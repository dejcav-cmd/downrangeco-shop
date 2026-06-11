import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/opsLogger";
import { createCart, addToCart, removeFromCart, updateCartLine, getCart } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const cartId = req.nextUrl.searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ cart: null });
  try {
    const cart = await getCart(cartId);
    return NextResponse.json({ cart });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, cartId, merchandiseId, quantity, lineId } = body;

  try {
    let cart;
    if (action === "add") {
      if (cartId) {
        cart = await addToCart(cartId, [{ merchandiseId, quantity: quantity ?? 1 }]);
      } else {
        cart = await createCart([{ merchandiseId, quantity: quantity ?? 1 }]);
      }
    } else if (action === "remove") {
      cart = await removeFromCart(cartId, [lineId]);
    } else if (action === "update") {
      cart = await updateCartLine(cartId, [{ id: lineId, quantity }]);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ cart });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
