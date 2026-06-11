import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KEY        = "drshop:social:v1";

async function kv(path: string, body?: any) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}${path}`, {
    method: body !== undefined ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return res.ok ? res.json() : null;
}

async function read() {
  const d = await kv(`/get/${KEY}`);
  if (!d?.result) return {};
  try { return JSON.parse(d.result); } catch { return {}; }
}

async function write(data: any): Promise<boolean> {
  const r = await kv(`/set/${KEY}`, { value: JSON.stringify(data) });
  return r !== null;
}

const LABELS: Record<string,string> = {
  twitter:"𝕏 X / Twitter", bluesky:"🦋 Bluesky", youtube:"▶ YouTube",
  facebook:"f Facebook", instagram:"◈ Instagram", threads:"@ Threads", reddit:"🔴 Reddit",
};

// Public GET — returns active links for footer (no auth needed)
// Admin GET (x-admin-key) — returns full stored config
export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-admin-key") === ADMIN_KEY || req.headers.get("x-admin-key") === ADMIN_KEY2;
  const config  = await read();

  if (!isAdmin) {
    const links   = config.links   || {};
    const enabled = config.enabled || {};
    const active  = Object.keys(LABELS)
      .filter(k => enabled[k] && links[k])
      .map(k => ({ key: k, label: LABELS[k], href: links[k] }));
    return NextResponse.json({ active }, { headers: { "Cache-Control": "no-store, no-cache" } });
  }

  return NextResponse.json({
    ok: true,
    links:   config.links   || {},
    enabled: config.enabled || {},
  }, { headers: { "Cache-Control": "no-store" } });
}

// POST — saves links + enabled map, returns the full saved state so UI can verify
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await read();
  const next = {
    ...existing,
    links:   body.links   ?? existing.links   ?? {},
    enabled: body.enabled ?? existing.enabled ?? {},
  };
  const saved = await write(next);

  // Re-read from Redis to confirm what was actually stored
  const verified = await read();

  return NextResponse.json({
    ok: saved,
    links:   verified.links   || {},
    enabled: verified.enabled || {},
    savedToRedis: saved,
  });
}
