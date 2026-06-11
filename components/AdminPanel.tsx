"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import PageEditor from "@/components/PageEditor";

const S = {
  bg:"#09090B", bg2:"#111113", bg3:"#1A1A1D", card:"#141416",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.1)", goldBorder:"rgba(200,146,42,0.3)",
  text:"#F0EDE8", muted:"#777", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.12)", green:"#2a6a3a", greenText:"#6adb8a",
  sidebar: "#0d0d0f",
};

const TABS = [
  { id:"dashboard",   icon:"⬡", label:"Dashboard"   },
  { id:"ops",         icon:"◎", label:"Operations"  },
  { id:"products",    icon:"◈", label:"Products"     },
  { id:"orders",      icon:"◎", label:"Orders"       },
  { id:"collections", icon:"⬡", label:"Collections" },
  { id:"storefront",  icon:"◉", label:"Storefront"  },
  { id:"store",       icon:"◈", label:"Store Info"  },
  { id:"pages",       icon:"◌", label:"Pages"       },
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
          {tab==="pages"       && <PageEditor      adminKey={key} showToast={showToast}/>}
          {tab==="ops"         && <OpsTab          adminKey={key}/>}
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
  const [slides,   setSlides]  = useState<any[]>([]);
  const [editing,  setEditing] = useState<any|null>(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [activeTab,setActiveTab] = useState<"slides"|"upload">("slides");

  const BLANK_SLIDE = {
    id:`slide-${Date.now()}`, image:"/hero.jpg",
    eyebrow:"", title_line1:"", title_line2:"", title_line3:"", title_line4:"",
    accent_word:"", subtitle:"", cta_primary:"Shop Now", cta_primary_url:"/products",
    cta_secondary:"Learn More", overlay_opacity:85, active:true, position:0,
  };

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const r = await fetch("/api/hero",{cache:"no-store"});
      const d = await r.json();
      // API returns active-only; fetch all via admin header
      const all = await fetch("/api/hero",{headers:{"x-admin-key":adminKey},cache:"no-store"}).then(r=>r.json());
      setSlides(all.slides ?? d.slides ?? []);
    } catch {}
    setLoading(false);
  },[adminKey]);

  useEffect(()=>{load();},[load]);

  const apiPost = async(body:any)=>{
    const r = await fetch("/api/hero",{method:"POST",headers:{"x-admin-key":adminKey,"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d = await r.json();
    if(d.error) throw new Error(d.error);
    return d;
  };

  const saveSlide = async()=>{
    if(!editing) return;
    setSaving(true);
    try {
      const d = await apiPost({action:"upsert",slide:editing});
      setSlides(d.slides);
      setEditing(null);
      showToast("Slide saved — live on homepage ✓");
    } catch(e:any){showToast(e.message,"err");}
    finally{setSaving(false);}
  };

  const deleteSlide = async(id:string)=>{
    if(!confirm("Delete this slide?")) return;
    const d = await apiPost({action:"delete",id}).catch(()=>null);
    if(d?.slides) setSlides(d.slides);
    showToast("Slide deleted");
  };

  const toggleSlide = async(id:string)=>{
    const d = await apiPost({action:"toggle",id}).catch(()=>null);
    if(d?.slides) setSlides(d.slides);
  };

  const moveSlide = async(id:string, dir:-1|1)=>{
    const idx = slides.findIndex(s=>s.id===id);
    const newIdx = idx+dir;
    if(newIdx<0||newIdx>=slides.length) return;
    const reordered = [...slides];
    [reordered[idx],reordered[newIdx]] = [reordered[newIdx],reordered[idx]];
    const order = reordered.map(s=>s.id);
    const d = await apiPost({action:"reorder",order}).catch(()=>null);
    if(d?.slides) setSlides(d.slides);
  };

  const reset = async()=>{
    if(!confirm("Reset all slides to defaults?")) return;
    const d = await apiPost({action:"reset"}).catch(()=>null);
    if(d?.slides){setSlides(d.slides); showToast("Reset to defaults");}
  };

  if(editing) return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"var(--font-bebas)",fontSize:32,letterSpacing:"0.04em"}}>
            {editing.id.startsWith("slide-new") ? "NEW SLIDE" : `EDIT SLIDE — ${editing.title_line1||"untitled"}`}
          </div>
          <div style={{...mono(9),color:S.muted}}>Image: {editing.image}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditing(null)} style={{...mono(10),background:"transparent",border:`1px solid ${S.border}`,color:S.muted,padding:"8px 14px",cursor:"pointer"}}>← Cancel</button>
          <button onClick={saveSlide} disabled={saving} style={{...mono(11),background:S.gold,color:S.bg,padding:"9px 20px",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Publish Slide"}</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Left: form */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SideCard title="Hero Image">
            <div style={{...mono(8),color:S.muted,marginBottom:6}}>Current: {editing.image}</div>
            <input value={editing.image} onChange={e=>setEditing((s:any)=>({...s,image:e.target.value}))} style={iStyle} placeholder="/hero.jpg" />
            <div style={{...mono(8),color:S.muted,marginTop:6}}>Upload new images in the Upload tab, then reference the filename here (e.g. /hero-2.jpg)</div>
          </SideCard>
          <SideCard title="Eyebrow Text">
            <input value={editing.eyebrow} onChange={e=>setEditing((s:any)=>({...s,eyebrow:e.target.value}))} style={iStyle} placeholder="Built for the Field — Summer 2026"/>
          </SideCard>
          <SideCard title="Headline (up to 4 lines)">
            {(["title_line1","title_line2","title_line3","title_line4"] as const).map((k,i)=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{...mono(9),color:S.muted,width:16,flexShrink:0}}>L{i+1}</span>
                <input value={editing[k]||""} onChange={e=>setEditing((s:any)=>({...s,[k]:e.target.value}))} style={{...iStyle,flex:1,fontFamily:"var(--font-bebas)",fontSize:16,letterSpacing:"0.06em"}} placeholder={i===0?"GEAR FOR":i===1?"HUNTERS,":""}/>
              </div>
            ))}
            <div style={{marginTop:8}}>
              <div style={{...mono(8),color:S.muted,marginBottom:4}}>Accent word (displayed in gold):</div>
              <input value={editing.accent_word||""} onChange={e=>setEditing((s:any)=>({...s,accent_word:e.target.value}))} style={iStyle} placeholder="SHOOTERS"/>
            </div>
          </SideCard>
          <SideCard title="Subtitle">
            <textarea value={editing.subtitle} onChange={e=>setEditing((s:any)=>({...s,subtitle:e.target.value}))} rows={3} style={{...iStyle,resize:"vertical"}} placeholder="Supporting text below the headline"/>
          </SideCard>
          <SideCard title="CTAs">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{...mono(8),color:S.muted,marginBottom:4}}>Primary Label</div><input value={editing.cta_primary} onChange={e=>setEditing((s:any)=>({...s,cta_primary:e.target.value}))} style={iStyle}/></div>
              <div><div style={{...mono(8),color:S.muted,marginBottom:4}}>Primary URL</div><input value={editing.cta_primary_url||"/products"} onChange={e=>setEditing((s:any)=>({...s,cta_primary_url:e.target.value}))} style={iStyle}/></div>
            </div>
            <div style={{marginTop:8}}><div style={{...mono(8),color:S.muted,marginBottom:4}}>Secondary Label</div><input value={editing.cta_secondary} onChange={e=>setEditing((s:any)=>({...s,cta_secondary:e.target.value}))} style={iStyle}/></div>
          </SideCard>
          <SideCard title="Overlay Opacity">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min={30} max={99} value={editing.overlay_opacity} onChange={e=>setEditing((s:any)=>({...s,overlay_opacity:parseInt(e.target.value)}))} style={{flex:1}}/>
              <span style={{...mono(11),color:S.gold,width:40,textAlign:"right"}}>{editing.overlay_opacity}%</span>
            </div>
            <div style={{...mono(8),color:S.muted,marginTop:4}}>Higher = darker overlay, easier to read text</div>
          </SideCard>
        </div>
        {/* Right: mini preview */}
        <div style={{position:"sticky",top:80,height:"fit-content"}}>
          <div style={{...mono(9),color:S.gold,marginBottom:8}}>// Preview</div>
          <div style={{position:"relative",height:260,overflow:"hidden",borderRadius:0,background:"#1a1a1a",backgroundImage:`url('${editing.image}')`,backgroundSize:"cover",backgroundPosition:"center"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(to right,rgba(9,9,11,${(editing.overlay_opacity||85)/100}) 0%,rgba(9,9,11,${(editing.overlay_opacity||85)/100*0.4}) 100%)`}}/>
            <div style={{position:"relative",zIndex:1,padding:"20px 24px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
              <div style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.2em",color:"#C8922A",marginBottom:8,textTransform:"uppercase"}}>{editing.eyebrow||"Eyebrow text"}</div>
              <div style={{fontFamily:"var(--font-bebas)",fontSize:32,lineHeight:0.9,color:"#F0EDE8",marginBottom:10}}>
                {[editing.title_line1,editing.title_line2,editing.title_line3,editing.title_line4].filter(Boolean).map((l,i)=>(
                  <div key={i} style={{color:l===editing.accent_word?"#C8922A":"#F0EDE8"}}>{l}</div>
                ))}
              </div>
              <p style={{fontSize:11,color:"rgba(240,237,232,0.75)",margin:"0 0 12px",lineHeight:1.5}}>{(editing.subtitle||"Subtitle...").slice(0,80)}...</p>
              <div style={{display:"flex",gap:8}}>
                <div style={{background:"#C8922A",color:"#09090B",fontSize:9,fontFamily:"var(--font-mono)",padding:"6px 14px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{editing.cta_primary||"Shop Now"}</div>
                <div style={{border:"1px solid rgba(255,255,255,0.3)",color:"#F0EDE8",fontSize:9,fontFamily:"var(--font-mono)",padding:"5px 14px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{editing.cta_secondary||"Learn More"}</div>
              </div>
            </div>
          </div>
          <div style={{...mono(8),color:S.muted,marginTop:8,textAlign:"center"}}>Live preview updates as you type</div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"var(--font-bebas)",fontSize:38,letterSpacing:"0.04em"}}>HERO <span style={{color:S.gold}}>SLIDESHOW</span></div>
          <div style={{...mono(9),color:S.muted}}>{slides.length} slide{slides.length!==1?"s":""} · auto-advances every 6 seconds · hover pauses</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditing({...BLANK_SLIDE,id:`slide-new-${Date.now()}`})} style={{...mono(10),background:S.goldDim,border:`1px solid ${S.goldBorder}`,color:S.gold,padding:"8px 16px",cursor:"pointer"}}>+ Add Slide</button>
          <button onClick={reset} style={{...mono(10),background:S.redDim,border:"1px solid rgba(184,64,64,0.3)",color:"#e08080",padding:"8px 14px",cursor:"pointer"}}>Reset Defaults</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${S.border}`}}>
        {(["slides","upload"] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{...mono(10),padding:"10px 20px",background:activeTab===t?S.goldDim:"transparent",borderBottom:`2px solid ${activeTab===t?S.gold:"transparent"}`,border:"none",color:activeTab===t?S.gold:S.muted,cursor:"pointer",textTransform:"uppercase"}}>
            {t==="slides"?"🖼 Slides":"⬆ Upload Image"}
          </button>
        ))}
      </div>

      {activeTab==="slides" && (
        <div>
          {loading && <LoadingBar/>}
          {!loading && slides.length===0 && (
            <div style={{...mono(10),color:S.muted,padding:"40px 0",textAlign:"center"}}>No slides. Click + Add Slide to create one.</div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {slides.map((slide,i)=>(
              <div key={slide.id} style={{background:S.card,border:`1px solid ${slide.active?S.border:"rgba(255,255,255,0.03)"}`,display:"grid",gridTemplateColumns:"56px 80px 1fr auto",gap:0,alignItems:"stretch",opacity:slide.active?1:0.5,transition:"opacity 0.2s"}}>
                {/* Position controls */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"0 8px",borderRight:`1px solid ${S.border}`}}>
                  <button onClick={()=>moveSlide(slide.id,-1)} disabled={i===0} style={{background:"transparent",border:"none",color:S.muted,cursor:i===0?"default":"pointer",fontSize:14,opacity:i===0?0.3:1,padding:"2px 6px"}}>▲</button>
                  <span style={{fontFamily:"var(--font-bebas)",fontSize:20,color:S.gold}}>{i+1}</span>
                  <button onClick={()=>moveSlide(slide.id,1)} disabled={i===slides.length-1} style={{background:"transparent",border:"none",color:S.muted,cursor:i===slides.length-1?"default":"pointer",fontSize:14,opacity:i===slides.length-1?0.3:1,padding:"2px 6px"}}>▼</button>
                </div>
                {/* Thumbnail */}
                <div style={{backgroundImage:`url('${slide.image}')`,backgroundSize:"cover",backgroundPosition:"center",borderRight:`1px solid ${S.border}`,minHeight:80}}/>
                {/* Content */}
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontFamily:"var(--font-bebas)",fontSize:18,letterSpacing:"0.04em",color:S.text,lineHeight:1}}>
                    {[slide.title_line1,slide.title_line2,slide.title_line3,slide.title_line4].filter(Boolean).join(" ")}
                  </div>
                  <div style={{...mono(9),color:S.gold,marginTop:3}}>{slide.eyebrow}</div>
                  <div style={{fontSize:12,color:S.muted,marginTop:4}}>{slide.subtitle?.slice(0,80)}...</div>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <span style={{...mono(8),padding:"2px 8px",background:"rgba(200,146,42,0.12)",border:"1px solid rgba(200,146,42,0.3)",color:S.gold}}>{slide.cta_primary}</span>
                    <span style={{...mono(8),padding:"2px 8px",background:"transparent",border:`1px solid ${S.border}`,color:S.muted}}>{slide.image}</span>
                    <span style={{...mono(8),padding:"2px 8px",background:"transparent",border:`1px solid ${S.border}`,color:S.muted}}>overlay {slide.overlay_opacity}%</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{display:"flex",flexDirection:"column",gap:0,borderLeft:`1px solid ${S.border}`}}>
                  <button onClick={()=>setEditing({...slide})} style={{flex:1,background:"transparent",border:"none",color:S.gold,cursor:"pointer",...mono(9),padding:"0 16px",borderBottom:`1px solid ${S.border}`}}>✎ Edit</button>
                  <button onClick={()=>toggleSlide(slide.id)} style={{flex:1,background:"transparent",border:"none",color:slide.active?"#6adb8a":"#e08080",cursor:"pointer",...mono(9),padding:"0 16px",borderBottom:`1px solid ${S.border}`}}>{slide.active?"● On":"○ Off"}</button>
                  <button onClick={()=>deleteSlide(slide.id)} style={{flex:1,background:"transparent",border:"none",color:"#e08080",cursor:"pointer",...mono(9),padding:"0 16px"}}>✕ Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==="upload" && (
        <HeroUploadTab adminKey={adminKey} showToast={showToast}/>
      )}
    </div>
  );
}


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


