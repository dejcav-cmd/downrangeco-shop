import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";
const ADMIN_KEY      = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const CLIENT_ID      = process.env.SHOPIFY_ADMIN_CLIENT_ID!;
const CLIENT_SECRET  = process.env.SHOPIFY_ADMIN_CLIENT_SECRET!;
const SITE_URL       = "https://shop.downrangeco.com";

const TOPICS = ["orders/create", "orders/cancelled", "refunds/create"];

async function getToken(): Promise<string> {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error_description ?? `Token error ${res.status}`);
  return d.access_token;
}

// POST — register all webhooks
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token   = await getToken();
    const address = `${SITE_URL}/api/webhooks/shopify`;
    const results = await Promise.all(TOPICS.map(async topic => {
      const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/webhooks.json`, {
        method: "POST",
        headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: { topic, address, format: "json" } }),
      });
      const d = await res.json();
      return { topic, ok: res.ok, id: d.webhook?.id, error: d.errors ?? null };
    }));

    const ok = results.every(r => r.ok);
    await writeLog({ level: ok ? "ok" : "warn", job: "webhook-register",
      message: `Webhooks registered: ${results.filter(r=>r.ok).length}/${results.length}`,
      detail: results.filter(r=>!r.ok).map(r=>`${r.topic}: ${JSON.stringify(r.error)}`).join(", ") || undefined });

    return NextResponse.json({ ok, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET — list existing webhooks
export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const token = await getToken();
    const res   = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/webhooks.json`,
      { headers: { "X-Shopify-Access-Token": token } });
    const d = await res.json();
    return NextResponse.json({ webhooks: d.webhooks ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
