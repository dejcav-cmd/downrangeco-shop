"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const linkStyle = {
    fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.15s", display: "block",
  } as const;

  return (
    <footer style={{ background: "var(--footer-bg)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 32px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "32px", maxWidth: "1200px", margin: "0 auto 32px" }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: "14px" }}>
            <img src="/logo.png" alt="Down Range Co." style={{ height: "130px", width: "auto", maxWidth: "520px", objectFit: "contain" }} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", color: "var(--muted)", textTransform: "uppercase", lineHeight: 1.8 }}>
            Gear for hunters, shooters &amp;<br />
            those who defend the Second.<br /><br />
            Washington State, USA
          </div>
        </div>

        {/* Shop */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Shop</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "All Products",   href: "/products" },
              { label: "Hunting",        href: "/products?category=Hunting" },
              { label: "2A / Patriot",   href: "/products?category=2A+%2F+Patriot" },
              { label: "Military / Vet", href: "/products?category=Military+%2F+Vet" },
              { label: "Long Range",     href: "/products?category=Long+Range" },
            ].map(l => (
              <li key={l.label}>
                <a href={l.href} style={linkStyle}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = "var(--text)")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--muted)")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Info — all real links now */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Info</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Sizing Guide",      href: "/pages/sizing-guide" },
              { label: "Shipping & Returns",href: "/pages/shipping-returns" },
              { label: "FAQ",               href: "/pages/faq" },
              { label: "Contact",           href: "/pages/contact" },
            ].map(l => (
              <li key={l.label}>
                <a href={l.href} style={linkStyle}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = "var(--text)")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--muted)")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>Connect</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "📡 News Portal",   href: "https://downrangeco.com",                        external: true },
              { label: "My Account",       href: "https://shopify.com/83728892116/account",         external: true },
              { label: "𝕏 X / Twitter",   href: "https://x.com/DownRangeCo",                       external: true },
              { label: "🦋 Bluesky",       href: "https://bsky.app/profile/downrangeco.bsky.social", external: true },
              { label: "▶ YouTube",        href: "https://www.youtube.com/@DownRangeCo",             external: true },
              { label: "f Facebook",       href: "https://www.facebook.com/downrangeco",             external: true },
            ].map(l => (
              <li key={l.label}>
                <a href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined}
                  style={linkStyle}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = "var(--text)")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--muted)")}>
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
          © {year} DownRange Co. — All Rights Reserved
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em", display: "flex", gap: "20px" }}>
          {[
            { label: "Privacy",  href: "/pages/privacy" },
            { label: "Terms",    href: "/pages/terms" },
            { label: "2A Proud", href: "/pages/2a-proud" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ color: "var(--muted)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--muted)")}>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:900px){footer>div:first-child{grid-template-columns:1fr 1fr!important}}`}</style>
    </footer>
  );
}
