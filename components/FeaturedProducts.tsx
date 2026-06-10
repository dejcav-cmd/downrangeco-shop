"use client";
import { useState } from "react";

interface Product {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: string;
  category: string;
  url: string;
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section style={{ padding: "56px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: "28px", paddingBottom: "16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" }}>
            // Live from the store
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "38px", letterSpacing: "0.06em", color: "var(--text)", lineHeight: 1 }}>
            FEATURED <span style={{ color: "var(--gold)" }}>PRODUCTS</span>
          </h2>
        </div>
        <a
          href="/products"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}
        >
          Shop All →
        </a>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <a
          href="/products"
          style={{
            display: "inline-block",
            background: "transparent",
            border: "1px solid rgba(200,146,42,0.3)",
            color: "var(--gold)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "13px 36px",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(200,146,42,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          View All Products
        </a>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card)",
        border: `1px solid ${hovered ? "rgba(200,146,42,0.3)" : "rgba(255,255,255,0.06)"}`,
        transition: "border-color 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "1", background: "var(--bg3)", position: "relative", overflow: "hidden" }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 60 60" fill="none" opacity={0.15}>
              <path d="M30 5L10 20L20 25L20 55L40 55L40 25L50 20Z" stroke="#C8922A" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(20,20,22,0.9) 0%, transparent 50%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "12px",
        }}>
          <a
            href={`/products/${product.handle}`}
            
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em",
              textTransform: "uppercase", background: "var(--gold)", color: "#09090B",
              padding: "8px 18px", textDecoration: "none", fontWeight: 600,
            }}
          >
            Buy Now →
          </a>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "11px 13px 13px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "3px" }}>
          {product.category}
        </div>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text)", marginBottom: "8px", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.title}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--gold)" }}>
          {product.price}
        </div>
      </div>
    </div>
  );
}
