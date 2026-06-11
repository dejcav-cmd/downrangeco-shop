"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import DottedSurface from "@/components/DottedSurface";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";

// ── Shop nav — same visual structure as portal, shop-specific links ──
const NAV = [
  { label: "Home",           href: "/",                          exact: true  },
  {
    label: "Hunting",        href: "/collections/hunting",
    children: [
      { label: "🦌 All Hunting",      href: "/collections/hunting",          desc: "Every hunting design" },
      { label: "🎯 Rifle Hunting",    href: "/products?category=rifle",      desc: "First light, season openers" },
      { label: "🏹 Bow Season",       href: "/products?category=bow",        desc: "Archery & bow hunting" },
      { label: "🦆 Waterfowl",        href: "/products?category=waterfowl",  desc: "Duck & goose season" },
      { label: "🐗 Big Game",         href: "/products?category=biggame",    desc: "Elk, bear, whitetail" },
    ],
  },
  {
    label: "2A / Patriot",   href: "/collections/2a-patriot",
    children: [
      { label: "⚖️ All 2A Designs",     href: "/collections/2a-patriot",        desc: "Shall not be infringed" },
      { label: "🇺🇸 Constitutional",    href: "/products?category=constitutional", desc: "Bill of Rights gear" },
      { label: "🔫 Carry Culture",      href: "/products?category=carry",       desc: "Daily carry lifestyle" },
      { label: "📋 2A Proud",           href: "/pages/2a-proud",                desc: "Our stance" },
    ],
  },
  {
    label: "Military / Vet", href: "/collections/military-vet",
    children: [
      { label: "🎖️ All Military",       href: "/collections/military-vet",      desc: "Honor & service" },
      { label: "🪖 Veteran",            href: "/products?category=veteran",     desc: "Vet pride designs" },
      { label: "🦅 Patriot",            href: "/products?category=patriot",     desc: "American made spirit" },
    ],
  },
  { label: "Our Story",     href: "/about", exact: false },
];

