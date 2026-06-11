"use client";
import { useState, useEffect, useCallback } from "react";

const S = {
  bg:"#09090B", bg2:"#111113", bg3:"#1A1A1D", card:"#141416",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.1)", goldBorder:"rgba(200,146,42,0.3)",
  text:"#F0EDE8", muted:"#888", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.15)", green:"#2a6a3a", greenText:"#6adb8a",
};

const TABS = ["Products","Orders","Collections","Store Info"] as const;
type Tab = typeof TABS[number];

// ── Shared helpers ────────────────────────────────────────────────────
function mono(size=10, extra={}) { return { fontFamily:"var(--font-mono)", fontSize:`${size}px`, letterSpacing:"0.12em", textTransform:"uppercase" as const, ...extra }; }
function label(text: string) { return <div style={{ ...mono(9), color:S.muted, marginBottom:6 }}>{text}</div>; }
function Divider() { return <div style={{ height:1, background:S.border, margin:"20px 0" }} />; }
function Badge({ status }: { status: string }) {
  const map: Record<string,{bg:string,text:string,border:string}> = {
    active:   { bg:"rgba(42,106,58,0.25)",  text:S.greenText, border:"#3a8a4a" },
    draft:    { bg:"rgba(80,80,80,0.25)",   text:S.muted,     border:"#555" },
    archived: { bg:"rgba(80,40,40,0.25)",   text:"#e08080",   border:"#804040" },
    paid:     { bg:"rgba(42,106,58,0.25)",  text:S.greenText, border:"#3a8a4a" },
    pending:  { bg:"rgba(180,120,20,0.25)", text:"#e0a830",   border:"#b07020" },
    refunded: { bg:"rgba(80,80,180,0.25)",  text:"#9090e0",   border:"#5050a0" },
    fulfilled:{ bg:"rgba(42,106,58,0.25)",  text:S.greenText, border:"#3a8a4a" },
    unfulfilled:{ bg:"rgba(180,120,20,0.25)", text:"#e0a830", border:"#b07020" },
  };
  const c = map[status?.toLowerCase()] ?? { bg:S.bg3, text:S.muted, border:S.border };
  return <span style={{ ...mono(9), padding:"3px 8px", background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{status ?? "—"}</span>;
}

// ── Main component ────────────────────────────────────────────────────
export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("Products");
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg:string, type:"ok"|"err"="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  };

  const api = useCallback(async (params: Record<string,string>) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/admin?${qs}`, { headers:{"x-admin-key":key}, cache:"no-store" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }, [key]);

  const post = useCallback(async (body: any) => {
    const res = await fetch("/api/admin", { method:"POST", headers:{"x-admin-key":key,"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }, [key]);

  const login = () => { if (!key.trim()) return; setAuthed(true); localStorage.setItem("dr_shop_admin", key); };

  useEffect(()=>{ const s = localStorage.getItem("dr_shop_admin"); if(s){setKey(s);setAuthed(true);} },[]);

  if (!authed) return <LoginScreen keyVal={key} setKey={setKey} login={login} />;

  return (
    <div style={{ minHeight:"100vh", background:S.bg, fontFamily:"var(--font-sans)" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div style={{ background:S.bg2, borderBottom:`1px solid ${S.border}`, padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <a href="/" style={{ fontFamily:"var(--font-bebas)", fontSize:20, letterSpacing:"0.1em", color:S.text, textDecoration:"none" }}>
            DOWN <span style={{color:S.gold}}>RANGE</span>
          </a>
          <span style={{ ...mono(10), color:S.muted }}>/ ADMIN</span>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <a href="/products" target="_blank" style={{ ...mono(10), color:S.muted, textDecoration:"none" }}>View Store ↗</a>
          <button onClick={()=>{setAuthed(false);localStorage.removeItem("dr_shop_admin");}} style={{ ...mono(10), background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:"6px 12px", cursor:"pointer" }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:S.bg3, borderBottom:`1px solid ${S.border}`, padding:"0 32px", display:"flex" }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ ...mono(11), padding:"16px 20px", background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?S.gold:"transparent"}`, color:tab===t?S.gold:S.muted, cursor:"pointer", transition:"color 0.15s" }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"28px 32px", maxWidth:1300, margin:"0 auto" }}>
        {tab==="Products"    && <ProductsTab api={api} post={post} showToast={showToast} />}
        {tab==="Orders"      && <OrdersTab   api={api} post={post} showToast={showToast} />}
        {tab==="Collections" && <CollectionsTab api={api} />}
        {tab==="Store Info"  && <StoreInfoTab api={api} />}
      </div>

      <style>{`input,textarea,select{outline:none;} input::placeholder,textarea::placeholder{color:#555;} *{box-sizing:border-box;}`}</style>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────
