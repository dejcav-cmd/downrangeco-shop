import { NextRequest, NextResponse } from "next/server";
import { readLogs, getStats, clearLogs } from "@/lib/opsLogger";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

function auth(req: NextRequest) {
  return (req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key")) === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const count = parseInt(req.nextUrl.searchParams.get("count") ?? "200");
  const [logs, stats] = await Promise.all([readLogs(count), getStats()]);
  return NextResponse.json({ logs, stats, ts: new Date().toISOString() });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearLogs();
  return NextResponse.json({ ok: true, message: "Ops log cleared" });
}
