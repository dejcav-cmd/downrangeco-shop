"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

const S = {
  bg:"#09090B", bg2:"#111113", bg3:"#1A1A1D", card:"#141416",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.1)", goldBorder:"rgba(200,146,42,0.3)",
  text:"#F0EDE8", muted:"#777", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.12)", green:"#2a6a3a", greenText:"#6adb8a",
  sidebar: "#0d0d0f",
};

const TABS = [
  { id:"dashboard",   icon:"⬡", label:"Dashboard"   },
  { id:"products",    icon:"◈", label:"Products"     },
  { id:"orders",      icon:"◎", label:"Orders"       },
  { id:"collections", icon:"⬡", label:"Collections" },
  { id:"storefront",  icon:"◉", label:"Storefront"  },
  { id:"store",       icon:"◈", label:"Store Info"  },
] as const;
type TabId = typeof TABS[number]["id"];

function mono(s=10){ return { fontFamily:"var(--font-mono)", fontSize:`${s}px`, letterSpacing:"0.11em", textTransform:"uppercase" as const }; }

export default function AdminPanel() {
  const [key, setKey]     = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab]     = useState<TabId>("dashboard");
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg:string, type:"ok"|"err"="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  };

  const apiFetch = useCallback(async(params:Record<string,string>)=>{
    const res = await fetch(`/api/admin?${new URLSearchParams(params)}`,{ headers:{"x-admin-key":key}, cache:"no-store" });
    const d = await res.json();
    if(d.error) throw new Error(d.error);
    return d;
  },[key]);

  const apiPost = useCallback(async(body:any)=>{
    const res = await fetch("/api/admin",{ method:"POST", headers:{"x-admin-key":key,"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const d = await res.json();
    if(d.error) throw new Error(d.error);
    return d;
  },[key]);

  const login=()=>{ if(!key.trim())return; setAuthed(true); localStorage.setItem("dr_admin_key",key); };
  useEffect(()=>{ const s=localStorage.getItem("dr_admin_key"); if(s){setKey(s);setAuthed(true);} },[]);

  if(!authed) return <Login keyVal={key} setKey={setKey} login={login}/>;

  const activeTab = TABS.find(t=>t.id===tab);

  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", fontFamily:"var(--font-sans)" }}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* ── Sidebar ── */}
      <div style={{ width: sidebarOpen ? 220 : 60, background:S.sidebar, borderRight:`1px solid ${S.border}`, display:"flex", flexDirection:"column", flexShrink:0, transition:"width 0.2s ease", overflow:"hidden" }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 20px 16px" : "20px 0 16px", display:"flex", alignItems:"center", justifyContent: sidebarOpen ? "space-between" : "center", borderBottom:`1px solid ${S.border}` }}>
          {sidebarOpen && (
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <img src="/logo.png" alt="Down Range Co." style={{ height:36, width:"auto", maxWidth:160, objectFit:"contain" }}/>
              <div style={{ ...mono(8), color:S.muted }}>Store Admin</div>
            </div>
          )}
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"transparent", border:`1px solid ${S.border}`, color:S.muted, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, transition:"all 0.15s" }}>
            {sidebarOpen ? "◁" : "▷"}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:"12px 0" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding: sidebarOpen ? "10px 20px" : "10px 0", justifyContent: sidebarOpen ? "flex-start" : "center", background: tab===t.id ? S.goldDim : "transparent", borderLeft: `2px solid ${tab===t.id ? S.gold : "transparent"}`, border:"none", cursor:"pointer", transition:"all 0.15s" }}>
              <span style={{ fontSize:16, opacity: tab===t.id ? 1 : 0.4, color: tab===t.id ? S.gold : S.text, flexShrink:0 }}>{t.icon}</span>
              {sidebarOpen && <span style={{ ...mono(10), color: tab===t.id ? S.gold : S.muted, whiteSpace:"nowrap" }}>{t.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom links */}
        {sidebarOpen && (
          <div style={{ padding:"16px 20px", borderTop:`1px solid ${S.border}` }}>
            <a href="/products" target="_blank" style={{ display:"block", ...mono(9), color:S.muted, textDecoration:"none", marginBottom:8 }}>↗ View Store</a>
            <a href="https://downrangeco.com" target="_blank" style={{ display:"block", ...mono(9), color:S.muted, textDecoration:"none", marginBottom:12 }}>↗ News Portal</a>
            <button onClick={()=>{setAuthed(false);localStorage.removeItem("dr_admin_key");}} style={{ ...mono(9), background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:"6px 10px", cursor:"pointer", width:"100%" }}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Top bar */}
        <div style={{ background:S.bg2, borderBottom:`1px solid ${S.border}`, padding:"0 28px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ ...mono(11), color:S.muted, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:S.gold }}>{activeTab?.icon}</span>
            {activeTab?.label}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:S.greenText }} title="Connected to Shopify"/>
            <span style={{ ...mono(9), color:S.muted }}>downrange-co.myshopify.com</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto", padding:"28px 28px 48px" }}>
          {tab==="dashboard"   && <DashboardTab   apiFetch={apiFetch} setTab={setTab}/>}
          {tab==="products"    && <ProductsTab    apiFetch={apiFetch} apiPost={apiPost} showToast={showToast}/>}
          {tab==="orders"      && <OrdersTab      apiFetch={apiFetch} apiPost={apiPost} showToast={showToast}/>}
          {tab==="collections" && <CollectionsTab apiFetch={apiFetch}/>}
          {tab==="storefront"  && <StorefrontTab  adminKey={key} showToast={showToast}/>}
          {tab==="store"       && <StoreInfoTab   apiFetch={apiFetch}/>}
        </div>
      </div>

      <style>{`button:focus{outline:none;} input:focus,textarea:focus,select:focus{outline:none;} *{box-sizing:border-box;} ::placeholder{color:#444;}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function DashboardTab({apiFetch,setTab}:any){
  const [stats,setStats]=useState<any>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      apiFetch({action:"products"}).catch(()=>({products:[],total:0})),
      apiFetch({action:"orders"}).catch(()=>({orders:[],total:0})),
    ]).then(([p,o])=>{
      const orders = o.orders??[];
      const revenue = orders.filter((x:any)=>x.financial_status==="paid").reduce((s:number,x:any)=>s+parseFloat(x.total_price||0),0);
      const pending = orders.filter((x:any)=>!x.fulfillment_status||x.fulfillment_status==="unfulfilled").length;
      setStats({ products:p.total||p.products?.length||0, orders:o.total||orders.length, revenue, pending, recentOrders:orders.slice(0,5) });
    }).finally(()=>setLoading(false));
  },[apiFetch]);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em", marginBottom:4 }}>
          STORE <span style={{color:S.gold}}>OVERVIEW</span>
        </div>
        <div style={{ ...mono(9), color:S.muted }}>Welcome back, DJ. Here's what's happening.</div>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        {[
          { label:"Total Products", value: loading?"—":stats?.products, icon:"◈", action:()=>setTab("products"), color:S.gold },
          { label:"Total Orders",   value: loading?"—":stats?.orders,   icon:"◎", action:()=>setTab("orders"),   color:"#9090e0" },
          { label:"Revenue (paid)", value: loading?"—":stats?.revenue!=null?`$${stats.revenue.toFixed(2)}`:"—", icon:"◉", action:()=>setTab("orders"), color:S.greenText },
          { label:"Awaiting Ship",  value: loading?"—":stats?.pending,  icon:"◌", action:()=>setTab("orders"),   color:"#e0a830" },
        ].map(k=>(
          <button key={k.label} onClick={k.action} style={{ background:S.card, border:`1px solid ${S.border}`, padding:"20px 18px", textAlign:"left", cursor:"pointer", transition:"border-color 0.15s, transform 0.1s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=k.color+"55";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.transform="none";}}>
            <div style={{ fontSize:20, marginBottom:8, opacity:0.6, color:k.color }}>{k.icon}</div>
            <div style={{ fontFamily:"var(--font-bebas)", fontSize:36, color:k.color, letterSpacing:"0.04em", lineHeight:1 }}>{k.value}</div>
            <div style={{ ...mono(9), color:S.muted, marginTop:4 }}>{k.label}</div>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length>0 && (
        <div>
          <div style={{ ...mono(10), color:S.gold, marginBottom:14 }}>Recent Orders</div>
          <div style={{ border:`1px solid ${S.border}` }}>
            {stats.recentOrders.map((o:any)=>(
              <div key={o.id} style={{ display:"grid", gridTemplateColumns:"90px 1fr 100px 100px 100px", padding:"11px 16px", borderBottom:`1px solid ${S.border}`, background:S.card, alignItems:"center" }}>
                <div style={{ ...mono(11), color:S.gold }}>{o.name}</div>
                <div style={{ fontSize:12, color:S.text }}>{o.email||"—"}</div>
                <div style={{ fontSize:12, color:S.muted }}>{new Date(o.created_at).toLocaleDateString()}</div>
                <SmallBadge status={o.financial_status}/>
                <div style={{ ...mono(12), color:S.gold, fontWeight:600 }}>${parseFloat(o.total_price||0).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setTab("orders")} style={{ ...mono(10), color:S.gold, background:"transparent", border:"none", cursor:"pointer", marginTop:10, padding:0 }}>
            View all orders →
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop:32 }}>
        <div style={{ ...mono(10), color:S.gold, marginBottom:14 }}>Quick Actions</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { label:"Edit Hero Banner", action:()=>setTab("storefront"), icon:"◉" },
            { label:"Manage Products",  action:()=>setTab("products"),   icon:"◈" },
            { label:"View Orders",      action:()=>setTab("orders"),     icon:"◎" },
            { label:"Shopify Admin",    href:"https://downrange-co.myshopify.com/admin", icon:"↗" },
            { label:"Printify",         href:"https://printify.com/app/dashboard", icon:"↗" },
          ].map(a=>(
            a.href
              ? <a key={a.label} href={a.href} target="_blank" style={{ display:"flex", alignItems:"center", gap:6, background:S.bg3, border:`1px solid ${S.border}`, color:S.muted, fontFamily:"var(--font-mono)",fontSize:"10px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"9px 14px",textDecoration:"none",transition:"all 0.15s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
                  <span>{a.icon}</span>{a.label}
                </a>
              : <button key={a.label} onClick={a.action} style={{ display:"flex", alignItems:"center", gap:6, background:S.bg3, border:`1px solid ${S.border}`, color:S.muted, fontFamily:"var(--font-mono)",fontSize:"10px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"9px 14px",cursor:"pointer",transition:"all 0.15s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
                  <span>{a.icon}</span>{a.label}
                </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STOREFRONT BUILDER
// ══════════════════════════════════════════════════════════════════════
function StorefrontTab({adminKey,showToast}:{adminKey:string;showToast:(m:string,t?:"ok"|"err")=>void}){
  const DEFAULT_HERO = {
    eyebrow:"Built for the Field — Summer 2026",
    title_line1:"GEAR FOR", title_line2:"HUNTERS,",
    title_line3:"SHOOTERS", title_line4:"& THE 2A.",
    subtitle:"Premium print-on-demand apparel for those who live it. No compromise. Washington-owned, American-printed.",
    cta_primary:"Shop All Products", cta_secondary:"Browse Categories",
    overlay_opacity:85, accent_word:"SHOOTERS",
  };
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(()=>{
    fetch("/api/hero",{cache:"no-store"}).then(r=>r.json()).then(d=>setHero({...DEFAULT_HERO,...d})).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const save = async()=>{
    setSaving(true);
    try {
      const res = await fetch("/api/hero",{ method:"POST", headers:{"x-admin-key":adminKey,"Content-Type":"application/json"}, body:JSON.stringify(hero) });
      const d = await res.json();
      if(d.error) throw new Error(d.error);
      showToast("Hero saved! Changes live on the homepage ✓");
    } catch(e:any){ showToast(e.message,"err"); }
    finally{ setSaving(false); }
  };

  const reset = async()=>{
    if(!confirm("Reset hero to defaults?")) return;
    await fetch("/api/hero",{ method:"DELETE", headers:{"x-admin-key":adminKey} });
    setHero(DEFAULT_HERO);
    showToast("Reset to defaults");
  };

  const set = (k:string)=>(e:any)=>setHero(h=>({...h,[k]:e.target.value}));
  const ovOpacity = hero.overlay_opacity??85;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em" }}>
            STOREFRONT <span style={{color:S.gold}}>BUILDER</span>
          </div>
          <div style={{ ...mono(9), color:S.muted }}>Edit homepage hero — changes go live immediately</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setPreview(p=>!p)} style={{ ...mono(10), background:preview?S.goldDim:"transparent", border:`1px solid ${preview?S.goldBorder:S.border}`, color:preview?S.gold:S.muted, padding:"8px 14px", cursor:"pointer" }}>
            {preview?"◉ Preview On":"◎ Preview Off"}
          </button>
          <button onClick={reset} style={{ ...mono(10), background:S.redDim, border:`1px solid rgba(184,64,64,0.3)`, color:"#e08080", padding:"8px 14px", cursor:"pointer" }}>Reset</button>
          <button onClick={save} disabled={saving} style={{ ...mono(11), background:S.gold, color:S.bg, padding:"8px 20px", border:"none", cursor:"pointer", fontWeight:700 }}>
            {saving?"Saving...":"Publish Changes"}
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: preview?"1fr 1fr":"1fr", gap:24 }}>

        {/* Form */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          <SideCard title="Eyebrow Text">
            <input value={hero.eyebrow} onChange={set("eyebrow")} style={iStyle} placeholder="Built for the Field — Summer 2026" />
            <div style={{ ...mono(8), color:S.muted, marginTop:4 }}>Small text above the main headline</div>
          </SideCard>

          <SideCard title="Headline (4 lines)">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(["title_line1","title_line2","title_line3","title_line4"] as const).map((k,i)=>(
                <div key={k} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ ...mono(9), color:S.muted, width:16, flexShrink:0 }}>L{i+1}</span>
                  <input value={(hero as any)[k]} onChange={set(k)} style={{ ...iStyle, flex:1, fontFamily:"var(--font-bebas)", fontSize:16, letterSpacing:"0.06em" }} />
                </div>
              ))}
            </div>
            <div style={{ ...mono(8), color:S.muted, marginTop:8 }}>
              Accent word (highlighted in gold):
              <input value={hero.accent_word} onChange={set("accent_word")} style={{ ...iStyle, marginTop:6, fontSize:13 }} placeholder="SHOOTERS" />
            </div>
          </SideCard>

          <SideCard title="Subtitle">
            <textarea value={hero.subtitle} onChange={set("subtitle")} rows={3} style={{ ...iStyle, resize:"vertical", lineHeight:1.5 }} />
          </SideCard>

          <SideCard title="CTA Buttons">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div>
                <div style={{ ...mono(8), color:S.muted, marginBottom:4 }}>Primary button (gold)</div>
                <input value={hero.cta_primary} onChange={set("cta_primary")} style={iStyle} placeholder="Shop All Products" />
              </div>
              <div>
                <div style={{ ...mono(8), color:S.muted, marginBottom:4 }}>Secondary button (ghost)</div>
                <input value={hero.cta_secondary} onChange={set("cta_secondary")} style={iStyle} placeholder="Browse Categories" />
              </div>
            </div>
          </SideCard>

          <SideCard title="Overlay Darkness">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <input type="range" min={20} max={100} value={ovOpacity} onChange={e=>setHero(h=>({...h,overlay_opacity:parseInt(e.target.value)}))}
                style={{ flex:1, accentColor:S.gold }} />
              <span style={{ ...mono(12), color:S.gold, fontWeight:600, minWidth:36 }}>{ovOpacity}%</span>
            </div>
            <div style={{ ...mono(8), color:S.muted, marginTop:4 }}>How dark the overlay on the hero image is (higher = darker)</div>
          </SideCard>

          <HeroImageUpload adminKey={adminKey} showToast={showToast}/>

        </div>

        {/* Live preview */}
        {preview && (
          <div>
            <div style={{ ...mono(9), color:S.gold, marginBottom:10 }}>◉ Live Preview</div>
            <div style={{ border:`1px solid ${S.border}`, overflow:"hidden", position:"sticky", top:20 }}>
              <HeroPreview hero={hero} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroPreview({hero}:any){
  const op = (hero.overlay_opacity??85)/100;
  const lines = [hero.title_line1,hero.title_line2,hero.title_line3,hero.title_line4].filter(Boolean);
  return (
    <div style={{ position:"relative", minHeight:280, background:"#1a1a1d", backgroundImage:"url('/hero.jpg')", backgroundSize:"cover", backgroundPosition:"center 30%", display:"flex", alignItems:"flex-end" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right, rgba(9,9,11,${op}) 0%, rgba(9,9,11,${op*0.6}) 60%, rgba(9,9,11,${op*0.2}) 100%)` }}/>
      <div style={{ position:"relative", zIndex:2, padding:"16px 20px 24px", maxWidth:"80%" }}>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.2em", textTransform:"uppercase", color:S.gold, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:16, height:1, background:S.gold, display:"inline-block" }}/>{hero.eyebrow}
        </div>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(22px,4vw,34px)", lineHeight:0.9, letterSpacing:"0.03em", color:S.text, marginBottom:10 }}>
          {lines.map((l:string,i:number)=>(
            <span key={i}>{l===hero.accent_word?<span style={{color:S.gold}}>{l}</span>:l}{i<lines.length-1&&<br/>}</span>
          ))}
        </div>
        <p style={{ fontSize:10, color:S.muted, lineHeight:1.5, marginBottom:12, maxWidth:280, fontWeight:300 }}>{hero.subtitle}</p>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ background:S.gold, color:S.bg, fontFamily:"var(--font-mono)", fontSize:8, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 10px" }}>{hero.cta_primary}</span>
          <span style={{ background:"transparent", color:S.text, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", border:`1px solid rgba(255,255,255,0.15)` }}>{hero.cta_secondary}</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════
function ProductsTab({apiFetch,apiPost,showToast}:any){
  const [products,setProducts]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [editing,setEditing]=useState<any|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{ const d=await apiFetch({action:"products"}); setProducts(d.products??[]); }
    catch(e:any){showToast(e.message,"err");}
    finally{setLoading(false);}
  },[apiFetch]);

  useEffect(()=>{load();},[load]);

  const filtered=products.filter(p=>!search||p.title.toLowerCase().includes(search.toLowerCase()));

  if(editing) return <ProductEditor product={editing} apiPost={apiPost} showToast={showToast} onBack={()=>{setEditing(null);load();}}/>;

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em" }}>
            PRODUCTS <span style={{color:S.gold}}>{products.length>0?`(${products.length})`:""}</span>
          </div>
        </div>
        <input placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ ...iStyle, width:260 }}/>
      </div>

      {loading && <LoadingBar/>}

      <div style={{ border:`1px solid ${S.border}` }}>
        <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 100px 110px 70px 180px", background:S.bg3, padding:"8px 14px" }}>
          {["","Product","Type","Status","Qty",""].map((h,i)=><div key={i} style={{ ...mono(8), color:S.muted }}>{h}</div>)}
        </div>

        {filtered.length===0&&!loading&&(
          <div style={{ ...mono(10), color:S.muted, padding:"40px 0", textAlign:"center" }}>No products found.</div>
        )}

        {filtered.map(p=>(
          <div key={p.id} style={{ display:"grid", gridTemplateColumns:"52px 1fr 100px 110px 70px 180px", padding:"10px 14px", borderTop:`1px solid ${S.border}`, background:S.card, alignItems:"center", transition:"background 0.1s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#161618"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
            <div style={{ width:38, height:38, background:S.bg3, overflow:"hidden", flexShrink:0 }}>
              {p.images?.[0]?.src&&<img src={p.images[0].src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
            </div>
            <div style={{ paddingRight:8 }}>
              <div style={{ fontSize:12, fontWeight:500, color:S.text, marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.title}</div>
              <div style={{ ...mono(8), color:S.muted }}>{p.vendor}</div>
            </div>
            <div style={{ ...mono(9), color:S.muted }}>{p.product_type||"—"}</div>
            <SmallBadge status={p.status}/>
            <div style={{ ...mono(10), color:S.muted }}>{p.variants?.length??0}</div>
            <div style={{ display:"flex", gap:5 }}>
              <Btn onClick={()=>setEditing(p)} color="gold">Edit</Btn>
              {p.status==="active"
                ? <Btn onClick={async()=>{try{await apiPost({action:"unpublish_product",id:p.id});showToast("Set to draft");load();}catch(e:any){showToast(e.message,"err");}}}>Draft</Btn>
                : <Btn onClick={async()=>{try{await apiPost({action:"publish_product",id:p.id});showToast("Published ✓");load();}catch(e:any){showToast(e.message,"err");}}} color="gold">Publish</Btn>
              }
              <Btn onClick={async()=>{if(!confirm(`Delete "${p.title}"?`))return;try{await apiPost({action:"delete_product",id:p.id});showToast("Deleted","err");load();}catch(e:any){showToast(e.message,"err");}}} color="red">Del</Btn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProductEditor({product:init,apiPost,showToast,onBack}:any){
  const [p,setP]=useState({...init});
  const [saving,setSaving]=useState(false);
  const [editingVariant,setEditingVariant]=useState<any|null>(null);

  const save=async()=>{
    setSaving(true);
    try{
      await apiPost({action:"update_product",id:p.id,data:{title:p.title,body_html:p.body_html,product_type:p.product_type,vendor:p.vendor,tags:p.tags,status:p.status}});
      showToast("Saved ✓");
    }catch(e:any){showToast(e.message,"err");}
    finally{setSaving(false);}
  };

  const saveVariant=async(v:any)=>{
    setSaving(true);
    try{
      await apiPost({action:"update_variant",id:p.id,variantId:v.id,data:{price:v.price,compare_at_price:v.compare_at_price,sku:v.sku}});
      setEditingVariant(null);
      showToast("Variant saved ✓");
    }catch(e:any){showToast(e.message,"err");}
    finally{setSaving(false);}
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28, flexWrap:"wrap" }}>
        <BackBtn onClick={onBack}/>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:28, letterSpacing:"0.04em", flex:1 }}>
          <span style={{color:S.gold}}>{p.title}</span>
        </div>
        <SmallBadge status={p.status}/>
        <button onClick={save} disabled={saving} style={{ ...mono(11), background:S.gold, color:S.bg, padding:"9px 20px", border:"none", cursor:"pointer", fontWeight:700 }}>
          {saving?"Saving...":"Save Changes"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <SideCard title="Title">
            <input value={p.title} onChange={e=>setP({...p,title:e.target.value})} style={iStyle}/>
          </SideCard>

          <SideCard title="Description (HTML)">
            <textarea value={p.body_html??""} onChange={e=>setP({...p,body_html:e.target.value})} rows={10}
              style={{ ...iStyle, resize:"vertical", fontFamily:"monospace", fontSize:12, lineHeight:1.5 }}/>
            {p.body_html&&(
              <div style={{ marginTop:8, padding:12, background:S.bg3, border:`1px solid ${S.border}`, fontSize:12, color:S.muted, lineHeight:1.7 }}
                dangerouslySetInnerHTML={{__html:p.body_html}}/>
            )}
          </SideCard>

          <SideCard title={`Variants (${p.variants?.length??0})`}>
            <div style={{ border:`1px solid ${S.border}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 60px", background:S.bg3, padding:"7px 10px" }}>
                {["Variant","Price","Compare","SKU",""].map(h=><div key={h} style={{ ...mono(8), color:S.muted }}>{h}</div>)}
              </div>
              {p.variants?.map((v:any)=>(
                editingVariant?.id===v.id
                  ? <VariantEditRow key={v.id} v={editingVariant} setV={setEditingVariant} onSave={()=>saveVariant(editingVariant)} onCancel={()=>setEditingVariant(null)} saving={saving}/>
                  : <div key={v.id} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 60px", padding:"9px 10px", borderTop:`1px solid ${S.border}`, alignItems:"center" }}>
                      <div style={{ fontSize:11, color:S.text }}>{v.title}</div>
                      <div style={{ ...mono(11), color:S.gold }}>${v.price}</div>
                      <div style={{ ...mono(10), color:S.muted }}>{v.compare_at_price?`$${v.compare_at_price}`:"—"}</div>
                      <div style={{ ...mono(10), color:S.muted }}>{v.sku||"—"}</div>
                      <Btn onClick={()=>setEditingVariant({...v})} color="gold">Edit</Btn>
                    </div>
              ))}
            </div>
          </SideCard>

          {p.images?.length>0&&(
            <SideCard title={`Images (${p.images.length})`}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {p.images.map((img:any,i:number)=>(
                  <div key={img.id||i} style={{ width:72, height:72, background:S.bg3, border:`1px solid ${S.border}`, overflow:"hidden" }}>
                    <img src={img.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                ))}
              </div>
            </SideCard>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <SideCard title="Status">
            <select value={p.status} onChange={e=>setP({...p,status:e.target.value})} style={{ ...iStyle, cursor:"pointer" }}>
              <option value="active">Active (Published)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </SideCard>

          <SideCard title="Organization">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div><FieldLbl>Product Type</FieldLbl><input value={p.product_type??""} onChange={e=>setP({...p,product_type:e.target.value})} style={iStyle} placeholder="T-Shirt"/></div>
              <div><FieldLbl>Vendor</FieldLbl><input value={p.vendor??""} onChange={e=>setP({...p,vendor:e.target.value})} style={iStyle} placeholder="Printify"/></div>
              <div><FieldLbl>Tags</FieldLbl><input value={p.tags??""} onChange={e=>setP({...p,tags:e.target.value})} style={iStyle} placeholder="hunting, 2a, rifle"/></div>
            </div>
          </SideCard>

          <SideCard title="URL">
            <div style={{ ...mono(9), color:S.muted, padding:"6px 0" }}>/products/{p.handle}</div>
            <a href={`/products/${p.handle}`} target="_blank" style={{ ...mono(8), color:S.gold, textDecoration:"none" }}>Preview in store ↗</a>
          </SideCard>

          <button onClick={save} disabled={saving} style={{ ...mono(12), background:S.gold, color:S.bg, padding:13, border:"none", cursor:"pointer", fontWeight:700, width:"100%" }}>
            {saving?"Saving...":"Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantEditRow({v,setV,onSave,onCancel,saving}:any){
  return (
    <div style={{ background:S.bg3, borderTop:`1px solid ${S.border}`, padding:12 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
        {[["Price","price"],["Compare","compare_at_price"],["SKU","sku"]].map(([l,k])=>(
          <div key={k}><FieldLbl>{l}</FieldLbl><input value={v[k]??""} onChange={e=>setV({...v,[k]:e.target.value})} style={{ ...iStyle, fontSize:12 }}/></div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={onSave} disabled={saving} style={{ ...mono(10), background:S.gold, color:S.bg, padding:"7px 14px", border:"none", cursor:"pointer", fontWeight:700 }}>{saving?"...":"Save"}</button>
        <button onClick={onCancel} style={{ ...mono(10), background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:"7px 14px", cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ══════════════════════════════════════════════════════════════════════
function OrdersTab({apiFetch,apiPost,showToast}:any){
  const [orders,setOrders]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [selected,setSelected]=useState<any|null>(null);
  const [filter,setFilter]=useState("all");

  const load=useCallback(async()=>{
    setLoading(true);
    try{ const d=await apiFetch({action:"orders"}); setOrders(d.orders??[]); }
    catch(e:any){showToast(e.message,"err");}
    finally{setLoading(false);}
  },[apiFetch]);

  useEffect(()=>{load();},[load]);

  if(selected) return <OrderDetail order={selected} onBack={()=>setSelected(null)}/>;

  const filtered = filter==="all" ? orders : orders.filter(o=>{
    if(filter==="unfulfilled") return !o.fulfillment_status||o.fulfillment_status==="unfulfilled";
    if(filter==="fulfilled") return o.fulfillment_status==="fulfilled";
    if(filter==="paid") return o.financial_status==="paid";
    return true;
  });

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em" }}>
            ORDERS <span style={{color:S.gold}}>{orders.length>0?`(${orders.length})`:""}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["all","unfulfilled","fulfilled","paid"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ ...mono(9), padding:"6px 12px", background:filter===f?S.goldDim:"transparent", border:`1px solid ${filter===f?S.goldBorder:S.border}`, color:filter===f?S.gold:S.muted, cursor:"pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading&&<LoadingBar/>}

      <div style={{ border:`1px solid ${S.border}` }}>
        <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 130px 90px 110px 100px 60px", background:S.bg3, padding:"8px 14px" }}>
          {["Order","Customer","Date","Total","Payment","Fulfillment",""].map((h,i)=><div key={i} style={{ ...mono(8), color:S.muted }}>{h}</div>)}
        </div>

        {filtered.length===0&&!loading&&(
          <div style={{ ...mono(10), color:S.muted, padding:"40px 0", textAlign:"center" }}>No orders.</div>
        )}

        {filtered.map(o=>(
          <div key={o.id} onClick={()=>setSelected(o)} style={{ display:"grid", gridTemplateColumns:"90px 1fr 130px 90px 110px 100px 60px", padding:"11px 14px", borderTop:`1px solid ${S.border}`, background:S.card, alignItems:"center", cursor:"pointer", transition:"background 0.1s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#161618"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
            <div style={{ ...mono(12), color:S.gold, fontWeight:600 }}>{o.name}</div>
            <div>
              <div style={{ fontSize:12, color:S.text }}>{o.email||"—"}</div>
              <div style={{ ...mono(8), color:S.muted }}>{o.shipping_address?.city}</div>
            </div>
            <div style={{ ...mono(9), color:S.muted }}>{new Date(o.created_at).toLocaleDateString()}</div>
            <div style={{ ...mono(12), color:S.gold, fontWeight:600 }}>${parseFloat(o.total_price||0).toFixed(2)}</div>
            <SmallBadge status={o.financial_status}/>
            <SmallBadge status={o.fulfillment_status||"unfulfilled"}/>
            <Btn onClick={(e:any)=>{e.stopPropagation();setSelected(o);}}>View</Btn>
          </div>
        ))}
      </div>
    </>
  );
}

function OrderDetail({order:o,onBack}:any){
  const date = new Date(o.created_at).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28, flexWrap:"wrap" }}>
        <BackBtn onClick={onBack}/>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:28, letterSpacing:"0.04em" }}>
          Order <span style={{color:S.gold}}>{o.name}</span>
        </div>
        <SmallBadge status={o.financial_status}/><SmallBadge status={o.fulfillment_status||"unfulfilled"}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <SideCard title="Line Items">
            {o.line_items?.map((item:any)=>(
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${S.border}` }}>
                <div>
                  <div style={{ fontSize:13, color:S.text, fontWeight:500 }}>{item.title}</div>
                  <div style={{ ...mono(8), color:S.muted, marginTop:2 }}>{item.variant_title} · Qty: {item.quantity}</div>
                </div>
                <div style={{ ...mono(13), color:S.gold, fontWeight:700 }}>${parseFloat(item.price).toFixed(2)}</div>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
              <div style={{ ...mono(14), color:S.gold, fontWeight:700 }}>Total: ${parseFloat(o.total_price||0).toFixed(2)}</div>
            </div>
          </SideCard>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <SideCard title="Customer">
            <div style={{ fontSize:13, color:S.text, marginBottom:6 }}>{o.email}</div>
            {o.shipping_address&&(
              <div style={{ ...mono(9), color:S.muted, lineHeight:1.8 }}>
                {o.shipping_address.name}<br/>
                {o.shipping_address.address1}<br/>
                {o.shipping_address.city}, {o.shipping_address.province_code} {o.shipping_address.zip}<br/>
                {o.shipping_address.country}
              </div>
            )}
          </SideCard>
          <SideCard title="Summary">
            {[["Order",o.name],["Date",date],["Payment",o.financial_status],["Fulfillment",o.fulfillment_status||"unfulfilled"],["Total",`$${parseFloat(o.total_price||0).toFixed(2)}`]].map(([k,v])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${S.border}` }}>
                <span style={{ ...mono(8), color:S.muted }}>{k}</span>
                <span style={{ ...mono(10), color:S.text }}>{v}</span>
              </div>
            ))}
          </SideCard>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// COLLECTIONS TAB
// ══════════════════════════════════════════════════════════════════════
function CollectionsTab({apiFetch}:any){
  const [cols,setCols]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    setLoading(true);
    apiFetch({action:"collections"}).then((d:any)=>setCols(d.collections??[])).catch(()=>{}).finally(()=>setLoading(false));
  },[apiFetch]);
  return (
    <>
      <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em", marginBottom:24 }}>
        COLLECTIONS <span style={{color:S.gold}}>{cols.length>0?`(${cols.length})`:""}</span>
      </div>
      {loading&&<LoadingBar/>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
        {cols.map((c:any)=>(
          <div key={c.id} style={{ background:S.card, border:`1px solid ${S.border}`, overflow:"hidden", transition:"border-color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=S.border}>
            {c.image?.src&&<img src={c.image.src} alt="" style={{width:"100%",height:110,objectFit:"cover"}}/>}
            <div style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:"var(--font-bebas)", fontSize:18, letterSpacing:"0.06em", color:S.text, marginBottom:4 }}>{c.title}</div>
              <div style={{ ...mono(8), color:S.muted, marginBottom:10 }}>{c.products_count} products · /collections/{c.handle}</div>
              <a href={`/collections/${c.handle}`} target="_blank" style={{ ...mono(8), color:S.gold, textDecoration:"none" }}>View in store ↗</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STORE INFO TAB
// ══════════════════════════════════════════════════════════════════════
function StoreInfoTab({apiFetch}:any){
  const [shop,setShop]=useState<any|null>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  useEffect(()=>{
    setLoading(true); setErr("");
    apiFetch({action:"shop"})
      .then((d:any)=>setShop(d))
      .catch((e:any)=>setErr(e.message))
      .finally(()=>setLoading(false));
  },[apiFetch]);
  return (
    <>
      <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em", marginBottom:24 }}>
        STORE <span style={{color:S.gold}}>INFO</span>
      </div>
      {loading && <LoadingBar/>}
      {err && (
        <div style={{ background:"rgba(184,64,64,0.1)", border:"1px solid rgba(184,64,64,0.3)", padding:"14px 18px", ...mono(11), color:"#e08080", marginBottom:16 }}>
          {err.includes("401")||err.includes("token")
            ? "Admin API not connected yet. Add SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET to Vercel env vars and redeploy."
            : err}
        </div>
      )}
      {shop&&(
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <SideCard title="Store Details">
            {[["Name",shop.name],["Domain",shop.domain],["Email",shop.email],["Currency",shop.currency],["Plan",shop.plan_display_name],["Country",shop.country_name],["Timezone",shop.timezone]].map(([k,v])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${S.border}` }}>
                <span style={{ ...mono(8), color:S.muted }}>{k}</span>
                <span style={{ fontSize:12, color:S.text, fontWeight:500 }}>{v||"—"}</span>
              </div>
            ))}
          </SideCard>
          <SideCard title="Quick Links">
            {[["Shopify Admin",`https://${shop.myshopify_domain}/admin`],["Products",`https://${shop.myshopify_domain}/admin/products`],["Orders",`https://${shop.myshopify_domain}/admin/orders`],["Printify","https://printify.com/app/dashboard"],["Live Store","https://shop.downrangeco.com"],["DownRange Portal","https://downrangeco.com"]].map(([l,h])=>(
              <a key={l as string} href={h as string} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${S.border}`, textDecoration:"none" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=S.gold}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=""}>
                <span style={{ fontSize:12, color:S.text }}>{l}</span>
                <span style={{ ...mono(8), color:S.muted }}>↗</span>
              </a>
            ))}
          </SideCard>
        </div>
      )}
    </>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────

// ── Hero Image Upload ──────────────────────────────────────────────
function HeroImageUpload({adminKey,showToast}:{adminKey:string;showToast:(m:string,t?:"ok"|"err")=>void}){
  const [uploading,setUploading]=useState(false);
  const [preview,setPreview]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    try{
      const fd=new FormData(); fd.append("file",file);
      const res=await fetch("/api/upload/hero",{method:"POST",headers:{"x-admin-key":adminKey},body:fd});
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      showToast("Hero image saved! Vercel redeploys in ~60s ✓");
    }catch(err:any){showToast((err as any).message,"err");setPreview(null);}
    finally{setUploading(false);}
  };
  return (
    <SideCard title="Hero Background Image">
      <div style={{marginBottom:10,fontSize:12,color:S.muted,lineHeight:1.6}}>Replace the background photo. 1920×800px recommended, JPG/PNG, max 10MB.</div>
      <div style={{height:110,overflow:"hidden",background:S.bg3,border:`1px solid ${S.border}`,marginBottom:10,position:"relative"}}>
        <img src={preview??"/hero.jpg"} alt="Hero" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        {preview&&<div style={{position:"absolute",top:6,right:6,...mono(8),background:"rgba(42,106,58,0.9)",color:"#6adb8a",padding:"3px 8px",border:"1px solid #3a8a4a"}}>New</div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
      <button onClick={()=>fileRef.current?.click()} disabled={uploading}
        style={{width:"100%",background:uploading?S.bg3:S.goldDim,border:`1px solid ${S.goldBorder}`,color:uploading?S.muted:S.gold,fontFamily:"var(--font-mono)",fontSize:"11px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"10px",cursor:uploading?"not-allowed":"pointer",fontWeight:600}}>
        {uploading?"Uploading...":"↑ Upload New Hero Image"}
      </button>
      <div style={{fontFamily:"var(--font-mono)",fontSize:"8px",letterSpacing:"0.11em",textTransform:"uppercase",color:S.muted,marginTop:6}}>Upload commits directly to GitHub → Vercel auto-deploys in ~60 seconds. Requires GH_TOKEN in Vercel env vars.</div>
    </SideCard>
  );
}

function Login({keyVal,setKey,login}:any){
  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:S.bg2, border:`1px solid ${S.border}`, padding:48, width:380 }}>
        <img src="/logo.png" alt="Down Range Co." style={{ height:52, width:"auto", maxWidth:300, objectFit:"contain", marginBottom:8 }}/>
        <div style={{ ...mono(10), color:S.muted, marginBottom:28 }}>Store Admin</div>
        <input type="password" placeholder="Admin key" value={keyVal} onChange={e=>setKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          style={{ ...iStyle, marginBottom:10 }}/>
        <button onClick={login} style={{ ...mono(12), background:S.gold, color:S.bg, padding:14, border:"none", cursor:"pointer", fontWeight:700, width:"100%" }}>
          Enter Admin →
        </button>
        <div style={{ ...mono(8), color:S.muted, marginTop:12, textAlign:"center" }}>Default: <span style={{color:S.gold}}>drco-admin-2026</span></div>
      </div>
    </div>
  );
}
function Toast({msg,type}:{msg:string;type:"ok"|"err"}){
  return <div style={{ position:"fixed", top:16, right:16, zIndex:9999, background:type==="ok"?S.green:S.red, color:"#fff", fontFamily:"var(--font-mono)",fontSize:"11px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"12px 20px",border:`1px solid ${type==="ok"?"#3a8a4a":"#d05050"}` }}>{msg}</div>;
}
function SmallBadge({status}:{status:string}){
  const m:Record<string,{bg:string,text:string,b:string}> = {
    active:{bg:"rgba(42,106,58,0.2)",text:"#6adb8a",b:"#3a8a4a"},
    draft:{bg:"rgba(80,80,80,0.2)",text:S.muted,b:"#555"},
    archived:{bg:"rgba(80,40,40,0.2)",text:"#e08080",b:"#804040"},
    paid:{bg:"rgba(42,106,58,0.2)",text:"#6adb8a",b:"#3a8a4a"},
    pending:{bg:"rgba(180,120,20,0.2)",text:"#e0a830",b:"#b07020"},
    refunded:{bg:"rgba(80,80,180,0.2)",text:"#9090e0",b:"#5050a0"},
    fulfilled:{bg:"rgba(42,106,58,0.2)",text:"#6adb8a",b:"#3a8a4a"},
    unfulfilled:{bg:"rgba(180,120,20,0.2)",text:"#e0a830",b:"#b07020"},
  };
  const c=m[status?.toLowerCase()]??{bg:S.bg3,text:S.muted,b:S.border};
  return <span style={{ ...mono(8), padding:"3px 7px", background:c.bg, border:`1px solid ${c.b}`, color:c.text }}>{status??"—"}</span>;
}
function Btn({onClick,color,children,disabled}:any){
  const c={gold:{bg:S.goldDim,b:S.goldBorder,text:S.gold},red:{bg:"rgba(184,64,64,0.1)",b:"rgba(184,64,64,0.3)",text:"#e08080"},default:{bg:"transparent",b:S.border,text:S.muted}};
  const s=c[color as keyof typeof c]??c.default;
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily:"var(--font-mono)",fontSize:"8px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"6px 9px",cursor:"pointer",border:`1px solid ${s.b}`,background:s.bg,color:s.text,whiteSpace:"nowrap" }}>{children}</button>;
}
function BackBtn({onClick}:{onClick:()=>void}){
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${S.border}`, color:S.muted, fontFamily:"var(--font-mono)",fontSize:"9px",letterSpacing:"0.11em",textTransform:"uppercase",padding:"7px 12px",cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
      ← Back
    </button>
  );
}
function SideCard({title,children}:{title:string;children:React.ReactNode}){
  return (
    <div style={{ background:S.card, border:`1px solid ${S.border}`, padding:18 }}>
      <div style={{ ...mono(9), color:S.gold, marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}
function FieldLbl({children}:{children:React.ReactNode}){
  return <div style={{ ...mono(8), color:S.muted, marginBottom:4 }}>{children}</div>;
}
function LoadingBar(){
  return <div style={{ height:2, background:S.gold, marginBottom:14, animation:"pulse 1s infinite" }}/>;
}
const iStyle = { width:"100%", background:S.bg3, border:`1px solid ${S.border}`, color:S.text, padding:"9px 12px", fontSize:13, fontFamily:"var(--font-sans)", boxSizing:"border-box" as const };