function LoginScreen({keyVal,setKey,login}:{keyVal:string;setKey:(v:string)=>void;login:()=>void}) {
  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:S.bg2, border:`1px solid ${S.border}`, padding:48, width:380 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:28, letterSpacing:"0.1em", marginBottom:4 }}>DOWN <span style={{color:S.gold}}>RANGE</span> CO.</div>
        <div style={{ ...mono(10), color:S.muted, marginBottom:32 }}>Store Admin</div>
        <input type="password" placeholder="Admin key" value={keyVal} onChange={e=>setKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          style={{ width:"100%", background:S.bg3, border:`1px solid ${S.border}`, color:S.text, ...mono(12, {padding:"12px 14px", marginBottom:12, display:"block", letterSpacing:"0.06em"}) }} />
        <button onClick={login} style={{ width:"100%", background:S.gold, color:S.bg, ...mono(12, {padding:14, border:"none", cursor:"pointer", fontWeight:700}) }}>Enter Admin →</button>
        <div style={{ ...mono(9), color:S.muted, marginTop:14, textAlign:"center" }}>Default: <span style={{color:S.gold}}>drco-admin-2026</span></div>
      </div>
    </div>
  );
}

function Toast({msg,type}:{msg:string;type:"ok"|"err"}) {
  return <div style={{ position:"fixed", top:16, right:16, zIndex:9999, background:type==="ok"?S.green:S.red, color:"#fff", ...mono(11, {padding:"12px 20px", border:`1px solid ${type==="ok"?"#3a8a4a":"#d05050"}`}) }}>{msg}</div>;
}

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════
function ProductsTab({api,post,showToast}:any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [search,  setSearch]    = useState("");
  const [editing, setEditing]   = useState<any|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await api({action:"products"}); setProducts(d.products??[]); }
    catch(e:any) { showToast(e.message,"err"); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(()=>{load();},[load]);

  const filtered = products.filter(p=>!search||p.title.toLowerCase().includes(search.toLowerCase()));

  if (editing) return <ProductEditor product={editing} post={post} showToast={showToast} onBack={()=>{setEditing(null);load();}} />;

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:36, letterSpacing:"0.06em" }}>
            PRODUCTS <span style={{color:S.gold}}>{products.length>0?`(${products.length})`:""}</span>
          </div>
          <div style={{ ...mono(9), color:S.muted }}>Manage your Shopify product catalog</div>
        </div>
        <input placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ background:S.bg3, border:`1px solid ${S.border}`, color:S.text, ...mono(11,{padding:"10px 14px",width:260,letterSpacing:"0.06em"}) }} />
      </div>

      {loading && <LoadingBar />}

      {/* Table header */}
      <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 100px 120px 80px 160px", gap:0, background:S.bg3, borderBottom:`1px solid ${S.border}`, padding:"8px 16px" }}>
        {["","Product","Type","Status","Variants","Actions"].map(h=>(
          <div key={h} style={{ ...mono(9), color:S.muted }}>{h}</div>
        ))}
      </div>

      {filtered.length===0 && !loading && (
        <div style={{ ...mono(11), color:S.muted, padding:"40px 0", textAlign:"center" }}>No products found.</div>
      )}

      {filtered.map(p=>(
        <ProductRow key={p.id} product={p} onEdit={()=>setEditing(p)}
          onPublish={async()=>{
            try{ await post({action:"publish_product",id:p.id}); showToast(`Published: ${p.title}`); load(); }
            catch(e:any){showToast(e.message,"err");}
          }}
          onUnpublish={async()=>{
            try{ await post({action:"unpublish_product",id:p.id}); showToast(`Drafted: ${p.title}`); load(); }
            catch(e:any){showToast(e.message,"err");}
          }}
          onDelete={async()=>{
            if(!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
            try{ await post({action:"delete_product",id:p.id}); showToast(`Deleted`,`err`); load(); }
            catch(e:any){showToast(e.message,"err");}
          }}
        />
      ))}
    </>
  );
}

