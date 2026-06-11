"use client";

const SOCIAL = [
  { label: "𝕏",  title: "X / Twitter", href: "https://x.com/DownRangeCo",                       color: "#e5e5e5" },
  { label: "🦋", title: "Bluesky",      href: "https://bsky.app/profile/downrangeco.bsky.social", color: "#0085FF" },
  { label: "▶",  title: "YouTube",      href: "https://www.youtube.com/@DownRangeCo",              color: "#FF0000" },
  { label: "f",  title: "Facebook",     href: "https://www.facebook.com/downrangeco",              color: "#1877F2" },
  { label: "◈",  title: "Instagram",    href: "https://www.instagram.com/downrangeco",             color: "#E1306C" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      background: "#07080A",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "28px 0",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>

        {/* Left — copyright */}
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          © {year} Down Range Co. · All Rights Reserved
        </div>

        {/* Center — social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#4B5563", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 6 }}>
            Social Media:
          </span>
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: s.color, textDecoration: "none", fontSize: 13, transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = s.color + "60"; (e.currentTarget as HTMLElement).style.background = s.color + "14"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}>
              {s.label}
            </a>
          ))}
        </div>

        {/* Right — legal links */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[["Privacy", "/pages/privacy"], ["Terms", "/pages/terms"], ["Contact", "/pages/contact"]].map(([l, h]) => (
            <a key={h} href={h}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#6B7280", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C8922A"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B7280"}>
              {l}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
