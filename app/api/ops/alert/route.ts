import { NextRequest, NextResponse } from "next/server";
import { readLogs, getStats } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = parseInt(req.nextUrl.searchParams.get("count") ?? "100");
  const [logs, stats] = await Promise.all([readLogs(count), getStats()]);
  return NextResponse.json({ logs, stats, ts: new Date().toISOString() });
}