function ProductRow({product:p,onEdit,onPublish,onUnpublish,onDelete}:any) {
  const img = p.images?.[0]?.src;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 100px 120px 80px 160px", gap:0, background:S.card, borderBottom:`1px solid ${S.border}`, padding:"10px 16px", alignItems:"center", transition:"background 0.15s" }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#1a1a1c"}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
      <div style={{ width:40, height:40, background:S.bg3, overflow:"hidden", flexShrink:0 }}>
        {img && <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />}
      </div>
      <div style={{ paddingRight:12 }}>
        <div style={{ fontSize:13, fontWeight:500, color:S.text, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.title}</div>
        <div style={{ ...mono(9), color:S.muted }}>{p.vendor}</div>
      </div>
      <div style={{ ...mono(9), color:S.muted }}>{p.product_type||"—"}</div>
      <div><Badge status={p.status} /></div>
      <div style={{ ...mono(10), color:S.muted }}>{p.variants?.length??0}</div>
      <div style={{ display:"flex", gap:6 }}>
        <Btn onClick={onEdit} color="gold">Edit</Btn>
        {p.status==="active" ? <Btn onClick={onUnpublish}>Draft</Btn> : <Btn onClick={onPublish} color="gold">Publish</Btn>}
        <Btn onClick={onDelete} color="red">Del</Btn>
      </div>
    </div>
  );
}

