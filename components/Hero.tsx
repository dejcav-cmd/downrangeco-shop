"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface HeroSlide {
  id: string; image: string;
  eyebrow: string;
  title_line1: string; title_line2: string; title_line3?: string; title_line4?: string;
  accent_word?: string; subtitle: string;
  cta_primary: string; cta_primary_url: string; cta_secondary: string;
  overlay_opacity: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id:"slide-1", image:"/hero.jpg", eyebrow:"Built for the Field — Summer 2026",
    title_line1:"GEAR FOR", title_line2:"HUNTERS,", title_line3:"SHOOTERS", title_line4:"& THE 2A.",
    accent_word:"SHOOTERS", subtitle:"Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
    cta_primary:"Shop All Products", cta_primary_url:"/products", cta_secondary:"Browse Categories", overlay_opacity:85 },
];

const INTERVAL = 10000;
const FADE_MS  = 1000;

export default function Hero() {
  const [slides,  setSlides]  = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState<number|null>(null);
  const [paused,  setPaused]  = useState(false);
  const [bar,     setBar]     = useState(0);

  // Single source of truth in refs — interval never touches state directly
  const stateRef = useRef({ current: 0, total: 1, paused: false, fading: false, bar: 0, elapsed: 0 });

  useEffect(() => { stateRef.current.total = slides.length; }, [slides.length]);
  useEffect(() => { stateRef.current.paused = paused; }, [paused]);

  // Load slides
  useEffect(() => {
    fetch("/api/hero", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.slides?.length) setSlides(d.slides); })
      .catch(() => {});
  }, []);

  // goTo — stored in ref so interval always calls latest version
  const goToRef = useRef<(idx: number) => void>(() => {});
  goToRef.current = (idx: number) => {
    const s = stateRef.current;
    if (s.fading || idx === s.current || s.total <= 1) return;
    s.fading  = true;
    s.elapsed = 0;
    s.bar     = 0;
    setBar(0);
    setPrev(s.current);
    setCurrent(idx);
    s.current = idx;
    setTimeout(() => {
      setPrev(null);
      s.fading = false;
    }, FADE_MS);
  };

  // Master tick — runs at 60fps, handles both bar and slide advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const TICK = 1000 / 60;

    const timer = setInterval(() => {
      const s = stateRef.current;
      if (s.paused || s.fading) return;
      s.elapsed += TICK;
      s.bar      = Math.min((s.elapsed / INTERVAL) * 100, 100);
      setBar(s.bar);
      if (s.elapsed >= INTERVAL) {
        s.elapsed = 0;
        const next = (s.current + 1) % s.total;
        goToRef.current(next);
      }
    }, TICK);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] ?? slides[0];
  const prevSlide = prev !== null ? (slides[prev] ?? null) : null;
  const ov    = (slide.overlay_opacity ?? 85) / 100;
  const lines = [slide.title_line1, slide.title_line2, slide.title_line3, slide.title_line4].filter(Boolean) as string[];

  return (
    <section
      style={{ position:"relative", minHeight:580, display:"flex", alignItems:"center", overflow:"hidden", background:"#09090B" }}
      onMouseEnter={() => { setPaused(true);  stateRef.current.paused = true; }}
      onMouseLeave={() => { setPaused(false); stateRef.current.paused = false; }}
    >
      {/* Previous image — stays visible underneath during crossfade */}
      {prevSlide && (
        <div style={{ position:"absolute", inset:0, zIndex:1,
          backgroundImage:`url('${prevSlide.image}')`,
          backgroundSize:"cover", backgroundPosition:"center 30%" }} />
      )}

      {/* Current image — fades in from 0→1 on top */}
      <div style={{
        position:"absolute", inset:0, zIndex:2,
        backgroundImage:`url('${slide.image}')`,
        backgroundSize:"cover", backgroundPosition:"center 30%",
        opacity: prevSlide ? 0 : 1,
        animation: prevSlide ? `heroFadeIn ${FADE_MS}ms ease forwards` : "none",
      }} />

      {/* Overlay */}
      <div style={{ position:"absolute", inset:0, zIndex:3, background:`
        linear-gradient(to right, rgba(9,9,11,${ov}) 0%, rgba(9,9,11,${ov*0.65}) 60%, rgba(9,9,11,${ov*0.2}) 100%),
        repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.012) 40px),
        repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.012) 40px)` }} />

      {/* Reticle */}
      <svg viewBox="0 0 260 260" fill="none" style={{ position:"absolute", right:"8%", top:"50%", transform:"translate(50%,-50%)", width:260, height:260, opacity:0.07, pointerEvents:"none", zIndex:4 }}>
        <circle cx="130" cy="130" r="120" stroke="#C8922A" strokeWidth="1"/>
        <circle cx="130" cy="130" r="65"  stroke="#C8922A" strokeWidth="0.8"/>
        <circle cx="130" cy="130" r="12"  stroke="#C8922A" strokeWidth="1"/>
        <line x1="130" y1="2"   x2="130" y2="116" stroke="#C8922A" strokeWidth="1"/>
        <line x1="130" y1="144" x2="130" y2="258" stroke="#C8922A" strokeWidth="1"/>
        <line x1="2"   y1="130" x2="116" y2="130" stroke="#C8922A" strokeWidth="1"/>
        <line x1="144" y1="130" x2="258" y2="130" stroke="#C8922A" strokeWidth="1"/>
        {[60,80,100,160,180,200].map(p=><line key={`h${p}`} x1={p} y1="127" x2={p} y2="133" stroke="#C8922A" strokeWidth="0.8"/>)}
        {[60,80,100,160,180,200].map(p=><line key={`v${p}`} x1="127" y1={p} x2="133" y2={p} stroke="#C8922A" strokeWidth="0.8"/>)}
        <circle cx="130" cy="130" r="3" fill="#C8922A"/>
      </svg>

      {/* Content */}
      <div style={{ position:"relative", zIndex:5, padding:"0 48px", maxWidth:700 }}>
        <h1 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(64px,10vw,100px)", lineHeight:0.88, letterSpacing:"0.03em", color:"#F0EDE8", marginBottom:22 }}>
          {lines.map((line, i) => (
            <span key={i}>
              {line === slide.accent_word ? <span style={{ color:"#C8922A" }}>{line}</span> : line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p style={{ fontSize:15, color:"rgba(240,237,232,0.82)", maxWidth:420, lineHeight:1.65, marginBottom:32, fontWeight:300 }}>
          {slide.subtitle}
        </p>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          <a href={slide.cta_primary_url ?? "/products"}
            style={{ background:"#C8922A", color:"#09090B", fontFamily:"var(--font-mono)", fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"14px 30px", textDecoration:"none", display:"inline-block", transition:"background 0.2s, transform 0.1s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#E5A83A";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#C8922A";(e.currentTarget as HTMLElement).style.transform="none"}}>
            {slide.cta_primary}
          </a>
          <a href="#categories"
            style={{ background:"transparent", color:"#F0EDE8", fontFamily:"var(--font-mono)", fontSize:12, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", padding:"13px 30px", border:"1px solid rgba(255,255,255,0.35)", textDecoration:"none", display:"inline-block", transition:"border-color 0.2s, color 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(200,146,42,0.5)";(e.currentTarget as HTMLElement).style.color="#C8922A"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.35)";(e.currentTarget as HTMLElement).style.color="#F0EDE8"}}>
            {slide.cta_secondary}
          </a>
        </div>

        <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.20em", textTransform:"uppercase", color:"rgba(200,146,42,0.65)", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ display:"inline-block", width:24, height:1, background:"rgba(200,146,42,0.65)" }}/>
          {slide.eyebrow}
        </div>
      </div>

      {/* Slide nav — absolute bottom-right */}
      {slides.length > 1 && (
        <div style={{ position:"absolute", right:48, bottom:60, zIndex:6, display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={() => goToRef.current((current - 1 + slides.length) % slides.length)}
            style={{ width:30,height:30,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"border-color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="#C8922A"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.2)"}>‹</button>
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => goToRef.current(i)}
              style={{ width:i===current?24:8, height:8, borderRadius:4, background:i===current?"#C8922A":"rgba(255,255,255,0.3)", border:"none", cursor:"pointer", padding:0, transition:"all 0.3s ease" }} />
          ))}
          <button onClick={() => goToRef.current((current + 1) % slides.length)}
            style={{ width:30,height:30,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"border-color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="#C8922A"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.2)"}>›</button>
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:6, height:2, background:"rgba(255,255,255,0.08)" }}>
          <div style={{ height:"100%", background:"#C8922A", width:`${bar}%`, transition:"width 0.1s linear" }}/>
        </div>
      )}

      <style>{`
        @keyframes heroFadeIn { from { opacity:0; } to { opacity:1; } }
        @media(max-width:768px){ section>div[style*="padding: 0 48px"]{ padding:0 24px!important; } }
      `}</style>
    </section>
  );
}
