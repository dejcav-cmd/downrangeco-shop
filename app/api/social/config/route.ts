import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const ADMIN_KEY2 = "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const KEY        = "drshop:social:v1";

function auth(req: NextRequest) {
  const k = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key") ?? "";
  return k === ADMIN_KEY || k === ADMIN_KEY2;
}

async function kvRaw(path: string, body?: any) {
  const url   = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${url}${path}`, {
    method: body !== undefined ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return r.ok ? r.json() : null;
}

// Unwrap however many layers of JSON encoding exist
function deepParse(val: any): any {
  if (typeof val !== "string") return val;
  try { return deepParse(JSON.parse(val)); } catch { return val; }
}

async function read(): Promise<any> {
  const d = await kvRaw(`/get/${KEY}`);
  if (!d?.result) return {};
  return deepParse(d.result) ?? {};
}

// Write using SET with the value as a plain JSON string (single encoding)
async function write(data: any): Promise<boolean> {
  // Use Upstash REST pipeline to SET key directly — avoids body wrapping
  const url   = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${url}/set/${KEY}/${encodeURIComponent(JSON.stringify(data))}`, {
    method: "GET",  // Upstash supports GET-style commands: /set/key/value
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return r.ok;
}

const LABELS: Record<string, string> = {
  twitter: "𝕏 X / Twitter", bluesky: "🦋 Bluesky",   youtube:   "▶ YouTube",
  facebook:"f Facebook",    instagram:"◈ Instagram",  threads:   "@ Threads",
  reddit:  "🔴 Reddit",
};

export async function GET(req: NextRequest) {
  const isAdmin = auth(req);
  const config  = await read();
  const links   = config.links   ?? {};
  const enabled = config.enabled ?? {};

  if (!isAdmin) {
    const active = Object.keys(LABELS)
      .filter(k => enabled[k] && links[k])
      .map(k => ({ key: k, label: LABELS[k], href: links[k] }));
    return NextResponse.json({ active }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ ok: true, links, enabled },
    { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body    = await req.json();
  const current = await read();
  const next    = {
    links:   { ...(current.links   ?? {}), ...(body.links   ?? {}) },
    enabled: { ...(current.enabled ?? {}), ...(body.enabled ?? {}) },
  };
  const saved = await write(next);
  const verify = await read();
  return NextResponse.json({
    ok: saved,
    savedToRedis: saved,
    links:   verify.links   ?? {},
    enabled: verify.enabled ?? {},
  });
}
