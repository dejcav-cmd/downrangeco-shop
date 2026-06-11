"use client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function TwoAProudPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>

        {/* Hero */}
        <div style={{ position: "relative", background: "var(--bg2)", borderBottom: "1px solid rgba(200,146,42,0.2)", padding: "72px 32px 64px", overflow: "hidden" }}>
          {/* Background reticle */}
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", right: "-60px", top: "50%", transform: "translateY(-50%)", width: 400, height: 400, opacity: 0.04, pointerEvents: "none" }}>
            <circle cx="200" cy="200" r="190" stroke="#C8922A" strokeWidth="1.5"/>
            <circle cx="200" cy="200" r="120" stroke="#C8922A" strokeWidth="1"/>
            <circle cx="200" cy="200" r="40" stroke="#C8922A" strokeWidth="1.5"/>
            <circle cx="200" cy="200" r="8" fill="#C8922A"/>
            <line x1="200" y1="4" x2="200" y2="158" stroke="#C8922A" strokeWidth="1.2"/>
            <line x1="200" y1="242" x2="200" y2="396" stroke="#C8922A" strokeWidth="1.2"/>
            <line x1="4" y1="200" x2="158" y2="200" stroke="#C8922A" strokeWidth="1.2"/>
            <line x1="242" y1="200" x2="396" y2="200" stroke="#C8922A" strokeWidth="1.2"/>
          </svg>

          <div style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold)" }} />
              Washington State · Est. 2024
            </div>
            <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(52px,9vw,96px)", letterSpacing: "0.03em", lineHeight: 0.88, margin: "0 0 24px", color: "var(--text)" }}>
              2A PROUD.<br />
              <span style={{ color: "var(--gold)" }}>NO APOLOGIES.</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--muted)", maxWidth: 520, lineHeight: 1.75, fontWeight: 300 }}>
              The Second Amendment isn't a privilege. It's a right — written in plain English, confirmed by the Supreme Court, and non-negotiable. We wear it on our backs because some things are worth stating out loud.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 920, margin: "0 auto", padding: "60px 32px 80px" }}>

          {/* What we stand for */}
          <div style={{ marginBottom: 60 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>// What we stand for</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
              {[
                { icon: "◈", title: "The Right to Keep & Bear Arms", body: "Not just for hunting. Not just for sport. The Second Amendment was written as a check on tyranny. That's not paranoia — it's the plain reading of the text and the intent of the founders." },
                { icon: "◎", title: "Constitutional Carry", body: "Law-abiding citizens shouldn't need government permission to exercise a constitutional right. We support permitless carry nationwide and follow Washington's CPL laws until that day comes." },
                { icon: "◉", title: "Responsible Ownership", body: "Rights come with responsibility. Safe storage, proper training, knowing your target and what's beyond it. The best argument for gun ownership is a gun owner who handles firearms with discipline and respect." },
                { icon: "◈", title: "Defending the Standard", body: "We follow Bruen. Text, history, and tradition — that's the standard for firearms regulation. Any law that fails that test fails the Constitution." },
                { icon: "◎", title: "The Hunting Tradition", body: "Two million acres of public land in Washington State. Elk, whitetail, mule deer, bear, turkey, waterfowl. Hunting is conservation, it's tradition, and it's how families stay connected to the land." },
                { icon: "◉", title: "Veteran & Military Pride", body: "We don't just honor military service — we're built by someone who respects it. The men and women who defended this country deserve a brand that means something when they put it on." },
              ].map(s => (
                <div key={s.title} style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 22px", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.3)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"}>
                  <div style={{ fontSize: 20, color: "var(--gold)", opacity: 0.7, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: 18, letterSpacing: "0.06em", color: "var(--text)", marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The brand */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 60, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>// The brand</div>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,4vw,44px)", letterSpacing: "0.04em", color: "var(--text)", lineHeight: 0.95, margin: "0 0 18px" }}>
                BUILT FROM THE<br /><span style={{ color: "var(--gold)" }}>FIELD UP.</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, fontWeight: 300, marginBottom: 14 }}>
                Down Range Co. started because every hunting and shooting apparel brand either looked like a big-box store logo or was so tactical it was unwearable off the range. We wanted something different — designs that mean something, that you'd actually wear to the gas station at 5am on the way to the field.
              </p>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, fontWeight: 300 }}>
                Washington State. One person. 400+ designs and growing. Every design comes from someone who daily carries, hunts public land, and reads 2A case law for fun.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { num: "400+", label: "Designs in the catalog" },
                { num: "2A",   label: "Washington State, USA" },
                { num: "100%", label: "Print-on-demand, no waste" },
                { num: "0",    label: "Apologies for existing" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 20px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: 36, color: "var(--gold)", letterSpacing: "0.04em", lineHeight: 1, minWidth: 70 }}>{s.num}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DownRange portal CTA */}
          <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.25)", padding: "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>// Stay informed</div>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 28, letterSpacing: "0.05em", color: "var(--text)", marginBottom: 6 }}>THE DOWNRANGE INTELLIGENCE PORTAL</div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>
                Daily 2A legislation updates, court case tracking, CCW reciprocity for all 50 states, firearm reviews, and market data. Free. No subscription.
              </p>
            </div>
            <a href="https://downrangeco.com" target="_blank" rel="noopener noreferrer"
              style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "13px 26px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Visit Portal ↗
            </a>
          </div>
        </div>

        <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </main>
      <Footer />
    </>
  );
}
