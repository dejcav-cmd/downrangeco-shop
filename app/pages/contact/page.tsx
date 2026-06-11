"use client";
import { useState } from "react";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import PolicyLayout from "@/components/PolicyLayout";

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"Order issue", message:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent">("idle");
  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));
  const submit = () => {
    if(!form.name||!form.email||!form.message) return;
    setStatus("sending");
    window.location.href=`mailto:support@downrangeco.com?subject=${encodeURIComponent(`[${form.subject}] ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    setTimeout(()=>setStatus("sent"),800);
  };
  return (
    <>
      <Masthead />
      <main style={{background:"var(--bg)",minHeight:"80vh"}}>
        <PolicyLayout eyebrow="// We read every message" title={"CONTACT\nUS."} subtitle="Questions about your order, sizing, or the brand. We respond within 1–2 business days.">
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:36}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Fld label="Your Name"><input value={form.name} onChange={set("name")} placeholder="DJ Cavalcanti" style={iS}/></Fld>
                <Fld label="Email"><input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" style={iS}/></Fld>
              </div>
              <Fld label="Subject">
                <select value={form.subject} onChange={set("subject")} style={{...iS,cursor:"pointer"}}>
                  {["Order issue","Damaged / defective item","Wrong item received","Shipping / tracking","Sizing question","Wholesale / collaboration","General question"].map(o=><option key={o}>{o}</option>)}
                </select>
              </Fld>
              <Fld label="Message"><textarea value={form.message} onChange={set("message")} placeholder="Include your order number if relevant..." rows={6} style={{...iS,resize:"vertical",lineHeight:1.6}}/></Fld>
              {status==="sent"
                ? <div style={{background:"rgba(42,106,58,0.12)",border:"1px solid rgba(42,106,58,0.4)",padding:"13px 16px",fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#6adb8a"}}>✓ Opening your email client...</div>
                : <button onClick={submit} disabled={!form.name||!form.email||!form.message} style={{background:"var(--gold)",color:"#09090B",fontFamily:"var(--font-mono)",fontSize:12,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",padding:14,border:"none",cursor:(!form.name||!form.email||!form.message)?"not-allowed":"pointer",opacity:(!form.name||!form.email||!form.message)?0.5:1}}>Send Message →</button>
              }
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <InfoCard title="Response Time"><div style={{fontFamily:"var(--font-bebas)",fontSize:32,color:"var(--text)",letterSpacing:"0.04em",lineHeight:1,marginBottom:6}}>1–2 DAYS</div><div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>We respond to all messages within 1–2 business days.</div></InfoCard>
              <InfoCard title="Direct Email"><a href="mailto:support@downrangeco.com" style={{fontSize:13,color:"var(--text)",textDecoration:"none",fontWeight:500}}>support@downrangeco.com</a></InfoCard>
              <InfoCard title="Quick Links">
                {[["/pages/sizing-guide","Sizing Guide"],["/pages/shipping-returns","Shipping & Returns"],["/pages/faq","FAQ"],["https://shopify.com/83728892116/account","Track Your Order"]].map(([href,label])=>(
                  <a key={label} href={href} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:12,color:"var(--muted)",textDecoration:"none"}}
                    onMouseEnter={e=>((e.currentTarget as HTMLElement).style.color="var(--gold)")} onMouseLeave={e=>((e.currentTarget as HTMLElement).style.color="var(--muted)")}>{label} <span>→</span></a>
                ))}
              </InfoCard>
            </div>
          </div>
          <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
function Fld({label,children}:{label:string;children:React.ReactNode}){return <div><div style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--muted)",marginBottom:6}}>{label}</div>{children}</div>;}
function InfoCard({title,children}:{title:string;children:React.ReactNode}){return <div style={{background:"var(--card)",border:"1px solid rgba(255,255,255,0.06)",padding:18}}><div style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:10}}>{title}</div>{children}</div>;}
const iS:React.CSSProperties={width:"100%",background:"var(--bg3)",border:"1px solid rgba(255,255,255,0.08)",color:"var(--text)",fontFamily:"var(--font-sans)",fontSize:13,padding:"11px 14px",outline:"none",boxSizing:"border-box"};
