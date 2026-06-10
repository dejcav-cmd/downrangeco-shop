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
  options?: Record<string, string>;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: PrintifyImage[];
  variants: PrintifyVariant[];
  tags: string[];
  visible: boolean;
  external?: { id: string; handle: string } | null;
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
      next: { revalidate: 300 },
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

export function getAllImages(product: PrintifyProduct): string[] {
  return product.images.map((i) => i.src).filter(Boolean).slice(0, 6);
}

export function getMinPrice(product: PrintifyProduct): number {
  const enabled = product.variants.filter((v) => v.is_enabled);
  if (!enabled.length) return 0;
  return Math.min(...enabled.map((v) => v.price));
}

export function getMaxPrice(product: PrintifyProduct): number {
  const enabled = product.variants.filter((v) => v.is_enabled);
  if (!enabled.length) return 0;
  return Math.max(...enabled.map((v) => v.price));
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

export function getProductUrl(product: PrintifyProduct): string {
  // Use external handle (slug) — what Printify Pop-Up Store actually uses
  const handle = product.external?.handle;
  if (handle) return `https://downrange-co.printify.me/products/${handle}`;
  // Fallback: slugify title
  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `https://downrange-co.printify.me/products/${slug}`;
}

export function getCategory(product: PrintifyProduct): string {
  const tags = product.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => ["hunting","elk","deer","turkey","waterfowl","duck","bow","archery","rifle","shotgun"].includes(t))) return "Hunting";
  if (tags.some((t) => ["2a","patriot","second amendment","constitutional","firearm","1776","liberty"].includes(t))) return "2A / Patriot";
  if (tags.some((t) => ["military","veteran","vet","army","marines","navy","air force","usmc","usaf","soldier"].includes(t))) return "Military / Vet";
  if (tags.some((t) => ["long range","precision","mrad","milradian","sniper","rimfire","ballistics"].includes(t))) return "Long Range";
  return "Apparel";
}

export function getShopInfo() {
  return { shopId: SHOP_ID, base: BASE };
}
