"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const FAQS = [
  { cat: "Orders", items: [
    { q: "How long does my order take?", a: "Production takes 2–7 business days, then 3–5 days US transit. Most orders arrive in 5–12 business days total." },
    { q: "Can I cancel or change my order?", a: "Within 24 hours of placement if it hasn't entered production. After that, it's already being printed. Email support@downrangeco.com immediately." },
    { q: "Why can't I return my order?", a: "Every item is printed specifically for you — we don't hold inventory. We can't accept returns for wrong size or change of mind, but we absolutely replace anything defective or incorrect." },
    { q: "Where are products made?", a: "US-based Printify print providers. Your item is printed fresh, typically from a facility near your delivery address." },
  ]},
  { cat: "Sizing", items: [
    { q: "How do I know what size to order?", a: "Check our Sizing Guide for full measurements. In general, our tees run true to size with a standard/classic fit. When in doubt, size up." },
    { q: "Will my shirt shrink?", a: "Most are pre-shrunk but may see 1–5% shrinkage after first wash. Cold wash, tumble dry low is safest for printed garments." },
  ]},
  { cat: "Shipping", items: [
    { q: "Do you offer free shipping?", a: "Yes — free standard shipping on US orders over $60. International and smaller orders are calculated at checkout." },
    { q: "Do you ship internationally?", a: "Yes, to most countries. 5–30 business days depending on location. Customs duties are the customer's responsibility." },
    { q: "My tracking hasn't updated. What do I do?", a: "Tracking can take 24–48 hours after label creation. If no movement after 5 business days, contact us at support@downrangeco.com." },
  ]},
  { cat: "About Down Range", items: [
    { q: "Who runs Down Range Co.?", a: "One person — a daily carrier and hunter based in Washington State. Every design comes from someone who actually lives this lifestyle." },
    { q: "What is the DownRange news portal?", a: "downrangeco.com is our companion intelligence portal — daily 2A legislation updates, court cases, gear reviews, hunting seasons, and a 50-state CCW guide." },
    { q: "Can I wholesale or collaborate?", a: "Reach out via the contact page. We're open to 2A organizations, hunting clubs, and aligned brands." },
  ]},
];

export default function FAQPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "52px 32px 80px" }}>
          <button onClick={() => window.history.back()}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 12px", cursor: "pointer", marginBottom: 32 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>

          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>// Got questions?</div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px,7vw,72px)", letterSpacing: "0.03em", lineHeight: 0.92, margin: 0 }}>
              FREQUENTLY<br /><span style={{ color: "var(--gold)" }}>ASKED.</span>
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {FAQS.map(section => (
              <div key={section.cat}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--gold)", flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.08em", color: "var(--gold)" }}>{section.cat}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {section.items.map(item => <FAQItem key={item.q} {...item} />)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.2)", padding: "28px", marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: "0.06em", marginBottom: 4 }}>STILL HAVE A QUESTION?</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>We read every message. 1–2 business day response.</div>
            </div>
            <a href="/pages/contact" style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "11px 22px", textDecoration: "none" }}>
              Contact Us →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", transition: "border-color 0.15s" }}
      onMouseEnter={e => !open && ((e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.2)")}
      onMouseLeave={e => !open && ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: "var(--gold)", fontSize: 18, lineHeight: 1, flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "2px 18px 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.75, fontWeight: 300 }}>{a}</div>
      )}
    </div>
  );
}
