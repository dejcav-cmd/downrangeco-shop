import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const CONFIG_KEY = "drshop:social:config";

async function kvGet(key:string){
  if(!KV_URL||!KV_TOKEN)return null;
  try{const r=await fetch(`${KV_URL}/get/${key}`,{headers:{Authorization:`Bearer ${KV_TOKEN}`},cache:"no-store"});return r.ok?r.json():null;}
  catch{return null;}
}
async function kvSet(key:string,value:string){
  if(!KV_URL||!KV_TOKEN)return false;
  try{const r=await fetch(`${KV_URL}/set/${key}`,{method:"POST",headers:{Authorization:`Bearer ${KV_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({value})});return r.ok;}
  catch{return false;}
}

// GET — public endpoint (no auth needed) returns only the public social links for footer
//        with ?admin=1 + x-admin-key returns full config for admin panel
export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-admin-key") === ADMIN_KEY ||
                  req.nextUrl.searchParams.get("key") === ADMIN_KEY;

  const data   = await kvGet(CONFIG_KEY);
  const config = data?.result ? JSON.parse(data.result) : {};

  // Public: return only what the footer needs — active social links
  if (!isAdmin) {
    const links    = config.socialLinks   || {};
    const enabled  = config.socialEnabled || {};
    const active: {key:string; label:string; href:string}[] = [];
    const LABELS: Record<string,string> = {
      twitter:"𝕏 X / Twitter", bluesky:"🦋 Bluesky", youtube:"▶ YouTube",
      facebook:"f Facebook",   instagram:"◈ Instagram", threads:"@ Threads", reddit:"🔴 Reddit",
    };
    Object.entries(LABELS).forEach(([key, label]) => {
      if (enabled[key] && links[key]) active.push({ key, label, href: links[key] });
    });
    return NextResponse.json({ active }, { headers:{"Cache-Control":"no-store"} });
  }

  // Admin: return full config
  const configured = {
    twitter:   !!(process.env.ZERNIO_API_KEY),
    bluesky:   !!(process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD),
    facebook:  !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
    threads:   !!(process.env.THREADS_ACCESS_TOKEN),
    reddit:    !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
    instagram: !!(process.env.INSTAGRAM_ACCESS_TOKEN),
  };
  return NextResponse.json({ ok:true, config, configured }, { headers:{"Cache-Control":"no-store"} });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const body  = await req.json();
  // Always read current value first and MERGE — never overwrite unrelated keys
  const existing = await kvGet(CONFIG_KEY);
  const current  = existing?.result ? JSON.parse(existing.result) : {};
  const merged   = { ...current, ...body };
  const saved    = await kvSet(CONFIG_KEY, JSON.stringify(merged));
  return NextResponse.json({ ok:saved, config:merged });
}
