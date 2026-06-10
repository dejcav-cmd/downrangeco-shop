"use client";
const STORE_URL = "https://downrange-co.printify.me";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "560px",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        background: "var(--bg2)",
        backgroundImage: "url('/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(to right, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.55) 60%, rgba(9,9,11,0.2) 100%),
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px)
          `,
        }}
      />

      {/* Reticle SVG — right side accent */}
      <svg
        viewBox="0 0 260 260"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        style={{
          position: "absolute",
          right: "8%",
          top: "50%",
          transform: "translate(50%, -50%)",
          width: "260px",
          height: "260px",
          opacity: 0.07,
          pointerEvents: "none",
        }}
      >
        <circle cx="130" cy="130" r="120" stroke="#C8922A" strokeWidth="1" />
        <circle cx="130" cy="130" r="65" stroke="#C8922A" strokeWidth="0.8" />
        <circle cx="130" cy="130" r="12" stroke="#C8922A" strokeWidth="1" />
        <line x1="130" y1="2" x2="130" y2="116" stroke="#C8922A" strokeWidth="1" />
        <line x1="130" y1="144" x2="130" y2="258" stroke="#C8922A" strokeWidth="1" />
        <line x1="2" y1="130" x2="116" y2="130" stroke="#C8922A" strokeWidth="1" />
        <line x1="144" y1="130" x2="258" y2="130" stroke="#C8922A" strokeWidth="1" />
        {/* Mil-dot marks */}
        {[60, 80, 100, 160, 180, 200].map((pos) => (
          <line
            key={`h${pos}`}
            x1={pos}
            y1="127"
            x2={pos}
            y2="133"
            stroke="#C8922A"
            strokeWidth="0.8"
          />
        ))}
        {[60, 80, 100, 160, 180, 200].map((pos) => (
          <line
            key={`v${pos}`}
            x1="127"
            y1={pos}
            x2="133"
            y2={pos}
            stroke="#C8922A"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="130" cy="130" r="3" fill="#C8922A" />
      </svg>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 48px 60px",
          maxWidth: "700px",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "32px",
              height: "1px",
              background: "var(--gold)",
            }}
          />
          Built for the Field — Summer 2026
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(64px, 10vw, 100px)",
            lineHeight: 0.88,
            letterSpacing: "0.03em",
            color: "var(--text)",
            marginBottom: "22px",
          }}
        >
          GEAR FOR
          <br />
          HUNTERS,
          <br />
          <span style={{ color: "var(--gold)" }}>SHOOTERS</span>
          <br />& THE 2A.
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: "15px",
            color: "var(--muted)",
            maxWidth: "420px",
            lineHeight: 1.65,
            marginBottom: "32px",
            fontWeight: 300,
          }}
        >
          Premium print-on-demand apparel for those who live it. No compromise.
          Washington-owned, American-printed.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/products"
            
            rel="noopener noreferrer"
            style={{
              background: "var(--gold)",
              color: "#09090B",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 30px",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.1s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--gold-light)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--gold)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            Shop All Products
          </a>
          <a
            href="#categories"
            style={{
              background: "transparent",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "13px 30px",
              border: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(200,146,42,0.28)";
              (e.currentTarget as HTMLElement).style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
            }}
          >
            Browse Categories
          </a>
        </div>
      </div>
    </section>
  );
}