export default function Masthead() {
  const { theme, toggle } = useTheme();
  const { cart, setCartOpen } = useCart();
  const qty = cart?.totalQuantity ?? 0;

  const [dateStr,        setDateStr]        = useState("");
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [openDrop,       setOpenDrop]       = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const days   = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
    const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
    const d = new Date();
    setDateStr(`${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function openDropdown(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDrop(label);
  }
  function closeDropdown() {
    closeTimer.current = setTimeout(() => setOpenDrop(null), 140);
  }

  return (
    <header style={{
      background: "#111318",
      borderBottom: "1px solid #1F2428",
      position: "sticky", top: 0, zIndex: 100,
      overflow: "visible",
    }}>
      {/* Animated dots — exact portal implementation */}
      <DottedSurface />

      <style>{`
        .nav-drop { display:none; position:absolute; top:calc(100% + 1px); left:0; background:#0A0B0C; border:1px solid #1F2428; border-top:2px solid #C8922A; padding:6px; min-width:240px; z-index:200; box-shadow:0 12px 40px rgba(0,0,0,0.9); }
        .nav-drop.open { display:block; }
        .nav-drop-item { display:block; padding:8px 12px; text-decoration:none; transition:background 0.1s; }
        .nav-drop-item:hover { background:#16191F; }
        .ndi-label { font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; color:#E5E5E5; letter-spacing:0.04em; display:block; }
        .ndi-desc  { font-family:'IBM Plex Mono',monospace; font-size:10px; color:#6B7280; display:block; margin-top:1px; }
        .nav-item-wrap { position:relative; }
        .nav-top-link { display:flex; align-items:center; gap:4px; font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:13px 14px; white-space:nowrap; text-decoration:none; border-bottom:2px solid transparent; transition:color 0.15s, border-color 0.15s; color:#C8922A; }
        .nav-top-link:hover { color:#6B7280; }
        .nav-top-link.active { border-bottom-color:#C8922A; color:#C8922A; }
        .masthead-logo { display:block; height:auto; max-height:72px; width:auto; max-width:100%; }
        @media(max-width:900px) { .nav-desktop{display:none!important} .nav-mob-bar{display:flex!important} .masthead-dateline{display:none!important} }
        @media(min-width:901px) { .nav-mob-bar{display:none!important} }
        .mob-section-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:none; border:none; border-bottom:1px solid #1F2428; cursor:pointer; text-align:left; }
        .mob-section-btn .mob-label { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#C8922A; }
        .mob-section-btn .mob-arrow { font-size:10px; color:#6B7280; transition:transform 0.2s; }
        .mob-section-btn.expanded .mob-arrow { transform:rotate(180deg); }
        .mob-child { display:flex; align-items:center; min-height:44px; padding:10px 16px 10px 28px; font-family:'IBM Plex Mono',monospace; font-size:13px; color:#9CA3AF; text-decoration:none; border-bottom:1px solid rgba(31,36,40,0.5); }
        .mob-child:hover { color:#C8922A; background:#16191F; }
      `}</style>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:1 }}>

        {/* ── Logo row — centered logo, date left, actions right ── */}
        <div style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center", padding:"10px 0 12px", minHeight:88 }}>

          {/* Logo centered */}
          <a href="/" style={{ display:"block", lineHeight:1, textDecoration:"none" }}>
            <img src="/logo.png" alt="Down Range Co." className="masthead-logo" />
          </a>

          {/* Left — date badge */}
          <div className="masthead-dateline" style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <a href="https://downrangeco.com" target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(200,146,42,.12)", color:"#C8922A", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.12em", padding:"3px 10px", textDecoration:"none", border:"1px solid rgba(200,146,42,.3)" }}>
                📡 PORTAL
              </a>
              <span style={{ background:"#C8922A", color:"#09090B", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", padding:"3px 10px" }}>
                APPAREL
              </span>
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#6B7280", whiteSpace:"nowrap" }}>
              {dateStr}
            </div>
          </div>

          {/* Right — exact portal layout: account+cart top row, search bar bottom row */}
          <div className="masthead-dateline" style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            {/* Row 1: Account + Cart — mirrors portal's Social Icons row */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <a href="https://shopify.com/83728892116/account" target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"1px solid #1F2428", color:"#9CA3AF", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.08em", textDecoration:"none", padding:"4px 10px", transition:"all 0.15s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor="#C8922A"; el.style.color="#C8922A"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor="#1F2428"; el.style.color="#9CA3AF"; }}>
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                ACCOUNT
              </a>
              <button onClick={() => setCartOpen(true)}
                style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(200,146,42,0.1)", border:"1px solid rgba(200,146,42,0.35)", color:"#C8922A", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", cursor:"pointer", transition:"background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.22)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.1)"}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l1.5 7h7l1-5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="11" cy="12" r="1" fill="currentColor"/></svg>
                {qty > 0 ? `Cart (${qty})` : "Cart"}
              </button>
            </div>
            {/* Row 2: Search bar — mirrors portal's GlobalSearchBar row */}
            <SearchBar />
          </div>
        </div>

        {/* ── Desktop nav bar — exact portal style ── */}
        <nav className="nav-desktop" style={{ borderTop:"1px solid #1F2428", display:"flex", alignItems:"stretch" }}>
          <ul style={{ display:"flex", listStyle:"none", flex:1, margin:0, padding:0 }}>
            {NAV.map(item => {
              const hasChildren = !!(item as any).children?.length;
              const isOpen = openDrop === item.label;
              return (
                <li key={item.label} className="nav-item-wrap"
                  onMouseEnter={() => hasChildren && openDropdown(item.label)}
                  onMouseLeave={closeDropdown}>
                  <a href={item.href} className="nav-top-link">
                    {item.label}
                    {hasChildren && <span style={{ fontSize:8, color:"#6B7280", marginTop:1 }}>▼</span>}
                  </a>
                  {hasChildren && (
                    <div className={`nav-drop${isOpen ? " open" : ""}`}
                      onMouseEnter={() => openDropdown(item.label)}
                      onMouseLeave={closeDropdown}>
                      {(item as any).children.map((child: any) => (
                        <a key={child.href} href={child.href} className="nav-drop-item">
                          <span className="ndi-label">{child.label}</span>
                          {child.desc && <span className="ndi-desc">{child.desc}</span>}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {/* SHOP ALL button — portal's FEEDBACK button equivalent */}
          <div style={{ padding:"0 12px", display:"flex", alignItems:"center", gap:10, borderLeft:"1px solid #1F2428" }}>
            <ThemeToggle />
            <a href="/products"
              style={{ background:"#C8922A", color:"#09090B", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"13px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"6px 16px", textDecoration:"none", whiteSpace:"nowrap", display:"block" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#E5A83A"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#C8922A"}>
              Shop Now
            </a>
          </div>
        </nav>

        {/* ── Mobile bar ── */}
        <div className="nav-mob-bar" style={{ display:"none", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderTop:"1px solid #1F2428" }}>
          <a href="/products" style={{ background:"#C8922A", color:"#09090B", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"6px 12px", textDecoration:"none" }}>
            Shop
          </a>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => setCartOpen(true)} style={{ background:"transparent", border:"none", color:"#C8922A", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700 }}>
              🛒 {qty > 0 && qty}
            </button>
            <button onClick={toggle} style={{ background:"transparent", border:"1px solid #2A2F38", color:"#9CA3AF", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {theme === "dark" ? "☀" : "🌙"}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background:"none", border:"1px solid #1F2428", color:"#9CA3AF", padding:"6px 12px", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"0.05em" }}>
              {menuOpen ? "✕" : "☰ MENU"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:48 }} />
      )}

      {/* Mobile sheet */}
      <div style={{
        display: menuOpen ? "flex" : "none", flexDirection:"column",
        background:"#09090B", borderTop:"2px solid #C8922A",
        maxHeight:"80vh", overflowY:"auto",
        position:"fixed", bottom:0, left:0, right:0, zIndex:49,
        boxShadow:"0 -8px 60px rgba(0,0,0,0.95)", borderRadius:"16px 16px 0 0",
      }}
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={e => { if (e.changedTouches[0].clientY - touchStartY.current > 60) setMenuOpen(false); }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.15)" }} />
        </div>
        <a href="/products" onClick={() => setMenuOpen(false)} className="mob-child"
          style={{ padding:"14px 16px", fontSize:15, fontWeight:700, color:"#C8922A", borderBottom:"1px solid #1F2428", display:"flex", alignItems:"center", gap:8 }}>
          🛍 Shop All
        </a>
        {NAV.slice(1).map(item => {
          const hasChildren = !!(item as any).children?.length;
          const exp = mobileExpanded === item.label;
          if (!hasChildren) {
            return (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="mob-child"
                style={{ padding:"14px 16px", fontSize:14, fontWeight:700, color:"#E5E5E5", borderBottom:"1px solid #1F2428", display:"flex" }}>
                {item.label}
              </a>
            );
          }
          return (
            <div key={item.label}>
              <button className={`mob-section-btn${exp ? " expanded" : ""}`}
                onClick={() => setMobileExpanded(exp ? null : item.label)}>
                <span className="mob-label">{item.label}</span>
                <span className="mob-arrow">▼</span>
              </button>
              {exp && (
                <div style={{ background:"#111318" }}>
                  {(item as any).children.map((child: any) => (
                    <a key={child.href} href={child.href} onClick={() => setMenuOpen(false)} className="mob-child">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display:"flex", borderTop:"1px solid #1F2428", marginTop:4 }}>
          {[["About", "/about"], ["FAQ", "/pages/faq"], ["Contact", "/pages/contact"]].map(([l, h]) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)}
              style={{ flex:1, textAlign:"center", padding:"12px 0", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#6B7280", textDecoration:"none", borderRight:"1px solid #1F2428", letterSpacing:"0.05em" }}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
