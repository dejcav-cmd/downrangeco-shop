"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const S = {
  bg:"#09090B", bg2:"#111113", bg3:"#1A1A1D", card:"#141416",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.1)", goldBorder:"rgba(200,146,42,0.3)",
  text:"#F0EDE8", muted:"#777", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.12)", greenText:"#6adb8a",
};

function mono(s=10){ return { fontFamily:"var(--font-mono)", fontSize:`${s}px`, letterSpacing:"0.11em", textTransform:"uppercase" as const }; }

// ── Page definitions with default content ────────────────────────────
const PAGE_DEFAULTS: Record<string, PageContent> = {
  "sizing-guide": {
    eyebrow: "// Gear that fits",
    title: "SIZING\nGUIDE",
    subtitle: "All measurements are in inches. Measure yourself and compare before ordering — every brand runs slightly different.",
    sections: [
      { id:"s1", heading:"How to Measure", body:"Use a soft tape measure, worn against skin. Don't pull tight.\n\n**Chest** — Around the fullest part, tape horizontal under your arms.\n**Waist** — Around your natural waistline, the narrowest part of your torso.\n**Length** — From the highest point of your shoulder to where you want the hem." },
      { id:"s2", heading:"Unisex T-Shirts", body:"Most of our tees run true to size with a standard/classic fit. Sizes S through 5XL available." },
      { id:"s3", heading:"Fit Guide", body:"**Classic / Regular** — True to size. Room through chest and waist.\n**Slim Fit** — Tapered through the torso. Size up if between sizes.\n**Oversized** — Intentionally baggy. Size down for a more fitted look." },
      { id:"s4", heading:"Still Unsure?", body:"When in doubt, size up. Contact us via the contact page for specific product questions." },
    ],
  },
  "shipping-returns": {
    eyebrow: "// Know before you order",
    title: "SHIPPING &\nRETURNS",
    subtitle: "Every item is printed on demand — made specifically for your order by Printify's US print network. No inventory. No waste.",
    sections: [
      { id:"s1", heading:"Production Time", body:"Standard: 2–7 business days\nHoliday / Peak: Up to 10 business days\nExpress: 1–2 business days (select products only)" },
      { id:"s2", heading:"US Shipping", body:"Standard: 3–5 business days — Free on orders over $60\nPriority: 2–3 business days\nExpress: 1–2 business days" },
      { id:"s3", heading:"International", body:"Canada: 5–10 business days\nUK / Europe: 5–14 business days\nAustralia: 10–20 business days\nRest of World: 10–30 business days\n\nCustoms duties are the customer's responsibility." },
      { id:"s4", heading:"Returns Policy", body:"We don't accept returns for wrong size, change of mind, or buyer's remorse.\n\nWe will replace or refund items that:\n• Arrive damaged or defective\n• Are the wrong item\n• Are lost in transit (30+ days)\n\nContact us within 30 days of delivery with your order number and a photo." },
    ],
  },
  "faq": {
    eyebrow: "// Got questions?",
    title: "FREQUENTLY\nASKED.",
    subtitle: "Everything you need to know about ordering, shipping, sizing, and the brand.",
    sections: [
      { id:"s1", heading:"Orders", body:"**How long does my order take?**\nProduction takes 2–7 business days, then 3–5 days US transit. Most orders arrive in 5–12 business days total.\n\n**Can I cancel or change my order?**\nWithin 24 hours of placement if it hasn't entered production. Email support@downrangeco.com immediately.\n\n**Why can't I return my order?**\nEvery item is printed specifically for you. We don't hold inventory. We replace anything defective or incorrect." },
      { id:"s2", heading:"Sizing", body:"**How do I know what size to order?**\nCheck our Sizing Guide for full measurements. In general, our tees run true to size. When in doubt, size up.\n\n**Will my shirt shrink?**\nMost are pre-shrunk but may see 1–5% shrinkage after first wash. Cold wash, tumble dry low is safest." },
      { id:"s3", heading:"Shipping", body:"**Do you offer free shipping?**\nYes — free standard shipping on US orders over $60.\n\n**Do you ship internationally?**\nYes, to most countries. 5–30 business days depending on location.\n\n**My tracking hasn't updated.**\nTracking can take 24–48 hours after label creation. If no movement after 5 business days, contact us." },
      { id:"s4", heading:"About Down Range", body:"**Who runs Down Range Co.?**\nOne person — a daily carrier and hunter based in Washington State.\n\n**What is the DownRange portal?**\ndownrangeco.com is our companion intelligence portal — daily 2A updates, court case tracking, CCW guide for all 50 states." },
    ],
  },
  "contact": {
    eyebrow: "// We read every message",
    title: "CONTACT\nUS.",
    subtitle: "Questions about your order, sizing, or the brand. We respond within 1–2 business days.",
    sections: [
      { id:"s1", heading:"Response Time", body:"We respond to all messages within 1–2 business days. For urgent order issues, include your order number." },
      { id:"s2", heading:"Direct Email", body:"support@downrangeco.com" },
    ],
  },
  "privacy": {
    eyebrow: "// Your data, handled straight",
    title: "PRIVACY\nPOLICY",
    subtitle: "We collect only what we need to run the store. We don't sell your data. We don't run ads.",
    sections: [
      { id:"s1", heading:"What We Collect", body:"When you place an order, Shopify collects your name, email, shipping address, and payment information. We never see your full card number — payments are processed by Shopify's PCI-DSS compliant infrastructure." },
      { id:"s2", heading:"How We Use It", body:"**Order fulfillment** — Your name and address are passed to Printify to print and ship your order.\n**Account management** — Email is used for order confirmations and shipping notifications.\n**Legal compliance** — We retain transaction records as required by law." },
      { id:"s3", heading:"What We Don't Do", body:"• Sell or rent your personal information to third parties\n• Share your data with advertisers\n• Send unsolicited marketing emails without consent" },
      { id:"s4", heading:"Your Rights", body:"You can request access to, correction of, or deletion of your personal data at any time. Contact support@downrangeco.com. We'll respond within 30 days.\n\nLast updated: June 2026" },
    ],
  },
  "terms": {
    eyebrow: "// The rules of the range",
    title: "TERMS OF\nSERVICE",
    subtitle: "By using this store, you agree to these terms. They're straightforward — no fine print traps.",
    sections: [
      { id:"s1", heading:"Orders & Payment", body:"Placing an order is an offer to purchase. We reserve the right to cancel any order for pricing errors or suspected fraud. Prices are in USD. Payment processed securely by Shopify." },
      { id:"s2", heading:"Production & Shipping", body:"All products are printed on demand and fulfilled by Printify. Production takes 2–7 business days. Delivery estimates are not guarantees." },
      { id:"s3", heading:"Returns & Refunds", body:"Because every product is made to order, we don't accept returns for wrong size or change of mind. We will replace or refund items that arrive damaged, defective, or incorrect." },
      { id:"s4", heading:"Intellectual Property", body:"All designs and creative content on this site are the property of Down Range Co. or are used with permission. You may not reproduce or distribute our designs without written permission." },
      { id:"s5", heading:"Governing Law", body:"These terms are governed by the laws of the State of Washington, USA.\n\nLast updated: June 2026" },
    ],
  },
  "2a-proud": {
    eyebrow: "// Washington State · Est. 2024",
    title: "2A PROUD.\nNO APOLOGIES.",
    subtitle: "The Second Amendment isn't a privilege. It's a right — written in plain English, confirmed by the Supreme Court, and non-negotiable.",
    sections: [
      { id:"s1", heading:"The Right to Keep & Bear Arms", body:"Not just for hunting. Not just for sport. The Second Amendment was written as a check on tyranny. That's not paranoia — it's the plain reading of the text and the intent of the founders." },
      { id:"s2", heading:"Constitutional Carry", body:"Law-abiding citizens shouldn't need government permission to exercise a constitutional right. We support permitless carry nationwide and follow Washington's CPL laws until that day comes." },
      { id:"s3", heading:"Responsible Ownership", body:"Rights come with responsibility. Safe storage, proper training, knowing your target and what's beyond it. The best argument for gun ownership is a gun owner who handles firearms with discipline and respect." },
      { id:"s4", heading:"The Brand", body:"Down Range Co. started because every hunting and shooting apparel brand either looked like a big-box store logo or was so tactical it was unwearable off the range.\n\nWashington State. One person. Hundreds of designs and growing." },
    ],
  },
};

