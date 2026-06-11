import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";

const ADMIN_KEY    = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL       = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN     = process.env.UPSTASH_REDIS_REST_TOKEN;

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

function pageKey(slug: string) { return `drshop_page_${slug}`; }

async function kvGet(key: string): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: "no-store",
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch { return null; }
}

async function kvSet(key: string, value: any) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  const data = await kvGet(pageKey(slug));
  return NextResponse.json({ content: data });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { slug, content } = body;
  if (!slug || !content) return NextResponse.json({ error: "Missing slug or content" }, { status: 400 });
  await kvSet(pageKey(slug), content);
  await writeLog({ level:"info", job:"pages", message:`Page content updated`, detail:`/pages/${slug}` });
  return NextResponse.json({ ok: true });
}
