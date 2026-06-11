import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { writeLog } from "@/lib/opsLogger";

const SHOPIFY_DOMAIN  = process.env.SHOPIFY_STORE_DOMAIN!;
const CLIENT_ID       = process.env.SHOPIFY_ADMIN_CLIENT_ID!;
const CLIENT_SECRET   = process.env.SHOPIFY_ADMIN_CLIENT_SECRET!;
const ADMIN_KEY       = process.env.ADMIN_KEY ?? "drco-admin-2026";
const ADMIN_BASE      = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01`;

// ── Token cache (in-memory, per serverless instance) ──────────────────
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Tokens expire in ~24h; cache for 23h
  tokenExpiry = Date.now() + (data.expires_in ?? 86400) * 1000;
  return cachedToken!;
}

async function shopifyAdmin(path: string, opts: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      ...(opts.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${res.status}: ${text.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit("admin", `admin-get:${ip}`, 30, "1 m");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action = req.nextUrl.searchParams.get("action") ?? "products";
  const page   = req.nextUrl.searchParams.get("page") ?? "1";
  const id     = req.nextUrl.searchParams.get("id");

  try {
    switch (action) {
      case "products": {
        const data  = await shopifyAdmin(`/products.json?limit=20&fields=id,title,status,variants,images,product_type,tags,vendor,handle,body_html`);
        const count = await shopifyAdmin("/products/count.json");
        return NextResponse.json({ products: data.products, total: count.count, page: parseInt(page) });
      }
      case "product": {
        const data = await shopifyAdmin(`/products/${id}.json`);
        return NextResponse.json(data.product);
      }
      case "orders": {
        const data  = await shopifyAdmin(`/orders.json?limit=20&status=any&fields=id,name,email,financial_status,fulfillment_status,total_price,created_at,line_items,shipping_address`);
        const count = await shopifyAdmin("/orders/count.json?status=any");
        return NextResponse.json({ orders: data.orders, total: count.count });
      }
      case "shop": {
        const data = await shopifyAdmin("/shop.json");
        return NextResponse.json(data.shop);
      }
      case "collections": {
        const custom = await shopifyAdmin("/custom_collections.json?limit=50&fields=id,title,handle,image,products_count");
        const smart  = await shopifyAdmin("/smart_collections.json?limit=50&fields=id,title,handle,image,products_count");
        return NextResponse.json({ collections: [...custom.custom_collections, ...smart.smart_collections] });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit("admin", `admin-post:${ip}`, 30, "1 m");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, id, data: payload, variantId } = body;

  try {
    switch (action) {
      case "update_product": { await writeLog({ level:"info", job:"admin-api", message:`Product updated`, detail:`ID: ${id}` });
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: payload }),
        });
        return NextResponse.json(data.product);
      }
      case "delete_product": { await writeLog({ level:"warn", job:"admin-api", message:`Product DELETED`, detail:`ID: ${id}` });
        await shopifyAdmin(`/products/${id}.json`, { method: "DELETE" });
        return NextResponse.json({ ok: true });
      }
      case "publish_product": { await writeLog({ level:"info", job:"admin-api", message:`Product published`, detail:`ID: ${id}` });
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: { id, status: "active" } }),
        });
        return NextResponse.json(data.product);
      }
      case "unpublish_product": { await writeLog({ level:"info", job:"admin-api", message:`Product set to draft`, detail:`ID: ${id}` });
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: { id, status: "draft" } }),
        });
        return NextResponse.json(data.product);
      }
      case "update_variant": {
        const data = await shopifyAdmin(`/variants/${variantId}.json`, {
          method: "PUT",
          body: JSON.stringify({ variant: payload }),
        });
        return NextResponse.json(data.variant);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
