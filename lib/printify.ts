const PRINTIFY_TOKEN = process.env.PRINTIFY_TOKEN!;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID!;
const BASE = "https://api.printify.com/v1";

export interface PrintifyImage {
  src: string;
  position: string;
  is_default: boolean;
}

export interface PrintifyVariant {
  id: number;
  title: string;
  price: number; // cents
  is_enabled: boolean;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: PrintifyImage[];
  variants: PrintifyVariant[];
  tags: string[];
  visible: boolean;
}

export interface PrintifyProductsResponse {
  data: PrintifyProduct[];
  total: number;
  current_page: number;
  last_page: number;
}

export async function getProducts(page = 1, limit = 24): Promise<PrintifyProductsResponse> {
  const res = await fetch(
    `${BASE}/shops/${SHOP_ID}/products.json?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${PRINTIFY_TOKEN}` },
      next: { revalidate: 300 }, // cache 5 min
    }
  );
  if (!res.ok) throw new Error(`Printify API error: ${res.status}`);
  return res.json();
}

export async function getProduct(productId: string): Promise<PrintifyProduct> {
  const res = await fetch(
    `${BASE}/shops/${SHOP_ID}/products/${productId}.json`,
    {
      headers: { Authorization: `Bearer ${PRINTIFY_TOKEN}` },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) throw new Error(`Printify API error: ${res.status}`);
  return res.json();
}

export function getDefaultImage(product: PrintifyProduct): string {
  const def = product.images.find((i) => i.is_default);
  return def?.src ?? product.images[0]?.src ?? "";
}

export function getMinPrice(product: PrintifyProduct): number {
  const enabled = product.variants.filter((v) => v.is_enabled);
  if (!enabled.length) return 0;
  return Math.min(...enabled.map((v) => v.price));
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

export function getProductUrl(product: PrintifyProduct): string {
  return `https://downrange-co.printify.me/products/${product.id}`;
}

/** Derive a category tag from product tags */
export function getCategory(product: PrintifyProduct): string {
  const tags = product.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => ["hunting", "elk", "deer", "turkey", "waterfowl", "duck", "bow", "archery"].includes(t))) return "Hunting";
  if (tags.some((t) => ["2a", "patriot", "second amendment", "constitutional", "firearm"].includes(t))) return "2A / Patriot";
  if (tags.some((t) => ["military", "veteran", "vet", "army", "marines", "navy", "air force"].includes(t))) return "Military / Vet";
  if (tags.some((t) => ["long range", "precision", "mrad", "milradian", "sniper"].includes(t))) return "Long Range";
  return "Apparel";
}
