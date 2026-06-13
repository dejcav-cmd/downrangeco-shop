import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";
const IDEOGRAM_KEY = process.env.IDEOGRAM_API_KEY ?? "";

// POST /api/ideogram — generate transparent 4K PNG via Ideogram v3
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!IDEOGRAM_KEY)
    return NextResponse.json({ error: "IDEOGRAM_API_KEY not configured in Vercel env vars" }, { status: 500 });

  const body = await req.json();
  const {
    prompt,
    aspect_ratio = "ASPECT_1_1",
    rendering_speed = "QUALITY",
    upscale_factor = "X2",   // X1 | X2 | X4 — X2 gets us ~3840px from native 2K
    color_palette,
    seed,
  } = body;

  if (!prompt?.trim())
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });

  // Build request payload for Ideogram v3 transparent endpoint
  const payload: any = {
    image_request: {
      prompt: prompt.trim(),
      aspect_ratio,
      rendering_speed,   // TURBO | DEFAULT | QUALITY (FLASH not supported for transparent)
      upscale_factor,    // upscale happens in-call — one API credit covers both
    },
  };

  if (seed) payload.image_request.seed = Number(seed);
  if (color_palette) payload.image_request.color_palette = color_palette;

  try {
    const res = await fetch("https://api.ideogram.ai/generate/transparent", {
      method: "POST",
      headers: {
        "Api-Key": IDEOGRAM_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok)
      return NextResponse.json({ error: data?.message ?? "Ideogram error", detail: data }, { status: res.status });

    // Return the generated image data to the client
    const images = (data.data ?? []).map((img: any) => ({
      url: img.url,
      seed: img.seed,
      resolution: img.resolution,
      prompt: img.prompt ?? prompt,
    }));

    return NextResponse.json({ ok: true, images, created: data.created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/ideogram — return config status
export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    configured: !!IDEOGRAM_KEY,
    endpoint: "https://api.ideogram.ai/generate/transparent",
    model: "ideogram-v3",
    defaults: {
      aspect_ratio: "ASPECT_1_1",
      rendering_speed: "QUALITY",
      upscale_factor: "X2",
    },
  });
}
