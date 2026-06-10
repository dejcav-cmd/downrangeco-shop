"use client";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  defaultImage: string;
  variants: { id: number; title: string; price: number }[];
  tags: string[];
  category: string;
  minPrice: string;
  maxPrice: string;
  buyUrl: string;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(
    product.variants[0]?.id ?? null
  );
  const images = product.images.length ? product.images : [product.defaultImage];
  const selected = product.variants.find((v) => v.id === selectedVariant);
  const price = selected
    ? `$${(selected.price / 100).toFixed(2).replace(/\.00$/, "")}`
    : product.minPrice;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "32px", display: "flex", gap: "8px", alignItems: "center" }}>
        <a href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
        <span>›</span>
        <a href="/products" style={{ color: "var(--muted)", textDecoration: "none" }}>Products</a>
        <span>›</span>
        <span style={{ color: "var(--gold)" }}>{product.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px" }}>

        {/* Left — image gallery */}
        <div>
          {/* Main image */}
          <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "12px", position: "relative" }}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}>
                <svg width="80" height="80" viewBox="0 0 60 60" fill="none"><rect x="8" y="16" width="44" height="28" rx="2" stroke="#C8922A" strokeWidth="1.5" /><circle cx="30" cy="30" r="8" stroke="#C8922A" strokeWidth="1.5" /></svg>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: "64px", height: "64px", border: `1px solid ${i === activeImg ? "rgba(200,146,42,0.5)" : "rgba(255,255,255,0.06)"}`, overflow: "hidden", cursor: "pointer", background: "var(--bg3)", transition: "border-color 0.15s" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — product info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Category */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)" }}>
            {product.category}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "0.04em", color: "var(--text)", lineHeight: 0.95, margin: 0 }}>
            {product.title}
          </h1>

          {/* Price */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 600, color: "var(--gold)" }}>
            {price}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                Select Option
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em",
                      padding: "8px 14px",
                      background: selectedVariant === v.id ? "rgba(200,146,42,0.15)" : "transparent",
                      border: `1px solid ${selectedVariant === v.id ? "rgba(200,146,42,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: selectedVariant === v.id ? "var(--gold)" : "var(--muted)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buy button */}
          <a
            href={product.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center",
              background: "var(--gold)", color: "#09090B",
              fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "16px 32px", textDecoration: "none",
              transition: "background 0.2s, transform 0.1s",
              marginTop: "8px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-light)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            Buy Now — Complete Order on Printify →
          </a>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center" }}>
            Secure checkout · Printed & shipped in USA · Free shipping $60+
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* Description */}
          {product.description && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>Description</div>
              <div
                style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300 }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
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

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
