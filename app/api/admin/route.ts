import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const ADMIN_KEY   = process.env.ADMIN_KEY ?? "drco-admin-2026";
const ADMIN_BASE  = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01`;

function auth(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  return key === ADMIN_KEY;
}

async function shopifyAdmin(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      ...(opts.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${res.status}: ${text.slice(0, 200)}`);
  }
  // DELETE returns 200 with no body
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action  = req.nextUrl.searchParams.get("action") ?? "products";
  const page    = req.nextUrl.searchParams.get("page") ?? "1";
  const id      = req.nextUrl.searchParams.get("id");
  const limit   = 20;
  const offset  = (parseInt(page) - 1) * limit;

  try {
    switch (action) {
      case "products": {
        const data = await shopifyAdmin(`/products.json?limit=${limit}&page_info=&fields=id,title,status,variants,images,product_type,tags,vendor,handle,body_html`);
        const count = await shopifyAdmin("/products/count.json");
        return NextResponse.json({ products: data.products, total: count.count, page: parseInt(page), limit });
      }
      case "product": {
        const data = await shopifyAdmin(`/products/${id}.json`);
        return NextResponse.json(data.product);
      }
      case "orders": {
        const data = await shopifyAdmin(`/orders.json?limit=${limit}&status=any&fields=id,name,email,financial_status,fulfillment_status,total_price,created_at,line_items,shipping_address`);
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
      case "inventory": {
        const data = await shopifyAdmin(`/products/${id}/variants.json`);
        return NextResponse.json(data.variants);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action, id, data: payload } = body;

  try {
    switch (action) {
      // ── Product CRUD ─────────────────────────────────────────────
      case "update_product": {
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: payload }),
        });
        return NextResponse.json(data.product);
      }
      case "delete_product": {
        await shopifyAdmin(`/products/${id}.json`, { method: "DELETE" });
        return NextResponse.json({ ok: true });
      }
      case "publish_product": {
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: { id, status: "active" } }),
        });
        return NextResponse.json(data.product);
      }
      case "unpublish_product": {
        const data = await shopifyAdmin(`/products/${id}.json`, {
          method: "PUT",
          body: JSON.stringify({ product: { id, status: "draft" } }),
        });
        return NextResponse.json(data.product);
      }
      // ── Variant updates ──────────────────────────────────────────
      case "update_variant": {
        const variantId = body.variantId;
        const data = await shopifyAdmin(`/variants/${variantId}.json`, {
          method: "PUT",
          body: JSON.stringify({ variant: payload }),
        });
        return NextResponse.json(data.variant);
      }
      // ── Order actions ────────────────────────────────────────────
      case "cancel_order": {
        const data = await shopifyAdmin(`/orders/${id}/cancel.json`, { method: "POST", body: "{}" });
        return NextResponse.json(data);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