// ══════════════════════════════════════════════════════════════════════
// PAGES TAB
// ══════════════════════════════════════════════════════════════════════
const MANAGED_PAGES = [
  { slug:"sizing-guide",     label:"Sizing Guide",       section:"Info",  icon:"◈" },
  { slug:"shipping-returns", label:"Shipping & Returns", section:"Info",  icon:"◎" },
  { slug:"faq",              label:"FAQ",                section:"Info",  icon:"◉" },
  { slug:"contact",          label:"Contact",            section:"Info",  icon:"◌" },
  { slug:"privacy",          label:"Privacy Policy",     section:"Legal", icon:"◈" },
  { slug:"terms",            label:"Terms of Service",   section:"Legal", icon:"◎" },
  { slug:"2a-proud",         label:"2A Proud",           section:"Brand", icon:"◉" },
];
function PagesTab({adminKey,showToast}:any){
  const sections=[...new Set(MANAGED_PAGES.map(p=>p.section))];
  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--font-bebas)",fontSize:38,letterSpacing:"0.04em"}}>
          PAGES <span style={{color:S.gold}}>(7)</span>
        </div>
        <div style={{...mono(9),color:S.muted}}>All store pages — preview or manage</div>
      </div>
      {sections.map(section=>(
        <div key={section} style={{marginBottom:28}}>
          <div style={{...mono(10),color:S.gold,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:20,height:1,background:S.gold,display:"inline-block"}}/>
            {section}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {MANAGED_PAGES.filter(p=>p.section===section).map(page=>(
              <div key={page.slug} style={{background:S.card,border:`1px solid ${S.border}`,padding:20,transition:"border-color 0.15s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=S.border}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:18,color:S.gold,opacity:0.6,marginBottom:6}}>{page.icon}</div>
                    <div style={{fontFamily:"var(--font-bebas)",fontSize:18,letterSpacing:"0.06em",color:S.text}}>{page.label}</div>
                    <div style={{...mono(9),color:S.muted,marginTop:2}}>/pages/{page.slug}</div>
                  </div>
                  <span style={{...mono(8),padding:"3px 8px",background:"rgba(42,106,58,0.2)",border:"1px solid #3a8a4a",color:"#6adb8a"}}>Live</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{flex:1,background:S.goldDim,border:`1px solid ${S.goldBorder}`,color:S.gold,fontFamily:"var(--font-mono)",fontSize:"9px",letterSpacing:"0.11em",textTransform:"uppercase" as const,padding:"8px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    Preview ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{background:"rgba(200,146,42,0.06)",border:`1px solid rgba(200,146,42,0.2)`,padding:"16px 20px",...mono(9),color:S.muted,lineHeight:1.8}}>
        <span style={{color:S.gold}}>Pages</span> are managed in the codebase at <span style={{color:S.text}}>app/pages/[slug]/page.tsx</span>. Hero text is editable in the Storefront tab.
      </div>
    </div>
  );
}



// ── Hero image upload tab ──────────────────────────────────────────────
function HeroUploadTab({adminKey,showToast}:{adminKey:string;showToast:(m:string,t?:"ok"|"err")=>void}){
  const [file,      setFile]    = useState<File|null>(null);
  const [filename,  setFilename] = useState("hero-2.jpg");
  const [uploading, setUploading]= useState(false);
  const [preview,   setPreview] = useState<string|null>(null);

  const onFile = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    // Auto-suggest filename from file name
    const name = f.name.replace(/[^a-zA-Z0-9._-]/g,"-").toLowerCase();
    setFilename(name.startsWith("hero")?name:`hero-${name}`);
  };

  const upload = async()=>{
    if(!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", filename);
      const r = await fetch("/api/upload/hero",{method:"POST",headers:{"x-admin-key":adminKey},body:fd});
      const d = await r.json();
      if(!r.ok) throw new Error(d.error??`HTTP ${r.status}`);
      showToast(`Uploaded! Use /${filename} as the slide image path. Vercel will redeploy in ~60s.`);
      setFile(null); setPreview(null);
    } catch(e:any){showToast(e.message,"err");}
    finally{setUploading(false);}
  };

  return (
    <div style={{maxWidth:520}}>
      <div style={{...mono(9),color:S.muted,marginBottom:16}}>
        Upload a new hero background image. It will be committed to GitHub and available as a slide background within ~60 seconds (Vercel redeploy).
      </div>
      <SideCard title="Select Image">
        <input type="file" accept="image/*" onChange={onFile} style={{color:S.text,marginBottom:12,display:"block"}}/>
        {preview&&<img src={preview} alt="preview" style={{width:"100%",height:160,objectFit:"cover",marginBottom:12}}/>}
      </SideCard>
      {file&&(
        <SideCard title="Save As (filename)">
          <input value={filename} onChange={e=>setFilename(e.target.value)} style={iStyle} placeholder="hero-2.jpg"/>
          <div style={{...mono(8),color:S.muted,marginTop:6}}>
            Will be available at <span style={{color:S.gold}}>/{filename}</span> — use this path in the slide Image field.
          </div>
        </SideCard>
      )}
      <div style={{marginTop:14}}>
        <button onClick={upload} disabled={!file||uploading}
          style={{...mono(11),background:S.gold,color:S.bg,padding:"10px 24px",border:"none",cursor:!file||uploading?"not-allowed":"pointer",fontWeight:700,opacity:!file||uploading?0.6:1}}>
          {uploading?"Uploading...":"⬆ Upload Image"}
        </button>
      </div>
      <div style={{marginTop:20,background:S.bg3,border:`1px solid ${S.border}`,padding:14}}>
        <div style={{...mono(8),color:S.gold,marginBottom:8}}>Existing hero images</div>
        {["/hero.jpg","/hero-2.jpg","/hero-3.jpg"].map(p=>(
          <div key={p} style={{...mono(9),color:S.muted,padding:"4px 0",borderBottom:`1px solid ${S.border}`}}>
            {p} <span style={{color:"#666"}}>— use this path in slide Image field</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ops Tab ──────────────────────────────────────────────────────────
function OpsTab({ adminKey }: { adminKey: string }) {
  const [health,      setHealth]      = useState<any>(null);
  const [logs,        setLogs]        = useState<any[]>([]);
  const [stats,       setStats]       = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [logFilter,   setLogFilter]   = useState("all");
  const [logSearch,   setLogSearch]   = useState("");
  const [lastRefresh, setLR]          = useState("");
  const [smsTab,      setSmsTab]      = useState<"all"|"sent"|"skipped"|"failed">("all");
  const [expanded,    setExpanded]    = useState<string|null>(null);
  const [smsSearch,   setSmsSearch]   = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [testing,     setTesting]     = useState(false);
  const [testResult,  setTestResult]  = useState<any>(null);
  const timerRef = useRef<any>(null);

  const load = React.useCallback(async (silent=false) => {
    if (!silent) setLoading(true);
    try {
      const [h, l] = await Promise.all([
        fetch(`/api/ops/health?key=${adminKey}`,         { cache:"no-store" }).then(r=>r.json()).catch(()=>({})),
        fetch(`/api/ops/alert?key=${adminKey}&count=500`,{ cache:"no-store" }).then(r=>r.json()).catch(()=>({})),
      ]);
      setHealth(h);
      setLogs(l.logs ?? []);
      setStats(l.stats ?? {});
      setLR(new Date().toLocaleTimeString());
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!autoRefresh) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => load(true), 15_000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, load]);

  const forceSync = async () => {
    setSyncing(true);
    try { await fetch("/api/ops/sync-products", { headers:{"x-admin-key":adminKey} }); await load(); }
    finally { setSyncing(false); }
  };

  const testSMS = async () => {
    setTesting(true); setTestResult(null);
    const r = await fetch("/api/ops/test-sms", { method:"POST", headers:{"x-admin-key":adminKey,"Content-Type":"application/json"}, body:"{}" });
    const d = await r.json();
    setTestResult(d);
    setTesting(false);
    setTimeout(() => load(true), 1000);
  };

  const clearLog = async () => {
    if (!confirm("Clear all ops logs? Cannot be undone.")) return;
    await fetch(`/api/ops/alert?key=${adminKey}`, { method:"DELETE", headers:{"x-admin-key":adminKey} });
    await load();
  };

  // style helpers
  const sc  = (s:string) => s==="ok"||s==="healthy" ? S.greenText : s==="warn"||s==="partial" ? "#e0a830" : "#e08080";
  const lc  = (l:string): string => ({ok:S.greenText,info:"#8888dd",warn:"#e0a830",error:"#e08080",critical:"#ff5555"}[l] ?? S.muted);
  const li  = (l:string): string => ({ok:"✓",info:"·",warn:"△",error:"✗",critical:"!"}[l] ?? "·");
  const rowBg = (l:string) => l==="error"||l==="critical" ? "rgba(184,64,64,0.08)" : l==="warn" ? "rgba(180,120,20,0.05)" : l==="ok" ? "rgba(22,163,74,0.04)" : S.card;

  // SMS log derivation — all SMS events from the ops log
  const allSmsLogs = logs.filter(l => l.job==="sms" || l.job==="sms-test");

  // Classify each SMS log entry
  const classify = (l: any): "sent"|"skipped"|"failed" => {
    if (l.level === "ok") return "sent";
    const d = (l.detail ?? "") + (l.message ?? "");
    if (d.includes("cooldown") || d.includes("Cooldown") || d.includes("configured") || d.includes("not configured") || d.includes("skipped") || d.includes("quiet")) return "skipped";
    return "failed";
  };

  const sentSms    = allSmsLogs.filter(l => classify(l) === "sent");
  const skippedSms = allSmsLogs.filter(l => classify(l) === "skipped");
  const failedSms  = allSmsLogs.filter(l => classify(l) === "failed");

  const smsFiltered = allSmsLogs.filter(l => {
    const c = classify(l);
    if (smsTab === "sent"    && c !== "sent")    return false;
    if (smsTab === "skipped" && c !== "skipped") return false;
    if (smsTab === "failed"  && c !== "failed")  return false;
    if (smsSearch && !l.message?.includes(smsSearch) && !l.detail?.includes(smsSearch) && !l.job?.includes(smsSearch)) return false;
    return true;
  });

  const successRate = allSmsLogs.length ? Math.round((sentSms.length / allSmsLogs.length) * 100) : null;

  // Full ops log filter
  const JOB_FILTERS = ["all","sms","sms-test","auth","cart","admin-api","storefront","pages","hero-upload","product-sync","health-check"];
  const LEVEL_FILTERS = ["error","warn","ok","info"];
  const opsFiltered = logFilter === "all"
    ? logs.filter(l => !logSearch || l.message?.includes(logSearch) || l.job?.includes(logSearch))
    : logs.filter(l => (l.level===logFilter || l.job===logFilter) && (!logSearch || l.message?.includes(logSearch) || l.job?.includes(logSearch)));

  const lastSent = sentSms[0];

  function SmsStatusBadge({ log }: { log: any }) {
    const c = classify(log);
    if (c === "sent")    return <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",letterSpacing:".05em",background:"rgba(34,197,94,.12)",color:"#22c55e",border:"1px solid rgba(34,197,94,.2)"}}>✓ SENT</span>;
    if (c === "skipped") return <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",letterSpacing:".05em",background:"rgba(59,130,246,.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,.2)"}}>SKIPPED</span>;
    return                      <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",letterSpacing:".05em",background:"rgba(239,68,68,.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,.2)"}}>✕ FAILED</span>;
  }

  function fmtAge(ts:string) {
    const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (m < 1)    return "just now";
    if (m < 60)   return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m/60)}h ago`;
    return `${Math.floor(m/1440)}d ago`;
  }
  function fmtTime(ts:string) {
    return new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  }

  // Mini sparkline
  function Spark() {
    const recent = allSmsLogs.slice(0, 20).reverse();
    if (!recent.length) return null;
    return (
      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:20}}>
        {recent.map((l,i) => {
          const c = classify(l);
          return <div key={i} style={{width:6,borderRadius:1,minHeight:2,
            height: c==="sent" ? 18 : c==="skipped" ? 10 : 6,
            background: c==="sent" ? "#22c55e" : c==="skipped" ? "#60a5fa" : "#ef4444",
            opacity: 0.4 + (i/recent.length)*0.6}} />;
        })}
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"var(--font-bebas)",fontSize:36,letterSpacing:"0.04em",lineHeight:1}}>
            OPERATIONS <span style={{color:S.gold}}>CENTER</span>
          </div>
          <div style={{...mono(9),color:S.muted,marginTop:3,display:"flex",alignItems:"center",gap:8}}>
            {autoRefresh && <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"drPulse 2s ease-in-out infinite"}} />}
            {loading ? "Loading…" : `${logs.length} events · ${lastRefresh}`}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <label style={{display:"flex",gap:5,alignItems:"center",cursor:"pointer",...mono(8),color:S.muted}}>
            <input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} style={{accentColor:S.gold}} />
            auto 15s
          </label>
          <button onClick={forceSync} disabled={syncing} style={{...mono(9),background:S.goldDim,border:`1px solid ${S.goldBorder}`,color:S.gold,padding:"7px 13px",cursor:"pointer"}}>{syncing?"Syncing…":"⟳ Sync Products"}</button>
          <button onClick={()=>load()} style={{...mono(9),background:"transparent",border:`1px solid ${S.border}`,color:S.muted,padding:"7px 13px",cursor:"pointer"}}>↻ Refresh</button>
          <button onClick={clearLog} style={{...mono(9),background:S.redDim,border:"1px solid rgba(184,64,64,0.3)",color:"#e08080",padding:"7px 13px",cursor:"pointer"}}>✕ Clear Log</button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {stats && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:20}}>
          {[
            {label:"Total Events",  v:stats.total,       c:S.text},
            {label:"Errors",        v:stats.errors,      c:"#e08080"},
            {label:"Warnings",      v:stats.warnings,    c:"#e0a830"},
            {label:"SMS Sent",      v:sentSms.length,    c:"#22c55e"},
            {label:"SMS Failed",    v:failedSms.length,  c:failedSms.length>0?"#e08080":S.muted},
            {label:"Cart Actions",  v:stats.cartActions, c:S.gold},
            {label:"Auth Events",   v:stats.authEvents,  c:S.greenText},
          ].map(s=>(
            <div key={s.label} style={{background:S.card,border:`1px solid ${S.border}`,padding:"11px 13px"}}>
              <div style={{fontFamily:"var(--font-bebas)",fontSize:22,color:s.c,letterSpacing:"0.04em",lineHeight:1}}>{s.v ?? 0}</div>
              <div style={{...mono(7),color:S.muted,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SMS MANAGEMENT PANEL
      ══════════════════════════════════════════════════════ */}
      <div style={{marginBottom:24,border:`1px solid ${S.border}`,background:S.card}}>
        {/* SMS panel header */}
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${S.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontFamily:"var(--font-bebas)",fontSize:18,letterSpacing:"0.06em",color:S.gold}}>📱 SMS ALERTS</div>
            <div style={{display:"flex",gap:6}}>
              {/* Status pill */}
              <span style={{...mono(8),padding:"3px 9px",background:"rgba(34,197,94,.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,.25)"}}>
                DownRange-Shop
              </span>
              {lastSent && (
                <span style={{...mono(8),padding:"3px 9px",background:S.bg3,color:S.muted,border:`1px solid ${S.border}`}}>
                  last sent {fmtAge(lastSent.ts)}
                </span>
              )}
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={testSMS} disabled={testing}
              style={{...mono(9),background:"rgba(42,106,58,0.15)",border:"1px solid rgba(42,106,58,0.35)",color:S.greenText,padding:"7px 13px",cursor:"pointer"}}>
              {testing ? "Sending…" : "📱 Test SMS"}
            </button>
            <a href="/api/ops/test-sms" target="_blank" rel="noopener noreferrer"
              style={{...mono(8),padding:"7px 13px",background:"transparent",border:`1px solid ${S.border}`,color:S.muted,textDecoration:"none",cursor:"pointer"}}>
              🔍 Diagnostic
            </a>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div style={{padding:"8px 16px",borderBottom:`1px solid ${S.border}`,background:testResult.sent?"rgba(34,197,94,.06)":"rgba(184,64,64,.06)"}}>
            <span style={{...mono(9),color:testResult.sent?"#22c55e":"#ef4444"}}>
              {testResult.sent
                ? `✓ SMS sent · SID: ${testResult.twilio_sid} · Status: ${testResult.twilio_status}`
                : `✕ Failed · Code: ${testResult.twilio_code ?? "—"} · ${testResult.twilio_error ?? "unknown"}`
              }
            </span>
          </div>
        )}

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",borderBottom:`1px solid ${S.border}`}}>
          {[
            {label:"Total SMS Events", v:allSmsLogs.length,  c:S.text},
            {label:"Sent",             v:sentSms.length,     c:"#22c55e"},
            {label:"Failed",           v:failedSms.length,   c:failedSms.length>0?"#ef4444":S.muted},
            {label:"Skipped",          v:skippedSms.length,  c:"#60a5fa"},
            {label:"Send Rate",        v:successRate!=null?`${successRate}%`:"—", c:successRate!=null&&successRate>=90?"#22c55e":successRate!=null&&successRate>=50?"#e0a830":"#ef4444"},
          ].map((s,i)=>(
            <div key={s.label} style={{padding:"10px 14px",borderRight:i<4?`1px solid ${S.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div>
                <div style={{fontFamily:"var(--font-bebas)",fontSize:20,color:s.c,letterSpacing:"0.04em",lineHeight:1}}>{s.v}</div>
                <div style={{...mono(7),color:S.muted,marginTop:3}}>{s.label}</div>
              </div>
              {i===0 && <Spark />}
            </div>
          ))}
        </div>

        {/* Config strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${S.border}`}}>
          {[
            ["Account SID",   "Set ✓",         "#22c55e"],
            ["From",          "+12062036281",   S.gold  ],
            ["Alert To",      "+12066016076",   S.gold  ],
            ["Quiet Hours",   "11pm–7am UTC",   S.muted ],
          ].map(([k,v,c],i)=>(
            <div key={k} style={{padding:"8px 14px",borderRight:i<3?`1px solid ${S.border}`:"none"}}>
              <div style={{...mono(7),color:S.muted,marginBottom:2}}>{k}</div>
              <div style={{...mono(9),color:c as string}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${S.border}`,flexWrap:"wrap",gap:0}}>
          {([["all","All",allSmsLogs.length,S.gold],["sent","Sent",sentSms.length,"#22c55e"],["failed","Failed",failedSms.length,"#ef4444"],["skipped","Skipped",skippedSms.length,"#60a5fa"]] as const).map(([id,label,count,color])=>(
            <button key={id} onClick={()=>setSmsTab(id as any)}
              style={{...mono(9),padding:"8px 16px",background:smsTab===id?S.bg3:"transparent",
                border:"none",borderBottom:smsTab===id?`2px solid ${S.gold}`:"2px solid transparent",
                color:smsTab===id?S.gold:S.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              {label}
              <span style={{fontSize:9,padding:"1px 5px",background:S.bg3,color:smsTab===id?(color as string):S.muted}}>{count}</span>
            </button>
          ))}
          <input value={smsSearch} onChange={e=>setSmsSearch(e.target.value)}
            placeholder="filter…"
            style={{...mono(8),marginLeft:"auto",marginRight:12,width:130,background:S.bg3,
              border:`1px solid ${S.border}`,color:S.text,padding:"4px 8px",outline:"none"}} />
        </div>

        {/* SMS Log table */}
        <div>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:"110px 70px 100px 1fr 60px 24px",padding:"5px 12px",
            background:"#0a0a0c",borderBottom:`1px solid ${S.border}`}}>
            {["Timestamp","Status","Job","Message / Detail","Latency",""].map(h=>(
              <div key={h} style={{...mono(7),color:S.muted}}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{maxHeight:360,overflowY:"auto"}}>
            {smsFiltered.length === 0 ? (
              <div style={{...mono(9),color:S.muted,padding:"28px 0",textAlign:"center"}}>
                {allSmsLogs.length === 0 ? "No SMS events yet — click Test SMS to verify." : `No ${smsTab} events${smsSearch?` matching "${smsSearch}"`:""}` }
              </div>
            ) : smsFiltered.map((l:any) => {
              const isExp = expanded === l.id;
              const c = classify(l);
              return (
                <React.Fragment key={l.id}>
                  <div onClick={()=>setExpanded(isExp?null:l.id)}
                    style={{display:"grid",gridTemplateColumns:"110px 70px 100px 1fr 60px 24px",
                      padding:"7px 12px",borderBottom:`1px solid ${S.border}`,
                      background:isExp?"#0d0d0f":rowBg(l.level),
                      cursor:"pointer",alignItems:"center"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.filter="brightness(1.12)"}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.filter="none"}}>
                    <div style={{...mono(8),color:S.muted}} title={fmtTime(l.ts)}>{fmtAge(l.ts)}</div>
                    <SmsStatusBadge log={l} />
                    <div style={{...mono(8),color:S.gold,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.job}</div>
                    <div style={{fontSize:11,color:c==="sent"?S.text:c==="skipped"?"#60a5fa":"#e08080",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                      title={l.message}>
                      {l.message}
                    </div>
                    <div style={{...mono(8),color:S.muted}}>{l.duration ? `${l.duration}ms` : "—"}</div>
                    <div style={{...mono(8),color:S.muted,textAlign:"right"}}>{isExp?"▲":"▼"}</div>
                  </div>
                  {isExp && (
                    <div style={{background:"#060a0f",borderBottom:`1px solid ${S.border}`,
                      padding:"10px 14px 12px",fontSize:10,lineHeight:1.9}}>
                      <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:"3px 12px"}}>
                        {[
                          ["Timestamp",    fmtTime(l.ts)],
                          ["Level",        l.level],
                          ["Job",          l.job],
                          ["Full Message", l.message ?? "—"],
                          l.detail ? ["Detail", l.detail] : null,
                          l.meta?.twilio_sid    ? ["Twilio SID",    l.meta.twilio_sid]    : null,
                          l.meta?.twilio_status ? ["Twilio Status", l.meta.twilio_status] : null,
                          l.meta?.http_status   ? ["HTTP Status",   String(l.meta.http_status)] : null,
                          l.meta?.twilio_code   ? ["Twilio Error",  `${l.meta.twilio_code}${l.meta.twilio_code===30034?" — Toll-free verification required":l.meta.twilio_code===21608?" — Number not verified":""}`] : null,
                          l.meta?.from_number   ? ["From",          l.meta.from_number]   : null,
                          l.meta?.to_number     ? ["To",            l.meta.to_number]     : null,
                          ["Event ID",     l.id ?? "—"],
                        ].filter(Boolean).map(([k,v]:any)=>(
                          <React.Fragment key={k}>
                            <span style={{...mono(8),color:S.muted}}>{k}</span>
                            <span style={{fontSize:10,color:k==="Full Message"||k==="Detail"?S.text:k.includes("Error")||k==="HTTP Status"&&parseInt(v)>=400?"#e08080":k==="Twilio SID"||k==="Twilio Status"?"#22c55e":S.muted,
                              wordBreak:"break-all",whiteSpace:"pre-wrap"}}>{v}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      {/* ══ END SMS PANEL ══ */}

      {/* ── Health cards ── */}
      {health?.checks && (
        <div style={{marginBottom:20}}>
          <div style={{...mono(9),color:S.gold,marginBottom:8}}>// System Health — {health.status?.toUpperCase()} · v{health.version}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
            {health.checks.map((c:any)=>(
              <div key={c.name} style={{background:S.card,border:`1px solid ${sc(c.status)}33`,padding:"12px 14px"}}>
                <div style={{...mono(8),color:S.muted,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"var(--font-bebas)",fontSize:18,color:sc(c.status),letterSpacing:"0.06em"}}>{c.status?.toUpperCase()}</span>
                  {c.latency&&<span style={{...mono(8),color:S.muted}}>{c.latency}ms</span>}
                </div>
                {c.detail&&<div style={{fontSize:10,color:S.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.detail}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cron schedule ── */}
      <div style={{marginBottom:20}}>
        <div style={{...mono(9),color:S.gold,marginBottom:8}}>// Vercel Cron Schedule</div>
        <div style={{border:`1px solid ${S.border}`}}>
          {[
            {job:"Product Sync", sched:"Hourly",    path:"/api/ops/sync-products", note:"Revalidates Next.js ISR cache from Shopify/Printify"},
            {job:"Health Check", sched:"Every 15m", path:"/api/ops/health?alert=1", note:"Checks all APIs · SMS after 3 consecutive failures"},
          ].map((r,i)=>(
            <div key={r.job} style={{display:"grid",gridTemplateColumns:"120px 80px 220px 1fr",padding:"10px 14px",background:S.card,borderTop:i>0?`1px solid ${S.border}`:"none",alignItems:"center",gap:8}}>
              <div style={{fontFamily:"var(--font-bebas)",fontSize:13,letterSpacing:"0.06em",color:S.text}}>{r.job}</div>
              <div style={{...mono(9),color:S.gold}}>{r.sched}</div>
              <div style={{...mono(9),color:"#8888dd"}}>{r.path}</div>
              <div style={{fontSize:12,color:S.muted}}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full ops log ── */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
          <div style={{...mono(9),color:S.gold}}>
            // Full Operations Log — {opsFiltered.length}/{logs.length} events
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <input value={logSearch} onChange={e=>setLogSearch(e.target.value)}
              placeholder="search…"
              style={{...mono(8),width:120,background:S.bg3,border:`1px solid ${S.border}`,color:S.text,padding:"4px 8px",outline:"none"}} />
            {[...LEVEL_FILTERS,...JOB_FILTERS].map(f=>(
              <button key={f} onClick={()=>setLogFilter(f)}
                style={{...mono(7),padding:"3px 7px",background:logFilter===f?S.goldDim:"transparent",border:`1px solid ${logFilter===f?S.goldBorder:S.border}`,color:logFilter===f?S.gold:S.muted,cursor:"pointer"}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{border:`1px solid ${S.border}`,maxHeight:520,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"150px 65px 120px 1fr 55px",background:"#0a0a0c",padding:"6px 12px",borderBottom:`1px solid ${S.border}`,position:"sticky",top:0,zIndex:2}}>
            {["Timestamp","Level","Job","Message + Detail","ms"].map(h=>(
              <div key={h} style={{...mono(8),color:S.muted}}>{h}</div>
            ))}
          </div>

          {opsFiltered.length===0 && !loading && (
            <div style={{...mono(9),color:S.muted,padding:"28px 0",textAlign:"center"}}>
              {logFilter==="all" ? "No events yet." : `No events matching "${logFilter}"`}
            </div>
          )}

          {opsFiltered.map((log:any)=>(
            <div key={log.id}
              style={{display:"grid",gridTemplateColumns:"150px 65px 120px 1fr 55px",padding:"7px 12px",borderBottom:`1px solid ${S.border}`,background:rowBg(log.level),alignItems:"start"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.filter="brightness(1.15)"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.filter="none"}}
            >
              <div style={{...mono(8),color:S.muted,lineHeight:1.5}}>
                {new Date(log.ts).toLocaleTimeString()}<br/>
                <span style={{opacity:.5}}>{new Date(log.ts).toLocaleDateString()}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{...mono(9),color:lc(log.level)}}>{li(log.level)}</span>
                <span style={{...mono(8),color:lc(log.level)}}>{log.level}</span>
              </div>
              <div style={{...mono(9),color:S.gold,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.job}</div>
              <div>
                <div style={{fontSize:11,color:S.text,lineHeight:1.4}}>{log.message}</div>
                {log.detail && <div style={{fontSize:10,color:S.muted,fontFamily:"monospace",marginTop:2,wordBreak:"break-all"}}>{log.detail}</div>}
              </div>
              <div style={{...mono(8),color:S.muted}}>{log.duration ? `${log.duration}ms` : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes drPulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
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
