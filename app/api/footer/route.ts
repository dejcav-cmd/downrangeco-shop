import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const ADMIN_KEY   = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL      = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN    = process.env.UPSTASH_REDIS_REST_TOKEN;
const FOOTER_KEY  = "drshop:footer:connect";

async function kvGet(key: string) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
async function kvSet(key: string, value: string) {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const r = await fetch(`${KV_URL}/set/${key}`, { method: "POST", headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
    return r.ok;
  } catch { return false; }
}

export const DEFAULT_LINKS = [
  { id: "portal",    label: "📡 News Portal", href: "https://downrangeco.com",                        enabled: true  },
  { id: "twitter",   label: "𝕏 X / Twitter",  href: "https://x.com/DownRangeCo",                     enabled: true  },
  { id: "bluesky",   label: "🦋 Bluesky",      href: "https://bsky.app/profile/downrangeco.bsky.social", enabled: true },
  { id: "youtube",   label: "▶ YouTube",       href: "https://www.youtube.com/@DownRangeCo",           enabled: true  },
  { id: "facebook",  label: "f Facebook",      href: "https://www.facebook.com/downrangeco",           enabled: true  },
  { id: "instagram", label: "◈ Instagram",     href: "https://www.instagram.com/downrangeco",          enabled: false },
  { id: "threads",   label: "@ Threads",       href: "https://www.threads.net/@downrangeco",           enabled: false },
  { id: "reddit",    label: "🔴 Reddit",        href: "https://www.reddit.com/r/DownRangeCo",           enabled: false },
];

export async function GET() {
  const data = await kvGet(FOOTER_KEY);
  if (data?.result) {
    try {
      const links = JSON.parse(data.result);
      if (Array.isArray(links) && links.length) return NextResponse.json({ links });
    } catch {}
  }
  return NextResponse.json({ links: DEFAULT_LINKS });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { links } = await req.json();
  const saved = await kvSet(FOOTER_KEY, JSON.stringify(links));
  return NextResponse.json({ ok: saved });
}
