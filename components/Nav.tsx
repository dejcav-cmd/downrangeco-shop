"use client";
import { useCart } from "@/context/CartContext";

export default function Nav() {
  const { cart, setCartOpen } = useCart();
  const qty = cart?.totalQuantity ?? 0;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(9,9,11,0.96)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "80px",
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", height: "100%" }}>
        <img src="/logo.png" alt="Down Range Co." style={{ height: "62px", width: "auto", maxWidth: "340px", objectFit: "contain" }} />
      </a>

      <ul style={{ display: "flex", gap: "28px", listStyle: "none", margin: 0, padding: 0 }} className="nav-links">
        {[
          { label: "Shop All",       href: "/products" },
          { label: "Hunting",        href: "/products?category=Hunting" },
          { label: "2A / Patriot",   href: "/products?category=2A+%2F+Patriot" },
          { label: "Military / Vet", href: "/products?category=Military+%2F+Vet" },
        ].map((link) => (
          <li key={link.label}>
            <a href={link.href} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}
            >{link.label}</a>
          </li>
        ))}
      </ul>

      {/* Cart button */}
      <button
        onClick={() => setCartOpen(true)}
        style={{ position: "relative", background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.28)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.22)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.12)")}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l1.5 7h7l1-5H4" stroke="#C8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="12" r="1" fill="#C8922A"/><circle cx="11" cy="12" r="1" fill="#C8922A"/></svg>
        Cart
        {qty > 0 && (
          <span style={{ background: "var(--gold)", color: "#09090B", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            {qty}
          </span>
        )}
      </button>

      <style>{`@media(max-width:768px){.nav-links{display:none!important}}`}</style>
    </nav>
  );
}
