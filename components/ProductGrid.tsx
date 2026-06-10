"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CATEGORIES = ["All", "Hunting", "2A / Patriot", "Military / Vet", "Long Range", "Apparel"];

interface Product {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: string;
  category: string;
  url: string;
}

interface Props {
  products: Product[];
  currentCategory: string;
  currentPage?: number;
  totalPages?: number;
}

export default function ProductGrid({ products, currentCategory, currentPage, totalPages }: Props) {
  const [activeCategory, setActiveCategory] = useState(currentCategory);
  const router = useRouter();

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div style={{ padding: "24px 32px 56px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "7px 14px",
              background: activeCategory === cat ? "rgba(200,146,42,0.12)" : "transparent",
              border: `1px solid ${activeCategory === cat ? "rgba(200,146,42,0.3)" : "rgba(255,255,255,0.06)"}`,
              color: activeCategory === cat ? "var(--gold)" : "var(--muted)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "20px", textTransform: "uppercase" }}>
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          No products in this category yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(totalPages ?? 0) > 1 && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "48px" }}>
          {Array.from({ length: totalPages ?? 0 }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => router.push(`/products?page=${p}`)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                padding: "8px 14px",
                background: p === (currentPage ?? 1) ? "var(--gold)" : "transparent",
                border: `1px solid ${p === (currentPage ?? 1) ? "var(--gold)" : "rgba(255,255,255,0.06)"}`,
                color: p === (currentPage ?? 1) ? "#09090B" : "var(--muted)",
                cursor: "pointer",
                fontWeight: p === (currentPage ?? 1) ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
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
        position: "relative",
        cursor: "pointer",
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "1", position: "relative", background: "var(--bg3)", overflow: "hidden" }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" opacity={0.15}>
              <rect x="8" y="16" width="44" height="28" rx="2" stroke="#C8922A" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="8" stroke="#C8922A" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(20,20,22,0.92) 0%, transparent 50%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "14px",
        }}>
          <a
            href={`/products/${product.handle}`}
            
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "var(--gold)",
              color: "#09090B",
              padding: "9px 20px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Buy Now →
          </a>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "4px",
        }}>
          {product.category}
        </div>
        <div style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text)",
          marginBottom: "10px",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--gold)",
          }}>
            {product.price}
          </span>
          <a
            href={`/products/${product.handle}`}
            
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--gold)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}
          >
            View →
          </a>
        </div>
      </div>
    </div>
  );
}
