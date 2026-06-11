"use client";

const MESSAGES = [
  "Free shipping on US orders over $60",
  "Hundreds of designs — hunters, shooters & 2A patriots",
  "Washington-owned · American-printed",
  "New drops every week",
  "Printify-fulfilled · Ships 2–7 business days",
  "Built for the field. Worn everywhere else.",
  "2A · Hunting · Outdoor · Military / Vet",
];

export default function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES, ...MESSAGES];
  return (
    <div style={{
      background: "#111318",   /* portal --bg2 exactly */
      borderBottom: "1px solid #1F2428",  /* portal --border */
      height: "36px",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Fade edges */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:80, background:"linear-gradient(to right, #111318, transparent)", zIndex:2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:"linear-gradient(to left, #111318, transparent)", zIndex:2, pointerEvents:"none" }}/>

      <div style={{ display:"flex", alignItems:"center", animation:"marquee 52s linear infinite", whiteSpace:"nowrap", willChange:"transform" }}>
        {items.map((text, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
            {/* Triple animated dots — exact portal pattern */}
            <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"0 20px" }}>
              {[0,1,2].map(d => (
                <span key={d} style={{
                  display:"inline-block",
                  width:"5px", height:"5px",
                  borderRadius:"50%",
                  background:"#C8922A",
                  animation:"dotPulse 1.8s ease-in-out infinite",
                  animationDelay:`${d * 0.24 + (i % 7) * 0.07}s`,
                }} />
              ))}
            </span>
            <span style={{
              fontFamily:"'IBM Plex Mono', monospace",
              fontSize:"10px",
              letterSpacing:"0.16em",
              textTransform:"uppercase",
              color:"#C8922A",
              opacity: 0.92,
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
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          50%       { opacity: 1;    transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
