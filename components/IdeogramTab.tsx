"use client";
import React, { useState, useCallback } from "react";

const S = {
  bg:"#09090B", bg2:"#0E0E10", bg3:"#161618", card:"#111113",
  gold:"#C8922A", goldDim:"rgba(200,146,42,0.10)", goldBorder:"rgba(200,146,42,0.28)",
  text:"#F0EDE8", muted:"#666", dim:"#444", border:"rgba(255,255,255,0.06)",
  red:"#B84040", redDim:"rgba(184,64,64,0.10)", redBorder:"rgba(184,64,64,0.28)",
  green:"#2a6a3a", greenText:"#6adb8a", greenDim:"rgba(22,163,74,0.08)",
};
const m = (s=10) => ({ fontFamily:"'IBM Plex Mono',monospace", fontSize:`${s}px`, letterSpacing:"0.10em", textTransform:"uppercase" as const });
const F = "var(--font-bebas,Bebas Neue,sans-serif)";
function iStyle(extra:any={}) {
  return { background:S.bg3, border:`1px solid ${S.border}`, color:S.text, padding:"8px 10px", width:"100%", fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", ...extra };
}
function Btn({ children, onClick, color="gold", disabled=false, size="md" }:any) {
  const bg = color==="gold" ? S.gold : color==="ghost" ? "transparent" : S.goldDim;
  const cl = color==="gold" ? S.bg   : color==="ghost" ? S.muted : S.gold;
  const bd = color==="gold" ? "none" : `1px solid ${S.goldBorder}`;
  const pd = size==="sm" ? "5px 10px" : "8px 16px";
  return <button onClick={onClick} disabled={disabled} style={{ ...m(9), background:bg, color:cl, border:bd, padding:pd, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, transition:"all 0.15s", whiteSpace:"nowrap" }}>{children}</button>;
}
function FieldLbl({ children }:any) {
  return <div style={{ ...m(8), color:S.muted, marginBottom:4 }}>{children}</div>;
}
function Card({ children, style={} }:any) {
  return <div style={{ background:S.card, border:`1px solid ${S.border}`, padding:"16px 18px", ...style }}>{children}</div>;
}

const ASPECT_OPTIONS = [
  { value:"ASPECT_1_1",   label:"1:1  Square (T-Shirt, POD)" },
  { value:"ASPECT_4_3",   label:"4:3  Landscape" },
  { value:"ASPECT_3_4",   label:"3:4  Portrait" },
  { value:"ASPECT_16_9",  label:"16:9 Wide" },
  { value:"ASPECT_9_16",  label:"9:16 Tall" },
];

const SPEED_OPTIONS = [
  { value:"QUALITY", label:"QUALITY — Best fidelity (recommended)" },
  { value:"DEFAULT", label:"DEFAULT — Balanced" },
  { value:"TURBO",   label:"TURBO — Fastest" },
];

const UPSCALE_OPTIONS = [
  { value:"X1", label:"X1 — Native (~2K)" },
  { value:"X2", label:"X2 — ~4K (recommended for POD)" },
  { value:"X4", label:"X4 — ~8K (max, slower)" },
];

export default function IdeogramTab({ adminKey, showToast }:any) {
  const [prompt,        setPrompt]       = useState("");
  const [aspectRatio,   setAspectRatio]  = useState("ASPECT_1_1");
  const [speed,         setSpeed]        = useState("QUALITY");
  const [upscale,       setUpscale]      = useState("X2");
  const [seed,          setSeed]         = useState("");
  const [generating,    setGenerating]   = useState(false);
  const [results,       setResults]      = useState<any[]>([]);
  const [error,         setError]        = useState("");
  const [configured,    setConfigured]   = useState<boolean|null>(null);
  const [batchPrompts,  setBatchPrompts] = useState("");
  const [batchMode,     setBatchMode]    = useState(false);
  const [batchRunning,  setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done:0, total:0, errors:0 });

  // Check API key config on mount
  React.useEffect(() => {
    fetch("/api/ideogram", { headers: { "x-admin-key": adminKey }, cache: "no-store" })
      .then(r => r.json()).then(d => setConfigured(d.configured)).catch(() => setConfigured(false));
  }, [adminKey]);

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    setGenerating(true); setError(""); setResults([]);
    try {
      const res = await fetch("/api/ideogram", {
        method: "POST",
        headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect_ratio: aspectRatio, rendering_speed: speed, upscale_factor: upscale, seed: seed || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setResults(data.images ?? []);
      showToast?.(`Generated ${data.images?.length ?? 0} image(s) ✓`, "ok");
    } catch (e:any) {
      setError(e.message);
      showToast?.(e.message, "err");
    } finally { setGenerating(false); }
  }, [prompt, aspectRatio, speed, upscale, seed, adminKey, showToast]);

  const runBatch = useCallback(async () => {
    const lines = batchPrompts.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBatchRunning(true); setBatchProgress({ done:0, total:lines.length, errors:0 }); setResults([]);
    let errors = 0;
    const allImages: any[] = [];
    for (let i = 0; i < lines.length; i++) {
      try {
        const res = await fetch("/api/ideogram", {
          method: "POST",
          headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: lines[i], aspect_ratio: aspectRatio, rendering_speed: speed, upscale_factor: upscale }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error);
        allImages.push(...(data.images ?? []).map((img:any) => ({ ...img, batchIndex: i+1, batchPrompt: lines[i] })));
      } catch { errors++; }
      setBatchProgress({ done: i+1, total: lines.length, errors });
      if (i < lines.length - 1) await new Promise(r => setTimeout(r, 1200)); // rate limit buffer
    }
    setResults(allImages);
    setBatchRunning(false);
    showToast?.(`Batch done — ${allImages.length} images, ${errors} errors`, errors ? "err" : "ok");
  }, [batchPrompts, aspectRatio, speed, upscale, adminKey, showToast]);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { showToast?.("Download failed — try right-click > Save image", "err"); }
  };

  const isRunning = generating || batchRunning;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:F, fontSize:26, letterSpacing:"0.04em" }}>
            IDEOGRAM <span style={{ color:S.gold }}>IMAGE GEN</span>
          </div>
          <div style={{ ...m(8), color:S.muted, marginTop:3 }}>
            Transparent PNG · 4K upscale · No background · POD ready
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {configured === null && <span style={{ ...m(8), color:S.muted }}>Checking API…</span>}
          {configured === true  && <span style={{ ...m(8), padding:"3px 10px", background:S.greenDim, color:S.greenText, border:`1px solid rgba(34,197,94,.2)` }}>● API CONNECTED</span>}
          {configured === false && <span style={{ ...m(8), padding:"3px 10px", background:S.redDim, color:"#e08080", border:`1px solid ${S.redBorder}` }}>✗ API KEY MISSING</span>}
        </div>
      </div>

      {/* API key warning */}
      {configured === false && (
        <Card style={{ border:`1px solid ${S.redBorder}`, background:S.redDim }}>
          <div style={{ ...m(9), color:"#e08080", marginBottom:6 }}>⚠ IDEOGRAM_API_KEY not set</div>
          <div style={{ ...m(8), color:S.muted, lineHeight:1.6 }}>
            Add <code style={{ color:S.gold }}>IDEOGRAM_API_KEY</code> to your Vercel environment variables.<br/>
            Get your key at <strong style={{ color:S.text }}>developer.ideogram.ai</strong> → API Dashboard → Create Key.
          </div>
        </Card>
      )}

      {/* Mode toggle */}
      <div style={{ display:"flex", gap:8 }}>
        <Btn onClick={() => setBatchMode(false)} color={!batchMode ? "gold" : "ghost"} size="sm">Single Image</Btn>
        <Btn onClick={() => setBatchMode(true)}  color={batchMode  ? "gold" : "ghost"} size="sm">Batch (CSV Prompts)</Btn>
      </div>

      {/* Settings row */}
      <Card>
        <div style={{ ...m(9), color:S.gold, marginBottom:12 }}>Generation Settings</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <div>
            <FieldLbl>Aspect Ratio</FieldLbl>
            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={iStyle()}>
              {ASPECT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLbl>Quality</FieldLbl>
            <select value={speed} onChange={e => setSpeed(e.target.value)} style={iStyle()}>
              {SPEED_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLbl>Upscale Factor</FieldLbl>
            <select value={upscale} onChange={e => setUpscale(e.target.value)} style={iStyle()}>
              {UPSCALE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {!batchMode && (
          <div style={{ marginTop:12 }}>
            <FieldLbl>Seed (optional — leave blank for random)</FieldLbl>
            <input value={seed} onChange={e => setSeed(e.target.value)} placeholder="e.g. 42" style={{ ...iStyle(), width:200 }} />
          </div>
        )}
        <div style={{ marginTop:8, ...m(8), color:S.muted }}>
          Output: Transparent PNG · {upscale === "X1" ? "~2K" : upscale === "X2" ? "~4K" : "~8K"} · No background · Print-ready
        </div>
      </Card>

      {/* Single prompt */}
      {!batchMode && (
        <Card>
          <div style={{ ...m(9), color:S.gold, marginBottom:12 }}>Prompt</div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A weathered bolt-action rifle rests against a split-rail fence post at golden hour... Art style is vintage American illustrative with crosshatch shading and an oval badge frame. Transparent PNG, no background."
            style={{ ...iStyle(), height:120, resize:"vertical", lineHeight:1.5 }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
            <Btn onClick={generate} disabled={isRunning || !prompt.trim() || !configured}>
              {generating ? "⟳ Generating…" : "⚡ Generate Image"}
            </Btn>
            <span style={{ ...m(8), color:S.muted }}>{prompt.length} chars</span>
          </div>
        </Card>
      )}

      {/* Batch mode */}
      {batchMode && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ ...m(9), color:S.gold }}>Batch Prompts</div>
            <span style={{ ...m(8), color:S.muted }}>One prompt per line — each generates one 4K PNG</span>
          </div>
          <textarea
            value={batchPrompts}
            onChange={e => setBatchPrompts(e.target.value)}
            placeholder={"A weathered bolt-action rifle at golden hour...\nA bowhunter at full draw in thick timber...\nA mallard drake descending into flooded timber..."}
            style={{ ...iStyle(), height:200, resize:"vertical", lineHeight:1.6 }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
            <Btn onClick={runBatch} disabled={isRunning || !batchPrompts.trim() || !configured}>
              {batchRunning ? `⟳ Running ${batchProgress.done}/${batchProgress.total}…` : "⚡ Run Batch"}
            </Btn>
            <span style={{ ...m(8), color:S.muted }}>
              {batchPrompts.split("\n").filter(l => l.trim()).length} prompts queued
            </span>
            {batchRunning && batchProgress.errors > 0 && (
              <span style={{ ...m(8), color:"#e08080" }}>⚠ {batchProgress.errors} errors</span>
            )}
          </div>
          {batchRunning && (
            <div style={{ marginTop:12 }}>
              <div style={{ ...m(8), color:S.muted, marginBottom:4 }}>Progress</div>
              <div style={{ height:4, background:S.bg3, width:"100%" }}>
                <div style={{ height:"100%", background:S.gold, width:`${(batchProgress.done/batchProgress.total)*100}%`, transition:"width 0.3s" }}/>
              </div>
              <div style={{ ...m(8), color:S.muted, marginTop:4 }}>
                {batchProgress.done} / {batchProgress.total} complete · {batchProgress.errors} errors
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Error state */}
      {error && (
        <div style={{ ...m(9), color:"#e08080", background:S.redDim, border:`1px solid ${S.redBorder}`, padding:"10px 14px" }}>
          ✗ {error}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div>
          <div style={{ ...m(10), color:S.gold, marginBottom:12 }}>
            Results — {results.length} image{results.length > 1 ? "s" : ""} · Transparent PNG · Click to download
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {results.map((img, i) => (
              <div key={i} style={{ background:S.card, border:`1px solid ${S.border}`, overflow:"hidden" }}>
                {/* Checkerboard bg to show transparency */}
                <div style={{
                  position:"relative", width:"100%", paddingBottom:"100%",
                  backgroundImage:"linear-gradient(45deg,#222 25%,transparent 25%,transparent 75%,#222 75%),linear-gradient(45deg,#222 25%,transparent 25%,transparent 75%,#222 75%)",
                  backgroundSize:"16px 16px", backgroundPosition:"0 0, 8px 8px",
                }}>
                  <img
                    src={img.url}
                    alt={`Generated ${i+1}`}
                    style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"contain" }}
                  />
                </div>
                <div style={{ padding:"10px 12px" }}>
                  {img.batchIndex && (
                    <div style={{ ...m(8), color:S.muted, marginBottom:4 }}>#{img.batchIndex}</div>
                  )}
                  {img.resolution && (
                    <div style={{ ...m(8), color:S.muted, marginBottom:6 }}>
                      {img.resolution} · Seed: {img.seed ?? "—"}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn
                      onClick={() => downloadImage(img.url, `downrange_${i+1}_${upscale.toLowerCase()}_${Date.now()}.png`)}
                      size="sm"
                    >
                      ↓ Download PNG
                    </Btn>
                    <Btn
                      onClick={() => { window.open(img.url, "_blank"); }}
                      color="ghost" size="sm"
                    >
                      ↗ Open
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage notes */}
      <Card style={{ marginTop:4 }}>
        <div style={{ ...m(9), color:S.gold, marginBottom:10 }}>Usage & Pricing Notes</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ ...m(8), color:S.muted, lineHeight:1.7 }}>
            <div style={{ color:S.text, marginBottom:4 }}>Endpoint</div>
            POST /v1/ideogram-v3/generate/transparent<br/>
            Upscale included in single API call<br/>
            Rate limit: 10 concurrent requests<br/>
            Images expire — download immediately
          </div>
          <div style={{ ...m(8), color:S.muted, lineHeight:1.7 }}>
            <div style={{ color:S.text, marginBottom:4 }}>Cost Estimate</div>
            QUALITY + X2 upscale: ~$0.10–0.15/image<br/>
            QUALITY + X1 (no upscale): ~$0.06–0.08<br/>
            TURBO + X2: ~$0.07–0.10<br/>
            Billing: developer.ideogram.ai dashboard
          </div>
        </div>
      </Card>
    </div>
  );
}
