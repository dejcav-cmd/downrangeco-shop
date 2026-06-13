import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic    = "force-dynamic";
export const maxDuration = 60;

const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const KV_URL    = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN  = process.env.UPSTASH_REDIS_REST_TOKEN;

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

async function fetchAllPublishedProducts() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const token  = process.env.SHOPIFY_STOREFRONT_TOKEN ?? process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
  const header = token?.startsWith("shpat_")
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";

  let products: any[] = [];
  let cursor: string | null = null;
  let afterClause: string = "";
  let hasNext = true;

  while (hasNext) {
    afterClause = cursor ? `, after: "${cursor}"` : "";
    const query = `{
      products(first: 250, sortKey: UPDATED_AT, reverse: true${afterClause}) {
        nodes {
          id
          title
          handle
          status: availableForSale
          updatedAt
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { nodes { url } }
          productType
          tags
          totalVariants
        }
        pageInfo { hasNextPage endCursor }
      }
    }`;

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", [header]: token },
      body:    JSON.stringify({ query }),
      signal:  AbortSignal.timeout(30000),
    });

    const data = await res.json();
    if (!res.ok || data.errors) throw new Error(data.errors?.[0]?.message ?? `Shopify ${res.status}`);

    const page = data.data?.products;
    products.push(...(page?.nodes ?? []));
    hasNext = page?.pageInfo?.hasNextPage ?? false;
    cursor  = page?.pageInfo?.endCursor ?? null;
  }

  return products;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const started = Date.now();

  try {
    const products = await fetchAllPublishedProducts();

    // Cache product list in Redis so admin panel can read it instantly
    await kvSet("drshop:products:cache", {
      products,
      ts:    new Date().toISOString(),
      count: products.length,
      source: "manual-pull",
    });

    // Bust Next.js page cache so storefront reflects latest products immediately
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/collections");
    try { revalidateTag("products"); } catch {}

    const elapsed = Date.now() - started;

    return NextResponse.json({
      ok:       true,
      count:    products.length,
      elapsed:  `${elapsed}ms`,
      ts:       new Date().toISOString(),
      message:  `Pulled ${products.length} published products from Shopify and revalidated storefront cache.`,
    });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// GET — return last cached pull result
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!KV_URL || !KV_TOKEN) return NextResponse.json({ ok: true, cached: null });
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent("drshop:products:cache")}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const d = await r.json();
    const cached = d.result ? JSON.parse(d.result) : null;
    return NextResponse.json({ ok: true, cached });
  } catch {
    return NextResponse.json({ ok: true, cached: null });
  }
}