interface Section { id: string; heading: string; body: string; }
interface PageContent { eyebrow: string; title: string; subtitle: string; sections: Section[]; }

// ── Main Editor export ────────────────────────────────────────────────
interface PageEditorProps { adminKey: string; showToast: (m: string, t?: "ok"|"err") => void; }

const ALL_PAGES = [
  { slug:"sizing-guide",     label:"Sizing Guide",       section:"Info"  },
  { slug:"shipping-returns", label:"Shipping & Returns", section:"Info"  },
  { slug:"faq",              label:"FAQ",                section:"Info"  },
  { slug:"contact",          label:"Contact",            section:"Info"  },
  { slug:"privacy",          label:"Privacy Policy",     section:"Legal" },
  { slug:"terms",            label:"Terms of Service",   section:"Legal" },
  { slug:"2a-proud",         label:"2A Proud",           section:"Brand" },
];

export default function PageEditor({ adminKey, showToast }: PageEditorProps) {
  const [activePage, setActivePage] = useState<string|null>(null);
  const sections = [...new Set(ALL_PAGES.map(p => p.section))];

  if (activePage) {
    const pageMeta = ALL_PAGES.find(p => p.slug === activePage)!;
    return <SinglePageEditor slug={activePage} label={pageMeta.label} adminKey={adminKey} showToast={showToast} onBack={() => setActivePage(null)} />;
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"var(--font-bebas)", fontSize:38, letterSpacing:"0.04em" }}>
          PAGES <span style={{color:S.gold}}>({ALL_PAGES.length})</span>
        </div>
        <div style={{ ...mono(9), color:S.muted }}>Click any page to edit its content — changes go live immediately</div>
      </div>

      {sections.map(section => (
        <div key={section} style={{ marginBottom:28 }}>
          <div style={{ ...mono(10), color:S.gold, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:20, height:1, background:S.gold, display:"inline-block" }}/>
            {section}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
            {ALL_PAGES.filter(p => p.section === section).map(page => (
              <PageCard key={page.slug} page={page} onClick={() => setActivePage(page.slug)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PageCard({ page, onClick }: { page: any; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background:S.card, border:`1px solid ${S.border}`, padding:20, cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.transform="none";}}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:18, letterSpacing:"0.06em", color:S.text, marginBottom:3 }}>{page.label}</div>
          <div style={{ ...mono(9), color:S.muted }}>/pages/{page.slug}</div>
        </div>
        <span style={{ ...mono(8), padding:"3px 8px", background:"rgba(42,106,58,0.2)", border:"1px solid #3a8a4a", color:"#6adb8a" }}>Live</span>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <div style={{ flex:1, background:S.goldDim, border:`1px solid ${S.goldBorder}`, color:S.gold, fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.11em", textTransform:"uppercase" as const, padding:"8px 12px", textAlign:"center" as const }}>
          ✎ Edit Content
        </div>
        <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
          style={{ background:"transparent", border:`1px solid ${S.border}`, color:S.muted, fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.11em", textTransform:"uppercase" as const, padding:"8px 12px", textDecoration:"none", display:"block" }}>
          ↗
        </a>
      </div>
    </div>
  );
}

// ── Single page editor ────────────────────────────────────────────────
function SinglePageEditor({ slug, label, adminKey, showToast, onBack }: { slug:string; label:string; adminKey:string; showToast:(m:string,t?:"ok"|"err")=>void; onBack:()=>void }) {
  const defaultContent = PAGE_DEFAULTS[slug] ?? { eyebrow:"", title:"", subtitle:"", sections:[] };
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("meta");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/pages?slug=${slug}`, { cache:"no-store" })
      .then(r => r.json())
      .then(d => { if (d.content) setContent({ ...defaultContent, ...d.content }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const update = (patch: Partial<PageContent>) => { setContent(c => ({...c, ...patch})); setDirty(true); };
  const updateSection = (id: string, patch: Partial<Section>) => {
    setContent(c => ({ ...c, sections: c.sections.map(s => s.id === id ? {...s, ...patch} : s) }));
    setDirty(true);
  };
  const addSection = () => {
    const newId = `s${Date.now()}`;
    setContent(c => ({ ...c, sections: [...c.sections, { id:newId, heading:"New Section", body:"" }] }));
    setActiveSection(newId);
    setDirty(true);
  };
  const removeSection = (id: string) => {
    setContent(c => ({ ...c, sections: c.sections.filter(s => s.id !== id) }));
    if (activeSection === id) setActiveSection("meta");
    setDirty(true);
  };
  const moveSection = (id: string, dir: -1|1) => {
    setContent(c => {
      const arr = [...c.sections];
      const idx = arr.findIndex(s => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return c;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...c, sections: arr };
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/pages", { method:"POST", headers:{"x-admin-key":adminKey,"Content-Type":"application/json"}, body:JSON.stringify({slug, content}) });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      showToast(`${label} saved ✓`);
      setDirty(false);
    } catch(e:any) { showToast(e.message, "err"); }
    finally { setSaving(false); }
  };

  const activeS = content.sections.find(s => s.id === activeSection);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${S.border}`, color:S.muted, fontFamily:"var(--font-mono)",fontSize:"9px",letterSpacing:"0.11em",textTransform:"uppercase" as const,padding:"7px 12px",cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.goldBorder;(e.currentTarget as HTMLElement).style.color=S.gold;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=S.border;(e.currentTarget as HTMLElement).style.color=S.muted;}}>
          ← All Pages
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-bebas)", fontSize:26, letterSpacing:"0.04em" }}>
            <span style={{color:S.gold}}>{label}</span>
            {dirty && <span style={{ ...mono(9), color:"#e0a830", marginLeft:12 }}>● Unsaved changes</span>}
          </div>
          <div style={{ ...mono(9), color:S.muted }}>/pages/{slug}</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>setPreview(p=>!p)} style={{ ...mono(10), background:preview?S.goldDim:"transparent", border:`1px solid ${preview?S.goldBorder:S.border}`, color:preview?S.gold:S.muted, padding:"8px 14px", cursor:"pointer" }}>
            {preview?"◉ Preview":"◎ Preview"}
          </button>
          <a href={`/pages/${slug}`} target="_blank" rel="noopener noreferrer"
            style={{ ...mono(10), background:"transparent", border:`1px solid ${S.border}`, color:S.muted, padding:"8px 14px", textDecoration:"none" }}>
            View Live ↗
          </a>
          <button onClick={save} disabled={saving} style={{ background:S.gold, color:S.bg, fontFamily:"var(--font-mono)",fontSize:"11px",letterSpacing:"0.11em",textTransform:"uppercase" as const,padding:"9px 20px",border:"none",cursor:saving?"not-allowed":"pointer",fontWeight:700,opacity:saving?0.7:1 }}>
            {saving?"Saving...":"Publish Changes"}
          </button>
        </div>
      </div>

      {loading ? <div style={{ ...mono(10), color:S.muted, padding:"40px 0", textAlign:"center" }}>Loading...</div> : (
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>

          {/* Sidebar — section navigator */}
          <div style={{ background:S.bg3, border:`1px solid ${S.border}`, padding:"8px 0", height:"fit-content", position:"sticky", top:80 }}>
            <div style={{ ...mono(8), color:S.muted, padding:"8px 16px 12px" }}>Page Sections</div>

            {/* Meta / Header */}
            <button onClick={()=>setActiveSection("meta")}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:activeSection==="meta"?S.goldDim:"transparent", borderLeft:`2px solid ${activeSection==="meta"?S.gold:"transparent"}`, border:"none", cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
              <span style={{ fontSize:14, color:activeSection==="meta"?S.gold:S.muted }}>◉</span>
              <span style={{ ...mono(10), color:activeSection==="meta"?S.gold:S.muted }}>Page Header</span>
            </button>

            {/* Sections */}
            {content.sections.map((s, i) => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:0 }}>
                <button onClick={()=>setActiveSection(s.id)}
                  style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:activeSection===s.id?S.goldDim:"transparent", borderLeft:`2px solid ${activeSection===s.id?S.gold:"transparent"}`, border:"none", cursor:"pointer", transition:"all 0.15s", textAlign:"left", overflow:"hidden" }}>
                  <span style={{ fontSize:12, color:activeSection===s.id?S.gold:S.muted, flexShrink:0 }}>◈</span>
                  <span style={{ ...mono(9), color:activeSection===s.id?S.gold:S.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.heading||"Untitled"}</span>
                </button>
                <div style={{ display:"flex", flexDirection:"column", paddingRight:8, gap:2 }}>
                  <button onClick={()=>moveSection(s.id,-1)} disabled={i===0} style={{ background:"transparent", border:"none", color:S.muted, cursor:i===0?"default":"pointer", fontSize:10, lineHeight:1, padding:"2px 4px", opacity:i===0?0.3:1 }}>▲</button>
                  <button onClick={()=>moveSection(s.id,1)} disabled={i===content.sections.length-1} style={{ background:"transparent", border:"none", color:S.muted, cursor:i===content.sections.length-1?"default":"pointer", fontSize:10, lineHeight:1, padding:"2px 4px", opacity:i===content.sections.length-1?0.3:1 }}>▼</button>
                </div>
              </div>
            ))}

            {/* Add section */}
            <button onClick={addSection} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", marginTop:4, borderTop:`1px solid ${S.border}` }}>
              <span style={{ fontSize:14, color:S.muted }}>+</span>
              <span style={{ ...mono(9), color:S.muted }}>Add Section</span>
            </button>
          </div>

          {/* Main edit area */}
          <div>
            {activeSection === "meta" ? (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <SectionCard title="Page Header">
                  <ELabel>Eyebrow text</ELabel>
                  <EInput value={content.eyebrow} onChange={v=>update({eyebrow:v})} placeholder="// Page tagline" />
                  <ELabel style={{marginTop:10}}>Title (use \n for line breaks)</ELabel>
                  <EInput value={content.title} onChange={v=>update({title:v})} placeholder="PAGE\nTITLE" multiline rows={3} mono />
                  <ELabel style={{marginTop:10}}>Subtitle / intro text</ELabel>
                  <EInput value={content.subtitle} onChange={v=>update({subtitle:v})} placeholder="Brief description shown below the title." multiline rows={3} />
                </SectionCard>
                {preview && <PreviewHeader content={content} />}
              </div>
            ) : activeS ? (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <SectionCard title={`Section: ${activeS.heading}`}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <ELabel>Section Heading</ELabel>
                    <button onClick={()=>removeSection(activeS.id)} style={{ ...mono(9), background:S.redDim, border:"1px solid rgba(184,64,64,0.3)", color:"#e08080", padding:"4px 10px", cursor:"pointer" }}>Remove Section</button>
                  </div>
                  <EInput value={activeS.heading} onChange={v=>updateSection(activeS.id,{heading:v})} placeholder="Section Title" />
                  <ELabel style={{marginTop:14}}>Body Content</ELabel>
                  <div style={{ ...mono(8), color:S.muted, marginBottom:6 }}>
                    Markdown supported: **bold**, *italic*, line breaks with Enter. Bullet points with •
                  </div>
                  <EInput value={activeS.body} onChange={v=>updateSection(activeS.id,{body:v})} placeholder="Section content..." multiline rows={14} />
                </SectionCard>
                {preview && <PreviewSection section={activeS} />}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function SectionCard({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{ background:S.card, border:`1px solid ${S.border}`, padding:20 }}>
      <div style={{ ...mono(9), color:S.gold, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );
}
function ELabel({children, style={}}:{children:React.ReactNode;style?:any}) {
  return <div style={{ ...mono(8), color:S.muted, marginBottom:5, ...style }}>{children}</div>;
}
function EInput({value,onChange,placeholder,multiline=false,rows=3,mono:isMono=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;multiline?:boolean;rows?:number;mono?:boolean}) {
  const base: React.CSSProperties = { width:"100%", background:S.bg3, border:`1px solid ${S.border}`, color:S.text, padding:"10px 12px", fontSize:13, fontFamily:isMono?"monospace":"var(--font-sans)", outline:"none", boxSizing:"border-box", resize:"vertical" as const, lineHeight:1.6, transition:"border-color 0.15s" };
  const handlers = {
    onFocus:(e:any)=>e.target.style.borderColor=S.goldBorder,
    onBlur:(e:any)=>e.target.style.borderColor=S.border,
  };
  if (multiline) return <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} {...handlers}/>;
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base} {...handlers}/>;
}

function PreviewHeader({content}:{content:PageContent}) {
  return (
    <div style={{ background:S.bg2, border:`1px solid ${S.border}`, padding:24 }}>
      <div style={{ ...mono(9), color:S.gold, marginBottom:10 }}>◉ Preview</div>
      <div style={{ ...mono(9), color:S.gold, marginBottom:8 }}>{content.eyebrow}</div>
      <div style={{ fontFamily:"var(--font-bebas)", fontSize:32, letterSpacing:"0.04em", lineHeight:0.92, color:S.text, marginBottom:12, whiteSpace:"pre-line" }}>{content.title}</div>
      <div style={{ fontSize:13, color:S.muted, lineHeight:1.75, maxWidth:480 }}>{content.subtitle}</div>
    </div>
  );
}
function PreviewSection({section}:{section:Section}) {
  const formatted = section.body
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F0EDE8">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
  return (
    <div style={{ background:S.bg2, border:`1px solid ${S.border}`, padding:24 }}>
      <div style={{ ...mono(9), color:S.gold, marginBottom:10 }}>◉ Preview</div>
      <div style={{ fontFamily:"var(--font-bebas)", fontSize:18, letterSpacing:"0.06em", color:S.text, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:20, height:1, background:S.gold, display:"inline-block" }}/>
        {section.heading}
      </div>
      <div style={{ fontSize:13, color:S.muted, lineHeight:1.8, paddingLeft:28 }} dangerouslySetInnerHTML={{__html:formatted}}/>
    </div>
  );
}

const mono10 = (extra={}) => ({ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.11em", textTransform:"uppercase" as const, ...extra });
