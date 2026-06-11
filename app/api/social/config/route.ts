import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const CONFIG_KEY = "drshop:social:config";

// Use the exact same KV pattern as opsLogger which is proven to work
async function kvGet(key: string): Promise<any> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function kvSet(key: string, value: string): Promise<boolean> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const r = await fetch(`${url}/set/${key}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
      cache: "no-store",
    });
    if (!r.ok) {
      const txt = await r.text();
      console.error("[social/config] kvSet failed:", r.status, txt.slice(0, 200));
    }
    return r.ok;
  } catch (e: any) {
    console.error("[social/config] kvSet exception:", e.message);
    return false;
  }
}

const LABELS: Record<string, string> = {
  twitter:   "𝕏 X / Twitter",
  bluesky:   "🦋 Bluesky",
  youtube:   "▶ YouTube",
  facebook:  "f Facebook",
  instagram: "◈ Instagram",
  threads:   "@ Threads",
  reddit:    "🔴 Reddit",
};

// ── GET ──────────────────────────────────────────────────────────────
// Public (no auth): returns { active: [{key,label,href}] } for footer
// Admin (x-admin-key): returns { ok, config, configured }
export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-admin-key") === ADMIN_KEY;

  const data   = await kvGet(CONFIG_KEY);
  const config = data?.result ? (() => { try { return JSON.parse(data.result); } catch { return {}; } })() : {};

  if (!isAdmin) {
    const links   = config.socialLinks   || {};
    const enabled = config.socialEnabled || {};
    const active  = Object.entries(LABELS)
      .filter(([key]) => enabled[key] && links[key])
      .map(([key, label]) => ({ key, label, href: links[key] }));
    return NextResponse.json({ active }, { headers: { "Cache-Control": "no-store" } });
  }

  const configured = {
    twitter:   !!(process.env.ZERNIO_API_KEY),
    bluesky:   !!(process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD),
    facebook:  !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
    threads:   !!(process.env.THREADS_ACCESS_TOKEN),
    reddit:    !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
    instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN),
  };
  return NextResponse.json(
    { ok: true, config, configured, debug: { hasResult: !!data?.result, configKeys: Object.keys(config) } },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// ── POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Read existing, merge, write back
  const existing = await kvGet(CONFIG_KEY);
  const current  = existing?.result
    ? (() => { try { return JSON.parse(existing.result); } catch { return {}; } })()
    : {};

  const merged = { ...current, ...body };
  const saved  = await kvSet(CONFIG_KEY, JSON.stringify(merged));

  console.log("[social/config] POST — saved:", saved, "keys:", Object.keys(merged));

  return NextResponse.json({ ok: saved, config: merged });
}
