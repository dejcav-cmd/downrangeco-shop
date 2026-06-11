"use client";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShopifyProduct, formatMoney } from "@/lib/shopify";

const COLOR_HEX: Record<string, string> = {
  black:"#1a1a1a",white:"#f5f5f0","heather grey":"#9a9a9a",grey:"#888",gray:"#888",
  navy:"#1a2a4a","navy blue":"#1a2a4a",red:"#8b1a1a","cardinal red":"#8b1a1a",
  maroon:"#5c1a1a",brown:"#4a3020","dark heather":"#444",forest:"#1a3a1a",
  "forest green":"#1a3a1a",green:"#2a4a2a",olive:"#4a4a1a","military green":"#3a4a1a",
  tan:"#b89060",coyote:"#9a7850",khaki:"#c8a878",blue:"#1a3a6a","royal blue":"#1a3a8a",
  purple:"#3a1a5a",orange:"#b86020",yellow:"#c8a820",pink:"#c86080",
  "light blue":"#4a7aaa",charcoal:"#333","dark grey":"#333","sport grey":"#aaa",
  "ash grey":"#c0bdb8","ash":"#c0bdb8",natural:"#e8dfc8",cream:"#f0e8d0",
  "heather blue":"#4a6a9a","heather red":"#8a4a4a","heather green":"#3a6a4a",
  "true royal":"#1a3a8a","independence red":"#8a1a1a",graphite:"#444",
  hemp:"#9a8a6a",ivory:"#f0ead8",chambray:"#6a8aaa",blossom:"#c8788a",
};

const SIZE_ORDER = ["XS","S","M","L","XL","2XL","XXL","3XL","4XL","5XL","One Size","OS"];

