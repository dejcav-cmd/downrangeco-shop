"use client";
const STORE_URL = "https://downrange-co.printify.me";

const categories = [
  {
    id: "hunting",
    label: "Hunting",
    sub: "Rifle • Bow • Waterfowl • Turkey",
    description:
      "From bull elk at first light to late-season whitetail. Gear that wears as hard as the field you hunt.",
    href: "/products?category=Hunting",
    accent: "#2a3a2a",
    icon: (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Elk silhouette */}
        <path
          d="M32 56 L27 38 L20 22 L13 11 L17 14 L21 10 L27 28 L30 36 M32 56 L37 38 L44 22 L51 11 L47 14 L43 10 L37 28 L34 36"
          stroke="#C8922A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse
          cx="32"
          cy="56"
          rx="7"
          ry="8"
          fill="rgba(200,146,42,0.15)"
          stroke="#C8922A"
          strokeWidth="1.5"
        />
        <path
          d="M17 18 L11 16 M47 18 L53 16"
          stroke="#C8922A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 13 L9 11 M49 13 L55 11"
          stroke="#C8922A"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "2a",
    label: "2A / Patriot",
    sub: "Second Amendment • Constitutional • Firearms",
    description:
      "Shall not be infringed. Apparel for those who understand what the Second Amendment actually means.",
    href: "/products?category=2A+%2F+Patriot",
    accent: "#1a1a2e",
    icon: (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rifle silhouette */}
        <rect x="6" y="28" width="52" height="8" rx="1.5" fill="rgba(200,146,42,0.2)" stroke="#C8922A" strokeWidth="1.5" />
        <rect x="9" y="20" width="30" height="8" rx="1" fill="rgba(200,146,42,0.15)" stroke="#C8922A" strokeWidth="1" />
        <circle cx="14" cy="32" r="5" fill="none" stroke="#C8922A" strokeWidth="1.5" />
        <rect x="40" y="21" width="16" height="3" rx="0.5" fill="#C8922A" opacity="0.5" />
        <rect x="20" y="36" width="7" height="9" rx="0.5" fill="rgba(200,146,42,0.3)" stroke="#C8922A" strokeWidth="1" />
        {/* Stars */}
        <path d="M50 10 L51.5 14.5 L56 14.5 L52.5 17 L54 21.5 L50 19 L46 21.5 L47.5 17 L44 14.5 L48.5 14.5 Z" stroke="#C8922A" strokeWidth="0.8" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "military",
    label: "Military / Vet",
    sub: "Army • Marines • Navy • Air Force • Veterans",
    description:
      "For those who served and those who stand with them. Worn with pride, made to last.",
    href: "/products?category=Military+%2F+Vet",
    accent: "#2e2220",
    icon: (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dog tags */}
        <rect x="20" y="12" width="24" height="30" rx="4" stroke="#C8922A" strokeWidth="1.5" fill="rgba(200,146,42,0.08)" />
        <rect x="20" y="30" width="24" height="12" rx="0 0 4 4" stroke="#C8922A" strokeWidth="1" fill="rgba(200,146,42,0.05)" />
        <circle cx="32" cy="12" r="3" fill="none" stroke="#C8922A" strokeWidth="1.5" />
        <line x1="32" y1="9" x2="32" y2="4" stroke="#C8922A" strokeWidth="1.5" />
        <text x="32" y="24" textAnchor="middle" fill="#C8922A" fontSize="6" fontFamily="monospace" fontWeight="600" letterSpacing="1" opacity="0.8">USVET</text>
        <text x="32" y="32" textAnchor="middle" fill="#C8922A" fontSize="5" fontFamily="monospace" opacity="0.5">USA</text>
        {/* Stars row */}
        <text x="32" y="40" textAnchor="middle" fill="#C8922A" fontSize="7" opacity="0.6">★ ★ ★</text>
        {/* Chain */}
        <path d="M26 4 Q32 2 38 4" stroke="#C8922A" strokeWidth="1" fill="none" strokeDasharray="2,1.5" />
      </svg>
    ),
  },
  {
    id: "long-range",
    label: "Long Range",
    sub: "Precision • Milradian • Sniper • Rimfire",
    description:
      "MRAD not MOA. For those who dope their turrets and know what come-ups mean.",
    href: "/products?category=Long+Range",
    accent: "#1a1916",
    icon: (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Reticle */}
        <circle cx="32" cy="32" r="22" stroke="#C8922A" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="8" stroke="#C8922A" strokeWidth="1" />
        <line x1="32" y1="6" x2="32" y2="22" stroke="#C8922A" strokeWidth="1.5" />
        <line x1="32" y1="42" x2="32" y2="58" stroke="#C8922A" strokeWidth="1.5" />
        <line x1="6" y1="32" x2="22" y2="32" stroke="#C8922A" strokeWidth="1.5" />
        <line x1="42" y1="32" x2="58" y2="32" stroke="#C8922A" strokeWidth="1.5" />
        {/* Mil dots */}
        {[16, 22, 42, 48].map((x) => (
          <circle key={`hd${x}`} cx={x} cy="32" r="1.2" fill="#C8922A" />
        ))}
        {[16, 22, 42, 48].map((y) => (
          <circle key={`vd${y}`} cx="32" cy={y} r="1.2" fill="#C8922A" />
        ))}
        <circle cx="32" cy="32" r="2.5" fill="#C8922A" />
        <text x="32" y="60" textAnchor="middle" fill="#C8922A" fontSize="5" fontFamily="monospace" letterSpacing="3" opacity="0.5">MRAD</text>
      </svg>
    ),
  },
];

export default function Categories() {
  return (
    <section
      id="categories"
      style={{
        padding: "56px 32px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "6px",
            }}
          >
            // Shop by Category
          </div>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "40px",
              letterSpacing: "0.06em",
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            FIND YOUR{" "}
            <span style={{ color: "var(--gold)" }}>GEAR</span>
          </h2>
        </div>
        <a
          href="/products"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--gold)",
            textDecoration: "none",
          }}
        >
          View All →
        </a>
      </div>

      {/* Category grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={cat.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              padding: "32px 28px",
              gap: "16px",
              transition: "border-color 0.2s, transform 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(200,146,42,0.3)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            {/* Accent background blob */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "120px",
                height: "120px",
                background: cat.accent,
                borderRadius: "50%",
                transform: "translate(40px, -40px)",
                opacity: 0.4,
                pointerEvents: "none",
              }}
            />

            {/* Icon */}
            <div style={{ position: "relative", zIndex: 1 }}>{cat.icon}</div>

            {/* Text */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "6px",
                }}
              >
                {cat.sub}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "32px",
                  letterSpacing: "0.06em",
                  color: "var(--text)",
                  marginBottom: "10px",
                  lineHeight: 1,
                }}
              >
                {cat.label}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  fontWeight: 300,
                  marginBottom: "20px",
                }}
              >
                {cat.description}
              </p>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                }}
              >
                Shop {cat.label} →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
