"use client";
import { useState, useEffect } from "react";

const DEFAULT = {
  eyebrow: "Built for the Field — Summer 2026",
  title_line1: "GEAR FOR",
  title_line2: "HUNTERS,",
  title_line3: "SHOOTERS",
  title_line4: "& THE 2A.",
  subtitle: "Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
  cta_primary: "Shop All Products",
  cta_secondary: "Browse Categories",
  overlay_opacity: 85,
  accent_word: "SHOOTERS",
};

export default function Hero() {
  const [content, setContent] = useState(DEFAULT);

  useEffect(() => {
    fetch("/api/hero").then(r => r.json()).then(d => setContent({ ...DEFAULT, ...d })).catch(() => {});
  }, []);

  const overlayOpacity = (content.overlay_opacity ?? 85) / 100;
  const lines = [content.title_line1, content.title_line2, content.title_line3, content.title_line4].filter(Boolean);

  return (
    <section style={{
      position: "relative", minHeight: "580px",
      display: "flex", alignItems: "flex-end", overflow: "hidden",
      background: "var(--bg2)",
      backgroundImage: "url('/hero.jpg')",
      backgroundSize: "cover", backgroundPosition: "center 30%",
    }}>
      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(to right, rgba(9,9,11,${overlayOpacity}) 0%, rgba(9,9,11,${overlayOpacity * 0.65}) 60%, rgba(9,9,11,${overlayOpacity * 0.25}) 100%),
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 40px)
        `,
      }} />

      {/* Reticle */}
      <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", right: "8%", top: "50%", transform: "translate(50%,-50%)", width: "260px", height: "260px", opacity: 0.07, pointerEvents: "none" }}>
        <circle cx="130" cy="130" r="120" stroke="#C8922A" strokeWidth="1"/>
        <circle cx="130" cy="130" r="65" stroke="#C8922A" strokeWidth="0.8"/>
        <circle cx="130" cy="130" r="12" stroke="#C8922A" strokeWidth="1"/>
        <line x1="130" y1="2" x2="130" y2="116" stroke="#C8922A" strokeWidth="1"/>
        <line x1="130" y1="144" x2="130" y2="258" stroke="#C8922A" strokeWidth="1"/>
        <line x1="2" y1="130" x2="116" y2="130" stroke="#C8922A" strokeWidth="1"/>
        <line x1="144" y1="130" x2="258" y2="130" stroke="#C8922A" strokeWidth="1"/>
        {[60,80,100,160,180,200].map(p=><line key={`h${p}`} x1={p} y1="127" x2={p} y2="133" stroke="#C8922A" strokeWidth="0.8"/>)}
        {[60,80,100,160,180,200].map(p=><line key={`v${p}`} x1="127" y1={p} x2="133" y2={p} stroke="#C8922A" strokeWidth="0.8"/>)}
        <circle cx="130" cy="130" r="3" fill="#C8922A"/>
      </svg>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 48px 60px", maxWidth: "700px" }}>
        {/* Eyebrow */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "32px", height: "1px", background: "var(--gold)" }} />
          {content.eyebrow}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(64px,10vw,100px)", lineHeight: 0.88, letterSpacing: "0.03em", color: "var(--text)", marginBottom: "22px" }}>
          {lines.map((line, i) => (
            <span key={i}>
              {line === content.accent_word
                ? <span style={{ color: "var(--gold)" }}>{line}</span>
                : line
              }
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: "15px", color: "var(--muted)", maxWidth: "420px", lineHeight: 1.65, marginBottom: "32px", fontWeight: 300 }}>
          {content.subtitle}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="/products"
            style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 30px", textDecoration: "none", display: "inline-block", transition: "background 0.2s, transform 0.1s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold-light)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
            {content.cta_primary}
          </a>
          <a href="#categories"
            style={{ background: "transparent", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 30px", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", display: "inline-block", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.28)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}>
            {content.cta_secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
