import { NextRequest, NextResponse } from "next/server";
import { writeLog, sendSMSAlert } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

interface HealthCheck { name: string; status: "ok" | "warn" | "error"; latency?: number; detail?: string; }

async function checkShopify(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN!;
    const token  = process.env.SHOPIFY_STOREFRONT_TOKEN!;
    const header = token.startsWith("shpat_") ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token";
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", [header]: token },
      body: JSON.stringify({ query: "{ shop { name } }" }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const ok = !!data.data?.shop?.name;
    return { name: "Shopify Storefront API", status: ok ? "ok" : "error", latency: Date.now() - start, detail: ok ? data.data.shop.name : "No shop name returned" };
  } catch (e: any) {
    return { name: "Shopify Storefront API", status: "error", latency: Date.now() - start, detail: e.message };
  }
}

async function checkShopifyAdmin(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const domain     = process.env.SHOPIFY_STORE_DOMAIN!;
    const clientId   = process.env.SHOPIFY_ADMIN_CLIENT_ID!;
    const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET!;
    if (!clientId || !clientSecret) return { name: "Shopify Admin API", status: "warn", detail: "Credentials not configured" };
    const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
      signal: AbortSignal.timeout(8000),
    });
    return { name: "Shopify Admin API", status: tokenRes.ok ? "ok" : "error", latency: Date.now() - start, detail: `Token exchange: ${tokenRes.status}` };
  } catch (e: any) {
    return { name: "Shopify Admin API", status: "error", latency: Date.now() - start, detail: e.message };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { name: "Upstash Redis", status: "warn", detail: "Not configured" };
  try {
    const res = await fetch(`${url}/ping`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return { name: "Upstash Redis", status: data.result === "PONG" ? "ok" : "error", latency: Date.now() - start };
  } catch (e: any) {
    return { name: "Upstash Redis", status: "error", latency: Date.now() - start, detail: e.message };
  }
}

async function checkGitHub(): Promise<HealthCheck> {
  const start = Date.now();
  const token = process.env.GH_TOKEN;
  if (!token) return { name: "GitHub API", status: "warn", detail: "GH_TOKEN not set" };
  try {
    const res = await fetch("https://api.github.com/repos/dejcav-cmd/downrangeco-shop", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(5000),
    });
    return { name: "GitHub API", status: res.ok ? "ok" : "error", latency: Date.now() - start, detail: `Status: ${res.status}` };
  } catch (e: any) {
    return { name: "GitHub API", status: "error", latency: Date.now() - start, detail: e.message };
  }
}

async function checkTwilio(): Promise<HealthCheck> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !tok) return { name: "Twilio SMS", status: "warn", detail: "Not configured — no SMS alerts" };
  return { name: "Twilio SMS", status: "ok", detail: "Credentials present" };
}

export async function GET(req: NextRequest) {
  const key    = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  const authed = key === ADMIN_KEY;
  const alert  = req.nextUrl.searchParams.get("alert") === "1";

  const [shopify, admin, redis, github, twilio] = await Promise.all([
    checkShopify(), checkShopifyAdmin(), checkRedis(), checkGitHub(), checkTwilio()
  ]);

  const checks  = [shopify, admin, redis, github, twilio];
  const errors  = checks.filter(c => c.status === "error");
  const overall = errors.length > 0 ? "degraded" : checks.some(c => c.status === "warn") ? "partial" : "healthy";

  // Log the health check
  await writeLog({
    level:   overall === "healthy" ? "ok" : overall === "partial" ? "warn" : "error",
    job:     "health-check",
    message: `Site health: ${overall}`,
    detail:  errors.length > 0 ? errors.map(e => `${e.name}: ${e.detail}`).join(", ") : undefined,
  });

  // SMS if critical and alert flag set
  if (alert && errors.length > 0) {
    const msg = `🚨 DownRange Shop Health Check FAILED\n${errors.map(e => `• ${e.name}: ${e.detail}`).join("\n")}`;
    await sendSMSAlert(msg);
  }

  const body = {
    status:    overall,
    timestamp: new Date().toISOString(),
    checks:    authed ? checks : checks.map(c => ({ name: c.name, status: c.status })),
    version:   process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "local",
    region:    process.env.VERCEL_REGION ?? "unknown",
  };

  return NextResponse.json(body, { status: overall === "degraded" ? 503 : 200 });
}
