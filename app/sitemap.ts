import { MetadataRoute } from "next";

const BASE = "https://shop.downrangeco.com";

async function getShopifyProducts(): Promise<{ handle: string; updatedAt: string }[]> {
  try {
    const endpoint = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN!;
    const header = token.startsWith("shpat_") ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", [header]: token },
      body: JSON.stringify({
        query: `{ products(first: 250) { nodes { handle updatedAt } } }`,
      }),
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.data?.products?.nodes ?? [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getShopifyProducts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/products`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/collections/hunting`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/collections/2a-patriot`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/collections/military-vet`,lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pages/sizing-guide`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/pages/shipping-returns`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/pages/faq`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/pages/contact`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/pages/2a-proud`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE}/products/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