// ── Full product editor ───────────────────────────────────────────────
function ProductEditor({product:initial,post,showToast,onBack}:any) {
  const [p, setP] = useState({...initial});
  const [saving, setSaving] = useState(false);
  const [activeVariant, setActiveVariant] = useState<any|null>(null);

  const save = async () => {
    setSaving(true);
    try {
      await post({ action:"update_product", id:p.id, data:{ title:p.title, body_html:p.body_html, product_type:p.product_type, vendor:p.vendor, tags:p.tags, status:p.status } });
      showToast("Product saved ✓");
    } catch(e:any) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  const saveVariant = async (v:any) => {
    setSaving(true);
    try {
      await post({ action:"update_variant", id:p.id, variantId:v.id, data:{ price:v.price, compare_at_price:v.compare_at_price, sku:v.sku, inventory_quantity:v.inventory_quantity } });
      showToast("Variant saved ✓");
      setActiveVariant(null);
    } catch(e:any) { showToast(e.message,"err"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Editor header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${S.border}`, color:S.muted, ...mono(10,{padding:"7px 12px",cursor:"pointer"}), transition:"all 0.15s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
          ← Back to Products
        </button>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:28, letterSpacing:"0.06em", flex:1 }}>
          Editing: <span style={{color:S.gold}}>{p.title}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Badge status={p.status} />
          <button onClick={save} disabled={saving} style={{ background:S.gold, color:S.bg, ...mono(11,{padding:"9px 20px",border:"none",cursor:"pointer",fontWeight:700}) }}>
            {saving?"Saving...":"Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24 }}>

        {/* Left — main fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Title */}
          <Field label="Product Title">
            <input value={p.title} onChange={e=>setP({...p,title:e.target.value})} style={inputStyle} />
          </Field>

          {/* Description */}
          <Field label="Description (HTML)">
            <textarea value={p.body_html??""} onChange={e=>setP({...p,body_html:e.target.value})} rows={10}
              style={{ ...inputStyle, resize:"vertical", fontFamily:"monospace", fontSize:12, lineHeight:1.5 }} />
            <div style={{ ...mono(9), color:S.muted, marginTop:4 }}>HTML is supported. Use &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt; etc.</div>
          </Field>

          {/* Description preview */}
          {p.body_html && (
            <Field label="Preview">
              <div style={{ background:S.bg3, border:`1px solid ${S.border}`, padding:16, fontSize:13, color:S.muted, lineHeight:1.7 }} dangerouslySetInnerHTML={{__html:p.body_html}} />
            </Field>
          )}

          {/* Variants table */}
          <Field label={`Variants (${p.variants?.length??0})`}>
            <div style={{ border:`1px solid ${S.border}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 80px", background:S.bg3, padding:"8px 12px" }}>
                {["Title","Price","Compare","SKU","Actions"].map(h=>(
                  <div key={h} style={{ ...mono(9), color:S.muted }}>{h}</div>
                ))}
              </div>
              {p.variants?.map((v:any)=>(
                <div key={v.id}>
                  {activeVariant?.id===v.id ? (
                    <VariantEditor variant={activeVariant} setVariant={setActiveVariant} onSave={()=>saveVariant(activeVariant)} onCancel={()=>setActiveVariant(null)} saving={saving} />
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 80px", padding:"10px 12px", borderTop:`1px solid ${S.border}`, alignItems:"center" }}>
                      <div style={{ fontSize:12, color:S.text }}>{v.title}</div>
                      <div style={{ ...mono(11), color:S.gold }}>${v.price}</div>
                      <div style={{ ...mono(10), color:S.muted }}>{v.compare_at_price?`$${v.compare_at_price}`:"—"}</div>
                      <div style={{ ...mono(10), color:S.muted }}>{v.sku||"—"}</div>
                      <Btn onClick={()=>setActiveVariant({...v})} color="gold">Edit</Btn>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Field>

          {/* Images */}
          {p.images?.length>0 && (
            <Field label={`Images (${p.images.length})`}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {p.images.map((img:any,i:number)=>(
                  <div key={img.id||i} style={{ width:80, height:80, background:S.bg3, border:`1px solid ${S.border}`, overflow:"hidden" }}>
                    <img src={img.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  </div>
                ))}
              </div>
            </Field>
          )}
        </div>

        {/* Right — sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Status */}
          <SideCard title="Status">
            <select value={p.status} onChange={e=>setP({...p,status:e.target.value})} style={{ ...inputStyle, cursor:"pointer" }}>
              <option value="active">Active (Published)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </SideCard>

          {/* Organization */}
          <SideCard title="Organization">
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                {label("Product Type")}
                <input value={p.product_type??""} onChange={e=>setP({...p,product_type:e.target.value})} style={inputStyle} placeholder="e.g. T-Shirt" />
              </div>
              <div>
                {label("Vendor")}
                <input value={p.vendor??""} onChange={e=>setP({...p,vendor:e.target.value})} style={inputStyle} placeholder="e.g. Printify" />
              </div>
              <div>
                {label("Tags (comma separated)")}
                <input value={p.tags??""} onChange={e=>setP({...p,tags:e.target.value})} style={inputStyle} placeholder="hunting, 2a, rifle" />
              </div>
            </div>
          </SideCard>

          {/* Handle */}
          <SideCard title="URL Handle">
            <div style={{ ...mono(10), color:S.muted, padding:"8px 0" }}>/products/{p.handle}</div>
            <a href={`/products/${p.handle}`} target="_blank" style={{ ...mono(9), color:S.gold, textDecoration:"none" }}>Preview in store ↗</a>
          </SideCard>

          {/* Save button */}
          <button onClick={save} disabled={saving} style={{ background:S.gold, color:S.bg, ...mono(12,{padding:14,border:"none",cursor:"pointer",fontWeight:700,width:"100%"}) }}>
            {saving?"Saving...":"Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantEditor({variant:v,setVariant,onSave,onCancel,saving}:any) {
  return (
    <div style={{ background:S.bg3, borderTop:`1px solid ${S.border}`, padding:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        {[["Price","price"],["Compare At","compare_at_price"],["SKU","sku"]].map(([lbl,key])=>(
          <div key={key}>
            {label(lbl)}
            <input value={v[key]??""} onChange={e=>setVariant({...v,[key]:e.target.value})} style={{ ...inputStyle, fontSize:12 }} />
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onSave} disabled={saving} style={{ background:S.gold, color:S.bg, ...mono(10,{padding:"7px 14px",border:"none",cursor:"pointer",fontWeight:700}) }}>
          {saving?"Saving...":"Save Variant"}
        </button>
        <button onClick={onCancel} style={{ background:"transparent", border:`1px solid ${S.border}`, color:S.muted, ...mono(10,{padding:"7px 14px",cursor:"pointer"}) }}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ══════════════════════════════════════════════════════════════════════
function OrdersTab({api,post,showToast}:any) {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected,setSelected]= useState<any|null>(null);

  const load = useCallback(async()=>{
    setLoading(true);
    try { const d = await api({action:"orders"}); setOrders(d.orders??[]); }
    catch(e:any){showToast(e.message,"err");}
    finally{setLoading(false);}
  },[api]);

  useEffect(()=>{load();},[load]);

  if (selected) return <OrderDetail order={selected} onBack={()=>setSelected(null)} />;

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:36, letterSpacing:"0.06em" }}>
          ORDERS <span style={{color:S.gold}}>{orders.length>0?`(${orders.length})`:""}</span>
        </div>
        <div style={{ ...mono(9), color:S.muted }}>Customer orders from your Shopify store</div>
      </div>

      {loading && <LoadingBar />}

      <div style={{ border:`1px solid ${S.border}` }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 160px 100px 120px 100px 80px", background:S.bg3, padding:"8px 16px" }}>
          {["Order","Customer","Date","Total","Payment","Fulfillment",""].map(h=>(
            <div key={h} style={{ ...mono(9), color:S.muted }}>{h}</div>
          ))}
        </div>

        {orders.length===0 && !loading && (
          <div style={{ ...mono(11), color:S.muted, padding:"40px 0", textAlign:"center" }}>No orders yet.</div>
        )}

        {orders.map(o=>(
          <div key={o.id} style={{ display:"grid", gridTemplateColumns:"100px 1fr 160px 100px 120px 100px 80px", padding:"12px 16px", borderTop:`1px solid ${S.border}`, alignItems:"center", background:S.card, cursor:"pointer", transition:"background 0.15s" }}
            onClick={()=>setSelected(o)}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#1a1a1c"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=S.card}>
            <div style={{ ...mono(11), color:S.gold }}>{o.name}</div>
            <div>
              <div style={{ fontSize:13, color:S.text }}>{o.email||"—"}</div>
              <div style={{ ...mono(9), color:S.muted }}>{o.shipping_address?.city}, {o.shipping_address?.province_code}</div>
            </div>
            <div style={{ ...mono(10), color:S.muted }}>{new Date(o.created_at).toLocaleDateString()}</div>
            <div style={{ ...mono(12), color:S.gold, fontWeight:600 }}>${parseFloat(o.total_price||0).toFixed(2)}</div>
            <Badge status={o.financial_status} />
            <Badge status={o.fulfillment_status||"unfulfilled"} />
            <Btn onClick={(e:any)=>{e.stopPropagation();setSelected(o);}}>View</Btn>
          </div>
        ))}
      </div>
    </>
  );
}

function OrderDetail({order:o,onBack}:any) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${S.border}`, color:S.muted, ...mono(10,{padding:"7px 12px",cursor:"pointer"}) }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
          ← Back to Orders
        </button>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:28, letterSpacing:"0.06em" }}>
          Order <span style={{color:S.gold}}>{o.name}</span>
        </div>
        <Badge status={o.financial_status} />
        <Badge status={o.fulfillment_status||"unfulfilled"} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Line items */}
          <SideCard title="Items Ordered">
            {o.line_items?.map((item:any)=>(
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${S.border}` }}>
                <div>
                  <div style={{ fontSize:13, color:S.text, fontWeight:500 }}>{item.title}</div>
                  <div style={{ ...mono(9), color:S.muted }}>{item.variant_title} · Qty: {item.quantity}</div>
                </div>
                <div style={{ ...mono(12), color:S.gold, fontWeight:600 }}>${parseFloat(item.price).toFixed(2)}</div>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
              <div style={{ ...mono(13), color:S.gold, fontWeight:700 }}>Total: ${parseFloat(o.total_price||0).toFixed(2)}</div>
            </div>
          </SideCard>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Customer */}
          <SideCard title="Customer">
            <div style={{ fontSize:13, color:S.text, marginBottom:4 }}>{o.email}</div>
            {o.shipping_address && (
              <div style={{ ...mono(10), color:S.muted, lineHeight:1.7 }}>
                {o.shipping_address.name}<br/>
                {o.shipping_address.address1}<br/>
                {o.shipping_address.city}, {o.shipping_address.province_code} {o.shipping_address.zip}<br/>
                {o.shipping_address.country}
              </div>
            )}
          </SideCard>

          {/* Summary */}
          <SideCard title="Summary">
            {[
              ["Order #", o.name],
              ["Date", new Date(o.created_at).toLocaleString()],
              ["Payment", o.financial_status],
              ["Fulfillment", o.fulfillment_status||"unfulfilled"],
              ["Total", `$${parseFloat(o.total_price||0).toFixed(2)}`],
            ].map(([k,v])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${S.border}` }}>
                <span style={{ ...mono(9), color:S.muted }}>{k}</span>
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
function CollectionsTab({api}:any) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    setLoading(true);
    api({action:"collections"}).then((d:any)=>setCollections(d.collections??[])).catch(()=>{}).finally(()=>setLoading(false));
  },[api]);

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:36, letterSpacing:"0.06em" }}>
          COLLECTIONS <span style={{color:S.gold}}>{collections.length>0?`(${collections.length})`:""}</span>
        </div>
        <div style={{ ...mono(9), color:S.muted }}>Your Shopify product collections</div>
      </div>
      {loading && <LoadingBar />}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {collections.map((c:any)=>(
          <div key={c.id} style={{ background:S.card, border:`1px solid ${S.border}`, padding:20, transition:"border-color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=S.border}>
            {c.image?.src && <img src={c.image.src} alt="" style={{ width:"100%", height:120, objectFit:"cover", marginBottom:12 }} />}
            <div style={{ fontFamily:"var(--font-bebas)", fontSize:20, letterSpacing:"0.06em", color:S.text, marginBottom:4 }}>{c.title}</div>
            <div style={{ ...mono(9), color:S.muted, marginBottom:12 }}>{c.products_count} products · /collections/{c.handle}</div>
            <a href={`/collections/${c.handle}`} target="_blank" style={{ ...mono(9), color:S.gold, textDecoration:"none" }}>View in store ↗</a>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STORE INFO TAB
// ══════════════════════════════════════════════════════════════════════
function StoreInfoTab({api}:any) {
  const [shop,    setShop]    = useState<any|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    setLoading(true);
    api({action:"shop"}).then(setShop).catch(()=>{}).finally(()=>setLoading(false));
  },[api]);

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:36, letterSpacing:"0.06em" }}>
          STORE <span style={{color:S.gold}}>INFO</span>
        </div>
        <div style={{ ...mono(9), color:S.muted }}>Your connected Shopify store</div>
      </div>
      {loading && <LoadingBar />}
      {shop && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <SideCard title="Store Details">
            {[
              ["Name",     shop.name],
              ["Domain",   shop.domain],
              ["Email",    shop.email],
              ["Currency", shop.currency],
              ["Plan",     shop.plan_display_name],
              ["Country",  shop.country_name],
              ["Timezone", shop.timezone],
            ].map(([k,v])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${S.border}` }}>
                <span style={{ ...mono(9), color:S.muted }}>{k}</span>
                <span style={{ fontSize:12, color:S.text, fontWeight:500 }}>{v||"—"}</span>
              </div>
            ))}
          </SideCard>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <SideCard title="Quick Links">
              {[
                ["Shopify Admin",    `https://${shop.myshopify_domain}/admin`],
                ["Products",        `https://${shop.myshopify_domain}/admin/products`],
                ["Orders",          `https://${shop.myshopify_domain}/admin/orders`],
                ["Printify App",    "https://printify.com/app/dashboard"],
                ["Live Store",      "https://shop.downrangeco.com"],
                ["DownRange Portal","https://downrangeco.com"],
              ].map(([lbl,href])=>(
                <a key={lbl as string} href={href as string} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${S.border}`, textDecoration:"none", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=S.gold}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=""}>
                  <span style={{ fontSize:12, color:S.text }}>{lbl}</span>
                  <span style={{ ...mono(9), color:S.muted }}>↗</span>
                </a>
              ))}
            </SideCard>
          </div>
        </div>
      )}
    </>
  );
}

// ── Shared UI pieces ──────────────────────────────────────────────────
function Btn({onClick,color,children,disabled}:any) {
  const colors = { gold:{bg:S.goldDim,border:S.goldBorder,text:S.gold}, red:{bg:S.redDim,border:"rgba(184,64,64,0.4)",text:"#e08080"}, default:{bg:"transparent",border:S.border,text:S.muted} };
  const c = colors[color as keyof typeof colors]??colors.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...mono(9,{padding:"6px 10px",cursor:"pointer",border:`1px solid ${c.border}`,background:c.bg,color:c.text,transition:"all 0.15s",whiteSpace:"nowrap"}) }}>
      {children}
    </button>
  );
}
function Field({label:lbl,children}:{label:string;children:React.ReactNode}) {
  return <div><div style={{ ...mono(9), color:S.muted, marginBottom:6 }}>{lbl}</div>{children}</div>;
}
function SideCard({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{ background:S.card, border:`1px solid ${S.border}`, padding:20 }}>
      <div style={{ ...mono(10), color:S.gold, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );
}
function LoadingBar() {
  return <div style={{ height:2, background:S.gold, marginBottom:16, animation:"pulse 1s infinite" }} />;
}
const inputStyle = { width:"100%", background:S.bg3, border:`1px solid ${S.border}`, color:S.text, padding:"9px 12px", fontSize:13, fontFamily:"var(--font-sans)" } as const;
