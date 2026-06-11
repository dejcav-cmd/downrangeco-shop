"use client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ShippingReturnsPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "52px 32px 80px" }}>
          <button onClick={() => window.history.back()}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 12px", cursor: "pointer", marginBottom: 32 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>

          <div style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>// Know before you order</div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px,7vw,72px)", letterSpacing: "0.03em", lineHeight: 0.92, margin: "0 0 16px" }}>
              SHIPPING &<br /><span style={{ color: "var(--gold)" }}>RETURNS</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 560, lineHeight: 1.75, fontWeight: 300 }}>
              Every item is printed on demand — made specifically for your order by Printify's US print network. No inventory. No waste. Here's what to expect.
            </p>
          </div>

          {/* Order Journey Timeline */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 24 }}>// Your order journey</div>
            <div style={{ display: "flex", gap: 0, position: "relative" }}>
              <div style={{ position: "absolute", top: 20, left: "12%", right: "12%", height: 1, background: "linear-gradient(to right, var(--gold), rgba(200,146,42,0.2))", zIndex: 0 }} />
              {[
                { icon: "◎", step: "01", label: "Order Placed",  desc: "Payment confirmed, enters queue" },
                { icon: "◈", step: "02", label: "Printing",      desc: "2–7 business days" },
                { icon: "◉", step: "03", label: "Shipped",       desc: "Tracking email sent" },
                { icon: "✓", step: "04", label: "Delivered",     desc: "3–5 US days transit" },
              ].map(s => (
                <div key={s.step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1, padding: "0 4px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg3)", border: "2px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--gold)", fontSize: 15, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 3 }}>{s.step}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <InfoCard title="Production Time" items={[["Standard","2–7 business days"],["Holiday / Peak","Up to 10 business days"],["Express","1–2 business days (select)"]]} />
            <InfoCard title="US Shipping" items={[["Standard","3–5 days · Free over $60"],["Priority","2–3 days"],["Express","1–2 days"]]} />
            <InfoCard title="International" items={[["Canada","5–10 business days"],["UK / Europe","5–14 business days"],["Australia","10–20 business days"],["Rest of World","10–30 business days"]]} note="Customs duties are customer's responsibility" />
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Returns Policy</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#e08080", marginBottom: 8 }}>Not accepted:</div>
                {["Wrong size selected","Change of mind","Buyer's remorse"].map(i=>(
                  <div key={i} style={{ display:"flex",gap:8,marginBottom:4,fontSize:12,color:"var(--muted)" }}><span style={{color:"#e08080"}}>×</span>{i}</div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 8 }}>We replace / refund:</div>
                {["Damaged or defective","Wrong item received","Lost in transit (30+ days)"].map(i=>(
                  <div key={i} style={{ display:"flex",gap:8,marginBottom:4,fontSize:12,color:"var(--muted)" }}><span style={{color:"var(--gold)"}}>✓</span>{i}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.2)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: "0.06em", marginBottom: 4 }}>GOT A PROBLEM WITH YOUR ORDER?</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>Contact us within 30 days with your order number and a photo.</div>
            </div>
            <a href="/pages/contact" style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "11px 22px", textDecoration: "none" }}>
              Contact Us →
            </a>
          </div>

          <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({ title, items, note }: { title: string; items: string[][]; note?: string }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>{title}</div>
      {items.map(([l,v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text)" }}>{l}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textAlign: "right" }}>{v}</span>
        </div>
      ))}
      {note && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginTop: 10 }}>{note}</div>}
    </div>
  );
}
