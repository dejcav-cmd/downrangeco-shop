"use client";
import { useCart } from "@/context/CartContext";

export default function Nav() {
  const { cart, setCartOpen } = useCart();
  const qty = cart?.totalQuantity ?? 0;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(9,9,11,0.96)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "68px",
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", height: "100%" }}>
        <img src="/logo.png" alt="Down Range Co." style={{ height: "52px", width: "auto", maxWidth: "280px", objectFit: "contain" }} />
      </a>

      <ul style={{ display: "flex", gap: "24px", listStyle: "none", margin: 0, padding: 0 }} className="nav-links">
        {[
          { label: "Shop All",       href: "/products" },
          { label: "Hunting",        href: "/collections/hunting" },
          { label: "2A / Patriot",   href: "/collections/2a-patriot" },
          { label: "Military / Vet", href: "/collections/military-vet" },
          { label: "Our Story",      href: "/about" },
        ].map((link) => (
          <li key={link.label}>
            <a href={link.href} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--muted)")}
            >{link.label}</a>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Account */}
        <a href="https://shopify.com/83728892116/account" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 14px", textDecoration: "none", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.28)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          "Account"
        </a>

        {/* Cart */}
        <button onClick={() => setCartOpen(true)}
          style={{ position: "relative", background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.28)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "background 0.2s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.22)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.12)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l1.5 7h7l1-5H4" stroke="#C8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="12" r="1" fill="#C8922A"/><circle cx="11" cy="12" r="1" fill="#C8922A"/></svg>
          Cart
          {qty > 0 && (
            <span style={{ background: "var(--gold)", color: "#09090B", borderRadius: "50%", width: "17px", height: "17px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {qty}
            </span>
          )}
        </button>
      </div>

      <style>{`@media(max-width:900px){.nav-links{display:none!important}}`}</style>
    </nav>
  );
}
