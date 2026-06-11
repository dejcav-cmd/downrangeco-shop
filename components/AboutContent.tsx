"use client";
import { useState, useEffect, useRef } from "react";

const RETICLE = (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <circle cx="60" cy="60" r="56" stroke="#C8922A" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.3"/>
    <circle cx="60" cy="60" r="36" stroke="#C8922A" strokeWidth="0.6" opacity="0.4"/>
    <circle cx="60" cy="60" r="8" stroke="#C8922A" strokeWidth="1" opacity="0.6"/>
    <line x1="60" y1="2" x2="60" y2="50" stroke="#C8922A" strokeWidth="0.8" opacity="0.5"/>
    <line x1="60" y1="70" x2="60" y2="118" stroke="#C8922A" strokeWidth="0.8" opacity="0.5"/>
    <line x1="2" y1="60" x2="50" y2="60" stroke="#C8922A" strokeWidth="0.8" opacity="0.5"/>
    <line x1="70" y1="60" x2="118" y2="60" stroke="#C8922A" strokeWidth="0.8" opacity="0.5"/>
    {[20,30,40,80,90,100].map(x => <line key={`h${x}`} x1={x} y1="57" x2={x} y2="63" stroke="#C8922A" strokeWidth="0.6" opacity="0.4"/>)}
    {[20,30,40,80,90,100].map(y => <line key={`v${y}`} x1="57" y1={y} x2="63" y2={y} stroke="#C8922A" strokeWidth="0.6" opacity="0.4"/>)}
    <circle cx="60" cy="60" r="2" fill="#C8922A" opacity="0.8"/>
  </svg>
);

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const timeline = [
  {
    year: "Jan 2026",
    label: "The Breaking Point",
    tag: "// Origin",
    body: "The news cycle hit a new low. Three major 2A bills moving through state legislatures — no coverage. A landmark Bruen-based ruling — buried. DJ Cavalcanti had been watching it happen for years. The firearms community was invisible in its own country's media. That month, he started building.",
    accent: false,
  },
  {
    year: "Feb 2026",
    label: "DownRange Portal Goes Live",
    tag: "// The mission begins",
    body: "downrangeco.com launches — a real-time intelligence portal covering legislation, court cases, gear reviews, hunting seasons, and Second Amendment news. No corporate backing. No editorial board. One person in Washington State, writing for the people who actually live this.",
    accent: true,
  },
  {
    year: "Apr 2026",
    label: "The Reader Request",
    tag: "// The community speaks",
    body: "The portal found its audience fast. Then came the messages: where do I get gear that actually represents this? Not the big-box camo. Not the corporate tactical aesthetic. The requests were specific — hunting designs with soul, 2A gear with conviction, military/vet graphics with real respect.",
    accent: false,
  },
  {
    year: "May 2026",
    label: "400+ Designs. One Vision.",
    tag: "// The apparel launches",
    body: "Working with Printify's US print network, the design library comes to life — rifle hunting at first light, bow season in the hardwoods, precision long-range, 2A patriot, waterfowl, military veteran. Every design made by someone who carries daily, hunts public land, and believes the Second Amendment is the one that protects all the others.",
    accent: true,
  },
  {
    year: "Jun 2026",
    label: "Both Barrels",
    tag: "// Right now",
    body: "Today Down Range Co. is two things with one soul: a daily-read news portal and a growing apparel brand. The portal keeps the community informed. The gear lets them say it out loud. Both built in Washington State. Both built for the same reason — because freedom isn't just a word on a hat. It's a responsibility.",
    accent: false,
  },
];

const values = [
  { icon: "🎯", title: "Built by a carrier", body: "Not a marketing team. Not a brand agency. One daily-carry, daily-hunt guy in Washington State who wanted something real." },
  { icon: "📰", title: "Rooted in the news", body: "Every design comes from someone who reads the legislation, follows the court cases, and knows what's happening to the Second Amendment right now." },
  { icon: "🇺🇸", title: "No compromise", body: "Shall not be infringed isn't a slogan here. It's the operating principle. Every product, every article, every decision comes from that foundation." },
  { icon: "🌲", title: "Washington-built", body: "From the Pacific Northwest — elk country, whitetail country, waterfowl country. The designs reflect actual terrain, actual seasons, actual hunts." },
];


