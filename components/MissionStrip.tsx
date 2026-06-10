"use client";
const STORE_URL = "https://downrange-co.printify.me";

export default function MissionStrip() {
  return (
    <div
      style={{
        background: "var(--bg3)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "52px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "48px",
        flexWrap: "wrap",
      }}
    >
      {/* Left — mission text */}
      <div style={{ maxWidth: "560px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "12px",
          }}
        >
          // Who We Are
        </div>
        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(36px, 5vw, 54px)",
            lineHeight: 0.95,
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          WASHINGTON-OWNED.
          <br />
          <span style={{ color: "var(--gold)" }}>2A-PROUD.</span>
          <br />
          BUILT TO LAST.
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--muted)",
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: "480px",
            marginBottom: "28px",
          }}
        >
          Down Range Co. is a daily-carry, daily-hunt operation. Every design
          comes from someone who actually lives this lifestyle — not a marketing
          team. From opening day to late-season pushes, we build gear that means
          something.
        </p>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "var(--gold)",
            color: "#09090B",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "13px 28px",
            textDecoration: "none",
            display: "inline-block",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "var(--gold-light)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "var(--gold)")
          }
        >
          Shop the Full Collection
        </a>
      </div>

      {/* Right — value props */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minWidth: "240px",
        }}
      >
        {[
          {
            icon: "🎯",
            title: "Designed by enthusiasts",
            desc: "Every design comes from someone who hunts, shoots, and carries daily.",
          },
          {
            icon: "🇺🇸",
            title: "American printed",
            desc: "Printed and shipped from the USA on quality blanks.",
          },
          {
            icon: "📦",
            title: "No inventory risk",
            desc: "Printed on demand — fresh every order, no warehouse waste.",
          },
          {
            icon: "⚡",
            title: "Fast fulfillment",
            desc: "Orders typically ship within 3–5 business days.",
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1.2 }}>{item.icon}</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--text)",
                  marginBottom: "2px",
                  textTransform: "uppercase",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  fontWeight: 300,
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
