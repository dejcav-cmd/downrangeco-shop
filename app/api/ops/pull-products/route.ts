import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const SHOP       = process.env.SHOPIFY_STORE_DOMAIN!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN ?? process.env.SHOPIFY_TOKEN ?? "";

function auth(req: NextRequest) {
  const k = req.headers.get("x-admin-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  return k === ADMIN_KEY;
}

async function kvSet(key: string, value: any) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ value: JSON.stringify(value) }),
  });
}

async function fetchAllProducts(): Promise<any[]> {
  const products: any[] = [];
  let url: string | null =
    `https://${SHOP}/admin/api/2024-01/products.json?limit=250&status=any`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Shopify Admin API ${res.status}: ${txt.slice(0, 200)}`);
    }

    const data = await res.json();
    products.push(...(data.products ?? []));

    // Follow pagination via Link header
    const link = res.headers.get("link") ?? "";
    const next = link.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
    url = next;
  }

  return products;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const started = Date.now();

  try {
    const products = await fetchAllProducts();

    await kvSet("drshop:products:cache", {
      products,
      ts:     new Date().toISOString(),
      count:  products.length,
      source: "manual-pull",
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/collections");

    const elapsed = Date.now() - started;

    return NextResponse.json({
      ok:      true,
      count:   products.length,
      elapsed: `${elapsed}ms`,
      ts:      new Date().toISOString(),
      message: `Pulled ${products.length} products from Shopify Admin API and revalidated storefront cache.`,
    });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!KV_URL || !KV_TOKEN) return NextResponse.json({ ok: true, cached: null });
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent("drshop:products:cache")}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const d      = await r.json();
    const cached = d.result ? JSON.parse(d.result) : null;
    return NextResponse.json({ ok: true, cached });
  } catch {
    return NextResponse.json({ ok: true, cached: null });
  }
}
