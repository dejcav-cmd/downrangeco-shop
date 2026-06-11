"use client";
import { ReactNode } from "react";

interface PolicyPageProps {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: ReactNode;
}

export default function PolicyLayout({ title, subtitle, eyebrow, children }: PolicyPageProps) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 32px 80px" }}>
      {/* Back */}
      <button onClick={() => window.history.back()}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 12px", cursor: "pointer", marginBottom: 32, transition: "all 0.15s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.3)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 48, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
          {eyebrow}
        </div>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px,6vw,64px)", letterSpacing: "0.04em", color: "var(--text)", margin: "0 0 14px", lineHeight: 0.95 }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 300, lineHeight: 1.7, maxWidth: 560 }}>
          {subtitle}
        </p>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {children}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: "0.06em", color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 24, height: 1, background: "var(--gold)", display: "inline-block", flexShrink: 0 }} />
        {title}
      </div>
      <div style={{ paddingLeft: 34, fontSize: 13, color: "var(--muted)", lineHeight: 1.8, fontWeight: 300 }}>
        {children}
      </div>
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", padding: "10px 16px", textAlign: "left", background: "var(--bg3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ fontSize: 12, color: j === 0 ? "var(--text)" : "var(--muted)", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "var(--card)" : "var(--bg3)", fontFamily: j === 0 ? "var(--font-mono)" : "var(--font-sans)", letterSpacing: j === 0 ? "0.04em" : "normal" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.2)", padding: "14px 18px", fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginTop: 12 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 6 }}>Note</span>
      {children}
    </div>
  );
}
