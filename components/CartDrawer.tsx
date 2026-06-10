"use client";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/shopify";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeItem, updateItem, loading } = useCart();
  const lines = cart?.lines?.nodes ?? [];

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 998, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 999,
        width: "420px", maxWidth: "100vw",
        background: "var(--bg2)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        transform: cartOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: "24px", letterSpacing: "0.08em", color: "var(--text)" }}>
              YOUR <span style={{ color: "var(--gold)" }}>CART</span>
            </div>
            {cart?.totalQuantity ? (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginTop: "2px" }}>
                {cart.totalQuantity} item{cart.totalQuantity !== 1 ? "s" : ""}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "22px", lineHeight: 1, padding: "4px" }}
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {lines.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "16px" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.2}>
                <circle cx="24" cy="24" r="20" stroke="#C8922A" strokeWidth="1.5"/>
                <path d="M16 24h16M24 16v16" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
                Your cart is empty
              </div>
              <a href="/products" onClick={() => setCartOpen(false)} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}>
                Start Shopping →
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {lines.map((line) => (
                <div key={line.id} style={{ display: "flex", gap: "14px", padding: "14px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Image */}
                  <div style={{ width: "70px", height: "70px", background: "var(--bg3)", flexShrink: 0, overflow: "hidden" }}>
                    {line.merchandise.image && (
                      <img src={line.merchandise.image.url} alt={line.merchandise.image.altText ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {line.merchandise.product.title}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", marginBottom: "10px" }}>
                      {line.merchandise.title}
                    </div>

                    {/* Qty + price */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <button
                          onClick={() => line.quantity > 1 ? updateItem(line.id, line.quantity - 1) : removeItem(line.id)}
                          style={{ width: "28px", height: "28px", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text)", padding: "0 10px", minWidth: "28px", textAlign: "center" }}>{line.quantity}</span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          style={{ width: "28px", height: "28px", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >+</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--gold)" }}>
                          {formatMoney((parseFloat(line.merchandise.price.amount) * line.quantity).toFixed(2))}
                        </span>
                        <button onClick={() => removeItem(line.id)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: "var(--gold)" }}>
                {formatMoney(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
              </span>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center", marginBottom: "12px" }}>
              Shipping calculated at checkout
            </div>

            {/* Checkout button */}
            <a
              href={cart.checkoutUrl}
              style={{
                display: "block", textAlign: "center",
                background: "var(--gold)", color: "#09090B",
                fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "16px", textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-light)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold)")}
            >
              Checkout — {formatMoney(cart.cost.totalAmount.amount)}
            </a>

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "14px" }}>
              {["🔒 Secure", "🇺🇸 USA Made", "📦 Free Ship $60+"].map((b) => (
                <span key={b} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase" }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(9,9,11,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)" }}>
              Updating...
            </div>
          </div>
        )}
      </div>
    </>
  );
}