export default function ProductDetail({ product }: { product: ShopifyProduct }) {
  const { addItem, loading } = useCart();
  const [added, setAdded] = useState(false);
  const images = product.images.nodes;

  const colorOption = product.options.find((o) => o.name.toLowerCase() === "color");
  const sizeOption  = product.options.find((o) => o.name.toLowerCase() === "size");
  const otherOptions = product.options.filter((o) => !["color","size"].includes(o.name.toLowerCase()));

  const [selectedColor, setSelectedColor] = useState<string>(colorOption?.values[0] ?? "");
  const [selectedSize,  setSelectedSize]  = useState<string>(sizeOption?.values[0] ?? "");
  const [selectedOther, setSelectedOther] = useState<Record<string,string>>(
    Object.fromEntries(otherOptions.map((o) => [o.name, o.values[0]]))
  );
  const [activeImg, setActiveImg] = useState(0);

  // ── Find image index for a given color ──────────────────────────────
  const findColorImageIndex = (color: string): number => {
    if (!color) return 0;
    const colorLower = color.toLowerCase();

    // 1. Check if any variant has this color and has its own image
    const variantWithImage = product.variants.nodes.find((v) =>
      v.selectedOptions.some((o) => o.name.toLowerCase() === "color" && o.value === color) && v.image?.url
    );
    if (variantWithImage?.image?.url) {
      const idx = images.findIndex((img) => img.url === variantWithImage.image!.url);
      if (idx !== -1) return idx;
    }

    // 2. Try matching image alt text to color name
    const altIdx = images.findIndex((img) =>
      img.altText?.toLowerCase().includes(colorLower)
    );
    if (altIdx !== -1) return altIdx;

    // 3. Try matching by position — Printify orders images by color group
    // Each color typically gets a block of images. Find which color index this is.
    const colorIdx = colorOption?.values.findIndex((c) => c === color) ?? 0;
    const imgsPerColor = Math.max(1, Math.floor(images.length / (colorOption?.values.length ?? 1)));
    const guessedIdx = colorIdx * imgsPerColor;
    if (guessedIdx < images.length) return guessedIdx;

    return 0;
  };

  // ── When color changes → swap main image ────────────────────────────
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const newSizes = sortSizes([
      ...new Set(
        product.variants.nodes
          .filter((v) => v.selectedOptions.some((o) => o.name.toLowerCase() === "color" && o.value === color))
          .filter((v) => v.availableForSale)
          .map((v) => v.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value ?? "")
          .filter(Boolean)
      ),
    ]);
    if (newSizes.length && !newSizes.includes(selectedSize)) setSelectedSize(newSizes[0]);
    // Swap image
    const imgIdx = findColorImageIndex(color);
    setActiveImg(imgIdx);
  };

  // Set initial image for default color on mount
  useEffect(() => {
    if (selectedColor) setActiveImg(findColorImageIndex(selectedColor));
  }, []); // eslint-disable-line

  // ── Matching variant ─────────────────────────────────────────────────
  const selectedVariant = useMemo(() => {
    return product.variants.nodes.find((v) =>
      v.selectedOptions.every((opt) => {
        if (opt.name.toLowerCase() === "color") return !selectedColor || opt.value === selectedColor;
        if (opt.name.toLowerCase() === "size")  return !selectedSize  || opt.value === selectedSize;
        return selectedOther[opt.name] === opt.value;
      })
    ) ?? product.variants.nodes[0];
  }, [product.variants.nodes, selectedColor, selectedSize, selectedOther]);

  // ── Available sizes for selected color ───────────────────────────────
  const availableSizes = useMemo(() => {
    if (!sizeOption) return [];
    const sizes = product.variants.nodes
      .filter((v) => !selectedColor || v.selectedOptions.some((o) => o.name.toLowerCase() === "color" && o.value === selectedColor))
      .filter((v) => v.availableForSale)
      .map((v) => v.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value ?? "")
      .filter(Boolean);
    return sortSizes([...new Set(sizes)]);
  }, [product.variants.nodes, selectedColor, sizeOption]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const price        = selectedVariant ? formatMoney(selectedVariant.price.amount) : formatMoney(product.priceRange.minVariantPrice.amount);
  const comparePrice = selectedVariant?.compareAtPrice ? formatMoney(selectedVariant.compareAtPrice.amount) : null;
  const inStock      = selectedVariant?.availableForSale !== false;

  // Current image — show variant image if available and different from selected
  const currentImgUrl = (() => {
    const varImg = selectedVariant?.image?.url;
    if (varImg) {
      const idx = images.findIndex((img) => img.url === varImg);
      return idx !== -1 ? images[idx].url : images[activeImg]?.url;
    }
    return images[activeImg]?.url;
  })();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 32px 60px" }}>

      {/* ── Back button + breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <button
          onClick={() => window.history.back()}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 12px", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.3)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", display: "flex", gap: "8px", alignItems: "center", overflow: "hidden" }}>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none", flexShrink: 0 }}>Home</a>
          <span>›</span>
          <a href="/products" style={{ color: "var(--muted)", textDecoration: "none", flexShrink: 0 }}>Products</a>
          <span>›</span>
          <span style={{ color: "var(--gold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px" }}>

        {/* ── Images ── */}
        <div>
          {/* Main image */}
          <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "12px", position: "relative" }}>
            {currentImgUrl ? (
              <img
                key={currentImgUrl}
                src={currentImgUrl}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", animation: "imgFade 0.25s ease" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1 }}>
                <svg width="80" height="80" viewBox="0 0 60 60" fill="none"><rect x="8" y="16" width="44" height="28" rx="2" stroke="#C8922A" strokeWidth="1.5"/><circle cx="30" cy="30" r="8" stroke="#C8922A" strokeWidth="1.5"/></svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{ width: "68px", height: "68px", border: `2px solid ${i === activeImg ? "var(--gold)" : "rgba(255,255,255,0.06)"}`, overflow: "hidden", cursor: "pointer", background: "var(--bg3)", flexShrink: 0, transition: "border-color 0.15s" }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
            {product.productType || "Apparel"}
          </div>

          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(30px,3.5vw,52px)", letterSpacing: "0.04em", color: "var(--text)", lineHeight: 0.95, margin: 0 }}>
            {product.title}
          </h1>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "30px", fontWeight: 700, color: "var(--gold)" }}>{price}</span>
            {comparePrice && <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", color: "var(--muted)", textDecoration: "line-through" }}>{comparePrice}</span>}
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* ── Color selector ── */}
          {colorOption && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px" }}>
                Color — <span style={{ color: "var(--text)" }}>{selectedColor}</span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {colorOption.values.map((color) => {
                  const hex = COLOR_HEX[color.toLowerCase()] ?? "#555";
                  const isSelected = selectedColor === color;
                  const isLight = ["white","ash","natural","cream","ivory","sport grey","light","blossom","chambray","hemp"].some((k) => color.toLowerCase().includes(k));
                  return (
                    <button
                      key={color}
                      title={color}
                      onClick={() => handleColorChange(color)}
                      style={{
                        width: "36px", height: "36px", background: hex,
                        border: "none", borderRadius: "50%", cursor: "pointer",
                        outline: isSelected ? "2px solid var(--gold)" : "2px solid transparent",
                        outlineOffset: "3px",
                        transition: "outline 0.15s, transform 0.1s",
                        transform: isSelected ? "scale(1.15)" : "scale(1)",
                        boxShadow: isLight ? "inset 0 0 0 1px rgba(0,0,0,0.2)" : "none",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Size selector ── */}
          {sizeOption && availableSizes.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                <span>Size — <span style={{ color: "var(--text)" }}>{selectedSize}</span></span>
                <a href="/pages/sizing-guide" style={{ color: "var(--gold)", fontSize: "9px", textDecoration: "none", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = "underline")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = "none")}>
                  Size Guide ↗
                </a>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", minWidth: "52px", height: "44px", padding: "0 12px", background: isSelected ? "var(--gold)" : "transparent", border: `1px solid ${isSelected ? "var(--gold)" : "rgba(255,255,255,0.1)"}`, color: isSelected ? "#09090B" : "var(--muted)", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,146,42,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}}
                      onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other options */}
          {otherOptions.map((opt) => (
            <div key={opt.name}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                {opt.name} — <span style={{ color: "var(--text)" }}>{selectedOther[opt.name]}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {opt.values.map((val) => {
                  const isSelected = selectedOther[opt.name] === val;
                  return (
                    <button key={val} onClick={() => setSelectedOther((p) => ({ ...p, [opt.name]: val }))}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", padding: "9px 16px", background: isSelected ? "var(--gold)" : "transparent", border: `1px solid ${isSelected ? "var(--gold)" : "rgba(255,255,255,0.1)"}`, color: isSelected ? "#09090B" : "var(--muted)", cursor: "pointer", transition: "all 0.15s" }}
                    >{val}</button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Add to Cart ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            {!inStock && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#e08080" }}>
                ⚠ Out of stock in this variant
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={loading || !inStock}
              style={{
                background: added ? "#2a6a3a" : inStock ? "var(--gold)" : "rgba(255,255,255,0.1)",
                color: added ? "#fff" : inStock ? "#09090B" : "var(--muted)",
                fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "17px 32px", border: "none", cursor: inStock ? "pointer" : "not-allowed",
                transition: "background 0.2s, transform 0.1s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
              onMouseEnter={(e) => { if (inStock && !loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {loading ? "Adding..." : added ? "✓ Added to Cart!" : inStock ? `Add to Cart — ${price}` : "Out of Stock"}
            </button>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center" }}>
              🔒 Secure checkout · 🇺🇸 USA printed · 📦 Free shipping $60+
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* Description */}
          {product.descriptionHtml && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>Description</div>
              <div style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.75, fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes imgFade { from { opacity: 0.4; } to { opacity: 1; } }
        @media(max-width:768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.findIndex((s) => s.toLowerCase() === a.toLowerCase());
    const bi = SIZE_ORDER.findIndex((s) => s.toLowerCase() === b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
}
