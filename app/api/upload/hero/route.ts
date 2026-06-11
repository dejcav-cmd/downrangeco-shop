import { NextRequest, NextResponse } from "next/server";
import { uploadRatelimit, checkRateLimit } from "@/lib/ratelimit";

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "drco-admin-2026";
const GH_TOKEN   = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "";
const GH_REPO    = "dejcav-cmd/downrangeco-shop";
const GH_PATH    = "public/hero.jpg";
const GH_BRANCH  = "main";
const GH_API     = `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit(uploadRatelimit, `upload:${ip}`);
  if (!allowed) return NextResponse.json({ error: "Upload rate limit exceeded" }, { status: 429 });
  const key = req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Must be an image file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 10MB" }, { status: 400 });

    if (!GH_TOKEN) return NextResponse.json({ error: "GH_TOKEN not configured in Vercel env vars" }, { status: 500 });

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Get current file SHA (needed for update)
    const shaRes = await fetch(GH_API, {
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    const shaData = shaRes.ok ? await shaRes.json() : null;
    const sha = shaData?.sha;

    // Commit the new image to GitHub
    const commitRes = await fetch(GH_API, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update hero image via admin panel",
        content: base64,
        branch: GH_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      throw new Error(`GitHub commit failed: ${err.message}`);
    }

    return NextResponse.json({
      ok: true,
      message: "Hero image committed to GitHub. Vercel will redeploy in ~60 seconds.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
