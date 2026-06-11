"use client";
const stats = [
  { num: "∞", label: "Design Ideas" },
  { num: "Free", label: "Shipping $60+" },
  { num: "USA", label: "Printed & Shipped" },
  { num: "2A", label: "Owned Business" },
];

export default function StatStrip() {
  return (
    <div
      style={{
        background: "var(--bg3)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            padding: "14px 0",
            textAlign: "center",
            borderRight:
              i < stats.length - 1
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-bebas)",
              fontSize: "26px",
              color: "var(--gold)",
              letterSpacing: "0.06em",
            }}
          >
            {s.num}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
