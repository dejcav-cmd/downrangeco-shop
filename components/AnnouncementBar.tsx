"use client";

const ANNOUNCEMENTS = [
  "Free shipping on US orders over $60",
  "400+ designs — hunters, shooters & 2A patriots",
  "Washington-owned · American-printed",
  "New drops every week — check back often",
  "Printify-fulfilled · Ships in 2–7 business days",
  "Built for the field. Worn everywhere else.",
];

export default function AnnouncementBar() {
  // Duplicate for seamless loop
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div style={{
      background: "var(--bg3)",
      borderBottom: "1px solid rgba(200,146,42,0.2)",
      height: "38px",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      alignItems: "center",
      paddingTop: "6px",
    }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, var(--bg3), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, var(--bg3), transparent)", zIndex: 2, pointerEvents: "none" }} />

      {/* Scrolling track */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, animation: "marquee 40s linear infinite", whiteSpace: "nowrap", willChange: "transform" }}>
        {items.map((text, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
            {/* Animated dot separator */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "0 20px" }}>
              <DotGroup index={i} />
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--gold)",
              opacity: 0.85,
            }}>
              {text}
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function DotGroup({ index }: { index: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2].map(d => (
        <span key={d} style={{
          display: "inline-block",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "var(--gold)",
          animation: `dotPulse 1.6s ease-in-out infinite`,
          animationDelay: `${(d * 0.2) + (index * 0.05)}s`,
        }} />
      ))}
    </span>
  );
}
