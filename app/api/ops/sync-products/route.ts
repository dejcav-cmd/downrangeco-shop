import { NextRequest, NextResponse } from "next/server";
import { runJob, writeLog, checkConsecutiveFailures, sendSMSAlert } from "@/lib/opsLogger";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET ?? process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const KV_URL      = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN    = process.env.UPSTASH_REDIS_REST_TOKEN;

function auth(req: NextRequest) {
  const secret = req.headers.get("x-admin-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  return secret === CRON_SECRET;
}

async function kvSet(key: string, value: any) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

async function getShopifyProductCount(): Promise<number> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const token  = process.env.SHOPIFY_STOREFRONT_TOKEN!;
  const header = token.startsWith("shpat_") ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token";

  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", [header]: token },
    body: JSON.stringify({ query: "{ products(first: 1) { nodes { id } pageInfo { hasNextPage } } shop { name } }" }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok || data.errors) throw new Error(data.errors?.[0]?.message ?? `Shopify ${res.status}`);
  return data.data?.products?.nodes?.length ?? 0;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runJob("product-sync", async () => {
    const count = await getShopifyProductCount();

    // Store last sync metadata in Redis
    await kvSet("drshop:sync:last", {
      ts:           new Date().toISOString(),
      productCount: count,
      source:       "shopify-storefront",
    });

    // Revalidate product pages so new Printify→Shopify products appear
    revalidatePath("/products");
    revalidatePath("/");

    await writeLog({
      level:   "info",
      job:     "product-sync",
      message: `Product pages revalidated`,
      detail:  `Shopify reports ${count}+ products visible. Printify→Shopify sync is automatic on Shopify's side. This job ensures Next.js cache reflects latest state.`,
    });

    return { count, revalidated: true };
  });

  // Check for consecutive failures and escalate
  const isFailing = await checkConsecutiveFailures("product-sync", 3);
  if (isFailing) {
    await sendSMSAlert("🚨 DownRange Shop: product-sync has failed 3 times in a row. Manual check required.");
  }

  return NextResponse.json({ ok: true, result, ts: new Date().toISOString() });
}
