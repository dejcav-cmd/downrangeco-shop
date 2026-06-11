"use client";
import Link from "next/link";

const PORTAL = "https://downrangeco.com";

const COLS = [
  {
    title: "News & Intel",
    links: [
      ["Latest News",      `${PORTAL}/news`],
      ["Live Deals",       `${PORTAL}/deals`],
      ["Market Watch",     `${PORTAL}/market`],
      ["New Releases",     `${PORTAL}/releases`],
      ["Video",            `${PORTAL}/video`],
      ["Giveaways",        `${PORTAL}/giveaways`],
    ],
  },
  {
    title: "Laws & Rights",
    links: [
      ["Bill Tracker",     `${PORTAL}/laws?tab=federal`],
      ["State Laws",       `${PORTAL}/laws?tab=state`],
      ["ATF Rules",        `${PORTAL}/laws?tab=atf`],
      ["SCOTUS Cases",     `${PORTAL}/laws?tab=scotus`],
      ["CCW Reciprocity",  `${PORTAL}/ccw`],
      ["State Hub",        `${PORTAL}/state-hub`],
    ],
  },
  {
    title: "Firearms",
    links: [
      ["Gun Encyclopedia",  `${PORTAL}/guns`],
      ["Compare Guns",      `${PORTAL}/compare/glock-19-vs-sig-p320`],
      ["NFA Tracker",       `${PORTAL}/nfa-tracker`],
      ["Value Estimator",   `${PORTAL}/value-estimator`],
      ["FFL Finder",        `${PORTAL}/ffl-finder`],
      ["Holsters",          `${PORTAL}/holsters/glock-19`],
    ],
  },
  {
    title: "Learn & Outdoors",
    links: [
      ["Learning Center",  `${PORTAL}/learn`],
      ["First Gun Guide",  `${PORTAL}/learn/buying-your-first-gun`],
      ["CCW License Guide",`${PORTAL}/learn/how-to-get-ccw-license`],
      ["Home Defense",     `${PORTAL}/learn/home-defense-basics`],
      ["Hunting",          `${PORTAL}/hunting`],
      ["Preparedness",     `${PORTAL}/preparedness`],
    ],
  },
  {
    title: "Apparel Store",
    links: [
      ["Shop All",         "/products"],
      ["Hunting Gear",     "/collections/hunting"],
      ["2A / Patriot",     "/collections/2a-patriot"],
      ["Military / Vet",   "/collections/military-vet"],
      ["Our Story",        "/about"],
      ["Sizing Guide",     "/pages/sizing-guide"],
      ["Shipping & Returns","/pages/shipping-returns"],
      ["FAQ",              "/pages/faq"],
    ],
  },
];

const SOCIAL = [
  { label: "𝕏",  href: "https://x.com/DownRangeCo",                      color: "#e5e5e5" },
  { label: "🦋", href: "https://bsky.app/profile/downrangeco.bsky.social", color: "#0085FF" },
  { label: "▶",  href: "https://www.youtube.com/@DownRangeCo",             color: "#FF0000" },
  { label: "f",  href: "https://www.facebook.com/downrangeco",             color: "#1877F2" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "#07080A",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "48px 0 24px",
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "260px repeat(5, 1fr)",
          gap: 36,
          marginBottom: 40,
          "@media(max-width:900px)": { gridTemplateColumns: "1fr 1fr" },
        } as any}>

          {/* Brand column */}
          <div>
            <a href="/" style={{ display: "block", marginBottom: 12, textDecoration: "none" }}>
              <img src="/logo.png" alt="Down Range Co." style={{ height: 36, width: "auto", maxWidth: 180, objectFit: "contain" }}/>
            </a>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Premium 2A Apparel<br/>Washington-Owned · American-Printed
            </div>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: s.color, textDecoration: "none", fontSize: 13, transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = s.color + "60"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}>
                  {s.label}
                </a>
              ))}
            </div>
            {/* Portal badge */}
            <a href={PORTAL} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(200,146,42,0.08)", border: "1px solid rgba(200,146,42,0.25)", color: "#C8922A", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", textDecoration: "none" }}>
              📡 Visit News Portal
            </a>
            <p style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.6, marginTop: 12 }}>
              Content is for informational purposes only and does not constitute legal advice.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {col.title}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {col.links.map(([label, href]) => {
                  const isExternal = href.startsWith("http");
                  const props = isExternal
                    ? { href, target: "_blank", rel: "noopener noreferrer" }
                    : { href };
                  return (
                    <li key={href}>
                      <a {...props}
                        style={{ fontSize: 12, color: "#6B7280", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C8922A"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B7280"}>
                        {label}{isExternal && col.title !== "Apparel Store" ? " ↗" : ""}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#6B7280", letterSpacing: "0.06em" }}>
            © {year} DOWN RANGE CO. · ALL RIGHTS RESERVED
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[["Privacy","/pages/privacy"],["Terms","/pages/terms"],["Shipping","/pages/shipping-returns"],["FAQ","/pages/faq"],["Contact","/pages/contact"]].map(([l,h]) => (
              <a key={h} href={h}
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#6B7280", textDecoration: "none", letterSpacing: "0.06em" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C8922A"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B7280"}>
                {l}
              </a>
            ))}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A6320", letterSpacing: "0.06em" }}>
            BUILT IN THE USA 🇺🇸
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          footer > div > div:first-of-type {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media(max-width:600px){
          footer > div > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
