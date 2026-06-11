"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Nav() {
  const { cart, setCartOpen } = useCart();
  const qty = cart?.totalQuantity ?? 0;

  const NAV_LINKS = [
    { label: "Shop All",       href: "/products",                  primary: true  },
    { label: "Hunting",        href: "/collections/hunting",       primary: false },
    { label: "2A / Patriot",   href: "/collections/2a-patriot",   primary: false },
    { label: "Military / Vet", href: "/collections/military-vet", primary: false },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(9,9,11,0.96)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", height: "108px",
    }}>
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", height: "100%", flexShrink: 0 }}>
        <img src="/logo.png" alt="Down Range Co." style={{ height: "96px", width: "auto", maxWidth: "480px", objectFit: "contain" }} />
      </a>

      {/* Pill nav */}
      <ul style={{ display: "flex", gap: "6px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }} className="nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            <PillLink href={link.href} primary={link.primary}>{link.label}</PillLink>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
        {/* Our Story — bigger, gold-tinted, separated */}
        <OurStoryLink />

        {/* Account */}
        <AccountBtn />

        {/* Cart */}
        <button onClick={() => setCartOpen(true)}
          style={{ position: "relative", background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.28)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "background 0.2s, border-color 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.25)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.55)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.28)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l1.5 7h7l1-5H4" stroke="#C8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="12" r="1" fill="#C8922A"/><circle cx="11" cy="12" r="1" fill="#C8922A"/></svg>
          Cart
          {qty > 0 && (
            <span style={{ background: "var(--gold)", color: "#09090B", borderRadius: "50%", width: "17px", height: "17px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {qty}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @media(max-width:960px){.nav-links{display:none!important}}
        .pill-link { transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s; }
        .pill-link:hover { transform: translateY(-1px); }
        .pill-link-primary:hover { background: #d4a030 !important; }
        .pill-link-ghost:hover { background: rgba(200,146,42,0.12) !important; border-color: rgba(200,146,42,0.35) !important; color: var(--gold) !important; }
        .our-story-link { transition: color 0.18s, letter-spacing 0.18s; }
        .our-story-link:hover { color: var(--gold) !important; letter-spacing: 0.18em !important; }
        .account-btn { transition: background 0.18s, border-color 0.18s, color 0.18s; }
        .account-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.2) !important; color: var(--text) !important; }
      `}</style>
    </nav>
  );
}

function PillLink({ href, primary, children }: { href: string; primary: boolean; children: React.ReactNode }) {
  if (primary) {
    return (
      <a href={href} className="pill-link pill-link-primary"
        style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#09090B", background: "var(--gold)", border: "1px solid var(--gold)", padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} className="pill-link pill-link-ghost"
      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
      {children}
    </a>
  );
}

function OurStoryLink() {
  return (
    <a href="/about" className="our-story-link"
      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,146,42,0.75)", textDecoration: "none", paddingRight: "14px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
      Our Story
    </a>
  );
}

function AccountBtn() {
  return (
    <a href="https://shopify.com/83728892116/account" target="_blank" rel="noopener noreferrer" className="account-btn"
      style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 14px", textDecoration: "none" }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      Account
    </a>
  );
}
