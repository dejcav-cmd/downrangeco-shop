import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const SHOP      = process.env.SHOPIFY_STORE_DOMAIN ?? "NOT_SET";
const SF_TOKEN  = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "NOT_SET";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const k = req.headers.get("x-admin-key");
  if (k !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const endpoint = `https://${SHOP}/api/2024-01/graphql.json`;
  const isPrivate = SF_TOKEN.startsWith("shpat_");
  const header    = isPrivate ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token";

  let shopTest: Record<string, unknown> = {};
  try {
    const res: Response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", [header]: SF_TOKEN },
      body: JSON.stringify({ query: "{ shop { name } }" }),
      cache: "no-store",
    });
    shopTest = { status: res.status, body: (await res.text()).slice(0, 600) };
  } catch (e: unknown) {
    shopTest = { error: e instanceof Error ? e.message : "unknown" };
  }

  let productsTest: Record<string, unknown> = {};
  try {
    const res: Response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", [header]: SF_TOKEN },
      body: JSON.stringify({ query: "{ products(first: 5) { nodes { title handle } } }" }),
      cache: "no-store",
    });
    productsTest = { status: res.status, body: (await res.text()).slice(0, 800) };
  } catch (e: unknown) {
    productsTest = { error: e instanceof Error ? e.message : "unknown" };
  }

  return NextResponse.json({
    config: { domain: SHOP, token_prefix: SF_TOKEN.slice(0, 10) + "...", token_type: isPrivate ? "private(shpat_)" : "public", endpoint },
    shop_test: shopTest,
    products_test: productsTest,
  });
}
