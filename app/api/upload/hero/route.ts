import { NextRequest, NextResponse } from "next/server";
import { uploadRatelimit, checkRateLimit } from "@/lib/ratelimit";
import { writeLog } from "@/lib/opsLogger";

export const dynamic = "force-dynamic";

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

// Get SHA of existing file (needed for update, null if new file)
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
  // Rate limit
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit(uploadRatelimit, `upload:${ip}`);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded — max 5 uploads/hour" }, { status: 429 });

  // Auth
  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GH_TOKEN) {
    return NextResponse.json({ error: "GH_TOKEN not set in Vercel environment variables" }, { status: 500 });
  }

  try {
    // Parse FormData
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    let   filename = (formData.get("filename") as string | null)?.trim();

    if (!file)                          return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)   return NextResponse.json({ error: "Max file size is 10MB" }, { status: 400 });

    // Sanitise filename — keep it safe for GitHub path
    if (!filename) filename = file.name;
    filename = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")  // only safe chars
      .replace(/^-+|-+$/g, "")           // no leading/trailing dashes
      .toLowerCase();
    if (!filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      filename += ".jpg";
    }

    // Always save under public/ so Next.js can serve it
    const ghPath = `public/${filename}`;

    // Convert to base64
    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Get existing file SHA (null = new file, ok to omit sha)
    const sha = await getFileSha(ghPath);

    // Commit to GitHub
    const commitBody: any = {
      message: `Hero image upload: ${filename} (via admin panel)`,
      content: base64,
      branch:  GH_BRANCH,
    };
    if (sha) commitBody.sha = sha; // required for updates, must NOT include for new files

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
      detail: `${(file.size / 1024).toFixed(0)}KB → public/${filename} committed to GitHub`,
    });

    return NextResponse.json({
      ok:       true,
      filename: filename,
      path:     `/${filename}`,
      message:  `Uploaded successfully. Use /${filename} as the slide image path. Vercel will redeploy in ~60 seconds.`,
    });

  } catch (e: any) {
    await writeLog({ level: "error", job: "hero-upload", message: "Upload exception", detail: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
