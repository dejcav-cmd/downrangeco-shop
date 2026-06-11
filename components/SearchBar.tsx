"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const TYPE_COLORS: Record<string, string> = {
  Product:    "#C8922A",
  Collection: "#22c55e",
  Page:       "#60a5fa",
};
const TYPE_ICONS: Record<string, string> = {
  Product:    "◈",
  Collection: "⬡",
  Page:       "◌",
};

export default function SearchBar() {
  const [open,    setOpen]    = useState(false);
  const [q,       setQ]       = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router   = useRouter();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) close();
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const doSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`);
      const d   = await res.json();
      setResults(d.results ?? []);
      setFocused(0);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQ(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(v), 220);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === "Enter") {
      if (results[focused]) { router.push(results[focused]._href); close(); }
      else if (q)            { router.push(`/products?search=${encodeURIComponent(q)}`); close(); }
    }
  }

  function close() { setOpen(false); setQ(""); setResults([]); }

  const MONO = "'IBM Plex Mono', monospace";

  if (!open) return (
    <button
      onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 30); }}
      title="Search (⌘K)"
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "none", border: "1px solid rgba(200,146,42,0.4)",
        color: "#fff", padding: "5px 10px", cursor: "pointer",
        fontFamily: MONO, fontSize: 10, transition: "border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#C8922A"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.4)"}
    >
      <span style={{ color: "#C8922A" }}>⌕</span>
      <span style={{ color: "#fff" }}>Search</span>
      <span style={{ opacity: 0.4, fontSize: 9, marginLeft: 2, color: "#fff" }}>⌘K</span>
    </button>
  );

  return (
    <div ref={panelRef} style={{ position: "relative", zIndex: 200 }}>
      {/* Input box */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "#111318", border: "1px solid #C8922A",
        padding: "4px 10px", width: 200, boxSizing: "border-box" as const,
      }}>
        <span style={{ color: "#C8922A", fontSize: 14, flexShrink: 0 }}>⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Search shop…"
          autoFocus
          style={{
            background: "none", border: "none", outline: "none",
            color: "#fff", fontFamily: MONO, fontSize: 11,
            flex: 1, minWidth: 0,
          }}
        />
        {loading && <span style={{ fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>↻</span>}
        <button onClick={close} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>✕</button>
      </div>

      {/* Results dropdown */}
      {(results.length > 0 || (q.length >= 2 && !loading)) && (
        <div style={{
          position: "fixed",
          top: panelRef.current ? panelRef.current.getBoundingClientRect().bottom + 4 : "auto",
          right: 16,
          width: Math.min(420, typeof window !== "undefined" ? window.innerWidth - 32 : 420),
          background: "#111318",
          border: "1px solid #1F2428",
          maxHeight: 420, overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          zIndex: 9999,
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "20px 16px", fontFamily: MONO, fontSize: 11, color: "#6B7280", textAlign: "center" as const }}>
              No results for <span style={{ color: "#C8922A" }}>"{q}"</span>
            </div>
          ) : results.map((r, i) => (
            <a key={r._id} href={r._href} onClick={close}
              style={{
                display: "flex", gap: 10, padding: "10px 14px", textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: i === focused ? "rgba(200,146,42,0.08)" : "transparent",
                borderLeft: i === focused ? "2px solid #C8922A" : "2px solid transparent",
              }}
              onMouseEnter={() => setFocused(i)}
            >
              <span style={{ flexShrink: 0, fontSize: 14, opacity: 0.7, marginTop: 1, color: TYPE_COLORS[r._typeLabel] ?? "#9CA3AF" }}>
                {TYPE_ICONS[r._typeLabel] ?? "◈"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 600, color: "#E5E5E5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.title}
                </div>
                {r.summary && (
                  <div style={{ fontFamily: MONO, fontSize: 9, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                    {r.summary.slice(0, 90)}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, padding: "2px 6px", background: `${TYPE_COLORS[r._typeLabel] ?? "#9CA3AF"}20`, color: TYPE_COLORS[r._typeLabel] ?? "#9CA3AF" }}>
                  {r._typeLabel}
                </span>
                {r.price && (
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "#C8922A" }}>${parseFloat(r.price).toFixed(2)}</span>
                )}
              </div>
            </a>
          ))}
          {results.length > 0 && (
            <a href={`/products?search=${encodeURIComponent(q)}`} onClick={close}
              style={{ display: "flex", justifyContent: "center", padding: "10px", fontFamily: MONO, fontSize: 10, color: "#C8922A", textDecoration: "none", borderTop: "1px solid #1F2428", background: "rgba(200,146,42,0.04)" }}>
              See all results for "{q}" →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
