"use client";
import { useState, useMemo } from "react";

interface Variant { id: number; title: string; price: number; }
interface Product {
  id: string; title: string; description: string;
  images: string[]; defaultImage: string;
  variants: Variant[]; tags: string[]; category: string;
  minPrice: string; maxPrice: string; buyUrl: string;
}

// Common color hex map for swatch rendering
const COLOR_HEX: Record<string, string> = {
  black:"#1a1a1a", white:"#f5f5f0", "heather grey":"#9a9a9a", grey:"#888",
  gray:"#888", navy:"#1a2a4a", "navy blue":"#1a2a4a", red:"#8b1a1a",
  "cardinal red":"#8b1a1a", maroon:"#5c1a1a", brown:"#4a3020",
  "dark heather":"#444", forest:"#1a3a1a", "forest green":"#1a3a1a",
  green:"#2a4a2a", olive:"#4a4a1a", "military green":"#3a4a1a",
  tan:"#b89060", coyote:"#9a7850", khaki:"#c8a878", blue:"#1a3a6a",
  "royal blue":"#1a3a8a", purple:"#3a1a5a", orange:"#b86020",
  yellow:"#c8a820", pink:"#c86080", "light blue":"#4a7aaa",
  charcoal:"#333", "dark grey":"#333", "sport grey":"#aaa",
  "ash grey":"#c0bdb8", natural:"#e8dfc8", cream:"#f0e8d0",
};

function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase().trim();
  return COLOR_HEX[lower] ?? "#555";
}

// Parse "Black / S" or "Black / Small" or "Black - XL" etc.
function parseVariant(title: string): { color: string; size: string } {
  const parts = title.split(/[\/\-–]/).map((s) => s.trim());
  if (parts.length >= 2) {
    // Heuristic: sizes are typically short or standard keywords
    const sizeKeywords = ["xs","s","m","l","xl","xxl","2xl","3xl","4xl","5xl","xsmall","small","medium","large","x-large","xx-large","one size","os"];
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (sizeKeywords.some((k) => lastPart === k || lastPart.includes(k))) {
      return { color: parts.slice(0, -1).join(" / "), size: parts[parts.length - 1] };
    }
  }
  // No size found — treat full title as color
  return { color: parts[0], size: "" };
}

const SIZE_ORDER = ["XS","S","M","L","XL","2XL","XXL","3XL","XXXL","4XL","5XL","One Size","OS"];
function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.findIndex((s) => s.toLowerCase() === a.toLowerCase());
    const bi = SIZE_ORDER.findIndex((s) => s.toLowerCase() === b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function ProductDetail({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [product.defaultImage].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);

  // Parse all variants into color/size groups
  const parsed = useMemo(() => product.variants.map((v) => ({ ...v, ...parseVariant(v.title) })), [product.variants]);

  const colors = useMemo(() => {
    const seen = new Set<string>();
    return parsed.filter((v) => { if (seen.has(v.color)) return false; seen.add(v.color); return true; }).map((v) => v.color);
  }, [parsed]);

  const hasColors = colors.length > 1 || (colors.length === 1 && colors[0] !== product.title);
  const hasSizes = parsed.some((v) => v.size !== "");

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const availableSizes = useMemo(() => {
    const sizes = parsed.filter((v) => !selectedColor || v.color === selectedColor).map((v) => v.size).filter(Boolean);
    return sortSizes([...new Set(sizes)]);
  }, [parsed, selectedColor]);

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] ?? "");

  // When color changes, reset size if current size not available
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const newSizes = sortSizes([...new Set(parsed.filter((v) => v.color === color).map((v) => v.size).filter(Boolean))]);
    if (newSizes.length && !newSizes.includes(selectedSize)) setSelectedSize(newSizes[0]);
  };

  // Find matching variant for price
  const matchedVariant = useMemo(() => {
    return parsed.find((v) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
    ) ?? parsed[0];
  }, [parsed, selectedColor, selectedSize]);

  const price = matchedVariant ? `$${(matchedVariant.price / 100).toFixed(2).replace(/\.00$/, "")}` : product.minPrice;

  // Build buy URL — go directly to Printify product page
  const buyUrl = product.buyUrl;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 32px" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "28px", display: "flex", gap: "8px", alignItems: "center" }}>
        <a href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
        <span>›</span>
        <a href="/products" style={{ color: "var(--muted)", textDecoration: "none" }}>Products</a>
        <span>›</span>
        <span style={{ color: "var(--gold)" }}>{product.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px" }}>

        {/* ── Left: image gallery ─────────────────────────── */}
        <div>
          <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "12px" }}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1 }}>
                <svg width="80" height="80" viewBox="0 0 60 60" fill="none"><rect x="8" y="16" width="44" height="28" rx="2" stroke="#C8922A" strokeWidth="1.5"/><circle cx="30" cy="30" r="8" stroke="#C8922A" strokeWidth="1.5"/></svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: "68px", height: "68px", border: `2px solid ${i === activeImg ? "var(--gold)" : "rgba(255,255,255,0.06)"}`, overflow: "hidden", cursor: "pointer", background: "var(--bg3)", transition: "border-color 0.15s", flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: product info ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* Category */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
            {product.category}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(30px, 3.5vw, 52px)", letterSpacing: "0.04em", color: "var(--text)", lineHeight: 0.95, margin: 0 }}>
            {product.title}
          </h1>

          {/* Price */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "30px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.02em" }}>
            {price}
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* ── Color selector ── */}
          {hasColors && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                Color
                {selectedColor && <span style={{ color: "var(--text)", letterSpacing: "0.06em" }}>— {selectedColor}</span>}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {colors.map((color) => {
                  const hex = getColorHex(color);
                  const isSelected = selectedColor === color;
                  const isLight = ["white","ash grey","natural","cream","sport grey","light blue"].some((c) => color.toLowerCase().includes(c));
                  return (
                    <button
                      key={color}
                      title={color}
                      onClick={() => handleColorChange(color)}
                      style={{
                        width: "36px", height: "36px",
                        background: hex,
                        border: isSelected ? "2px solid var(--gold)" : `2px solid ${isLight ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "50%",
                        cursor: "pointer",
                        outline: isSelected ? "2px solid var(--gold)" : "none",
                        outlineOffset: "3px",
                        transition: "outline 0.15s, transform 0.1s",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                        boxShadow: isLight ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "none",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Size selector ── */}
          {hasSizes && availableSizes.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Size {selectedSize && <span style={{ color: "var(--text)" }}>— {selectedSize}</span>}</span>
                <span style={{ color: "var(--gold)", cursor: "pointer", fontSize: "9px" }}>Size Guide</span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        minWidth: "52px", height: "44px", padding: "0 12px",
                        background: isSelected ? "var(--gold)" : "transparent",
                        border: `1px solid ${isSelected ? "var(--gold)" : "rgba(255,255,255,0.1)"}`,
                        color: isSelected ? "#09090B" : "var(--muted)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; } }}
                      onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; } }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Non-color/size variants (e.g. styles) */}
          {!hasColors && !hasSizes && product.variants.length > 1 && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>Option</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.variants.map((v) => (
                  <button key={v.id} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", padding: "9px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)", cursor: "pointer" }}>
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Buy Now ── */}
          <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                background: "var(--gold)", color: "#09090B",
                fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "17px 32px", textDecoration: "none",
                transition: "background 0.2s, transform 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-light)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              Buy Now — {price}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center" }}>
              Secure checkout via Printify · USA printed · Free shipping $60+
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* Description */}
          {product.description && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                Description
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.75, fontWeight: 300 }}
                dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {product.tags.map((tag: string) => (
                <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
