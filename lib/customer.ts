// Shopify Customer Account API
// Uses magic link (passwordless) authentication

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = "2024-01";
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

const isPrivate = STOREFRONT_TOKEN?.startsWith("shpat_");
const TOKEN_HEADER = isPrivate ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token";

async function sfFetch<T>(query: string, variables?: any, customerToken?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [TOKEN_HEADER]: STOREFRONT_TOKEN,
  };
  if (customerToken) headers["Authorization"] = customerToken;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL error");
  return json.data as T;
}

// ── Types ─────────────────────────────────────────────────────────────
export interface CustomerOrder {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  subtotalPrice: { amount: string; currencyCode: string };
  totalShippingPrice: { amount: string; currencyCode: string };
  shippingAddress: {
    name: string; address1: string; city: string;
    provinceCode: string; zip: string; country: string;
  } | null;
  lineItems: {
    nodes: {
      title: string; quantity: number;
      variant: { title: string; image: { url: string } | null; price: { amount: string; currencyCode: string } } | null;
    }[];
  };
  successfulFulfillments: {
    trackingCompany: string | null;
    trackingInfo: { number: string; url: string | null }[];
  }[];
}

export interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  defaultAddress: {
    address1: string; city: string; provinceCode: string; zip: string; country: string;
  } | null;
  orders: { nodes: CustomerOrder[] };
}

// ── Auth mutations ────────────────────────────────────────────────────
export async function sendMagicLink(email: string): Promise<{ sent: boolean; error?: string }> {
  const gql = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors { field message }
      }
    }
  `;
  try {
    const data = await sfFetch<any>(gql, { email });
    const errs = data.customerRecover?.customerUserErrors;
    if (errs?.length) return { sent: false, error: errs[0].message };
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

export async function createCustomer(input: { firstName: string; lastName: string; email: string; password: string }): Promise<{ customer: any; error?: string }> {
  const gql = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email firstName lastName }
        customerUserErrors { field message }
      }
    }
  `;
  try {
    const data = await sfFetch<any>(gql, { input });
    const errs = data.customerCreate?.customerUserErrors;
    if (errs?.length) return { customer: null, error: errs[0].message };
    return { customer: data.customerCreate.customer };
  } catch (e: any) {
    return { customer: null, error: e.message };
  }
}

export async function loginCustomer(email: string, password: string): Promise<{ token: string | null; error?: string; expiresAt?: string }> {
  const gql = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `;
  try {
    const data = await sfFetch<any>(gql, { input: { email, password } });
    const errs = data.customerAccessTokenCreate?.customerUserErrors;
    if (errs?.length) return { token: null, error: errs[0].message };
    const token = data.customerAccessTokenCreate?.customerAccessToken;
    return { token: token?.accessToken, expiresAt: token?.expiresAt };
  } catch (e: any) {
    return { token: null, error: e.message };
  }
}

export async function logoutCustomer(token: string): Promise<void> {
  const gql = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
      }
    }
  `;
  await sfFetch(gql, { customerAccessToken: token });
}

export async function getCustomer(token: string): Promise<CustomerInfo | null> {
  const gql = `
    query Customer($token: String!) {
      customer(customerAccessToken: $token) {
        id firstName lastName email phone
        defaultAddress { address1 city provinceCode zip country }
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id name orderNumber processedAt financialStatus fulfillmentStatus
            totalPrice { amount currencyCode }
            subtotalPrice { amount currencyCode }
            totalShippingPrice { amount currencyCode }
            shippingAddress { name address1 city provinceCode zip country }
            lineItems(first: 10) {
              nodes {
                title quantity
                variant {
                  title
                  image { url }
                  price { amount currencyCode }
                }
              }
            }
            successfulFulfillments(first: 5) {
              trackingCompany
              trackingInfo { number url }
            }
          }
        }
      }
    }
  `;
  try {
    const data = await sfFetch<any>(gql, { token });
    return data.customer ?? null;
  } catch {
    return null;
  }
}

export async function updateCustomer(token: string, input: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<{ customer: any; error?: string }> {
  const gql = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer { id firstName lastName email phone }
        customerUserErrors { field message }
      }
    }
  `;
  try {
    const data = await sfFetch<any>(gql, { customerAccessToken: token, customer: input });
    const errs = data.customerUpdate?.customerUserErrors;
    if (errs?.length) return { customer: null, error: errs[0].message };
    return { customer: data.customerUpdate.customer };
  } catch (e: any) {
    return { customer: null, error: e.message };
  }
}

export function formatMoney(amount: string, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

export function getFulfillmentColor(status: string): string {
  const map: Record<string, string> = {
    FULFILLED: "#6adb8a", PARTIAL: "#e0a830", UNFULFILLED: "#e08080", IN_TRANSIT: "#9090e0",
  };
  return map[status?.toUpperCase()] ?? "#888";
}

export function getFinancialColor(status: string): string {
  const map: Record<string, string> = {
    PAID: "#6adb8a", PENDING: "#e0a830", REFUNDED: "#9090e0", PARTIALLY_REFUNDED: "#e0a830",
  };
  return map[status?.toUpperCase()] ?? "#888";
}
