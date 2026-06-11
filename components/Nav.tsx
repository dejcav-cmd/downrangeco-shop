"use client";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

export default function Nav() {
  const { cart, setCartOpen } = useCart();
  const { theme, toggle } = useTheme();
  const qty = cart?.totalQuantity ?? 0;

  const NAV_LINKS = [
    { label: "Shop All",       href: "/products",               primary: true  },
    { label: "Hunting",        href: "/collections/hunting",    primary: false },
    { label: "2A / Patriot",   href: "/collections/2a-patriot",primary: false },
    { label: "Military / Vet", href: "/collections/military-vet",primary:false },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--nav-bg)", backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Row 1: Centered logo ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 28px 8px", borderBottom: "1px solid var(--border)", position: "relative" }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Down Range Co."
            style={{ height: "62px", width: "auto", maxWidth: "480px", objectFit: "contain" }}
          />
        </a>
      </div>

      {/* ── Row 2: Centered pill nav + right actions ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 28px", position: "relative", height: "50px" }}>

        {/* Centered pills */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }} className="nav-links">
          {NAV_LINKS.map(link => (
            <PillLink key={link.label} href={link.href} primary={link.primary}>
              {link.label}
            </PillLink>
          ))}
        </div>

        {/* Right actions — absolutely positioned so pills stay centered */}
        <div style={{ position: "absolute", right: "28px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px", alignItems: "center" }}>
          <OurStoryLink />
          <ThemeToggle theme={theme} toggle={toggle} />
          <AccountBtn />
          <CartBtn qty={qty} onOpen={() => setCartOpen(true)} />
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.nav-links{display:none!important}}
        .pill-link{transition:background 0.18s,border-color 0.18s,color 0.18s,transform 0.12s;}
        .pill-link:hover{transform:translateY(-1px);}
        .pill-primary:hover{filter:brightness(1.12);}
        .pill-ghost:hover{background:var(--gold-dim)!important;border-color:var(--gold-border)!important;color:var(--gold)!important;}
        .our-story-link{transition:color 0.18s;}
        .our-story-link:hover{color:var(--gold)!important;}
        .theme-btn{transition:border-color 0.18s,color 0.18s;}
        .theme-btn:hover{border-color:var(--gold-border)!important;color:var(--gold)!important;}
        .acct-btn{transition:background 0.18s,border-color 0.18s,color 0.18s;}
        .acct-btn:hover{background:var(--bg3)!important;border-color:var(--border)!important;color:var(--text)!important;}
        .cart-btn{transition:background 0.18s,border-color 0.18s;}
        .cart-btn:hover{background:var(--gold-dim)!important;border-color:rgba(200,146,42,0.5)!important;}
      `}</style>
    </nav>
  );
}

function PillLink({ href, primary, children }: { href: string; primary: boolean; children: React.ReactNode }) {
  if (primary) return (
    <a href={href} className="pill-link pill-primary"
      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#09090B", background: "var(--gold)", border: "1px solid var(--gold)", padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
      {children}
    </a>
  );
  return (
    <a href={href} className="pill-link pill-ghost"
      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
      {children}
    </a>
  );
}

function OurStoryLink() {
  return (
    <a href="/about" className="our-story-link"
      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,146,42,0.75)", textDecoration: "none", paddingRight: "12px", borderRight: "1px solid var(--border)" }}>
      Our Story
    </a>
  );
}

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button onClick={toggle} className="theme-btn" aria-label="Toggle theme"
      style={{ width: 34, height: 34, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", flexShrink: 0 }}>
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <line x1="8" y1="1" x2="8" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="8" y1="13.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="1" y1="8" x2="2.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="13.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="3.1" y1="3.1" x2="4.2" y2="4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="11.8" y1="11.8" x2="12.9" y2="12.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="12.9" y1="3.1" x2="11.8" y2="4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="4.2" y1="11.8" x2="3.1" y2="12.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M12.5 10a6 6 0 0 1-7-7 6 6 0 1 0 7 7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

function AccountBtn() {
  return (
    <a href="https://shopify.com/83728892116/account" target="_blank" rel="noopener noreferrer" className="acct-btn"
      style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 13px", textDecoration: "none", flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      Account
    </a>
  );
}

function CartBtn({ qty, onOpen }: { qty: number; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="cart-btn"
      style={{ background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l1.5 7h7l1-5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="11" cy="12" r="1" fill="currentColor"/></svg>
      Cart
      {qty > 0 && (
        <span style={{ background: "var(--gold)", color: "#09090B", borderRadius: "50%", width: "17px", height: "17px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {qty}
        </span>
      )}
    </button>
  );
}
