"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout from "@/components/PolicyLayout";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Order issue", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    // Opens default mail client as fallback — in production wire to Resend or similar
    const mailto = `mailto:support@downrangeco.com?subject=${encodeURIComponent(`[${form.subject}] ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setTimeout(() => setStatus("sent"), 1000);
  };

  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// We read every message"
          title="CONTACT\nUS"
          subtitle="Questions about your order, sizing, or the brand — reach out and we'll get back to you within 1–2 business days. We're a small operation and every message comes to a real person."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }}>

            {/* Form */}
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <CField label="Your Name">
                    <input value={form.name} onChange={set("name")} placeholder="DJ Cavalcanti" style={iStyle} />
                  </CField>
                  <CField label="Email Address">
                    <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" style={iStyle} />
                  </CField>
                </div>

                <CField label="Subject">
                  <select value={form.subject} onChange={set("subject")} style={{ ...iStyle, cursor: "pointer" }}>
                    <option>Order issue</option>
                    <option>Damaged / defective item</option>
                    <option>Wrong item received</option>
                    <option>Shipping / tracking question</option>
                    <option>Sizing question</option>
                    <option>Wholesale / collaboration</option>
                    <option>General question</option>
                    <option>Other</option>
                  </select>
                </CField>

                <CField label="Message">
                  <textarea value={form.message} onChange={set("message")} placeholder="Include your order number if this is about a specific order..." rows={6}
                    style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} />
                </CField>

                {status === "sent" ? (
                  <div style={{ background: "rgba(42,106,58,0.15)", border: "1px solid rgba(42,106,58,0.4)", padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#6adb8a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    ✓ Opening your email client — we'll reply within 1–2 business days.
                  </div>
                ) : (
                  <button onClick={submit} disabled={status === "sending" || !form.name || !form.email || !form.message}
                    style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: 14, border: "none", cursor: "pointer", opacity: (!form.name || !form.email || !form.message) ? 0.5 : 1, transition: "opacity 0.2s" }}>
                    {status === "sending" ? "Opening..." : "Send Message →"}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Response time */}
              <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Response Time</div>
                <div style={{ fontFamily: "var(--font-bebas)", fontSize: 28, color: "var(--text)", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 6 }}>1–2 DAYS</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>We respond to all messages within 1–2 business days. For urgent order issues, include your order number in the subject.</div>
              </div>

              {/* Direct email */}
              <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>Direct Email</div>
                <a href="mailto:support@downrangeco.com" style={{ fontSize: 13, color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>
                  support@downrangeco.com
                </a>
              </div>

              {/* Quick links */}
              <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Before You Write</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Sizing Guide", href: "/pages/sizing-guide" },
                    { label: "Shipping & Returns", href: "/pages/shipping-returns" },
                    { label: "FAQ", href: "/pages/faq" },
                    { label: "Track Your Order", href: "https://shopify.com/83728892116/account" },
                  ].map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "color 0.15s" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted)")}>
                      {l.label} <span>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Portal link */}
              <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.2)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>DownRange Portal</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>For questions about the news portal, legislation coverage, or the CCW guide — visit the portal directly.</div>
                <a href="https://downrangeco.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  downrangeco.com ↗
                </a>
              </div>
            </div>
          </div>

          <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr!important}}`}</style>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}

function CField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const iStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 13, padding: "11px 14px",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
};
