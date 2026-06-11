import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { writeLog } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";

// Vercel Pro body size limit is 4.5MB — we enforce 4MB to be safe
const MAX_BYTES = 4 * 1024 * 1024;

const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";
const GH_TOKEN  = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "";
const GH_REPO   = "dejcav-cmd/downrangeco-shop";
const GH_BRANCH = "main";

function ghHeaders() {
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function getFileSha(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`,
      { headers: ghHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.sha ?? null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit("upload", `upload:${ip}`, 5, "1 h");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded — max 5 uploads/hour" }, { status: 429 });

  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!GH_TOKEN)
    return NextResponse.json({ error: "GH_TOKEN not set in Vercel environment variables" }, { status: 500 });

  // Check content-length header before reading body
  const contentLength = parseInt(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({
      error: `File too large (${(contentLength / 1024 / 1024).toFixed(1)}MB). Please compress the image to under 4MB before uploading. Use squoosh.app or tinypng.com to reduce file size.`,
    }, { status: 413 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    let   filename = (formData.get("filename") as string | null)?.trim();

    if (!file)                           return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });

    // Double-check actual size after parse
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json({
        error: `Image is ${mb}MB — too large for direct upload. Compress it to under 4MB first.\n\nFree tools:\n• squoosh.app (best quality control)\n• tinypng.com (drag & drop)\n• imagecompressor.com\n\nFor hero images, 1920×1080px at 80% JPEG quality is ideal (~300-600KB).`,
      }, { status: 413 });
    }

    // Sanitise filename
    if (!filename) filename = file.name;
    filename = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    if (!filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) filename += ".jpg";

    const ghPath = `public/${filename}`;
    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const sha    = await getFileSha(ghPath);

    const commitBody: any = {
      message: `Hero image upload: ${filename} via admin panel`,
      content: base64,
      branch:  GH_BRANCH,
    };
    if (sha) commitBody.sha = sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${ghPath}`,
      { method: "PUT", headers: ghHeaders(), body: JSON.stringify(commitBody) }
    );

    if (!commitRes.ok) {
      const errText = await commitRes.text();
      let   errMsg  = `GitHub API ${commitRes.status}`;
      try   { errMsg = JSON.parse(errText).message ?? errMsg; } catch {}
      await writeLog({ level: "error", job: "hero-upload", message: "Upload failed", detail: errMsg });
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    await writeLog({
      level: "ok", job: "hero-upload",
      message: `Hero image uploaded: ${filename}`,
      detail: `${(file.size / 1024).toFixed(0)}KB → public/${filename} committed`,
    });

    return NextResponse.json({
      ok:       true,
      filename: filename,
      path:     `/${filename}`,
      message:  `Uploaded! Use /${filename} as the slide image path. Vercel will redeploy in ~60s.`,
    });

  } catch (e: any) {
    // Catch the 413 from Vercel's own body parser before we even read it
    if (e.message?.includes("413") || e.message?.toLowerCase().includes("too large") || e.message?.toLowerCase().includes("body")) {
      return NextResponse.json({
        error: "Image is too large for direct upload (Vercel 4.5MB limit). Please compress the image first.\n\nFree tools: squoosh.app · tinypng.com · imagecompressor.com\n\nTarget: 1920×1080px, JPEG 80% quality (~300-600KB).",
      }, { status: 413 });
    }
    await writeLog({ level: "error", job: "hero-upload", message: "Upload exception", detail: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
