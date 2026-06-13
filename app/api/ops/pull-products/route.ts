import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const SHOP       = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const CLIENT_ID  = process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "";
const ADMIN_BASE = `https://${SHOP}/admin/api/2024-01`;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;
  const res: Response = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
    cache:   "no-store",
  });
  if (!res.ok) {
    const text: string = await res.text();
    throw new Error(`Token exchange failed ${res.status}: ${text.slice(0, 200)}`);
  }
  const data: { access_token: string; expires_in?: number } = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ?? 86400) * 1000;
  return cachedToken;
}

async function shopifyAdmin(path: string): Promise<Record<string, unknown>> {
  const token: string = await getAccessToken();
  const res: Response = await fetch(`${ADMIN_BASE}${path}`, {
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    cache:   "no-store",
    signal:  AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const txt: string = await res.text();
    throw new Error(`Shopify ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

function auth(req: NextRequest): boolean {
  const k = req.headers.get("x-admin-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  return k === ADMIN_KEY;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ value: JSON.stringify(value) }),
  });
}

async function fetchAllProducts(): Promise<unknown[]> {
  // Get total count first
  const countData = await shopifyAdmin("/products/count.json") as { count?: number };
  const total: number = countData.count ?? 0;
  if (total === 0) return [];

  // Fetch all pages using page_info cursor pagination
  const products: unknown[] = [];
  const fields = "id,title,status,variants,images,product_type,tags,vendor,handle,body_html,created_at,updated_at";
  
  // First page
  let url: string = `${ADMIN_BASE}/products.json?limit=250&fields=${fields}`;
  const token: string = await getAccessToken();

  while (url) {
    const res: Response = await fetch(url, {
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      cache:   "no-store",
      signal:  AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const txt: string = await res.text();
      throw new Error(`Shopify ${res.status}: ${txt.slice(0, 300)}`);
    }
    const data: { products?: unknown[] } = await res.json();
    products.push(...(data.products ?? []));

    // Shopify page_info cursor from Link header
    const link: string = res.headers.get("link") ?? "";
    const match: RegExpMatchArray | null = link.match(/<([^>]+page_info=[^>]+)>;\s*rel="next"/);
    url = match ? match[1] : "";
  }

  return products;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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
      message: `Pulled ${products.length} products from Shopify and revalidated cache.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (!KV_URL || !KV_TOKEN) return NextResponse.json({ ok: true, cached: null });
    const res: Response = await fetch(
      `${KV_URL}/get/${encodeURIComponent("drshop:products:cache")}`,
      { headers: { Authorization: `Bearer ${KV_TOKEN}` } }
    );
    const d: { result?: string } = await res.json();
    const cached: unknown = d.result ? JSON.parse(d.result) : null;
    return NextResponse.json({ ok: true, cached });
  } catch {
    return NextResponse.json({ ok: true, cached: null });
  }
}
