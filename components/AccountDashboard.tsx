"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Section = "orders" | "profile";

const S = {
  gold: "var(--gold)", muted: "var(--muted)", text: "var(--text)",
  card: "var(--card)", border: "rgba(255,255,255,0.06)",
  goldBorder: "rgba(200,146,42,0.28)", goldDim: "rgba(200,146,42,0.1)",
};

function mono(size = 10) {
  return { fontFamily: "var(--font-mono)", fontSize: `${size}px`, letterSpacing: "0.12em", textTransform: "uppercase" as const };
}

export default function AccountDashboard() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>("orders");

  useEffect(() => {
    if (!loading && !customer) router.replace("/account");
  }, [customer, loading, router]);

  if (loading) return <LoadingState />;
  if (!customer) return null;

  const orders = customer.orders?.nodes ?? [];
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ ...mono(10), color: S.gold, marginBottom: 6 }}>// My Account</div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(32px,5vw,52px)", letterSpacing: "0.04em", color: S.text, margin: 0, lineHeight: 1 }}>
            WELCOME BACK,<br />
            <span style={{ color: S.gold }}>{customer.firstName?.toUpperCase() || "SHOOTER"}.</span>
          </h1>
          <div style={{ ...mono(9), color: S.muted, marginTop: 6 }}>{customer.email}</div>
        </div>
        <button onClick={async () => { await logout(); router.push("/"); }}
          style={{ ...mono(10), background: "transparent", border: `1px solid ${S.border}`, color: S.muted, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = S.goldBorder; (e.currentTarget as HTMLElement).style.color = S.gold; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = S.border; (e.currentTarget as HTMLElement).style.color = S.muted; }}>
          Sign Out
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, marginBottom: 32, border: `1px solid ${S.border}` }}>
        {[
          { num: orders.length, label: "Total Orders" },
          { num: orders.filter(o => o.fulfillmentStatus === "FULFILLED").length, label: "Fulfilled" },
          { num: orders.filter(o => o.financialStatus === "PAID").length, label: "Paid" },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "20px 24px", background: S.card, borderRight: i < 2 ? `1px solid ${S.border}` : "none" }}>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 36, color: S.gold, letterSpacing: "0.04em", lineHeight: 1 }}>{s.num}</div>
            <div style={{ ...mono(9), color: S.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${S.border}`, marginBottom: 28 }}>
        {(["orders", "profile"] as Section[]).map(s => (
          <button key={s} onClick={() => setSection(s)}
            style={{ ...mono(11), padding: "12px 20px", background: "transparent", border: "none", borderBottom: `2px solid ${section === s ? S.gold : "transparent"}`, color: section === s ? S.gold : S.muted, cursor: "pointer", transition: "color 0.15s" }}>
            {s === "orders" ? `Order History (${orders.length})` : "Profile"}
          </button>
        ))}
      </div>

      {/* Orders */}
      {section === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 48, color: "rgba(200,146,42,0.15)", marginBottom: 12 }}>NO ORDERS YET</div>
              <div style={{ ...mono(10), color: S.muted, marginBottom: 24 }}>Your order history will appear here</div>
              <a href="/products" style={{ background: S.gold, color: "#09090B", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 24px", textDecoration: "none", fontWeight: 700 }}>
                Start Shopping →
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      {section === "profile" && <ProfileEditor customer={customer} />}
    </div>
  );
}

// ── Order card ────────────────────────────────────────────────────────
function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const tracking = order.successfulFulfillments?.flatMap((f: any) => f.trackingInfo ?? []) ?? [];
  const trackingCompany = order.successfulFulfillments?.[0]?.trackingCompany;

  const finColor: Record<string, string> = { PAID: "#6adb8a", PENDING: "#e0a830", REFUNDED: "#9090e0" };
  const fulColor: Record<string, string> = { FULFILLED: "#6adb8a", UNFULFILLED: "#e08080", PARTIAL: "#e0a830", IN_TRANSIT: "#9090e0" };
  const fc = finColor[order.financialStatus] ?? "var(--muted)";
  const uc = fulColor[order.fulfillmentStatus ?? "UNFULFILLED"] ?? "var(--muted)";

  const date = new Date(order.processedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const total = new Intl.NumberFormat("en-US", { style: "currency", currency: order.totalPrice?.currencyCode ?? "USD" }).format(parseFloat(order.totalPrice?.amount ?? 0));

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, overflow: "hidden", transition: "border-color 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.2)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = S.border}>

      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 120px 120px 120px 48px", gap: 0, padding: "16px 20px", alignItems: "center", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: S.gold }}>{order.name}</div>
        <div>
          <div style={{ fontSize: 13, color: S.text }}>{date}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: S.muted, marginTop: 2 }}>
            {order.lineItems?.nodes?.length ?? 0} item{(order.lineItems?.nodes?.length ?? 0) !== 1 ? "s" : ""}
          </div>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", background: `${fc}18`, border: `1px solid ${fc}44`, color: fc }}>
            {order.financialStatus}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", background: `${uc}18`, border: `1px solid ${uc}44`, color: uc }}>
            {order.fulfillmentStatus ?? "UNFULFILLED"}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: S.gold }}>{total}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: S.muted, textAlign: "center", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${S.border}`, padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>

            {/* Line items */}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Items</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {order.lineItems?.nodes?.map((item: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {item.variant?.image?.url && (
                      <div style={{ width: 52, height: 52, background: "var(--bg3)", flexShrink: 0, overflow: "hidden" }}>
                        <img src={item.variant.image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: S.text, fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: S.muted, marginTop: 2 }}>
                        {item.variant?.title !== "Default Title" ? item.variant?.title : ""} · Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: S.gold }}>
                      {item.variant?.price ? new Intl.NumberFormat("en-US", { style: "currency", currency: item.variant.price.currencyCode }).format(parseFloat(item.variant.price.amount) * item.quantity) : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: `1px solid ${S.border}`, marginTop: 16, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Subtotal", order.subtotalPrice],
                  ["Shipping", order.totalShippingPrice],
                  ["Total", order.totalPrice],
                ].map(([label, price]: any) => price && (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: label === "Total" ? 14 : 12, fontWeight: label === "Total" ? 700 : 400, color: label === "Total" ? S.gold : S.text }}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: price.currencyCode }).format(parseFloat(price.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — shipping + tracking */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Shipping address */}
              {order.shippingAddress && (
                <div style={{ background: "var(--bg3)", border: `1px solid ${S.border}`, padding: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: S.gold, marginBottom: 10 }}>Ship To</div>
                  <div style={{ fontSize: 13, color: S.text, lineHeight: 1.7 }}>
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address1}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.provinceCode} {order.shippingAddress.zip}<br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              )}

              {/* Tracking */}
              {tracking.length > 0 ? (
                <div style={{ background: "rgba(42,106,58,0.1)", border: "1px solid rgba(42,106,58,0.3)", padding: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6adb8a", marginBottom: 10 }}>
                    📦 Tracking
                    {trackingCompany && <span style={{ marginLeft: 8, color: S.muted }}>via {trackingCompany}</span>}
                  </div>
                  {tracking.map((t: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: S.text, marginBottom: 6 }}>{t.number}</div>
                      {t.url && (
                        <a href={t.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-block", background: "#6adb8a", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 16px", textDecoration: "none" }}>
                          Track Package →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : order.fulfillmentStatus !== "FULFILLED" ? (
                <div style={{ background: "rgba(180,120,20,0.1)", border: "1px solid rgba(180,120,20,0.3)", padding: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e0a830", marginBottom: 6 }}>⏳ In Production</div>
                  <div style={{ fontSize: 12, color: S.muted }}>Your order is being printed and fulfilled by Printify. Tracking will appear here once shipped.</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile editor ────────────────────────────────────────────────────
function ProfileEditor({ customer }: { customer: any }) {
  const { refresh } = useAuth();
  const [form, setForm] = useState({ firstName: customer.firstName ?? "", lastName: customer.lastName ?? "", email: customer.email ?? "", phone: customer.phone ?? "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/account", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", data: { firstName: form.firstName, lastName: form.lastName, phone: form.phone } }),
      });
      const data = await res.json();
      if (data.error) setMsg(`Error: ${data.error}`);
      else { setMsg("Profile updated ✓"); await refresh(); }
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <PField label="First Name" value={form.firstName} onChange={(v: string) => setForm(f => ({ ...f, firstName: v }))} />
          <PField label="Last Name" value={form.lastName} onChange={(v: string) => setForm(f => ({ ...f, lastName: v }))} />
        </div>
        <PField label="Email" value={form.email} type="email" disabled hint="Contact Shopify support to change email" />
        <PField label="Phone" value={form.phone} onChange={(v: string) => setForm(f => ({ ...f, phone: v }))} placeholder="+1 (555) 000-0000" />

        {msg && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: msg.startsWith("Error") ? "#e08080" : "#6adb8a", padding: "10px 12px", background: msg.startsWith("Error") ? "rgba(184,64,64,0.1)" : "rgba(42,106,58,0.1)", border: `1px solid ${msg.startsWith("Error") ? "rgba(184,64,64,0.3)" : "rgba(42,106,58,0.3)"}` }}>{msg}</div>}

        <button onClick={save} disabled={saving}
          style={{ background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function PField({ label, value, onChange, type = "text", disabled, hint, placeholder }: any) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ width: "100%", background: disabled ? "var(--bg3)" : "var(--bg3)", border: "1px solid rgba(255,255,255,0.08)", color: disabled ? "var(--muted)" : "var(--text)", fontFamily: "var(--font-sans)", fontSize: 13, padding: "11px 14px", outline: "none", boxSizing: "border-box", cursor: disabled ? "not-allowed" : "text" }}
        onFocus={e => !disabled && (e.target.style.borderColor = "rgba(200,146,42,0.4)")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
      {hint && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
        Loading account...
      </div>
    </div>
  );
}
