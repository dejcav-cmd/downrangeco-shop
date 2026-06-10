"use client";

export default function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(9,9,11,0.96)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "60px",
    }}>
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", height: "42px" }}>
        <img src="/logo.png" alt="Down Range Co." style={{ height: "38px", width: "auto", objectFit: "contain" }} />
      </a>

      {/* Desktop links */}
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
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a href="/products" style={{ background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.28)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", textDecoration: "none", whiteSpace: "nowrap" }}>
        Shop Now →
      </a>

      <style>{`@media(max-width:768px){.nav-links{display:none!important}}`}</style>
    </nav>
  );
}
