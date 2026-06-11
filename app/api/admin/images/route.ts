import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "bc081ac920174e0ca49d7f95518a9ce5f8c8d744";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const publicDir = join(process.cwd(), "public");
    const entries   = await readdir(publicDir);

    const images = await Promise.all(
      entries
        .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
        .filter(f => !f.startsWith("icon") && f !== "logo.png")
        .map(async f => {
          const s = await stat(join(publicDir, f)).catch(() => null);
          return {
            path:     `/${f}`,
            filename: f,
            size:     s ? Math.round(s.size / 1024) + "KB" : "?",
          };
        })
    );

    // Sort: hero images first
    images.sort((a, b) => a.filename.localeCompare(b.filename));

    return NextResponse.json({ images });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
