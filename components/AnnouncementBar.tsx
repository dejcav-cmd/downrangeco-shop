"use client";

const ANNOUNCEMENTS = [
  "Free shipping on US orders over $60",
  "Hundreds of designs — hunters, shooters & 2A patriots",
  "Washington-owned · American-printed",
  "New drops every week — check back often",
  "Printify-fulfilled · Ships in 2–7 business days",
  "Built for the field. Worn everywhere else.",
  "2A · Hunting · Outdoor · Military / Vet",
];

export default function AnnouncementBar() {
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div style={{
      background: "var(--bg3)",
      borderBottom: "1px solid var(--gold-border)",
      height: "34px",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(to right, var(--bg3), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(to left, var(--bg3), transparent)", zIndex: 2, pointerEvents: "none" }} />

      {/* Scrolling track */}
      <div style={{ display: "flex", alignItems: "center", animation: "marquee 50s linear infinite", whiteSpace: "nowrap", willChange: "transform" }}>
        {items.map((text, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            {/* Animated triple dot separator */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "0 22px" }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{
                  display: "inline-block",
                  width: "4px", height: "4px",
                  borderRadius: "50%",
                  background: "var(--gold)",
                  animation: "dotPulse 1.8s ease-in-out infinite",
                  animationDelay: `${d * 0.22 + (i % 7) * 0.08}s`,
                }} />
              ))}
            </span>
            {/* Text */}
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              opacity: 0.9,
            }}>
              {text}
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.18; transform: scale(0.65); }
          50%       { opacity: 1;    transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
