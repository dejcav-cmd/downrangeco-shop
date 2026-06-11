import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HERO_KEY = "downrange_shop_hero_v1";

export const DEFAULT_HERO = {
  eyebrow: "Built for the Field — Summer 2026",
  title_line1: "GEAR FOR",
  title_line2: "HUNTERS,",
  title_line3: "SHOOTERS",
  title_line4: "& THE 2A.",
  subtitle: "Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
  cta_primary: "Shop All Products",
  cta_secondary: "Browse Categories",
  overlay_opacity: 85,
  accent_word: "SHOOTERS",
};

async function kvGet(): Promise<typeof DEFAULT_HERO> {
  if (!KV_URL || !KV_TOKEN) return DEFAULT_HERO;
  try {
    const res = await fetch(`${KV_URL}/get/${HERO_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: "no-store",
    });
    const data = await res.json();
    if (data.result) return { ...DEFAULT_HERO, ...JSON.parse(data.result) };
    return DEFAULT_HERO;
  } catch { return DEFAULT_HERO; }
}

async function kvSet(value: any) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${HERO_KEY}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET() {
  const hero = await kvGet();
  return NextResponse.json(hero, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await kvSet({ ...DEFAULT_HERO, ...body });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await kvSet(DEFAULT_HERO);
  return NextResponse.json({ ok: true });
}
