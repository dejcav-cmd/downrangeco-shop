import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const CONFIG_KEY = "drshop:social:config";
async function kvGet(key:string){if(!KV_URL||!KV_TOKEN)return null;try{const r=await fetch(`${KV_URL}/get/${key}`,{headers:{Authorization:`Bearer ${KV_TOKEN}`},cache:"no-store"});return r.ok?r.json():null;}catch{return null;}}
async function kvSet(key:string,value:string){if(!KV_URL||!KV_TOKEN)return false;try{const r=await fetch(`${KV_URL}/set/${key}`,{method:"POST",headers:{Authorization:`Bearer ${KV_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({value})});return r.ok;}catch{return false;}}
export async function GET(req:NextRequest){
  if(req.headers.get("x-admin-key")!==ADMIN_KEY)return NextResponse.json({error:"Unauthorized"},{status:401});
  const data=await kvGet(CONFIG_KEY);
  const config=data?.result?JSON.parse(data.result):{};
  const configured={twitter:!!(process.env.ZERNIO_API_KEY),bluesky:!!(process.env.BLUESKY_HANDLE&&process.env.BLUESKY_APP_PASSWORD),facebook:!!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN),threads:!!(process.env.THREADS_ACCESS_TOKEN),reddit:!!(process.env.REDDIT_CLIENT_ID&&process.env.REDDIT_CLIENT_SECRET),instagram:!!(process.env.INSTAGRAM_ACCESS_TOKEN)};
  return NextResponse.json({ok:true,config,configured});
}
export async function POST(req:NextRequest){
  if(req.headers.get("x-admin-key")!==ADMIN_KEY)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  const saved=await kvSet(CONFIG_KEY,JSON.stringify(body));
  return NextResponse.json({ok:saved});
}
