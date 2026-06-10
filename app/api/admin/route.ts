import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.PRINTIFY_TOKEN!;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID!;
const BASE = "https://api.printify.com/v1";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "drco-admin-2026";

function auth(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  return key === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action = req.nextUrl.searchParams.get("action") ?? "products";
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  try {
    let url = "";
    if (action === "products") url = `${BASE}/shops/${SHOP_ID}/products.json?page=${page}&limit=20`;
    else if (action === "orders") url = `${BASE}/shops/${SHOP_ID}/orders.json?page=${page}&limit=20`;
    else if (action === "shop") url = `${BASE}/shops.json`;
    else return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, productId } = body;

  try {
    let url = "";
    let method = "POST";
    let payload: any = null;

    if (action === "publish") {
      url = `${BASE}/shops/${SHOP_ID}/products/${productId}/publishing_succeeded.json`;
      payload = { external: { id: productId, handle: "" } };
    } else if (action === "unpublish") {
      url = `${BASE}/shops/${SHOP_ID}/products/${productId}/publishing_failed.json`;
      payload = { reason: "unpublished" };
    } else if (action === "delete") {
      url = `${BASE}/shops/${SHOP_ID}/products/${productId}.json`;
      method = "DELETE";
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (method === "DELETE") return NextResponse.json({ ok: true });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
