import { NextRequest, NextResponse } from "next/server";

export const dynamic     = "force-dynamic";
export const maxDuration = 30;

const SHOP          = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const CLIENT_ID     = process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "";
const ADMIN_BASE    = `https://${SHOP}/admin/api/2024-01`;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;
  const res: Response = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data: { access_token: string; expires_in?: number } = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ?? 86400) * 1000;
  return cachedToken;
}

export async function GET(): Promise<NextResponse> {
  try {
    const token  = await getAdminToken();
    const res: Response = await fetch(
      `${ADMIN_BASE}/products.json?limit=250&status=active&fields=id,title,handle,status,variants,images,product_type,tags`,
      {
        headers: { "X-Shopify-Access-Token": token },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Shopify ${res.status}`);
    const data: { products: unknown[] } = await res.json();

    // Normalize to same shape as Storefront API so ProductGrid works unchanged
    const products = (data.products ?? []).map((p: any) => ({
      id:           p.id?.toString(),
      title:        p.title,
      handle:       p.handle,
      productType:  p.product_type ?? "",
      tags:         p.tags ? p.tags.split(", ") : [],
      featuredImage: p.images?.[0] ? { url: p.images[0].src, altText: p.title } : null,
      priceRange: {
        minVariantPrice: {
          amount:       p.variants?.[0]?.price ?? "0",
          currencyCode: "USD",
        },
      },
    }));

    return NextResponse.json({ products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ products: [], error: message }, { status: 500 });
  }
}
