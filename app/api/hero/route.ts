import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";
import { revalidatePath } from "next/cache";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const KV_URL     = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN   = process.env.UPSTASH_REDIS_REST_TOKEN;
const SLIDES_KEY = "drshop:hero:slides:v2";

export interface HeroSlide {
  id:              string;
  image:           string;        // path: /hero.jpg, /hero-2.jpg, etc.
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
    id: "slide-1", image: "/hero.jpg",
    eyebrow: "Built for the Field — Summer 2026",
    title_line1: "GEAR FOR", title_line2: "HUNTERS,",
    title_line3: "SHOOTERS", title_line4: "& THE 2A.",
    accent_word: "SHOOTERS",
    subtitle: "Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
    cta_primary: "Shop All Products", cta_primary_url: "/products",
    cta_secondary: "Browse Categories",
    overlay_opacity: 85, active: true, position: 0,
  },
  {
    id: "slide-2", image: "/hero.jpg",
    eyebrow: "Opening Day Ready",
    title_line1: "HUNTING", title_line2: "SEASON", title_line3: "STARTS HERE.",
    accent_word: "SEASON",
    subtitle: "Elk, whitetail, waterfowl, bear. Designs made by someone who hunts public land in Washington State.",
    cta_primary: "Shop Hunting", cta_primary_url: "/collections/hunting",
    cta_secondary: "Our Story",
    overlay_opacity: 80, active: true, position: 1,
  },
  {
    id: "slide-3", image: "/hero.jpg",
    eyebrow: "Shall Not Be Infringed",
    title_line1: "2A PROUD.", title_line2: "NO", title_line3: "APOLOGIES.",
    accent_word: "NO",
    subtitle: "The Second Amendment is the right that protects all the others. Wear it. Live it. No compromise.",
    cta_primary: "Shop 2A Gear", cta_primary_url: "/collections/2a-patriot",
    cta_secondary: "Read Our Stance",
    overlay_opacity: 88, active: true, position: 2,
  },
  {
    id: "slide-4", image: "/hero.jpg",
    eyebrow: "Honor. Service. Brotherhood.",
    title_line1: "MILITARY", title_line2: "& VETERAN", title_line3: "PROUD.",
    accent_word: "VETERAN",
    subtitle: "Designs built for those who served and those who still carry the mission. American-made, American-worn.",
    cta_primary: "Shop Military / Vet", cta_primary_url: "/collections/military-vet",
    cta_secondary: "Our Story",
    overlay_opacity: 86, active: true, position: 3,
  },
];

async function kv(path: string, body?: any) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}${path}`, {
      method: body !== undefined ? "POST" : "GET",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function getSlides(): Promise<HeroSlide[]> {
  try {
    const data = await kv(`/get/${SLIDES_KEY}`);
    if (data?.result) {
      const slides = JSON.parse(data.result);
      if (Array.isArray(slides) && slides.length > 0) return slides;
    }
  } catch {}
  return DEFAULT_SLIDES;
}

async function saveSlides(slides: HeroSlide[]) {
  await kv(`/set/${SLIDES_KEY}`, { value: JSON.stringify(slides) });
}

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

// GET — returns active slides (all slides when authenticated as admin)
export async function GET(req: NextRequest) {
  const slides = await getSlides();
  const isAdmin = req.headers.get("x-admin-key") === ADMIN_KEY;
  const filtered = isAdmin
    ? slides.sort((a, b) => a.position - b.position)           // all slides for admin
    : slides.filter(s => s.active).sort((a, b) => a.position - b.position); // active only for public
  return NextResponse.json(
    { slides: filtered },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// POST — create/update/reorder/delete slides
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const action = body.action as string;
  let   slides = await getSlides();

  switch (action) {

    case "upsert": {
      const slide: HeroSlide = body.slide;
      const idx = slides.findIndex(s => s.id === slide.id);
      if (idx >= 0) slides[idx] = { ...slides[idx], ...slide };
      else          slides.push({ ...slide, position: slides.length });
      await saveSlides(slides);
      await writeLog({ level: "ok", job: "storefront", message: `Hero slide updated`, detail: `ID: ${slide.id} — "${slide.title_line1}"` });
      revalidatePath("/");
      return NextResponse.json({ ok: true, slides });
    }

    case "delete": {
      slides = slides.filter(s => s.id !== body.id);
      slides = slides.map((s, i) => ({ ...s, position: i }));
      await saveSlides(slides);
      await writeLog({ level: "warn", job: "storefront", message: `Hero slide deleted`, detail: `ID: ${body.id}` });
      revalidatePath("/");
      return NextResponse.json({ ok: true, slides });
    }

    case "reorder": {
      const order: string[] = body.order; // array of slide IDs in new order
      slides = order.map((id, i) => {
        const s = slides.find(s => s.id === id)!;
        return { ...s, position: i };
      });
      await saveSlides(slides);
      revalidatePath("/");
      return NextResponse.json({ ok: true, slides });
    }

    case "toggle": {
      const idx = slides.findIndex(s => s.id === body.id);
      if (idx >= 0) slides[idx].active = !slides[idx].active;
      await saveSlides(slides);
      revalidatePath("/");
      return NextResponse.json({ ok: true, slides });
    }

    case "reset": {
      await saveSlides(DEFAULT_SLIDES);
      revalidatePath("/");
      return NextResponse.json({ ok: true, slides: DEFAULT_SLIDES });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
