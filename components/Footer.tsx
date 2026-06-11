"use client";

const PRINTIFY_STORE = "https://downrange-co.printify.me";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--bg2)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 32px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "32px", maxWidth: "1200px", margin: "0 auto 32px" }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: "12px" }}>
            <img src="/logo.png" alt="Down Range Co." style={{ height: "130px", width: "auto", maxWidth: "520px", objectFit: "contain" }} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", color: "var(--muted)", textTransform: "uppercase", lineHeight: 1.8 }}>
            Gear for hunters, shooters &amp;<br />
            those who defend the Second.<br /><br />
            Washington State, USA
          </div>
        </div>

        {/* Shop — all internal */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Shop</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { label: "All Products",   href: "/products" },
              { label: "Hunting",        href: "/products?category=Hunting" },
              { label: "2A / Patriot",   href: "/products?category=2A+%2F+Patriot" },
              { label: "Military / Vet", href: "/products?category=Military+%2F+Vet" },
              { label: "Long Range",     href: "/products?category=Long+Range" },
            ].map((l) => (
              <li key={l.label} style={{ marginBottom: "8px" }}>
                <a href={l.href} style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Info</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {["Sizing Guide", "Shipping & Returns", "FAQ", "Contact"].map((l) => (
              <li key={l} style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", cursor: "pointer" }}>{l}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Connect</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { label: "DownRange Portal", href: "https://downrangeco.com" },
              { label: "Instagram",        href: "#" },
              { label: "Facebook",         href: "#" },
            ].map((l) => (
              <li key={l.label} style={{ marginBottom: "8px" }}>
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase" }}>
          © {year} Down Range Co. — All Rights Reserved
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em", display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "2A Proud"].map((l) => (
            <span key={l} style={{ cursor: "pointer" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
