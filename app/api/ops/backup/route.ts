import { NextRequest, NextResponse } from "next/server";
import { writeLog, sendSMSAlert } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const GH_TOKEN  = process.env.GH_TOKEN  ?? "";
const GH_REPO   = "dejcav-cmd/downrangeco-shop";
const KV_URL    = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN  = process.env.UPSTASH_REDIS_REST_TOKEN;

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET ?? ADMIN_KEY}`;
}

async function kvGetAll(): Promise<Record<string, any>> {
  if (!KV_URL || !KV_TOKEN) return {};
  const keys = ["drshop:hero:slides:v2", "drshop:ops:log", "downrange_shop_hero_v1"];
  const result: Record<string, any> = {};
  for (const key of keys) {
    try {
      const res = await fetch(`${KV_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: "no-store"
      });
      const data = await res.json();
      if (data?.result) result[key] = data.result;
    } catch {}
  }
  return result;
}

async function getRecentDeployment(): Promise<string> {
  if (!GH_TOKEN) return "unknown";
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GH_REPO}/commits/main`,
      { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" } }
    );
    const data = await res.json();
    return data?.sha?.slice(0, 8) ?? "unknown";
  } catch { return "unknown"; }
}

async function commitBackupToGitHub(backup: object): Promise<boolean> {
  if (!GH_TOKEN) return false;
  try {
    const date     = new Date().toISOString().slice(0, 10);
    const path     = `backups/${date}.json`;
    const content  = Buffer.from(JSON.stringify(backup, null, 2)).toString("base64");

    // Get existing SHA if file exists
    const shaRes  = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${path}`, {
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" }
    });
    const shaData = shaRes.ok ? await shaRes.json() : null;

    await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${path}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Daily backup ${date}`,
        content,
        branch: "main",
        ...(shaData?.sha ? { sha: shaData.sha } : {}),
      }),
    });
    return true;
  } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const start = Date.now();
  const ts    = new Date().toISOString();

  try {
    const [kvData, commitSha] = await Promise.all([kvGetAll(), getRecentDeployment()]);

    const backup = {
      meta: { ts, commitSha, source: "vercel-cron", site: "shop.downrangeco.com" },
      redis: kvData,
      env_check: {
        upstash:  !!(KV_URL && KV_TOKEN),
        github:   !!GH_TOKEN,
        twilio:   !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        shopify:  !!process.env.SHOPIFY_STOREFRONT_TOKEN,
        adminKey: !!process.env.ADMIN_KEY,
      },
    };

    const committed = await commitBackupToGitHub(backup);
    const duration  = Date.now() - start;

    await writeLog({
      level:    committed ? "ok" : "warn",
      job:      "daily-backup",
      message:  committed ? `Daily backup committed to GitHub` : `Daily backup — GitHub commit failed`,
      detail:   `Commit: ${commitSha} · Redis keys: ${Object.keys(kvData).length} · ${duration}ms`,
      duration,
    });

    if (!committed) {
      await sendSMSAlert(`DownRange-Shop: Daily backup FAILED to commit to GitHub. Check GH_TOKEN.`);
    }

    return NextResponse.json({ ok: true, committed, ts, commitSha, keysBackedUp: Object.keys(kvData) });
  } catch (e: any) {
    await writeLog({ level: "error", job: "daily-backup", message: "Backup exception", detail: e.message });
    await sendSMSAlert(`DownRange-Shop: Daily backup exception — ${e.message.slice(0, 120)}`);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
