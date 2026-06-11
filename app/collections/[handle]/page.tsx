import { getCollection, getCategory, formatMoney } from "@/lib/shopify";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { notFound } from "next/navigation";

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await getCollection(handle, 24);
  if (!collection) notFound();

  const products = collection.products.nodes.map((p: any) => ({
    id: p.id, handle: p.handle, title: p.title,
    image: p.featuredImage?.url ?? "",
    price: formatMoney(p.priceRange.minVariantPrice.amount),
    category: getCategory(p),
  }));

  return (
    <>
      <Masthead />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <div style={{ padding: "40px 32px 0", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" }}>// Collection</div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "48px", letterSpacing: "0.06em", color: "var(--text)", margin: "0 0 8px" }}>
            {collection.title}
          </h1>
          {collection.description && (
            <p style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 300, maxWidth: "520px", marginBottom: "0" }}>{collection.description}</p>
          )}
        </div>
        <ProductGrid products={products} currentCategory="All" />
      </main>
      <Footer />
    </>
  );
}
