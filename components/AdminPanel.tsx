"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import PageEditor from "@/components/PageEditor";

// ── Design tokens ──────────────────────────────────────────────────────────
const S = {
  bg:"#09090B", bg2:"#0E0E10", bg3:"#161618", card:"#111113",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.10)", goldBorder:"rgba(200,146,42,0.28)",
  goldHover:"rgba(200,146,42,0.18)",
  text:"#F0EDE8", muted:"#666", dim:"#444", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.10)", redBorder:"rgba(184,64,64,0.28)",
  green:"#2a6a3a", greenText:"#6adb8a", greenDim:"rgba(22,163,74,0.08)",
  blue:"#3b82f6", blueDim:"rgba(59,130,246,0.10)",
  sidebar:"#08080A",
};

const TABS = [
  { id:"dashboard",   icon:"⬡", label:"Dashboard",   badge:null },
  { id:"orders",      icon:"◎", label:"Orders",       badge:null },
  { id:"products",    icon:"◈", label:"Products",     badge:null },
  { id:"storefront",  icon:"◉", label:"Storefront",   badge:null },
  { id:"collections", icon:"⬡", label:"Collections",  badge:null },
  { id:"pages",       icon:"◌", label:"Pages",        badge:null },
  { id:"ops",         icon:"◎", label:"Operations",   badge:null },
  { id:"store",       icon:"◈", label:"Store Info",   badge:null },
] as const;
type TabId = typeof TABS[number]["id"];

const m = (s=10) => ({ fontFamily:"'IBM Plex Mono',monospace", fontSize:`${s}px`, letterSpacing:"0.10em", textTransform:"uppercase" as const });
const F = "var(--font-bebas,Bebas Neue,sans-serif)";

// ── Shared helpers ──────────────────────────────────────────────────────────
function iStyle(extra:any={}) {
  return { background:S.bg3, border:`1px solid ${S.border}`, color:S.text, padding:"8px 10px", width:"100%", fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", ...extra };
}
function Card({ children, style={} }:any) {
  return <div style={{ background:S.card, border:`1px solid ${S.border}`, padding:"16px 18px", ...style }}>{children}</div>;
}
function SideCard({ title, children, accent="" }:any) {
  return (
    <div style={{ background:S.bg3, border:`1px solid ${S.border}`, padding:"14px 16px" }}>
      {title && <div style={{ ...m(8), color:accent||S.gold, marginBottom:10 }}>{title}</div>}
      {children}
    </div>
  );
}
function Pill({ label, color="#22c55e", bg }:any) {
  return <span style={{ ...m(7), padding:"2px 7px", background:bg||`${color}14`, color, border:`1px solid ${color}28` }}>{label}</span>;
}
function LoadingBar() {
  return <div style={{ height:2, background:S.goldBorder, animation:"ldBar 1.2s ease infinite", width:"60%", marginBottom:20 }}>
    <style>{`@keyframes ldBar{0%{width:0%}100%{width:100%}}`}</style>
  </div>;
}
function Btn({ children, onClick, color="gold", disabled=false, size="md" }:any) {
  const bg = color==="gold" ? S.gold : color==="red" ? S.redDim : S.goldDim;
  const cl = color==="gold" ? S.bg   : color==="red" ? "#e08080"  : S.gold;
  const bd = color==="gold" ? "none" : color==="red" ? `1px solid ${S.redBorder}` : `1px solid ${S.goldBorder}`;
  const pd = size==="sm" ? "5px 10px" : "7px 14px";
  return <button onClick={onClick} disabled={disabled} style={{ ...m(9), background:bg, color:cl, border:bd, padding:pd, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, transition:"all 0.15s", whiteSpace:"nowrap" }}>{children}</button>;
}
function BackBtn({ onClick }:any) {
  return <button onClick={onClick} style={{ ...m(9), background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:"6px 12px", cursor:"pointer" }}>← Back</button>;
}
function FieldLbl({ children }:any) {
  return <div style={{ ...m(8), color:S.muted, marginBottom:4 }}>{children}</div>;
}
function SmallBadge({ status }:any) {
  const ok = status==="ACTIVE"||status==="active"||status==="published";
  return <span style={{ ...m(7), padding:"2px 7px", background:ok?S.greenDim:S.redDim, color:ok?S.greenText:"#e08080", border:`1px solid ${ok?"rgba(34,197,94,.2)":"rgba(184,64,64,.2)"}` }}>{status}</span>;
}
function Toast({ msg, type }:any) {
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background:type==="ok"?S.greenDim:S.redDim, border:`1px solid ${type==="ok"?"rgba(34,197,94,.3)":S.redBorder}`, padding:"10px 18px", ...m(10), color:type==="ok"?S.greenText:"#e08080", maxWidth:400 }}>
      {type==="ok"?"✓ ":"✗ "}{msg}
    </div>
  );
}

