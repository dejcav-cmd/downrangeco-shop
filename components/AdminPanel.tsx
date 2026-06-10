"use client";
import { useState, useEffect, useCallback } from "react";

const TABS = ["Products", "Orders", "Store Info"] as const;
type Tab = typeof TABS[number];

const S = {
  bg: "#09090B", bg2: "#111113", bg3: "#1A1A1D",
  card: "#141416", gold: "#C8922A", text: "#F0EDE8",
  muted: "#888", border: "rgba(255,255,255,0.06)",
  goldBorder: "rgba(200,146,42,0.3)", goldDim: "rgba(200,146,42,0.1)",
  red: "#B84040", green: "#2a6a3a",
};

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("Products");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const apiFetch = useCallback(async (action: string, pg = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?action=${action}&page=${pg}`, {
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (e: any) {
      showToast(e.message, "err");
      return null;
    } finally {
      setLoading(false);
    }
  }, [key]);

  const apiPost = useCallback(async (body: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "x-admin-key": key, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (e: any) {
      showToast(e.message, "err");
      return null;
    } finally {
      setLoading(false);
    }
  }, [key]);

  const login = () => {
    if (!key.trim()) return;
    setAuthed(true);
    localStorage.setItem("dr_shop_admin", key);
  };

  useEffect(() => {
    const saved = localStorage.getItem("dr_shop_admin");
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "Products") apiFetch("products", page).then((d) => { if (d) { setProducts(d.data ?? []); setTotalPages(d.last_page ?? 1); } });
    if (tab === "Orders") apiFetch("orders", page).then((d) => { if (d) { setOrders(d.data ?? []); setTotalPages(d.last_page ?? 1); } });
    if (tab === "Store Info") apiFetch("shop").then((d) => { if (d) setShopInfo(d); });
  }, [authed, tab, page, apiFetch]);

  const filtered = products.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)" }}>
        <div style={{ background: S.bg2, border: `1px solid ${S.border}`, padding: "40px", width: "360px" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.1em", marginBottom: "6px" }}>
            DOWN <span style={{ color: S.gold }}>RANGE</span> CO.
          </div>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: "28px" }}>
            Store Admin
          </div>
          <input
            type="password"
            placeholder="Admin key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{ width: "100%", background: S.bg3, border: `1px solid ${S.border}`, color: S.text, fontFamily: "var(--font-mono)", fontSize: "13px", padding: "12px 14px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
          />
          <button onClick={login} style={{ width: "100%", background: S.gold, color: S.bg, fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px", border: "none", cursor: "pointer" }}>
            Enter Admin →
          </button>
          <div style={{ fontSize: "10px", color: S.muted, marginTop: "14px", textAlign: "center" }}>
            Default key: <span style={{ color: S.gold }}>drco-admin-2026</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "var(--font-sans)" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 999, background: toast.type === "ok" ? S.green : S.red, color: "#fff", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.1em", padding: "12px 20px", border: `1px solid ${toast.type === "ok" ? "#3a8a4a" : "#d05050"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: S.bg2, borderBottom: `1px solid ${S.border}`, padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-bebas)", fontSize: "20px", letterSpacing: "0.1em" }}>
          <a href="/" style={{ color: S.text, textDecoration: "none" }}>DOWN <span style={{ color: S.gold }}>RANGE</span></a>
          <span style={{ color: S.muted, fontSize: "13px", fontFamily: "var(--font-mono)", marginLeft: "12px", letterSpacing: "0.1em" }}>/ ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="/products" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: S.muted, textDecoration: "none" }}>View Store ↗</a>
          <button onClick={() => { setAuthed(false); localStorage.removeItem("dr_shop_admin"); }} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", border: `1px solid ${S.border}`, color: S.muted, padding: "6px 12px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: S.bg3, borderBottom: `1px solid ${S.border}`, padding: "0 32px", display: "flex", gap: "0" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "16px 20px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t ? S.gold : "transparent"}`, color: tab === t ? S.gold : S.muted, cursor: "pointer", transition: "color 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Loading bar */}
        {loading && <div style={{ height: "2px", background: S.gold, marginBottom: "24px", animation: "pulse 1s infinite" }} />}

        {/* PRODUCTS TAB */}
        {tab === "Products" && (
          <>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-bebas)", fontSize: "32px", letterSpacing: "0.06em", color: S.text }}>
                  PRODUCTS <span style={{ color: S.gold }}>{products.length > 0 ? `(${products.length})` : ""}</span>
                </div>
              </div>
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: S.bg3, border: `1px solid ${S.border}`, color: S.text, fontFamily: "var(--font-mono)", fontSize: "12px", padding: "10px 14px", outline: "none", width: "260px" }}
              />
            </div>

            {filtered.length === 0 && !loading && (
              <div style={{ color: S.muted, fontFamily: "var(--font-mono)", fontSize: "12px", padding: "40px 0" }}>No products found.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onPublish={async () => {
                    await apiPost({ action: "publish", productId: p.id });
                    showToast(`Published: ${p.title}`);
                    apiFetch("products", page).then((d) => { if (d) setProducts(d.data ?? []); });
                  }}
                  onUnpublish={async () => {
                    await apiPost({ action: "unpublish", productId: p.id });
                    showToast(`Unpublished: ${p.title}`);
                    apiFetch("products", page).then((d) => { if (d) setProducts(d.data ?? []); });
                  }}
                  onDelete={async () => {
                    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
                    await apiPost({ action: "delete", productId: p.id });
                    showToast(`Deleted: ${p.title}`, "err");
                    apiFetch("products", page).then((d) => { if (d) setProducts(d.data ?? []); });
                  }}
                />
              ))}
            </div>

            <Pagination page={page} total={totalPages} onChange={setPage} />
          </>
        )}

        {/* ORDERS TAB */}
        {tab === "Orders" && (
          <>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: "32px", letterSpacing: "0.06em", color: S.text, marginBottom: "24px" }}>
              ORDERS <span style={{ color: S.gold }}>{orders.length > 0 ? `(${orders.length})` : ""}</span>
            </div>

            {orders.length === 0 && !loading && (
              <div style={{ color: S.muted, fontFamily: "var(--font-mono)", fontSize: "12px", padding: "40px 0" }}>No orders yet.</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {orders.map((o) => (
                <div key={o.id} style={{ background: S.card, border: `1px solid ${S.border}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: S.gold, marginBottom: "3px", letterSpacing: "0.1em" }}>#{o.id?.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: "13px", color: S.text, fontWeight: 500 }}>{o.address_to?.first_name} {o.address_to?.last_name}</div>
                    <div style={{ fontSize: "11px", color: S.muted, marginTop: "2px" }}>{o.address_to?.city}, {o.address_to?.country} · {o.line_items?.length ?? 0} item{o.line_items?.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={o.status} />
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: S.gold, marginTop: "6px" }}>
                      ${((o.total_price ?? 0) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} total={totalPages} onChange={setPage} />
          </>
        )}

        {/* STORE INFO TAB */}
        {tab === "Store Info" && shopInfo && (
          <>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: "32px", letterSpacing: "0.06em", color: S.text, marginBottom: "24px" }}>
              STORE <span style={{ color: S.gold }}>INFO</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {(Array.isArray(shopInfo) ? shopInfo : [shopInfo]).map((shop: any) => (
                <div key={shop.id} style={{ background: S.card, border: `1px solid ${S.border}`, padding: "24px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: S.gold, marginBottom: "8px" }}>Shop</div>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: S.text, marginBottom: "14px" }}>{shop.title}</div>
                  {[
                    ["ID", shop.id],
                    ["Sales Channel", shop.sales_channel],
                    ["Currency", shop.currency ?? "USD"],
                  ].map(([label, val]) => (
                    <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${S.border}` }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted }}>{label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: S.text }}>{String(val ?? "—")}</span>
                    </div>
                  ))}
                  <a href="https://printify.com/app/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "16px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: S.gold, textDecoration: "none" }}>
                    Open Printify Dashboard ↗
                  </a>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ marginTop: "24px", fontFamily: "var(--font-bebas)", fontSize: "24px", letterSpacing: "0.06em", color: S.text, marginBottom: "16px" }}>
              QUICK <span style={{ color: S.gold }}>LINKS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {[
                { label: "Printify Dashboard", href: "https://printify.com/app/dashboard" },
                { label: "Add Products", href: "https://printify.com/app/catalog" },
                { label: "Pop-Up Store", href: "https://downrange-co.printify.me" },
                { label: "Stripe Payouts", href: "https://dashboard.stripe.com" },
                { label: "Live Store", href: "https://shop.downrangeco.com" },
                { label: "DownRange Portal", href: "https://downrangeco.com" },
              ].map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: S.bg3, border: `1px solid ${S.border}`, padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = S.goldBorder; (e.currentTarget as HTMLElement).style.color = S.gold; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = S.border; (e.currentTarget as HTMLElement).style.color = S.muted; }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
}