function TimelineRow({ item, index, last }: { item: any; index: number; last: boolean }) {
  const { ref, inView } = useInView(0.15);
  const isAccent = item.accent;

  return (
    <div ref={ref} className="timeline-row" style={{
      display: "flex", gap: 0, alignItems: "flex-start",
      opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-20px)",
      transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`,
      paddingBottom: last ? 0 : 0,
    }}>
      {/* Year column */}
      <div className="timeline-year-col" style={{ width: 120, flexShrink: 0, paddingTop: 18, textAlign: "right", paddingRight: 28 }}>
        <div style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: "0.06em", color: isAccent ? "var(--gold)" : "rgba(200,146,42,0.5)", lineHeight: 1 }}>
          {item.year.split(" ")[0]}
        </div>
        <div style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: "0.06em", color: isAccent ? "var(--gold)" : "rgba(200,146,42,0.5)", lineHeight: 1 }}>
          {item.year.split(" ")[1] || ""}
        </div>
      </div>

      {/* Node */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", width: 0, position: "relative" }}>
        <div style={{
          width: isAccent ? 16 : 10, height: isAccent ? 16 : 10,
          borderRadius: "50%",
          background: isAccent ? "var(--gold)" : "var(--bg3)",
          border: `2px solid ${isAccent ? "var(--gold)" : "rgba(200,146,42,0.5)"}`,
          marginTop: isAccent ? 20 : 23,
          marginLeft: isAccent ? -8 : -5,
          boxShadow: isAccent ? "0 0 12px rgba(200,146,42,0.4)" : "none",
          flexShrink: 0,
          zIndex: 1,
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingLeft: 36, paddingBottom: last ? 0 : 52, paddingTop: 14 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6, opacity: 0.7 }}>
          {item.tag}
        </div>
        <div style={{
          fontFamily: "var(--font-bebas)", fontSize: "clamp(20px, 3vw, 28px)", letterSpacing: "0.04em",
          color: isAccent ? "var(--text)" : "var(--text)", lineHeight: 1,
          marginBottom: 14,
          paddingLeft: isAccent ? 14 : 0,
          borderLeft: isAccent ? "3px solid var(--gold)" : "none",
        }}>
          {item.label}
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, fontWeight: 300, maxWidth: 540, margin: 0 }}>
          {item.body}
        </p>
      </div>
    </div>
  );
}

export default function AboutContent() {
  return (
    <div style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "600px", display: "flex", alignItems: "center", overflow: "hidden", background: "var(--bg2)" }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.018) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.018) 40px)" }} />
        {/* Reticle */}
        <div style={{ position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)", width: "500px", height: "500px", opacity: 0.06, pointerEvents: "none" }}>
          {RETICLE}
        </div>
        {/* Gold bar left */}
        <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: "3px", background: "linear-gradient(to bottom, transparent, var(--gold), transparent)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "80px 64px", maxWidth: "800px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "inline-block", width: "40px", height: "1px", background: "var(--gold)" }} />
            Washington State · Est. 2024
          </div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(60px, 10vw, 110px)", lineHeight: 0.88, letterSpacing: "0.02em", margin: "0 0 28px" }}>
            WE BUILT THIS<br />
            BECAUSE<br />
            <span style={{ color: "var(--gold)" }}>NOBODY ELSE</span><br />
            WOULD.
          </h1>
          <p style={{ fontSize: "16px", color: "var(--muted)", lineHeight: 1.75, maxWidth: "520px", fontWeight: 300 }}>
            Down Range Co. started as a news portal — one guy in Washington State building the intelligence hub the 2A community deserved. The apparel came next. Both exist for the same reason.
          </p>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section style={{ padding: "100px 64px", maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
        <FadeIn>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px" }}>
            // Origin
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.92, letterSpacing: "0.03em", marginBottom: "28px" }}>
            IT STARTED WITH<br />
            A <span style={{ color: "var(--gold)" }}>NEWS PORTAL.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              "The mainstream media has never understood the firearms community. They cover it from the outside — with fear, with bias, or not at all. Legislative updates get buried. Court wins go unreported. Gear that matters never gets a fair look.",
              "So DJ Cavalcanti, a daily carrier and hunter based in Washington State, built downrangeco.com — a real-time intelligence portal covering everything that matters: legislation, court cases, gear, hunting seasons, and Second Amendment news. No agenda except the truth.",
              "Then readers started asking where to get gear that reflected the lifestyle. Not mass-market camo. Not corporate \"tactical\" branding. Something real. Something that looked like it came from someone who actually hunts, shoots, and carries.",
              "That's how the apparel line started. 400+ designs — and counting — each one rooted in the same community that reads the portal every day."
            ].map((p, i) => (
              <p key={i} style={{ fontSize: "14px", color: i === 0 ? "var(--text)" : "var(--muted)", lineHeight: 1.75, fontWeight: i === 0 ? 400 : 300, margin: 0 }}>{p}</p>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          {/* Stats card */}
          <div style={{ background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.06)", padding: "40px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "32px" }}>
              By the numbers
            </div>
            {[
              { num: "400+", label: "Original designs" },
              { num: "2", label: "Platforms — news + apparel" },
              { num: "50", label: "States covered in CCW database" },
              { num: "1", label: "Daily carrier behind it all" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "42px", color: "var(--gold)", letterSpacing: "0.04em", lineHeight: 1 }}>{s.num}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textAlign: "right", maxWidth: "160px" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <style>{`@media(max-width:768px){section[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;gap:40px!important;padding:60px 32px!important}}`}</style>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ background: "var(--bg2)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "100px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "600px", background: "radial-gradient(ellipse, rgba(200,146,42,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold)" }} />
              How we got here
            </div>
            <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.92, letterSpacing: "0.03em", marginBottom: "72px" }}>
              2026. <span style={{ color: "var(--gold)" }}>BUILT FROM</span><br />SCRATCH.
            </h2>
          </FadeIn>

          {/* Vertical timeline */}
          <div style={{ position: "relative" }}>
            {/* Spine */}
            <div style={{ position: "absolute", left: "119px", top: 24, bottom: 24, width: "1px", background: "linear-gradient(to bottom, transparent, rgba(200,146,42,0.5) 8%, rgba(200,146,42,0.5) 92%, transparent)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {timeline.map((item, i) => (
                <TimelineRow key={i} item={item} index={i} last={i === timeline.length - 1} />
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInLeft { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
          @media(max-width:768px){ .timeline-row { flex-direction:column!important; } .timeline-year-col { width:auto!important; margin-bottom:8px; } }
        `}</style>
      </section>


      {/* ── VALUES ── */}
      <section style={{ padding: "100px 64px", maxWidth: "1100px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px" }}>
            // What we stand for
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "0.04em", marginBottom: "56px" }}>
            NOT A BRAND.<br />
            <span style={{ color: "var(--gold)" }}>A POSITION.</span>
          </h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2px" }}>
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 80}>
              <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", padding: "36px 28px", height: "100%", transition: "border-color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(200,146,42,0.28)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{v.icon}</div>
                <div style={{ fontFamily: "var(--font-bebas)", fontSize: "22px", letterSpacing: "0.06em", color: "var(--text)", marginBottom: "10px" }}>{v.title}</div>
                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{v.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── PORTAL CTA ── */}
      <section style={{ background: "var(--bg3)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "80px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <FadeIn>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "14px" }}>
              // The news portal
            </div>
            <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 0.92, letterSpacing: "0.03em", marginBottom: "20px" }}>
              STAY INFORMED.<br />
              <span style={{ color: "var(--gold)" }}>DOWNRANGECO.COM</span>
            </h2>
            <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.75, fontWeight: 300, marginBottom: "28px", maxWidth: "420px" }}>
              The apparel is one half of what we built. The other half is a daily-updated intelligence portal covering Second Amendment legislation, court decisions, gear reviews, hunting seasons, and the news that actually matters to gun owners.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="https://downrangeco.com" target="_blank" rel="noopener noreferrer"
                style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 24px", textDecoration: "none", display: "inline-block", transition: "background 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold-light)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold)")}>
                Read the Portal ↗
              </a>
              <a href="/products"
                style={{ background: "transparent", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 24px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", display: "inline-block", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.3)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}>
                Shop the Gear
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            {/* Portal feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                { icon: "⚖️", label: "2A Legislation Tracker", desc: "Every bill, every state, in real time" },
                { icon: "🏛️", label: "Court Case Coverage", desc: "Bruen, McDonald, and what comes next" },
                { icon: "🦌", label: "Hunting Intelligence", desc: "Seasons, regulations, and field reports" },
                { icon: "🔫", label: "Gear & Reviews", desc: "Firearms, optics, and load data" },
                { icon: "🗺️", label: "50-State CCW Guide", desc: "Carry laws for every state and DC" },
              ].map((f) => (
                <div key={f.label} style={{ display: "flex", gap: "16px", padding: "16px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)", marginBottom: "2px" }}>{f.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
        <style>{`@media(max-width:768px){section div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "120px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(200,146,42,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <FadeIn>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px" }}>
            // Wear the mission
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 0.88, letterSpacing: "0.02em", marginBottom: "28px" }}>
            THIS IS MORE<br />
            THAN A <span style={{ color: "var(--gold)" }}>T-SHIRT.</span>
          </h2>
          <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.75, maxWidth: "480px", margin: "0 auto 40px", fontWeight: 300 }}>
            Every piece you wear is a conversation starter, a declaration, and a statement of support for the community building this. We appreciate every order — genuinely.
          </p>
          <a href="/products"
            style={{ display: "inline-block", background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "17px 40px", textDecoration: "none", transition: "background 0.2s, transform 0.1s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-light)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
            Shop the Full Collection →
          </a>
        </FadeIn>
      </section>

    </div>
  );
}
