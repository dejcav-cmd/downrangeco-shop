const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!; // e.g. downrangeco.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = "2024-01";
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

// ── Core fetcher ────────────────────────────────────────────────────
async function shopifyFetch<T>(query: string, variables?: Record<string, any>, cache: RequestCache = "no-store"): Promise<T> {
  // shpat_ = private token (Headless channel) → use private header
  // anything else = public token → use public header
  const isPrivateToken = STOREFRONT_TOKEN?.startsWith("shpat_");
  const tokenHeader = isPrivateToken
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [tokenHeader]: STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
    cache,
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL error");
  return json.data as T;
}

// ── Types ────────────────────────────────────────────────────────────
export interface ShopifyImage { url: string; altText: string | null; }
export interface ShopifyProductOption { name: string; values: string[]; }
export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  options: ShopifyProductOption[];
  variants: { nodes: ShopifyVariant[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}
export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: { id: string; title: string; product: { title: string; handle: string }; image: ShopifyImage | null; price: { amount: string; currencyCode: string } };
    }[];
  };
}

// ── Fragments ────────────────────────────────────────────────────────
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id title handle description descriptionHtml productType tags
    featuredImage { url altText }
    images(first: 8) { nodes { url altText } }
    options { name values }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 100) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { totalAmount { amount currencyCode } }
    lines(first: 50) {
      nodes {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title
            price { amount currencyCode }
            image { url altText }
            product { title handle }
          }
        }
      }
    }
  }
`;

// ── Queries ──────────────────────────────────────────────────────────
export async function getProducts(first = 24, after?: string, query?: string) {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query Products($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor hasPreviousPage startCursor }
        nodes { ...ProductFields }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { first, after: after ?? null, query: query ?? null });
  return data.products;
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query Product($handle: String!) {
      productByHandle(handle: $handle) { ...ProductFields }
    }
  `;
  const data = await shopifyFetch<any>(gql, { handle });
  return data.productByHandle ?? null;
}

export async function getCollections() {
  const gql = `
    query Collections {
      collections(first: 20) {
        nodes { id title handle description image { url altText } }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql);
  return data.collections.nodes;
}

export async function getCollection(handle: string, first = 24, after?: string) {
  const gql = `
    ${PRODUCT_FRAGMENT}
    query Collection($handle: String!, $first: Int!, $after: String) {
      collectionByHandle(handle: $handle) {
        id title description
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { ...ProductFields }
        }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { handle, first, after: after ?? null });
  return data.collectionByHandle;
}

// ── Cart mutations ────────────────────────────────────────────────────
export async function createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const gql = `
    ${CART_FRAGMENT}
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { lines });
  if (data.cartCreate.userErrors?.length) throw new Error(data.cartCreate.userErrors[0].message);
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const gql = `
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { cartId, lines });
  return data.cartLinesAdd.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const gql = `
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

export async function updateCartLine(cartId: string, lines: { id: string; quantity: number }[]): Promise<ShopifyCart> {
  const gql = `
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
      }
    }
  `;
  const data = await shopifyFetch<any>(gql, { cartId, lines });
  return data.cartLinesUpdate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const gql = `
    ${CART_FRAGMENT}
    query Cart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
  `;
  const data = await shopifyFetch<any>(gql, { cartId });
  return data.cart ?? null;
}

// ── Helpers ───────────────────────────────────────────────────────────
export function formatMoney(amount: string, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

export function getCategory(product: ShopifyProduct): string {
  const tags = product.tags.map((t) => t.toLowerCase());
  const type = product.productType.toLowerCase();
  if ([...tags, type].some((t) => ["hunting","elk","deer","turkey","waterfowl","duck","bow","archery","rifle","shotgun"].some((k) => t.includes(k)))) return "Hunting";
  if ([...tags, type].some((t) => ["2a","patriot","second amendment","constitutional","1776","liberty"].some((k) => t.includes(k)))) return "2A / Patriot";
  if ([...tags, type].some((t) => ["military","veteran","vet","army","marines","navy","air force","usmc"].some((k) => t.includes(k)))) return "Military / Vet";
  if ([...tags, type].some((t) => ["long range","precision","mrad","milradian","sniper"].some((k) => t.includes(k)))) return "Long Range";
  return "Apparel";
}

export const CATEGORIES = ["All", "Hunting", "2A / Patriot", "Military / Vet", "Long Range", "Apparel"] as const;
export type Category = typeof CATEGORIES[number];
