import { NextRequest, NextResponse } from "next/server";
import { sendSMSAlert, writeLog } from "@/lib/opsLogger";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return true; // skip verification until secret is set
  try {
    const hash = createHmac("sha256", WEBHOOK_SECRET)
      .update(body, "utf8")
      .digest("base64");
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch { return false; }
}

function money(val: string | number): string {
  return `$${parseFloat(String(val ?? 0)).toFixed(2)}`;
}

function items(lineItems: any[]): string {
  if (!lineItems?.length) return "unknown items";
  const list = lineItems.slice(0, 3).map(i => `${i.quantity}x ${i.name ?? i.title}`).join(", ");
  return lineItems.length > 3 ? `${list} +${lineItems.length - 3} more` : list;
}

export async function POST(req: NextRequest) {
  const topic     = req.headers.get("x-shopify-topic") ?? "";
  const signature = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const body      = await req.text();

  if (!verifySignature(body, signature)) {
    await writeLog({ level: "warn", job: "shopify-webhook", message: "Invalid signature — rejected", detail: topic });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: any = {};
  try { data = JSON.parse(body); } catch {}

  // ── NEW ORDER ──────────────────────────────────────────────────
  if (topic === "orders/create") {
    const num      = data.order_number ?? data.name ?? "?";
    const total    = money(data.total_price ?? 0);
    const customer = data.customer
      ? `${data.customer.first_name ?? ""} ${data.customer.last_name ?? ""}`.trim() || "Guest"
      : "Guest";
    const city  = data.shipping_address?.city ?? data.billing_address?.city ?? "";
    const state = data.shipping_address?.province_code ?? data.billing_address?.province_code ?? "";
    const loc   = [city, state].filter(Boolean).join(", ");
    const prods = items(data.line_items ?? []);

    await sendSMSAlert(
      `DownRange-Shop: NEW ORDER 🎯\n` +
      `Order ${num} · ${total}\n` +
      `${prods}\n` +
      `${customer}${loc ? ` · ${loc}` : ""}`
    );

    await writeLog({
      level: "ok", job: "shopify-webhook",
      message: `New order ${num} · ${total}`,
      detail: `${customer} · ${prods}`,
    });
  }

  // ── ORDER CANCELLED ────────────────────────────────────────────
  if (topic === "orders/cancelled") {
    const num    = data.order_number ?? data.name ?? "?";
    const total  = money(data.total_price ?? 0);
    const reason = data.cancel_reason ?? "no reason given";
    await sendSMSAlert(`DownRange-Shop: Order ${num} CANCELLED · ${total} · ${reason}`);
    await writeLog({ level: "warn", job: "shopify-webhook", message: `Order cancelled: ${num}`, detail: reason });
  }

  // ── REFUND ─────────────────────────────────────────────────────
  if (topic === "refunds/create") {
    const num    = data.order_id ?? "?";
    const amount = data.transactions?.[0]?.amount;
    await sendSMSAlert(`DownRange-Shop: Refund issued · Order ${num} · ${amount ? money(amount) : "amount unknown"}`);
    await writeLog({ level: "warn", job: "shopify-webhook", message: `Refund: order ${num}` });
  }

  return NextResponse.json({ ok: true });
}