function fmtAge(ts:string) {
  const d = new Date(ts);
  if (!ts || isNaN(d.getTime())) return "—";
  const min = Math.floor((Date.now()-d.getTime())/60000);
  if (min<1)    return "just now";
  if (min<60)   return `${min}m ago`;
  if (min<1440) return `${Math.floor(min/60)}h ago`;
  return `${Math.floor(min/1440)}d ago`;
}
function fmtTime(ts:string) {
  const d = new Date(ts);
  if (!ts||isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
}
function money(v:any) { return `$${parseFloat(String(v??0)).toFixed(2)}`; }

// ══════════════════════════════════════════════════════════════════════
// MAIN ADMIN SHELL
// ══════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [key,     setKey]    = useState("");
  const [authed,  setAuthed] = useState(false);
  const [tab,     setTab]    = useState<TabId>("dashboard");
  const [toast,   setToast]  = useState<{msg:string;type:"ok"|"err"}|null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [alerts,  setAlerts] = useState(0); // error count from ops

  const showToast = (msg:string, type:"ok"|"err"="ok") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  };
  const apiFetch = useCallback(async(p:Record<string,string>)=>{
    const r = await fetch(`/api/admin?${new URLSearchParams(p)}`,{headers:{"x-admin-key":key},cache:"no-store"});
    const d = await r.json(); if(d.error) throw new Error(d.error); return d;
  },[key]);
  const apiPost = useCallback(async(b:any)=>{
    const r = await fetch("/api/admin",{method:"POST",headers:{"x-admin-key":key,"Content-Type":"application/json"},body:JSON.stringify(b)});
    const d = await r.json(); if(d.error) throw new Error(d.error); return d;
  },[key]);
  const login = () => { if(!key.trim()) return; setAuthed(true); localStorage.setItem("dr_admin_key",key); };
  useEffect(()=>{ const s=localStorage.getItem("dr_admin_key"); if(s){setKey(s);setAuthed(true);} },[]);

  if (!authed) return <Login keyVal={key} setKey={setKey} login={login}/>;

  const activeTab = TABS.find(t=>t.id===tab);

  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", fontFamily:"var(--font-sans)" }}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* ── Sidebar ── */}
      <aside style={{ width:collapsed?52:210, background:S.sidebar, borderRight:`1px solid ${S.border}`, display:"flex", flexDirection:"column", flexShrink:0, transition:"width 0.22s ease", overflow:"hidden" }}>
        {/* Logo + collapse */}
        <div style={{ padding:collapsed?"14px 0":"16px 16px 12px", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", borderBottom:`1px solid ${S.border}`, flexShrink:0 }}>
          {!collapsed && (
            <div>
              <img src="/logo.png" alt="DR" style={{ height:28, width:"auto", maxWidth:140, objectFit:"contain" }}/>
              <div style={{ ...m(7), color:S.muted, marginTop:3 }}>Admin</div>
            </div>
          )}
          <button onClick={()=>setCollapsed(c=>!c)} style={{ background:"transparent", border:`1px solid ${S.border}`, color:S.muted, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0 }}>
            {collapsed?"▷":"◁"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, paddingTop:8, overflowY:"auto" }}>
          {TABS.map(t=>{
            const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} title={collapsed?t.label:undefined}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:collapsed?"10px 0":"9px 16px", justifyContent:collapsed?"center":"flex-start", background:active?S.goldDim:"transparent", borderLeft:`2px solid ${active?S.gold:"transparent"}`, border:"none", borderLeftStyle:"solid", borderLeftWidth:2, borderLeftColor:active?S.gold:"transparent", cursor:"pointer", transition:"all 0.12s", position:"relative" }}>
                <span style={{ fontSize:13, color:active?S.gold:S.muted, flexShrink:0, opacity:active?1:0.6 }}>{t.icon}</span>
                {!collapsed && <span style={{ ...m(9), color:active?S.gold:S.muted, whiteSpace:"nowrap" }}>{t.label}</span>}
                {!collapsed && t.id==="ops" && alerts>0 && (
                  <span style={{ marginLeft:"auto", background:S.red, color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, flexShrink:0 }}>{alerts}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:collapsed?"12px 0":"12px 16px", borderTop:`1px solid ${S.border}`, display:"flex", flexDirection:"column", gap:6, alignItems:collapsed?"center":"stretch" }}>
          {!collapsed && <>
            <a href="/" target="_blank" style={{ ...m(8), color:S.muted, textDecoration:"none" }}>↗ Store</a>
            <a href="https://downrangeco.com" target="_blank" style={{ ...m(8), color:S.muted, textDecoration:"none" }}>↗ Portal</a>
          </>}
          <button title="Sign out" onClick={()=>{setAuthed(false);localStorage.removeItem("dr_admin_key");}}
            style={{ background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:collapsed?"5px":"5px 8px", cursor:"pointer", ...m(8), width:"100%" }}>
            {collapsed?"⏏":"Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ background:S.bg2, borderBottom:`1px solid ${S.border}`, padding:"0 24px", height:48, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ ...m(10), color:S.gold }}>{activeTab?.icon}</span>
            <span style={{ ...m(11), color:S.muted }}>{activeTab?.label}</span>
            {tab==="ops" && alerts>0 && <span style={{ ...m(8), color:S.red, background:S.redDim, border:`1px solid ${S.redBorder}`, padding:"2px 8px" }}>⚠ {alerts} active errors</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:S.greenText, animation:"drPulse 2s ease-in-out infinite" }}/>
            <span style={{ ...m(8), color:S.muted }}>downrange-co.myshopify.com</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px 60px" }}>
          {tab==="dashboard"   && <DashboardTab   apiFetch={apiFetch} setTab={setTab} adminKey={key} onAlerts={setAlerts}/>}
          {tab==="orders"      && <OrdersTab      apiFetch={apiFetch} apiPost={apiPost} showToast={showToast}/>}
          {tab==="products"    && <ProductsTab    apiFetch={apiFetch} apiPost={apiPost} showToast={showToast}/>}
          {tab==="storefront"  && <StorefrontTab  adminKey={key} showToast={showToast}/>}
          {tab==="collections" && <CollectionsTab apiFetch={apiFetch}/>}
          {tab==="pages"       && <PageEditor     adminKey={key} showToast={showToast}/>}
          {tab==="ops"         && <OpsTab         adminKey={key} onAlerts={setAlerts}/>}
          {tab==="store"       && <StoreInfoTab   apiFetch={apiFetch}/>}
        </div>
      </main>

      <style>{`
        button:focus,input:focus,textarea:focus,select:focus{outline:none;}
        *{box-sizing:border-box;} ::placeholder{color:#333;}
        @keyframes drPulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes ldBar{0%{margin-left:0;width:40%}50%{margin-left:30%;width:60%}100%{margin-left:100%;width:0%}}
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${S.border};border-radius:2px}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD — command center with live metrics + quick actions
// ══════════════════════════════════════════════════════════════════════
function DashboardTab({ apiFetch, setTab, adminKey, onAlerts }:any) {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [health,  setHealth]  = useState<any>(null);
  const [stats,   setStats]   = useState<any>(null);
  const [products,setProducts]= useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [time,    setTime]    = useState(new Date());

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [o, h, l, p] = await Promise.all([
        apiFetch({action:"list_orders",limit:"5"}).catch(()=>({orders:[]})),
        fetch(`/api/ops/health?key=${adminKey}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})),
        fetch(`/api/ops/alert?key=${adminKey}&count=200`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})),
        apiFetch({action:"list_products",limit:"4"}).catch(()=>({products:[]})),
      ]);
      setOrders(o.orders??[]);
      setHealth(h);
      setStats(l.stats??{});
      setProducts(p.products??[]);
      const errCount = (l.logs??[]).filter((x:any)=>x.level==="error"||x.level==="critical").length;
      onAlerts?.(errCount);
    } finally { setLoading(false); }
  },[apiFetch, adminKey, onAlerts]);
  useEffect(()=>{ load(); },[load]);

  const statusColor = (s:string) => s==="ok"||s==="healthy"?S.greenText:s==="warn"?"#e0a830":"#e08080";
  const recentRevenue = orders.reduce((s:number,o:any)=>s+parseFloat(o.total_price??0),0);

  return (
    <div>
      {/* ── Live clock + greeting ── */}
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:F, fontSize:38, letterSpacing:"0.04em", lineHeight:1 }}>
            COMMAND <span style={{ color:S.gold }}>CENTER</span>
          </div>
          <div style={{ ...m(9), color:S.muted, marginTop:4 }}>
            {time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {time.toLocaleTimeString("en-US",{hour12:false})}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn onClick={load} color="ghost">↻ Refresh</Btn>
          <Btn onClick={async()=>{setSyncing(true);await fetch("/api/ops/sync-products",{headers:{"x-admin-key":adminKey}});await load();setSyncing(false);}} disabled={syncing}>{syncing?"Syncing…":"⟳ Sync Products"}</Btn>
        </div>
      </div>

      {loading && <LoadingBar/>}

      {/* ── Health strip ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:20 }}>
        {(health?.checks??[{name:"Loading…",status:"info"}]).map((c:any)=>(
          <div key={c.name} style={{ background:S.card, border:`1px solid ${c.status==="ok"?"rgba(34,197,94,0.2)":c.status==="error"?S.redBorder:S.border}`, padding:"10px 12px" }}>
            <div style={{ ...m(7), color:S.muted, marginBottom:4 }}>{c.name}</div>
            <div style={{ ...m(11), color:statusColor(c.status) }}>{c.status?.toUpperCase()}</div>
            {c.latency && <div style={{ ...m(7), color:S.muted, marginTop:2 }}>{c.latency}ms</div>}
          </div>
        ))}
      </div>

      {/* ── KPI row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Recent Orders",    v:orders.length,          unit:"last 5",   color:S.gold     },
          { label:"Revenue (recent)", v:money(recentRevenue),   unit:"5 orders", color:S.greenText},
          { label:"Products",         v:products.length,        unit:"active",   color:S.text     },
          { label:"Errors Logged",    v:stats?.errors??0,       unit:"total",    color:stats?.errors>0?"#e08080":S.muted},
        ].map(k=>(
          <Card key={k.label}>
            <div style={{ fontFamily:F, fontSize:36, color:k.color, letterSpacing:"0.04em", lineHeight:1 }}>{k.v}</div>
            <div style={{ ...m(9), color:S.gold, marginTop:2 }}>{k.label}</div>
            <div style={{ ...m(7), color:S.muted, marginTop:2 }}>{k.unit}</div>
          </Card>
        ))}
      </div>

      {/* ── Two columns: recent orders + quick actions ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:16 }}>
        {/* Recent orders */}
        <SideCard title="Recent Orders">
          {orders.length===0 && !loading && <div style={{ ...m(9), color:S.muted, padding:"20px 0", textAlign:"center" }}>No orders yet</div>}
          {orders.slice(0,5).map((o:any)=>(
            <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${S.border}` }}>
              <div>
                <div style={{ ...m(10), color:S.text }}>#{o.order_number} · {money(o.total_price)}</div>
                <div style={{ ...m(8), color:S.muted, marginTop:2 }}>{o.customer?.first_name} {o.customer?.last_name} · {fmtAge(o.created_at)}</div>
              </div>
              <SmallBadge status={o.financial_status??o.fulfillment_status??"pending"}/>
            </div>
          ))}
          <div style={{ marginTop:10 }}>
            <Btn onClick={()=>setTab("orders")} size="sm" color="ghost">View all orders →</Btn>
          </div>
        </SideCard>

        {/* Quick actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ ...m(8), color:S.gold, marginBottom:4 }}>Quick Actions</div>
          {[
            { label:"↗ Visit Store",        action:()=>window.open("/","_blank") },
            { label:"📦 Add Product",       action:()=>setTab("products") },
            { label:"🖼 Edit Hero",          action:()=>setTab("storefront") },
            { label:"📋 Manage Orders",     action:()=>setTab("orders") },
            { label:"📄 Edit Pages",        action:()=>setTab("pages") },
            { label:"⚙ Operations",         action:()=>setTab("ops") },
          ].map(a=>(
            <button key={a.label} onClick={a.action}
              style={{ ...m(9), background:S.bg3, border:`1px solid ${S.border}`, color:S.muted, padding:"9px 14px", cursor:"pointer", textAlign:"left", transition:"all 0.12s" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent products ── */}
      <SideCard title="Recent Products">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {products.slice(0,4).map((p:any)=>(
            <div key={p.id} style={{ background:S.bg, border:`1px solid ${S.border}`, overflow:"hidden" }}>
              {p.images?.[0]?.src && <img src={p.images[0].src} alt="" style={{ width:"100%", height:100, objectFit:"cover" }}/>}
              <div style={{ padding:"8px 10px" }}>
                <div style={{ ...m(8), color:S.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</div>
                <div style={{ ...m(8), color:S.gold, marginTop:3 }}>{money(p.variants?.[0]?.price??0)}</div>
              </div>
            </div>
          ))}
        </div>
      </SideCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// OPERATIONS — tabbed: Health / Logs / SMS / Webhooks / Crons / Backup
// ══════════════════════════════════════════════════════════════════════
function OpsTab({ adminKey, onAlerts }:any) {
  const [opsTab,  setOpsTab]  = useState<"health"|"logs"|"sms"|"webhooks"|"crons"|"backup">("health");
  const [health,  setHealth]  = useState<any>(null);
  const [logs,    setLogs]    = useState<any[]>([]);
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLR]  = useState("");
  const [autoRefresh, setAR]  = useState(true);
  const [syncing, setSyncing] = useState(false);
  const timerRef = useRef<any>(null);

  const load = useCallback(async(silent=false)=>{
    if(!silent) setLoading(true);
    try {
      const [h,l] = await Promise.all([
        fetch(`/api/ops/health?key=${adminKey}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})),
        fetch(`/api/ops/alert?key=${adminKey}&count=500`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})),
      ]);
      setHealth(h);
      setLogs(l.logs??[]);
      setStats(l.stats??{});
      setLR(new Date().toLocaleTimeString());
      const errs = (l.logs??[]).filter((x:any)=>x.level==="error"||x.level==="critical").length;
      onAlerts?.(errs);
    } finally { if(!silent) setLoading(false); }
  },[adminKey, onAlerts]);

  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{
    if(!autoRefresh){clearInterval(timerRef.current);return;}
    timerRef.current = setInterval(()=>load(true),15000);
    return()=>clearInterval(timerRef.current);
  },[autoRefresh,load]);

  const errorCount = logs.filter(l=>l.level==="error"||l.level==="critical").length;
  const warnCount  = logs.filter(l=>l.level==="warn").length;

  const OPS_TABS = [
    { id:"health",   label:"System Health",  badge: health?.status!=="healthy"?1:0 },
    { id:"logs",     label:"Event Log",      badge: errorCount },
    { id:"sms",      label:"SMS Alerts",     badge: 0 },
    { id:"webhooks", label:"Webhooks",       badge: 0 },
    { id:"crons",    label:"Cron Jobs",      badge: 0 },
    { id:"backup",   label:"Backups",        badge: 0 },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:F, fontSize:36, letterSpacing:"0.04em", lineHeight:1 }}>OPERATIONS <span style={{ color:S.gold }}>CENTER</span></div>
          <div style={{ ...m(9), color:S.muted, marginTop:3, display:"flex", alignItems:"center", gap:8 }}>
            {autoRefresh && <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:S.greenText, animation:"drPulse 2s ease-in-out infinite" }}/>}
            {loading?"Loading…":`${logs.length} events · ${lastRefresh}`}
            {errorCount>0 && <span style={{ ...m(8), color:S.red, background:S.redDim, border:`1px solid ${S.redBorder}`, padding:"1px 7px" }}>⚠ {errorCount} errors</span>}
            {warnCount>0  && <span style={{ ...m(8), color:"#e0a830", background:"rgba(224,168,48,0.08)", border:"1px solid rgba(224,168,48,0.2)", padding:"1px 7px" }}>△ {warnCount} warnings</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <label style={{ display:"flex", gap:5, alignItems:"center", cursor:"pointer", ...m(8), color:S.muted }}>
            <input type="checkbox" checked={autoRefresh} onChange={e=>setAR(e.target.checked)} style={{ accentColor:S.gold }}/>auto 15s
          </label>
          <Btn onClick={async()=>{setSyncing(true);await fetch("/api/ops/sync-products",{headers:{"x-admin-key":adminKey}}).catch(()=>{});await load();setSyncing(false);}} disabled={syncing} size="sm">{syncing?"Syncing…":"⟳ Sync"}</Btn>
          <Btn onClick={()=>load()} color="ghost" size="sm">↻ Refresh</Btn>
          <Btn onClick={async()=>{if(!confirm("Clear all logs?"))return;await fetch(`/api/ops/alert?key=${adminKey}`,{method:"DELETE",headers:{"x-admin-key":adminKey}});load();}} color="red" size="sm">✕ Clear</Btn>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:18 }}>
        {[
          {l:"Total",   v:stats?.total??0,         c:S.text},
          {l:"Errors",  v:errorCount,               c:errorCount>0?"#e08080":S.muted},
          {l:"Warns",   v:warnCount,                c:warnCount>0?"#e0a830":S.muted},
          {l:"SMS Sent",v:stats?.smsAttempts??0,    c:S.greenText},
          {l:"Failed",  v:stats?.smsFailed??0,      c:stats?.smsFailed>0?"#e08080":S.muted},
          {l:"Cart",    v:stats?.cartActions??0,    c:S.gold},
          {l:"Auth",    v:stats?.authEvents??0,     c:S.muted},
        ].map(s=>(
          <div key={s.l} style={{ background:S.card, border:`1px solid ${s.l==="Errors"&&errorCount>0?S.redBorder:S.border}`, padding:"8px 10px" }}>
            <div style={{ fontFamily:F, fontSize:22, color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ ...m(7), color:S.muted, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${S.border}`, marginBottom:20, overflowX:"auto" }}>
        {OPS_TABS.map(t=>(
          <button key={t.id} onClick={()=>setOpsTab(t.id as any)}
            style={{ ...m(9), padding:"10px 18px", background:"transparent", borderBottom:`2px solid ${opsTab===t.id?S.gold:"transparent"}`, border:"none", color:opsTab===t.id?S.gold:S.muted, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6, transition:"color 0.12s" }}>
            {t.label}
            {(t.badge??0)>0 && <span style={{ background:S.red, color:"#fff", borderRadius:"50%", width:15, height:15, fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {opsTab==="health"   && <OpsHealthTab   health={health} loading={loading} onRefresh={()=>load()}/>}
      {opsTab==="logs"     && <OpsLogsTab     logs={logs} adminKey={adminKey} onRefresh={()=>load()}/>}
      {opsTab==="sms"      && <OpsSmsTab      logs={logs} adminKey={adminKey} onRefresh={()=>load()}/>}
      {opsTab==="webhooks" && <OpsWebhooksTab adminKey={adminKey}/>}
      {opsTab==="crons"    && <OpsCronsTab    adminKey={adminKey} onRefresh={()=>load()}/>}
      {opsTab==="backup"   && <OpsBackupTab   adminKey={adminKey} logs={logs}/>}
    </div>
  );
}

// ── Health sub-tab ──────────────────────────────────────────────────
function OpsHealthTab({ health, loading, onRefresh }:any) {
  const sc = (s:string) => s==="ok"||s==="healthy"?S.greenText:s==="warn"?"#e0a830":"#e08080";
  const checks = health?.checks??[];
  const overall = health?.status??"unknown";

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ fontFamily:F, fontSize:22, letterSpacing:"0.04em" }}>
          SYSTEM STATUS
        </div>
        <span style={{ ...m(10), color:sc(overall), background:`${sc(overall)}14`, border:`1px solid ${sc(overall)}28`, padding:"3px 12px" }}>
          {overall.toUpperCase()}
        </span>
        {health?.commit && <span style={{ ...m(8), color:S.muted }}>commit: {health.commit}</span>}
      </div>

      {loading && <LoadingBar/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
        {checks.map((c:any)=>(
          <div key={c.name} style={{ background:S.card, border:`2px solid ${c.status==="ok"?"rgba(34,197,94,0.2)":c.status==="error"?S.redBorder:"rgba(224,168,48,0.2)"}`, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ ...m(9), color:S.muted }}>{c.name}</div>
              <span style={{ ...m(9), color:sc(c.status) }}>{c.status?.toUpperCase()}</span>
            </div>
            {c.latency && <div style={{ fontFamily:F, fontSize:28, color:sc(c.status), letterSpacing:"0.04em" }}>{c.latency}<span style={{ ...m(8), color:S.muted, marginLeft:4 }}>ms</span></div>}
            {c.detail && <div style={{ ...m(8), color:S.muted, marginTop:6 }}>{c.detail}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <Btn onClick={onRefresh} size="sm">↻ Re-check</Btn>
        <a href="/api/ops/health" target="_blank" style={{ ...m(9), color:S.muted, textDecoration:"none", border:`1px solid ${S.border}`, padding:"5px 10px", display:"inline-block" }}>↗ Raw JSON</a>
      </div>
    </div>
  );
}

// ── Logs sub-tab ──────────────────────────────────────────────────
function OpsLogsTab({ logs, adminKey, onRefresh }:any) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [exp,    setExp]    = useState<string|null>(null);

  const lc = (l:string) => ({ok:S.greenText,info:"#8888dd",warn:"#e0a830",error:"#e08080",critical:"#ff5555"}[l]??S.muted);
  const li = (l:string) => ({ok:"✓",info:"·",warn:"△",error:"✗",critical:"!"}[l]??"·");
  const rb = (l:string) => l==="error"||l==="critical"?"rgba(184,64,64,0.07)":l==="warn"?"rgba(180,120,20,0.05)":l==="ok"?"rgba(22,163,74,0.03)":"transparent";

  const JOB_FILTERS = ["all","error","warn","ok","sms","product-sync","health-check","shopify-webhook","daily-backup","storefront"];
  const filtered = logs.filter((l:any) => {
    if(filter!=="all" && l.level!==filter && l.job!==filter) return false;
    if(search && !l.message?.toLowerCase().includes(search.toLowerCase()) && !l.job?.toLowerCase().includes(search.toLowerCase()) && !l.detail?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ ...iStyle(), width:200 }}/>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {JOB_FILTERS.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ ...m(8), padding:"4px 10px", background:filter===f?S.goldDim:"transparent", border:`1px solid ${filter===f?S.goldBorder:S.border}`, color:filter===f?S.gold:S.muted, cursor:"pointer" }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ ...m(8), color:S.muted, marginLeft:"auto" }}>{filtered.length} events</div>
      </div>

      <div style={{ border:`1px solid ${S.border}`, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"90px 50px 120px 1fr 60px", padding:"6px 12px", background:S.bg3, ...m(7), color:S.muted }}>
          {["Time","Lvl","Job","Message","Ms"].map(h=><div key={h}>{h}</div>)}
        </div>
        {filtered.length===0 && <div style={{ ...m(9), color:S.muted, padding:"30px", textAlign:"center" }}>No events{search?" matching search":""}</div>}
        {filtered.slice(0,200).map((l:any)=>(
          <div key={l.id} onClick={()=>setExp(exp===l.id?null:l.id)} style={{ background:exp===l.id?S.bg3:rb(l.level), borderTop:`1px solid ${S.border}`, cursor:"pointer" }}>
            <div style={{ display:"grid", gridTemplateColumns:"90px 50px 120px 1fr 60px", padding:"7px 12px", alignItems:"center" }}>
              <div style={{ ...m(7), color:S.muted }}>{fmtAge(l.ts)}</div>
              <div style={{ ...m(9), color:lc(l.level), fontWeight:700 }}>{li(l.level)}</div>
              <div style={{ ...m(8), color:S.gold, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.job}</div>
              <div style={{ ...m(9), color:S.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.message}</div>
              <div style={{ ...m(7), color:S.muted, textAlign:"right" }}>{l.duration??""}</div>
            </div>
            {exp===l.id && (
              <div style={{ padding:"8px 12px 12px", borderTop:`1px solid ${S.border}`, background:S.bg2 }}>
                <div style={{ ...m(7), color:S.muted, marginBottom:4 }}>{fmtTime(l.ts)}</div>
                {l.detail && <div style={{ ...m(9), color:S.text, marginBottom:4, whiteSpace:"pre-wrap" }}>{l.detail}</div>}
                {l.meta && <div style={{ ...m(8), color:S.muted, fontFamily:"monospace", whiteSpace:"pre-wrap" }}>{JSON.stringify(l.meta,null,2)}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SMS sub-tab ──────────────────────────────────────────────────────
function OpsSmsTab({ logs, adminKey, onRefresh }:any) {
  const [testing,  setTesting]  = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [smsFilter,setSmsFilter]= useState<"all"|"sent"|"skipped"|"failed">("all");
  const [exp, setExp] = useState<string|null>(null);

  const allSms = logs.filter((l:any)=>l.job==="sms"||l.job==="sms-test");
  const classify = (l:any)=>{
    if(l.level==="ok") return "sent";
    const d=(l.detail??"")+(l.message??"");
    if(d.includes("cooldown")||d.includes("configured")||d.includes("skipped")||d.includes("quiet")) return "skipped";
    return "failed";
  };
  const sent    = allSms.filter((l:any)=>classify(l)==="sent");
  const skipped = allSms.filter((l:any)=>classify(l)==="skipped");
  const failed  = allSms.filter((l:any)=>classify(l)==="failed");
  const rate    = allSms.length ? Math.round(sent.length/allSms.length*100) : null;
  const filtered= allSms.filter((l:any)=>smsFilter==="all"||classify(l)===smsFilter);

  const testSMS = async()=>{
    setTesting(true); setResult(null);
    const r = await fetch("/api/ops/test-sms",{method:"POST",headers:{"x-admin-key":adminKey,"Content-Type":"application/json"},body:"{}"});
    const d = await r.json(); setResult(d); setTesting(false);
    setTimeout(()=>onRefresh?.(),1000);
  };

  return (
    <div>
      {/* Config strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 120px", gap:10, marginBottom:20 }}>
        <SideCard title="FROM Number"><div style={{ ...m(11), color:S.gold }}>{process?.env?.NEXT_PUBLIC_TWILIO_FROM||"+12062036281"}</div></SideCard>
        <SideCard title="ALERT TO"><div style={{ ...m(11), color:S.gold }}>+12066016076</div></SideCard>
        <SideCard title="Send Rate">
          <div style={{ fontFamily:F, fontSize:28, color:S.greenText }}>{rate!==null?`${rate}%`:"—"}</div>
          <div style={{ ...m(7), color:S.muted, marginTop:2 }}>{sent.length}/{allSms.length} sent</div>
        </SideCard>
        <div style={{ display:"flex", flexDirection:"column", gap:6, justifyContent:"center" }}>
          <Btn onClick={testSMS} disabled={testing}>{testing?"Sending…":"📱 Test SMS"}</Btn>
        </div>
      </div>

      {result && (
        <div style={{ marginBottom:16, padding:"10px 14px", background:result.sent?S.greenDim:S.redDim, border:`1px solid ${result.sent?"rgba(34,197,94,.3)":S.redBorder}` }}>
          <div style={{ ...m(9), color:result.sent?S.greenText:"#e08080" }}>
            {result.sent?`✓ SMS sent · SID: ${result.twilioSid}`:result.errorMessage??"Send failed"}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${S.border}`, marginBottom:14 }}>
        {(["all","sent","skipped","failed"] as const).map(f=>(
          <button key={f} onClick={()=>setSmsFilter(f)}
            style={{ ...m(9), padding:"8px 16px", background:"transparent", borderBottom:`2px solid ${smsFilter===f?S.gold:"transparent"}`, border:"none", color:smsFilter===f?S.gold:S.muted, cursor:"pointer" }}>
            {f} {f==="all"?allSms.length:f==="sent"?sent.length:f==="skipped"?skipped.length:failed.length}
          </button>
        ))}
      </div>

      {/* SMS log */}
      <div style={{ border:`1px solid ${S.border}` }}>
        {filtered.length===0 && <div style={{ ...m(9), color:S.muted, padding:"30px", textAlign:"center" }}>No SMS events yet</div>}
        {filtered.map((l:any)=>{
          const c = classify(l);
          const cc = c==="sent"?"#22c55e":c==="skipped"?"#60a5fa":"#ef4444";
          return (
            <div key={l.id} onClick={()=>setExp(exp===l.id?null:l.id)} style={{ borderBottom:`1px solid ${S.border}`, cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px" }}>
                <span style={{ ...m(8), color:cc, background:`${cc}14`, border:`1px solid ${cc}28`, padding:"2px 7px", flexShrink:0 }}>{c.toUpperCase()}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ ...m(9), color:S.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.message}</div>
                  {l.detail && <div style={{ ...m(7), color:S.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.detail}</div>}
                </div>
                <div style={{ ...m(7), color:S.muted, flexShrink:0 }}>{fmtAge(l.ts)}</div>
              </div>
              {exp===l.id && (
                <div style={{ padding:"8px 14px 12px", borderTop:`1px solid ${S.border}`, background:S.bg2 }}>
                  <div style={{ ...m(7), color:S.muted, marginBottom:6 }}>{fmtTime(l.ts)}</div>
                  {l.meta && Object.entries(l.meta).map(([k,v]:any)=>(
                    <div key={k} style={{ display:"flex", gap:10, marginBottom:3 }}>
                      <span style={{ ...m(7), color:S.muted, minWidth:120 }}>{k}</span>
                      <span style={{ ...m(8), color:S.text }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Webhooks sub-tab ──────────────────────────────────────────────────
function OpsWebhooksTab({ adminKey }:any) {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [registering, setReg]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  const loadWh = useCallback(async()=>{
    setLoading(true);
    const r = await fetch("/api/webhooks/register",{headers:{"x-admin-key":adminKey}}).then(r=>r.json()).catch(()=>({}));
    setWebhooks(r.webhooks??[]);
    setLoading(false);
  },[adminKey]);
  useEffect(()=>{ loadWh(); },[loadWh]);

  const register = async()=>{
    setReg(true); setResult(null);
    const r = await fetch("/api/webhooks/register",{method:"POST",headers:{"x-admin-key":adminKey}}).then(r=>r.json()).catch(e=>({error:e.message}));
    setResult(r);
    await loadWh();
    setReg(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:F, fontSize:22, letterSpacing:"0.04em" }}>SHOPIFY <span style={{ color:S.gold }}>WEBHOOKS</span></div>
          <div style={{ ...m(8), color:S.muted, marginTop:3 }}>Purchase events → instant SMS. Register once to activate.</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn onClick={loadWh} size="sm" color="ghost">↻ Refresh</Btn>
          <Btn onClick={register} disabled={registering}>{registering?"Registering…":"⚡ Register All"}</Btn>
        </div>
      </div>

      {result && (
        <div style={{ marginBottom:16, padding:"10px 14px", background:result.ok?S.greenDim:S.redDim, border:`1px solid ${result.ok?"rgba(34,197,94,.3)":S.redBorder}` }}>
          {result.ok
            ? <><div style={{ ...m(9), color:S.greenText }}>✓ {result.results?.filter((r:any)=>r.ok).length}/{result.results?.length} webhooks registered</div>
                <div style={{ ...m(8), color:S.muted, marginTop:4 }}>Add SHOPIFY_WEBHOOK_SECRET to Vercel env vars, then redeploy to enable signature verification.</div></>
            : <div style={{ ...m(9), color:"#e08080" }}>✗ {result.error??JSON.stringify(result)}</div>
          }
        </div>
      )}

      {loading && <LoadingBar/>}

      <div style={{ border:`1px solid ${S.border}`, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 80px", padding:"6px 14px", background:S.bg3, ...m(7), color:S.muted, borderBottom:`1px solid ${S.border}` }}>
          {["Topic","Endpoint","Status"].map(h=><div key={h}>{h}</div>)}
        </div>
        {webhooks.length===0 && !loading && <div style={{ ...m(9), color:S.muted, padding:"24px", textAlign:"center" }}>No webhooks registered yet</div>}
        {webhooks.map((wh:any)=>(
          <div key={wh.id} style={{ display:"grid", gridTemplateColumns:"200px 1fr 80px", padding:"10px 14px", borderTop:`1px solid ${S.border}`, alignItems:"center" }}>
            <div style={{ ...m(9), color:S.gold }}>{wh.topic}</div>
            <div style={{ ...m(8), color:S.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{wh.address}</div>
            <div style={{ ...m(8), color:S.greenText }}>● live</div>
          </div>
        ))}
      </div>

      <SideCard title="SMS triggers when…">
        {[["orders/create","New purchase — order #, total, items, customer, city"],["orders/cancelled","Order cancelled — with reason"],["refunds/create","Refund issued — with amount"]].map(([t,d])=>(
          <div key={t} style={{ display:"flex", gap:12, marginBottom:6 }}>
            <span style={{ ...m(8), color:S.gold, flexShrink:0, minWidth:140 }}>{t}</span>
            <span style={{ ...m(8), color:S.muted }}>{d}</span>
          </div>
        ))}
      </SideCard>
    </div>
  );
}

// ── Crons sub-tab ──────────────────────────────────────────────────
function OpsCronsTab({ adminKey, onRefresh }:any) {
  const CRONS = [
    { job:"product-sync",   schedule:"Every hour",     path:"/api/ops/sync-products",      desc:"Revalidates Next.js ISR cache from Shopify/Printify" },
    { job:"health-check",   schedule:"Every 15 min",   path:"/api/ops/health?alert=1",     desc:"Checks all APIs — SMS after 3 consecutive failures" },
    { job:"daily-backup",   schedule:"Daily 6am UTC",  path:"/api/ops/backup",             desc:"Snapshots Redis data to GitHub backups/ folder" },
  ];
  const [running, setRunning] = useState<string|null>(null);
  const [results, setResults] = useState<Record<string,any>>({});

  const run = async(cron: typeof CRONS[0])=>{
    setRunning(cron.job);
    try {
      const r = await fetch(cron.path,{headers:{"x-admin-key":adminKey}});
      const d = await r.json().catch(()=>({}));
      setResults(prev=>({...prev,[cron.job]:{ok:r.ok,data:d}}));
      onRefresh?.();
    } catch(e:any) {
      setResults(prev=>({...prev,[cron.job]:{ok:false,data:{error:e.message}}}));
    }
    setRunning(null);
  };

  return (
    <div>
      <div style={{ fontFamily:F, fontSize:22, letterSpacing:"0.04em", marginBottom:16 }}>SCHEDULED <span style={{ color:S.gold }}>JOBS</span></div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {CRONS.map(c=>(
          <div key={c.job} style={{ background:S.card, border:`1px solid ${S.border}`, padding:"16px 18px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4 }}>
                <span style={{ ...m(10), color:S.gold }}>{c.job}</span>
                <span style={{ ...m(8), color:S.muted, background:S.bg3, border:`1px solid ${S.border}`, padding:"2px 8px" }}>{c.schedule}</span>
              </div>
              <div style={{ ...m(8), color:S.muted }}>{c.desc}</div>
              <div style={{ ...m(7), color:S.dim, marginTop:3, fontFamily:"monospace" }}>{c.path}</div>
              {results[c.job] && (
                <div style={{ ...m(8), color:results[c.job].ok?S.greenText:"#e08080", marginTop:6 }}>
                  {results[c.job].ok?"✓ Ran successfully":results[c.job].data?.error??"Failed"}
                </div>
              )}
            </div>
            <Btn onClick={()=>run(c)} disabled={running===c.job} size="sm">{running===c.job?"Running…":"▶ Run Now"}</Btn>
          </div>
        ))}
      </div>
      <div style={{ marginTop:20, ...m(8), color:S.muted }}>All crons are defined in vercel.json and run automatically on Vercel Pro.</div>
    </div>
  );
}

// ── Backup sub-tab ──────────────────────────────────────────────────
function OpsBackupTab({ adminKey, logs }:any) {
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState<any>(null);

  const backupLogs = logs.filter((l:any)=>l.job==="daily-backup").slice(0,10);
  const lastBackup = backupLogs[0];

  const runBackup = async()=>{
    setRunning(true); setResult(null);
    const r = await fetch("/api/ops/backup",{headers:{"x-admin-key":adminKey}});
    const d = await r.json().catch(()=>({}));
    setResult({ok:r.ok,...d});
    setRunning(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:F, fontSize:22, letterSpacing:"0.04em" }}>DATA <span style={{ color:S.gold }}>BACKUPS</span></div>
          <div style={{ ...m(8), color:S.muted, marginTop:3 }}>Daily Redis snapshot → GitHub backups/ folder · 6am UTC</div>
        </div>
        <Btn onClick={runBackup} disabled={running}>{running?"Running…":"⬇ Run Backup Now"}</Btn>
      </div>

      {result && (
        <div style={{ marginBottom:16, padding:"10px 14px", background:result.ok?S.greenDim:S.redDim, border:`1px solid ${result.ok?"rgba(34,197,94,.3)":S.redBorder}` }}>
          <div style={{ ...m(9), color:result.ok?S.greenText:"#e08080" }}>
            {result.ok?`✓ Backup committed · ${result.commitSha??""}`:result.error??"Backup failed"}
          </div>
        </div>
      )}

      <SideCard title="Recent Backup Runs" style={{ marginBottom:16 }}>
        {backupLogs.length===0 && <div style={{ ...m(9), color:S.muted, padding:"16px 0", textAlign:"center" }}>No backup runs recorded yet</div>}
        {backupLogs.map((l:any)=>(
          <div key={l.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${S.border}` }}>
            <div style={{ ...m(9), color:l.level==="ok"?S.greenText:"#e08080" }}>{l.level==="ok"?"✓":"✗"} {l.message}</div>
            <div style={{ ...m(7), color:S.muted }}>{fmtTime(l.ts)}</div>
          </div>
        ))}
      </SideCard>

      <div style={{ ...m(8), color:S.muted }}>
        Backup files are committed to{" "}
        <a href="https://github.com/dejcav-cmd/downrangeco-shop/tree/main/backups" target="_blank" style={{ color:S.gold, textDecoration:"none" }}>
          github.com/dejcav-cmd/downrangeco-shop/backups
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STOREFRONT TAB (hero slides)
// ══════════════════════════════════════════════════════════════════════
function StorefrontTab({adminKey,showToast}:{adminKey:string;showToast:(m:string,t?:"ok"|"err")=>void}){
  const [slides,    setSlides]    = useState<any[]>([]);
  const [editing,   setEditing]   = useState<any|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState<"slides"|"upload">("slides");
  const [images,    setImages]    = useState<{path:string;filename:string;size:string}[]>([]);
  const [kvReady,   setKvReady]   = useState<boolean|null>(null);
  const [publishing,setPublishing]= useState(false);

  const BLANK:any = { id:`slide-new-${Date.now()}`, image:"/hero.jpg", eyebrow:"", title_line1:"", title_line2:"", title_line3:"", title_line4:"", accent_word:"", subtitle:"", cta_primary:"Shop Now", cta_primary_url:"/products", cta_secondary:"Learn More", overlay_opacity:85, active:true, position:0 };

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [hr,ir] = await Promise.all([
        fetch("/api/hero",{headers:{"x-admin-key":adminKey},cache:"no-store"}).then(r=>r.json()),
        fetch("/api/admin/images",{headers:{"x-admin-key":adminKey},cache:"no-store"}).then(r=>r.json()).catch(()=>({images:[]})),
      ]);
      setSlides(hr.slides??[]);
      setKvReady(hr.kvReady??false);
      setImages(ir.images??[]);
    } catch {} finally { setLoading(false); }
  },[adminKey]);
  useEffect(()=>{ load(); },[load]);

  const api = async(body:any)=>{
    const r = await fetch("/api/hero",{method:"POST",headers:{"x-admin-key":adminKey,"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d = await r.json(); if(d.error) throw new Error(d.error); return d;
  };

  const publishAll = async()=>{
    setPublishing(true);
    try {
      const d = await api({action:"save_all",slides});
      setKvReady(d.kvReady);
      showToast(d.saved?`All ${slides.length} slides saved ✓`:"Warning: Redis not configured — changes won't persist", d.saved?"ok":"err");
    } catch(e:any){showToast(e.message,"err");} finally{setPublishing(false);}
  };

  const saveSlide = async()=>{
    if(!editing) return; setSaving(true);
    try { const d=await api({action:"upsert",slide:editing}); setSlides(d.slides); setEditing(null); showToast("Slide saved ✓"); }
    catch(e:any){showToast(e.message,"err");} finally{setSaving(false);}
  };

  if(editing) return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontFamily:F,fontSize:28,letterSpacing:"0.04em"}}>{editing.id.startsWith("slide-new")?"NEW SLIDE":`EDIT · ${editing.title_line1||"untitled"}`}</div>
        <div style={{display:"flex",gap:8}}>
          <BackBtn onClick={()=>setEditing(null)}/>
          <Btn onClick={saveSlide} disabled={saving}>{saving?"Saving…":"Publish Slide"}</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <SideCard title="Hero Image">
            {editing.image&&<div style={{width:"100%",height:120,backgroundImage:`url('${editing.image}')`,backgroundSize:"cover",backgroundPosition:"center",marginBottom:10,border:`1px solid ${S.border}`,position:"relative"}}><div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.6)",padding:"4px 8px",...m(7),color:"#fff"}}>{editing.image}</div></div>}
            <FieldLbl>Select image</FieldLbl>
            <select value={editing.image} onChange={e=>setEditing((s:any)=>({...s,image:e.target.value}))} style={{...iStyle(),cursor:"pointer"}}>
              {images.length===0&&<option value="/hero.jpg">/hero.jpg</option>}
              {images.map((img:any)=><option key={img.path} value={img.path}>{img.filename} — {img.size}</option>)}
            </select>
          </SideCard>
          <SideCard title="Eyebrow"><input value={editing.eyebrow} onChange={e=>setEditing((s:any)=>({...s,eyebrow:e.target.value}))} style={iStyle()} placeholder="Built for the Field — Summer 2026"/></SideCard>
          <SideCard title="Headline (up to 4 lines)">
            {(["title_line1","title_line2","title_line3","title_line4"] as const).map((k,i)=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{...m(8),color:S.muted,width:16}}>L{i+1}</span>
                <input value={editing[k]||""} onChange={e=>setEditing((s:any)=>({...s,[k]:e.target.value}))} style={{...iStyle({flex:1,fontFamily:F,fontSize:16,letterSpacing:"0.06em"})}}/>
              </div>
            ))}
            <FieldLbl>Accent word (gold)</FieldLbl>
            <input value={editing.accent_word||""} onChange={e=>setEditing((s:any)=>({...s,accent_word:e.target.value}))} style={iStyle()}/>
          </SideCard>
          <SideCard title="Subtitle"><textarea value={editing.subtitle} onChange={e=>setEditing((s:any)=>({...s,subtitle:e.target.value}))} rows={3} style={{...iStyle(),resize:"vertical"}}/></SideCard>
          <SideCard title="CTAs">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><FieldLbl>Primary label</FieldLbl><input value={editing.cta_primary} onChange={e=>setEditing((s:any)=>({...s,cta_primary:e.target.value}))} style={iStyle()}/></div>
              <div><FieldLbl>Primary URL</FieldLbl><input value={editing.cta_primary_url||"/products"} onChange={e=>setEditing((s:any)=>({...s,cta_primary_url:e.target.value}))} style={iStyle()}/></div>
            </div>
            <div style={{marginTop:8}}><FieldLbl>Secondary label</FieldLbl><input value={editing.cta_secondary} onChange={e=>setEditing((s:any)=>({...s,cta_secondary:e.target.value}))} style={iStyle()}/></div>
          </SideCard>
          <SideCard title="Overlay Opacity">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min={30} max={99} value={editing.overlay_opacity} onChange={e=>setEditing((s:any)=>({...s,overlay_opacity:parseInt(e.target.value)}))} style={{flex:1,accentColor:S.gold}}/>
              <span style={{...m(11),color:S.gold,width:40,textAlign:"right"}}>{editing.overlay_opacity}%</span>
            </div>
          </SideCard>
        </div>
        {/* Live preview */}
        <div style={{position:"sticky",top:20,height:"fit-content"}}>
          <div style={{...m(8),color:S.gold,marginBottom:8}}>Live Preview</div>
          <div style={{position:"relative",height:280,overflow:"hidden",background:"#1a1a1a",backgroundImage:`url('${editing.image}')`,backgroundSize:"cover",backgroundPosition:"center"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(to right,rgba(9,9,11,${(editing.overlay_opacity||85)/100}) 0%,rgba(9,9,11,${(editing.overlay_opacity||85)/100*0.4}) 100%)`}}/>
            <div style={{position:"relative",zIndex:1,padding:"20px 24px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontFamily:"var(--font-mono,monospace)",fontSize:9,letterSpacing:"0.2em",color:"#C8922A",marginBottom:8,textTransform:"uppercase"}}>{editing.eyebrow||"Eyebrow"}</div>
              <div style={{fontFamily:F,fontSize:28,lineHeight:0.9,color:"#F0EDE8",marginBottom:10}}>
                {[editing.title_line1,editing.title_line2,editing.title_line3,editing.title_line4].filter(Boolean).map((l:string,i:number)=>(
                  <div key={i} style={{color:l===editing.accent_word?"#C8922A":"#F0EDE8"}}>{l}</div>
                ))}
              </div>
              <p style={{fontSize:11,color:"rgba(240,237,232,0.75)",margin:"0 0 14px",lineHeight:1.5}}>{(editing.subtitle||"Subtitle…").slice(0,80)}</p>
              <div style={{display:"flex",gap:8}}>
                <div style={{background:"#C8922A",color:"#09090B",fontSize:9,fontFamily:"monospace",padding:"6px 14px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{editing.cta_primary||"Shop Now"}</div>
                <div style={{border:"1px solid rgba(255,255,255,0.3)",color:"#F0EDE8",fontSize:9,fontFamily:"monospace",padding:"5px 14px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{editing.cta_secondary||"Learn More"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:F,fontSize:34,letterSpacing:"0.04em"}}>HERO <span style={{color:S.gold}}>SLIDESHOW</span></div>
          <div style={{...m(8),color:S.muted,marginTop:3}}>{slides.length} slides · 10s rotation · hover pauses</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={publishAll} disabled={publishing}>{publishing?"Saving…":"💾 Publish All"}</Btn>
          <Btn onClick={()=>setEditing({...BLANK,id:`slide-new-${Date.now()}`})} color="ghost">+ Add Slide</Btn>
          <Btn onClick={async()=>{if(!confirm("Reset to defaults?"))return;const d=await api({action:"reset"}).catch(()=>null);if(d?.slides){setSlides(d.slides);showToast("Reset ✓");}}} color="red" size="sm">Reset</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${S.border}`,marginBottom:20}}>
        {(["slides","upload"] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{...m(9),padding:"9px 18px",background:"transparent",borderBottom:`2px solid ${activeTab===t?S.gold:"transparent"}`,border:"none",color:activeTab===t?S.gold:S.muted,cursor:"pointer",textTransform:"uppercase"}}>
            {t==="slides"?"🖼 Slides":"⬆ Upload Image"}
          </button>
        ))}
      </div>

      {activeTab==="slides" && (
        <div>
          {kvReady===false&&<div style={{marginBottom:14,background:S.redDim,border:`1px solid ${S.redBorder}`,padding:"10px 14px",...m(8),color:"#e08080"}}>⚠ Redis not configured — slides will reset on redeploy. Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to Vercel env vars.</div>}
          {kvReady===true&&<div style={{...m(8),color:S.greenText,marginBottom:10}}>● Redis connected — slides persist</div>}
          {loading&&<LoadingBar/>}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {slides.map((slide:any,i:number)=>(
              <div key={slide.id} style={{background:S.card,border:`1px solid ${slide.active?S.border:"rgba(255,255,255,0.02)"}`,display:"grid",gridTemplateColumns:"50px 80px 1fr auto",alignItems:"stretch",opacity:slide.active?1:0.5}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"0 8px",borderRight:`1px solid ${S.border}`}}>
                  <button onClick={async()=>{if(i===0)return;const o=slides.map((s:any)=>s.id);[o[i-1],o[i]]=[o[i],o[i-1]];const d=await api({action:"reorder",order:o}).catch(()=>null);if(d?.slides)setSlides(d.slides);}} style={{background:"transparent",border:"none",color:i===0?S.dim:S.muted,cursor:i===0?"default":"pointer",fontSize:12,padding:"2px 6px"}}>▲</button>
                  <span style={{fontFamily:F,fontSize:18,color:S.gold}}>{i+1}</span>
                  <button onClick={async()=>{if(i===slides.length-1)return;const o=slides.map((s:any)=>s.id);[o[i],o[i+1]]=[o[i+1],o[i]];const d=await api({action:"reorder",order:o}).catch(()=>null);if(d?.slides)setSlides(d.slides);}} style={{background:"transparent",border:"none",color:i===slides.length-1?S.dim:S.muted,cursor:i===slides.length-1?"default":"pointer",fontSize:12,padding:"2px 6px"}}>▼</button>
                </div>
                <div style={{backgroundImage:`url('${slide.image}')`,backgroundSize:"cover",backgroundPosition:"center",borderRight:`1px solid ${S.border}`,minHeight:80}}/>
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontFamily:F,fontSize:16,color:S.text,lineHeight:1,marginBottom:4}}>{[slide.title_line1,slide.title_line2,slide.title_line3,slide.title_line4].filter(Boolean).join(" ")}</div>
                  <div style={{...m(8),color:S.gold,marginBottom:4}}>{slide.eyebrow}</div>
                  <div style={{fontSize:11,color:S.muted}}>{slide.subtitle?.slice(0,80)}…</div>
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <span style={{...m(7),padding:"2px 7px",background:S.goldDim,border:`1px solid ${S.goldBorder}`,color:S.gold}}>{slide.cta_primary}</span>
                    <span style={{...m(7),padding:"2px 7px",background:S.bg3,border:`1px solid ${S.border}`,color:S.muted}}>{slide.image}</span>
                    <span style={{...m(7),padding:"2px 7px",background:S.bg3,border:`1px solid ${S.border}`,color:S.muted}}>opacity {slide.overlay_opacity}%</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",borderLeft:`1px solid ${S.border}`}}>
                  <button onClick={()=>setEditing({...slide})} style={{flex:1,background:"transparent",border:"none",color:S.gold,cursor:"pointer",...m(8),padding:"0 14px",borderBottom:`1px solid ${S.border}`}}>✎ Edit</button>
                  <button onClick={async()=>{const d=await api({action:"toggle",id:slide.id}).catch(()=>null);if(d?.slides)setSlides(d.slides);}} style={{flex:1,background:"transparent",border:"none",color:slide.active?"#6adb8a":"#e08080",cursor:"pointer",...m(8),padding:"0 14px",borderBottom:`1px solid ${S.border}`}}>{slide.active?"● On":"○ Off"}</button>
                  <button onClick={async()=>{if(!confirm("Delete?"))return;const d=await api({action:"delete",id:slide.id}).catch(()=>null);if(d?.slides)setSlides(d.slides);}} style={{flex:1,background:"transparent",border:"none",color:"#e08080",cursor:"pointer",...m(8),padding:"0 14px"}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab==="upload" && <HeroUploadTab adminKey={adminKey} showToast={showToast} setImages={setImages}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════
function ProductsTab({apiFetch,apiPost,showToast}:any){
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [editing,  setEditing]  = useState<any>(null);

  const load = useCallback(async()=>{
    setLoading(true);
    try { const d=await apiFetch({action:"list_products",limit:"250"}); setProducts(d.products??[]); }
    catch {} finally { setLoading(false); }
  },[apiFetch]);
  useEffect(()=>{ load(); },[load]);

  if(editing) return <ProductEditor product={editing} apiPost={apiPost} showToast={showToast} onBack={()=>{setEditing(null);load();}}/>;

  const filtered = products.filter((p:any)=>!search||p.title?.toLowerCase().includes(search.toLowerCase())||p.product_type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:F,fontSize:34,letterSpacing:"0.04em"}}>PRODUCTS <span style={{color:S.gold}}>{products.length>0?`(${products.length})`:""}</span></div>
        <input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} style={{...iStyle(),width:240}}/>
      </div>
      {loading&&<LoadingBar/>}
      <div style={{border:`1px solid ${S.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"52px 1fr 100px 110px 70px 160px",padding:"6px 14px",background:S.bg3,...m(7),color:S.muted,borderBottom:`1px solid ${S.border}`}}>
          {["","Product","Type","Status","Qty",""].map((h,i)=><div key={i}>{h}</div>)}
        </div>
        {filtered.length===0&&!loading&&<div style={{...m(9),color:S.muted,padding:"40px",textAlign:"center"}}>No products found.</div>}
        {filtered.map((p:any)=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"52px 1fr 100px 110px 70px 160px",padding:"10px 14px",borderTop:`1px solid ${S.border}`,background:S.card,alignItems:"center",transition:"background 0.1s"}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=S.bg3}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
            <div style={{width:38,height:38,background:S.bg3,overflow:"hidden"}}>
              {p.images?.[0]?.src&&<img src={p.images[0].src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
            </div>
            <div style={{paddingRight:8}}>
              <div style={{...m(9),color:S.text}}>{p.title}</div>
              <div style={{...m(7),color:S.muted,marginTop:2}}>{money(p.variants?.[0]?.price??0)}</div>
            </div>
            <div style={{...m(8),color:S.muted}}>{p.product_type||"—"}</div>
            <SmallBadge status={p.status}/>
            <div style={{...m(8),color:S.muted}}>{p.variants?.reduce((s:number,v:any)=>s+(v.inventory_quantity??0),0)}</div>
            <div style={{display:"flex",gap:6}}>
              <Btn onClick={()=>setEditing(p)} size="sm" color="ghost">Edit</Btn>
              {p.status==="draft"
                ? <Btn onClick={async()=>{try{await apiPost({action:"publish_product",id:p.id});showToast("Published ✓");load();}catch(e:any){showToast(e.message,"err");}}} size="sm">Publish</Btn>
                : <Btn onClick={async()=>{try{await apiPost({action:"unpublish_product",id:p.id});showToast("Set to draft");load();}catch(e:any){showToast(e.message,"err");}}} size="sm" color="ghost">Draft</Btn>
              }
              <Btn onClick={async()=>{if(!confirm(`Delete "${p.title}"?`))return;try{await apiPost({action:"delete_product",id:p.id});showToast("Deleted","err");load();}catch(e:any){showToast(e.message,"err");}}} size="sm" color="red">Del</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({product:init,apiPost,showToast,onBack}:any){
  const [p, setP] = useState({...init});
  const [saving, setSaving] = useState(false);
  const saveProduct = async()=>{
    setSaving(true);
    try { await apiPost({action:"update_product",id:p.id,data:{title:p.title,body_html:p.body_html,product_type:p.product_type,vendor:p.vendor,tags:p.tags,status:p.status}}); showToast("Saved ✓"); }
    catch(e:any){showToast(e.message,"err");} finally{setSaving(false);}
  };
  const saveVariant = async(v:any)=>{
    try { await apiPost({action:"update_variant",id:p.id,variantId:v.id,data:{price:v.price,compare_at_price:v.compare_at_price,sku:v.sku}}); showToast("Variant saved ✓"); }
    catch(e:any){showToast(e.message,"err");}
  };
  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
        <BackBtn onClick={onBack}/>
        <div style={{fontFamily:F,fontSize:28,letterSpacing:"0.04em",flex:1}}>{p.title}</div>
        <Btn onClick={saveProduct} disabled={saving}>{saving?"Saving…":"Save"}</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <SideCard title="Title"><input value={p.title||""} onChange={e=>setP((x:any)=>({...x,title:e.target.value}))} style={iStyle()}/></SideCard>
          <SideCard title="Description"><textarea value={p.body_html||""} onChange={e=>setP((x:any)=>({...x,body_html:e.target.value}))} rows={6} style={{...iStyle(),resize:"vertical"}}/></SideCard>
          <SideCard title="Variants">
            {(p.variants??[]).map((v:any,i:number)=><VariantEditRow key={v.id} v={v} setV={(nv:any)=>setP((x:any)=>({...x,variants:x.variants.map((vv:any,ii:number)=>ii===i?nv:vv)}))} onSave={()=>saveVariant(v)} onCancel={()=>{}} saving={false}/>)}
          </SideCard>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <SideCard title="Status">
            <select value={p.status||"active"} onChange={e=>setP((x:any)=>({...x,status:e.target.value}))} style={{...iStyle(),cursor:"pointer"}}>
              <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
          </SideCard>
          <SideCard title="Product Type"><input value={p.product_type||""} onChange={e=>setP((x:any)=>({...x,product_type:e.target.value}))} style={iStyle()}/></SideCard>
          <SideCard title="Tags"><input value={p.tags||""} onChange={e=>setP((x:any)=>({...x,tags:e.target.value}))} style={iStyle()} placeholder="tag1, tag2"/></SideCard>
          {p.images?.[0]?.src && <SideCard title="Image"><img src={p.images[0].src} alt="" style={{width:"100%",height:180,objectFit:"cover"}}/></SideCard>}
        </div>
      </div>
    </div>
  );
}

function VariantEditRow({v,setV,onSave,saving}:any){
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 100px 130px 80px 80px",gap:8,alignItems:"center",marginBottom:8,padding:"8px 0",borderBottom:`1px solid ${S.border}`}}>
      <div style={{...m(9),color:S.text}}>{v.title}</div>
      <div><input value={v.price||""} onChange={e=>setV({...v,price:e.target.value})} style={{...iStyle(),fontSize:11}} placeholder="Price"/></div>
      <div><input value={v.compare_at_price||""} onChange={e=>setV({...v,compare_at_price:e.target.value})} style={{...iStyle(),fontSize:11}} placeholder="Compare at"/></div>
      <div><input value={v.sku||""} onChange={e=>setV({...v,sku:e.target.value})} style={{...iStyle(),fontSize:11}} placeholder="SKU"/></div>
      <Btn onClick={onSave} disabled={saving} size="sm">Save</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════
function OrdersTab({apiFetch,apiPost,showToast}:any){
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState<any>(null);
  const [filter,  setFilter]  = useState("any");

  const load = useCallback(async()=>{
    setLoading(true);
    try { const d=await apiFetch({action:"list_orders",limit:"50",status:filter}); setOrders(d.orders??[]); }
    catch {} finally { setLoading(false); }
  },[apiFetch,filter]);
  useEffect(()=>{ load(); },[load]);

  if(detail) return <OrderDetail order={detail} onBack={()=>setDetail(null)}/>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:F,fontSize:34,letterSpacing:"0.04em"}}>ORDERS <span style={{color:S.gold}}>{orders.length>0?`(${orders.length})`:""}</span></div>
        <div style={{display:"flex",gap:8}}>
          {["any","open","closed","cancelled"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{...m(8),padding:"5px 12px",background:filter===f?S.goldDim:"transparent",border:`1px solid ${filter===f?S.goldBorder:S.border}`,color:filter===f?S.gold:S.muted,cursor:"pointer"}}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading&&<LoadingBar/>}
      <div style={{border:`1px solid ${S.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"80px 1fr 120px 100px 100px 80px",padding:"6px 14px",background:S.bg3,...m(7),color:S.muted,borderBottom:`1px solid ${S.border}`}}>
          {["Order","Customer","Date","Total","Status",""].map((h,i)=><div key={i}>{h}</div>)}
        </div>
        {orders.length===0&&!loading&&<div style={{...m(9),color:S.muted,padding:"40px",textAlign:"center"}}>No orders found.</div>}
        {orders.map((o:any)=>(
          <div key={o.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 120px 100px 100px 80px",padding:"10px 14px",borderTop:`1px solid ${S.border}`,background:S.card,alignItems:"center",cursor:"pointer",transition:"background 0.1s"}}
            onClick={()=>setDetail(o)}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=S.bg3}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
            <div style={{...m(10),color:S.gold}}>#{o.order_number}</div>
            <div>
              <div style={{...m(9),color:S.text}}>{o.customer?.first_name} {o.customer?.last_name}</div>
              <div style={{...m(7),color:S.muted}}>{o.customer?.email}</div>
            </div>
            <div style={{...m(8),color:S.muted}}>{new Date(o.created_at).toLocaleDateString()}</div>
            <div style={{...m(10),color:S.greenText}}>{money(o.total_price)}</div>
            <SmallBadge status={o.financial_status??o.fulfillment_status??"pending"}/>
            <div style={{...m(8),color:S.gold}}>View →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderDetail({order:o,onBack}:any){
  const date = new Date(o.created_at).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
        <BackBtn onClick={onBack}/>
        <div style={{fontFamily:F,fontSize:28,letterSpacing:"0.04em",flex:1}}>ORDER #{o.order_number}</div>
        <SmallBadge status={o.financial_status}/>
        <SmallBadge status={o.fulfillment_status??"unfulfilled"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <SideCard title="Line Items">
            {(o.line_items??[]).map((li:any)=>(
              <div key={li.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${S.border}`}}>
                <div><div style={{...m(9),color:S.text}}>{li.name}</div><div style={{...m(7),color:S.muted}}>Qty: {li.quantity}</div></div>
                <div style={{...m(9),color:S.gold}}>{money(li.price)}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:10}}>
              <div style={{...m(10),color:S.text}}>Total</div>
              <div style={{...m(11),color:S.greenText}}>{money(o.total_price)}</div>
            </div>
          </SideCard>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <SideCard title="Customer">
            <div style={{...m(9),color:S.text}}>{o.customer?.first_name} {o.customer?.last_name}</div>
            <div style={{...m(8),color:S.muted,marginTop:4}}>{o.customer?.email}</div>
            <div style={{...m(8),color:S.muted,marginTop:2}}>{o.customer?.phone}</div>
          </SideCard>
          <SideCard title="Shipping">
            {o.shipping_address&&<>
              <div style={{...m(9),color:S.text}}>{o.shipping_address.name}</div>
              <div style={{...m(8),color:S.muted,marginTop:4}}>{o.shipping_address.address1}</div>
              <div style={{...m(8),color:S.muted}}>{o.shipping_address.city}, {o.shipping_address.province_code} {o.shipping_address.zip}</div>
            </>}
          </SideCard>
          <SideCard title="Order Info">
            <div style={{...m(8),color:S.muted}}>Date: <span style={{color:S.text}}>{date}</span></div>
            <div style={{...m(8),color:S.muted,marginTop:4}}>Payment: <span style={{color:S.text}}>{o.payment_gateway}</span></div>
          </SideCard>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ══════════════════════════════════════════════════════════════════════
function CollectionsTab({apiFetch}:any){
  const [cols, setCols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    apiFetch({action:"list_collections"}).then((d:any)=>setCols(d.collections??[])).catch(()=>{}).finally(()=>setLoading(false));
  },[apiFetch]);
  return (
    <div>
      <div style={{fontFamily:F,fontSize:34,letterSpacing:"0.04em",marginBottom:20}}>COLLECTIONS <span style={{color:S.gold}}>{cols.length>0?`(${cols.length})`:""}</span></div>
      {loading&&<LoadingBar/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {cols.map((c:any)=>(
          <Card key={c.id}>
            <div style={{fontFamily:F,fontSize:18,color:S.gold,letterSpacing:"0.04em",marginBottom:4}}>{c.title}</div>
            <div style={{...m(8),color:S.muted}}>{c.products_count??0} products</div>
            {c.body_html&&<div style={{fontSize:12,color:S.muted,marginTop:6}} dangerouslySetInnerHTML={{__html:c.body_html.slice(0,80)+"…"}}/>}
          </Card>
        ))}
        {cols.length===0&&!loading&&<div style={{...m(9),color:S.muted,padding:"40px 0",textAlign:"center",gridColumn:"1/-1"}}>No collections found.</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STORE INFO
// ══════════════════════════════════════════════════════════════════════
function StoreInfoTab({apiFetch}:any){
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ apiFetch({action:"shop_info"}).then(setInfo).catch(()=>{}).finally(()=>setLoading(false)); },[apiFetch]);
  if(loading) return <LoadingBar/>;
  const s = info?.shop;
  return (
    <div>
      <div style={{fontFamily:F,fontSize:34,letterSpacing:"0.04em",marginBottom:20}}>STORE <span style={{color:S.gold}}>INFO</span></div>
      {s&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["Store Name",s.name],["Email",s.email],["Domain",s.domain],["Plan",s.plan_name],["Currency",s.currency],["Timezone",s.timezone],["Country",s.country_name],["Phone",s.phone]].map(([l,v])=>(
            <SideCard key={l} title={l}><div style={{...m(11),color:S.text}}>{v||"—"}</div></SideCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// HERO UPLOAD
// ══════════════════════════════════════════════════════════════════════
function HeroUploadTab({adminKey,showToast,setImages}:{adminKey:string;showToast:(m:string,t?:"ok"|"err")=>void;setImages:(imgs:any[])=>void}){
  const [file,      setFile]     = useState<File|null>(null);
  const [filename,  setFilename] = useState("hero-2.jpg");
  const [uploading, setUploading]= useState(false);
  const [preview,   setPreview]  = useState<string|null>(null);
  const [uploaded,  setUploaded] = useState<string|null>(null);
  const [uploadErr, setUploadErr]= useState<string|null>(null);
  const MAX_MB = 4;

  const onFile = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setUploadErr(null);
    const name=f.name.replace(/[^a-zA-Z0-9._-]/g,"-").toLowerCase();
    setFilename(name.startsWith("hero")?name:`hero-${name}`);
  };
  const upload = async()=>{
    if(!file) return; setUploadErr(null);
    if(file.size>MAX_MB*1024*1024){setUploadErr(`Image is ${(file.size/1024/1024).toFixed(1)}MB — over ${MAX_MB}MB limit. Compress at squoosh.app.`);return;}
    setUploading(true); setUploaded(null);
    try {
      const fd=new FormData(); fd.append("file",file); fd.append("filename",filename);
      const r=await fetch("/api/upload/hero",{method:"POST",headers:{"x-admin-key":adminKey},body:fd});
      let d:any={};
      try{d=await r.json();}catch{if(r.status===413){throw new Error("Image too large (413). Compress at squoosh.app.");} throw new Error(`HTTP ${r.status}`);}
      if(!r.ok) throw new Error(d.error??`HTTP ${r.status}`);
      setUploaded(d.path??`/${filename}`); setFile(null); setPreview(null);
      showToast(`✓ Uploaded as ${d.path}`);
      fetch("/api/admin/images",{headers:{"x-admin-key":adminKey}}).then(r=>r.json()).then(d=>{if(d.images)setImages(d.images);}).catch(()=>{});
    }catch(e:any){setUploadErr(e.message); showToast(e.message,"err");}
    finally{setUploading(false);}
  };

  return (
    <div style={{maxWidth:520}}>
      <div style={{...m(8),color:S.muted,marginBottom:16}}>Upload a new hero background. It commits to GitHub and is available in ~60s after Vercel redeploys.</div>
      <SideCard title="Select Image" style={{marginBottom:12}}>
        <input type="file" accept="image/*" onChange={onFile} style={{color:S.text,marginBottom:10,display:"block"}}/>
        {file&&<div style={{...m(8),color:file.size>MAX_MB*1024*1024?"#e08080":S.greenText,marginBottom:8}}>{(file.size/1024/1024).toFixed(2)}MB {file.size>MAX_MB*1024*1024?"— TOO LARGE":"— OK"}</div>}
        {preview&&<img src={preview} alt="preview" style={{width:"100%",height:160,objectFit:"cover"}}/>}
      </SideCard>
      {file&&<SideCard title="Save As" style={{marginBottom:12}}>
        <input value={filename} onChange={e=>setFilename(e.target.value)} style={iStyle()} placeholder="hero-2.jpg"/>
        <div style={{...m(7),color:S.muted,marginTop:6}}>Will be available at <span style={{color:S.gold}}>/{filename}</span></div>
      </SideCard>}
      {uploadErr&&<div style={{marginBottom:12,background:S.redDim,border:`1px solid ${S.redBorder}`,padding:"10px 14px"}}>
        <div style={{...m(9),color:"#e08080",marginBottom:4}}>✗ Upload failed</div>
        <div style={{fontSize:12,color:"#e08080",lineHeight:1.6}}>{uploadErr}</div>
        <div style={{...m(8),color:S.muted,marginTop:8}}>Compress at: <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" style={{color:S.gold}}>squoosh.app</a> · <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" style={{color:S.gold}}>tinypng.com</a></div>
      </div>}
      {uploaded&&<div style={{marginBottom:12,background:S.greenDim,border:"1px solid rgba(34,197,94,0.3)",padding:"10px 14px"}}>
        <div style={{...m(9),color:S.greenText,marginBottom:4}}>✓ Uploaded: <span style={{color:S.gold}}>{uploaded}</span></div>
        <div style={{...m(8),color:S.muted}}>Use this path in the slide Image field. Vercel redeploying (~60s).</div>
      </div>}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Btn onClick={upload} disabled={!file||uploading}>{uploading?"Uploading…":"⬆ Upload"}</Btn>
        {uploading&&<div style={{...m(9),color:S.muted}}>Committing to GitHub…</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════
function Login({keyVal,setKey,login}:any){
  return (
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:320,padding:32,border:`1px solid ${S.border}`,background:S.card}}>
        <img src="/logo.png" alt="DR" style={{height:40,width:"auto",marginBottom:24,display:"block"}}/>
        <div style={{fontFamily:F,fontSize:28,letterSpacing:"0.04em",color:S.gold,marginBottom:20}}>ADMIN ACCESS</div>
        <input type="password" value={keyVal} onChange={e=>setKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Admin key" style={{...iStyle(),marginBottom:12}}/>
        <Btn onClick={login}>Enter →</Btn>
      </div>
    </div>
  );
}



