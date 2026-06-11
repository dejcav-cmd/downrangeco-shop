import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_TOKEN  = process.env.SHOPIFY_STOREFRONT_TOKEN!;

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "12"), 20);

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  try {
    const header = SHOPIFY_TOKEN.startsWith("shpat_")
      ? "Shopify-Storefront-Private-Token"
      : "X-Shopify-Storefront-Access-Token";

    const res = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", [header]: SHOPIFY_TOKEN },
        body: JSON.stringify({
          query: `query Search($q: String!, $first: Int!) {
            products(first: $first, query: $q) {
              nodes {
                id
                title
                handle
                description
                tags
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                images(first: 1) {
                  nodes { url altText }
                }
              }
            }
            collections(first: 4, query: $q) {
              nodes { id title handle description }
            }
          }`,
          variables: { q, first: limit },
        }),
        signal: AbortSignal.timeout(6000),
      }
    );

    const data = await res.json();

    const products = (data.data?.products?.nodes ?? []).map((p: any) => ({
      _id:       p.id,
      _typeLabel: "Product",
      _href:     `/products/${p.handle}`,
      title:     p.title,
      summary:   p.description ? p.description.slice(0, 100) : p.tags?.join(", ") ?? "",
      price:     p.priceRange?.minVariantPrice?.amount,
      image:     p.images?.nodes?.[0]?.url ?? null,
    }));

    const collections = (data.data?.collections?.nodes ?? []).map((c: any) => ({
      _id:        c.id,
      _typeLabel: "Collection",
      _href:      `/collections/${c.handle}`,
      title:      c.title,
      summary:    c.description ?? "",
    }));

    // Static pages — always include if query matches
    const staticPages = [
      { title: "Sizing Guide",       href: "/pages/sizing-guide",      tags: ["size", "sizing", "fit", "measurements"] },
      { title: "Shipping & Returns", href: "/pages/shipping-returns",  tags: ["shipping", "returns", "delivery", "refund"] },
      { title: "FAQ",                href: "/pages/faq",               tags: ["faq", "question", "help", "support"] },
      { title: "2A Proud",           href: "/pages/2a-proud",          tags: ["2a", "second amendment", "constitution", "rights"] },
      { title: "Our Story",          href: "/about",                   tags: ["about", "story", "history", "founder"] },
      { title: "Contact Us",         href: "/pages/contact",           tags: ["contact", "support", "email", "help"] },
    ].filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.tags.some(t => t.includes(q.toLowerCase()) || q.toLowerCase().includes(t))
    ).map(p => ({
      _id:        p.href,
      _typeLabel: "Page",
      _href:      p.href,
      title:      p.title,
      summary:    "",
    }));

    const results = [...products, ...collections, ...staticPages].slice(0, limit);

    await writeLog({
      level: "info", job: "search",
      message: `Search: "${q}" — ${results.length} results`,
    });

    return NextResponse.json({ results, query: q, total: results.length });
  } catch (e: any) {
    await writeLog({ level: "error", job: "search", message: "Search failed", detail: e.message });
    return NextResponse.json({ results: [], error: e.message });
  }
}