function ProductRow({ product, onPublish, onUnpublish, onDelete }: { product: any; onPublish: () => void; onUnpublish: () => void; onDelete: () => void }) {
  const img = product.images?.find((i: any) => i.is_default)?.src ?? product.images?.[0]?.src;
  const price = product.variants?.filter((v: any) => v.is_enabled)?.[0]?.price;

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {/* Thumb */}
      <div style={{ width: "52px", height: "52px", background: S.bg3, border: `1px solid ${S.border}`, flexShrink: 0, overflow: "hidden" }}>
        {img && <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: "180px" }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: S.text, marginBottom: "3px" }}>{product.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", color: S.muted, textTransform: "uppercase" }}>
          {product.variants?.filter((v: any) => v.is_enabled).length ?? 0} variants
          {price ? ` · from $${(price / 100).toFixed(2)}` : ""}
        </div>
      </div>

      {/* Status */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 8px", background: product.visible ? "rgba(42,106,58,0.3)" : S.bg3, border: `1px solid ${product.visible ? "#3a8a4a" : S.border}`, color: product.visible ? "#6adb8a" : S.muted }}>
        {product.visible ? "Published" : "Hidden"}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px" }}>
        <a href={`/products/${product.id}`} target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", background: "transparent", border: `1px solid ${S.border}`, color: S.muted, textDecoration: "none", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = S.gold; (e.currentTarget as HTMLElement).style.borderColor = S.goldBorder; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = S.muted; (e.currentTarget as HTMLElement).style.borderColor = S.border; }}>
          View
        </a>
        {product.visible ? (
          <button onClick={onUnpublish} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", background: "transparent", border: `1px solid ${S.border}`, color: S.muted, cursor: "pointer" }}>
            Hide
          </button>
        ) : (
          <button onClick={onPublish} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", background: S.goldDim, border: `1px solid ${S.goldBorder}`, color: S.gold, cursor: "pointer" }}>
            Publish
          </button>
        )}
        <button onClick={onDelete} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", background: "transparent", border: `1px solid ${S.border}`, color: S.red, cursor: "pointer" }}>
          Delete
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pending:    { bg: "rgba(180,120,20,0.2)", text: "#e0a830", border: "#b07020" },
    fulfilled:  { bg: "rgba(42,106,58,0.2)", text: "#6adb8a", border: "#3a8a4a" },
    cancelled:  { bg: "rgba(184,64,64,0.2)", text: "#e08080", border: "#b04040" },
    on_hold:    { bg: "rgba(80,80,180,0.2)", text: "#9090e0", border: "#5050a0" },
  };
  const c = colors[status] ?? { bg: S.bg3, text: S.muted, border: S.border };
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 8px", background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {status ?? "unknown"}
    </span>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "32px" }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", padding: "8px 14px", background: p === page ? S.gold : "transparent", border: `1px solid ${p === page ? S.gold : S.border}`, color: p === page ? S.bg : S.muted, cursor: "pointer", fontWeight: p === page ? 700 : 400 }}>
          {p}
        </button>
      ))}
    </div>
  );
}
