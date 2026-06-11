"use client";
import { useState, useEffect } from "react";

const PLATFORM_LABELS: Record<string,string> = {
  portal:"📡 News Portal", twitter:"𝕏 X / Twitter", bluesky:"🦋 Bluesky",
  youtube:"▶ YouTube", facebook:"f Facebook", instagram:"◈ Instagram",
  threads:"@ Threads", reddit:"🔴 Reddit",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [connectLinks, setConnectLinks] = useState<{label:string;href:string}[]>([{label:"📡 News Portal",href:"https://downrangeco.com"}]);

  useEffect(() => {
    fetch(`/api/social/config?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(r => r.json())
      .then(d => {
        const active = d.active || [];
        const built: {label:string;href:string}[] = [
          { label:"📡 News Portal", href:"https://downrangeco.com" },
          ...active.map((a:any) => ({ label:a.label, href:a.href })),
        ];
        setConnectLinks(built);
      })
      .catch(() => {
        setConnectLinks([{ label:"📡 News Portal", href:"https://downrangeco.com" }]);
      });
  }, []);

  const linkStyle = {
    fontSize: "12px", color: "var(--muted)", textDecoration: "none",
    transition: "color 0.15s", display: "block",
  } as const;

  return (
    <footer style={{ background:"var(--footer-bg)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"44px 32px 24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:"40px", marginBottom:"32px", maxWidth:"1300px", margin:"0 auto 32px" }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom:"14px" }}>
            <img src="/logo.png" alt="Down Range Co." style={{ height:"130px", width:"auto", maxWidth:"520px", objectFit:"contain" }}/>
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.12em", color:"var(--muted)", textTransform:"uppercase", lineHeight:1.8 }}>
            Gear for hunters, shooters &amp;<br/>those who defend the Second.<br/><br/>Washington State, USA
          </div>
        </div>

        {/* Shop */}
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"14px" }}>Shop</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
            {[
              { label:"All Products",    href:"/products" },
              { label:"Hunting",         href:"/products?category=Hunting" },
              { label:"2A / Patriot",    href:"/products?category=2A+%2F+Patriot" },
              { label:"Military / Vet",  href:"/products?category=Military+%2F+Vet" },
              { label:"Long Range",      href:"/products?category=Long+Range" },
            ].map(l=>(
              <li key={l.label}>
                <a href={l.href} style={linkStyle}
                  onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--text)")}
                  onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"14px" }}>Info</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
            {[
              { label:"Sizing Guide",       href:"/pages/sizing-guide" },
              { label:"Shipping & Returns", href:"/pages/shipping-returns" },
              { label:"FAQ",                href:"/pages/faq" },
              { label:"Contact",            href:"/pages/contact" },
            ].map(l=>(
              <li key={l.label}>
                <a href={l.href} style={linkStyle}
                  onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--text)")}
                  onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect — admin-configurable via Social Media → Profile Links */}
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"14px" }}>Connect</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
            {connectLinks.map(l=>(
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" style={linkStyle}
                  onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--text)")}
                  onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Account — separate column */}
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"14px" }}>Account</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
            {[
              { label:"My Account",    href:"https://shopify.com/83728892116/account", external:true },
              { label:"Order Status",  href:"https://shopify.com/83728892116/account/orders", external:true },
              { label:"Returns",       href:"/pages/shipping-returns" },
            ].map(l=>(
              <li key={l.label}>
                <a href={l.href} target={(l as any).external?"_blank":undefined} rel={(l as any).external?"noopener noreferrer":undefined}
                  style={linkStyle}
                  onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--text)")}
                  onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"18px", display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:"1300px", margin:"0 auto", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.1em", color:"var(--muted)", textTransform:"uppercase" }}>
          © {year} DownRange Co. — All Rights Reserved
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", letterSpacing:"0.08em", display:"flex", gap:"20px" }}>
          {[["Privacy","/pages/privacy"],["Terms","/pages/terms"],["2A Proud","/pages/2a-proud"]].map(([l,h])=>(
            <a key={h} href={h} style={{ color:"var(--muted)", textDecoration:"none", transition:"color 0.15s" }}
              onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--gold)")}
              onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>{l}</a>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:1000px){footer > div:first-of-type{grid-template-columns:1fr 1fr!important}} @media(max-width:600px){footer > div:first-of-type{grid-template-columns:1fr!important}}`}</style>
    </footer>
  );
}
