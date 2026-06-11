import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

export async function GET(req: NextRequest) {
  const isAuth = req.headers.get("x-admin-key") === ADMIN_KEY ||
                   req.nextUrl.searchParams.get("key") === ADMIN_KEY;
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Check env vars
  const envOk = !!(url && token);
  const urlPreview = url ? url.slice(0, 40) + "..." : "NOT SET";

  if (!envOk) {
    return NextResponse.json({
      envOk: false,
      url: urlPreview,
      message: "UPSTASH env vars not set in Vercel",
    });
  }

  // 2. Test write
  const writeRes = await fetch(`${url}/set/drshop:social:test`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: "hello-" + Date.now() }),
    cache: "no-store",
  });
  const writeBody = await writeRes.text();

  // 3. Test read back
  const readRes = await fetch(`${url}/get/drshop:social:test`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const readBody = await readRes.text();

  // 4. Read actual social config
  const socialRes = await fetch(`${url}/get/drshop:social:v1`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const socialBody = await socialRes.text();

  return NextResponse.json({
    envOk,
    urlPreview,
    write: { ok: writeRes.ok, status: writeRes.status, body: writeBody },
    read:  { ok: readRes.ok,  status: readRes.status,  body: readBody  },
    socialConfig: { ok: socialRes.ok, status: socialRes.status, body: socialBody.slice(0, 500) },
  });
}
