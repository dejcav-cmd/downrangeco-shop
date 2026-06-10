"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
    product: { title: string; handle: string };
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: { nodes: CartLine[] };
}

interface CartContextType {
  cart: Cart | null;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartId = localStorage.getItem("dr_cart_id");
    if (cartId) fetchCart(cartId);
  }, []);

  const fetchCart = async (cartId: string) => {
    try {
      const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
      }
    } catch {}
  };

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    setLoading(true);
    try {
      const cartId = localStorage.getItem("dr_cart_id");
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", cartId, merchandiseId, quantity }),
      });
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
        localStorage.setItem("dr_cart_id", data.cart.id);
        setCartOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", cartId: cart.id, lineId }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", cartId: cart.id, lineId, quantity }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addItem, removeItem, updateItem, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
