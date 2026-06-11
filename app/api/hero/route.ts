import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";
import { revalidatePath } from "next/cache";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const SLIDES_KEY = "drshop:hero:slides:v2";

export interface HeroSlide {
  id:              string;
  image:           string;
  eyebrow:         string;
  title_line1:     string;
  title_line2:     string;
  title_line3?:    string;
  title_line4?:    string;
  accent_word?:    string;
  subtitle:        string;
  cta_primary:     string;
  cta_primary_url: string;
  cta_secondary:   string;
  overlay_opacity: number;
  active:          boolean;
  position:        number;
}

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id:"slide-1", image:"/hero.jpg",
    eyebrow:"Built for the Field — Summer 2026",
    title_line1:"GEAR FOR", title_line2:"HUNTERS,", title_line3:"SHOOTERS", title_line4:"& THE 2A.",
    accent_word:"SHOOTERS",
    subtitle:"Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
    cta_primary:"Shop All Products", cta_primary_url:"/products",
    cta_secondary:"Browse Categories", overlay_opacity:85, active:true, position:0,
  },
  {
    id:"slide-2", image:"/hero.jpg",
    eyebrow:"Opening Day Ready",
    title_line1:"HUNTING", title_line2:"SEASON", title_line3:"STARTS HERE.",
    accent_word:"SEASON",
    subtitle:"Elk, whitetail, waterfowl, bear. Designs made by someone who hunts public land in Washington State.",
    cta_primary:"Shop Hunting", cta_primary_url:"/collections/hunting",
    cta_secondary:"Our Story", overlay_opacity:80, active:true, position:1,
  },
  {
    id:"slide-3", image:"/hero.jpg",
    eyebrow:"Shall Not Be Infringed",
    title_line1:"2A PROUD.", title_line2:"NO", title_line3:"APOLOGIES.",
    accent_word:"NO",
    subtitle:"The Second Amendment is the right that protects all the others. Wear it. Live it. No compromise.",
    cta_primary:"Shop 2A Gear", cta_primary_url:"/collections/2a-patriot",
    cta_secondary:"Read Our Stance", overlay_opacity:88, active:true, position:2,
  },
  {
    id:"slide-4", image:"/hero.jpg",
    eyebrow:"Honor. Service. Brotherhood.",
    title_line1:"MILITARY", title_line2:"& VETERAN", title_line3:"PROUD.",
    accent_word:"VETERAN",
    subtitle:"Designs built for those who served and those who still carry the mission. American-made, American-worn.",
    cta_primary:"Shop Military / Vet", cta_primary_url:"/collections/military-vet",
    cta_secondary:"Our Story", overlay_opacity:86, active:true, position:3,
  },
];

// ── KV helpers ───────────────────────────────────────────────────────
function kvReady() {
  // Re-read env vars at call time (not just module load time)
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return !!(url && token && url.startsWith("https://"));
}

async function kvGet(key: string): Promise<any> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function kvSet(key: string, value: string): Promise<boolean> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(`${url}/set/${key}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
      cache: "no-store",
    });
    return res.ok;
  } catch { return false; }
}

async function getSlides(): Promise<HeroSlide[]> {
  try {
    const data = await kvGet(SLIDES_KEY);
    if (data?.result) {
      const slides = JSON.parse(data.result);
      if (Array.isArray(slides) && slides.length > 0) return slides;
    }
  } catch {}
  return DEFAULT_SLIDES;
}

async function saveSlides(slides: HeroSlide[]): Promise<boolean> {
  return kvSet(SLIDES_KEY, JSON.stringify(slides));
}

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

// ── GET ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const isAdmin = auth(req);
  const slides  = await getSlides();
  const out     = isAdmin
    ? slides.sort((a, b) => a.position - b.position)
    : slides.filter(s => s.active).sort((a, b) => a.position - b.position);

  return NextResponse.json(
    { slides: out, kvReady: kvReady(), source: kvReady() ? "redis" : "defaults" },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// ── POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const action = body.action as string;
  let slides   = await getSlides();

  switch (action) {

    // Save entire slides array at once — used by "Publish All"
    case "save_all": {
      const incoming: HeroSlide[] = body.slides;
      if (!Array.isArray(incoming) || incoming.length === 0)
        return NextResponse.json({ error: "No slides provided" }, { status: 400 });
      const saved = await saveSlides(incoming);
      await writeLog({ level: saved ? "ok" : "warn", job: "storefront",
        message: saved ? `All ${incoming.length} slides saved to Redis` : `Save_all: Redis not configured — changes will not persist`,
        detail: !saved ? "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars" : undefined });
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides: incoming });
    }

    case "upsert": {
      const slide: HeroSlide = body.slide;
      const idx = slides.findIndex(s => s.id === slide.id);
      if (idx >= 0) slides[idx] = { ...slides[idx], ...slide };
      else          slides.push({ ...slide, position: slides.length });
      const saved = await saveSlides(slides);
      await writeLog({ level: saved ? "ok" : "warn", job: "storefront",
        message: saved ? `Slide updated: ${slide.title_line1}` : `Slide upsert: Redis not ready — not persisted`,
      });
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides });
    }

    case "delete": {
      slides = slides.filter(s => s.id !== body.id).map((s, i) => ({ ...s, position: i }));
      const saved = await saveSlides(slides);
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides });
    }

    case "reorder": {
      const order: string[] = body.order;
      slides = order.map((id, i) => ({ ...slides.find(s => s.id === id)!, position: i }));
      const saved = await saveSlides(slides);
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides });
    }

    case "toggle": {
      const idx = slides.findIndex(s => s.id === body.id);
      if (idx >= 0) slides[idx] = { ...slides[idx], active: !slides[idx].active };
      const saved = await saveSlides(slides);
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides });
    }

    case "reset": {
      const saved = await saveSlides(DEFAULT_SLIDES);
      revalidatePath("/");
      return NextResponse.json({ ok: true, saved, kvReady: kvReady(), slides: DEFAULT_SLIDES });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
