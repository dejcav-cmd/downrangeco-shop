import { getProducts, getCategory, formatMoney } from "@/lib/shopify";
import ProductGrid from "@/components/ProductGrid";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ cursor?: string; category?: string }> }) {
  const params = await searchParams;
  const category = params.category ?? "All";

  let products: any[] = [];
  let pageInfo = { hasNextPage: false, endCursor: null };
  let error = false;

  try {
    // Build Shopify query from category filter
    const tagQuery = category !== "All" ? buildTagQuery(category) : undefined;
    const data = await getProducts(24, undefined, tagQuery);
    products = data.nodes.map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      image: p.featuredImage?.url ?? "",
      price: formatMoney(p.priceRange.minVariantPrice.amount),
      category: getCategory(p),
    }));
    pageInfo = data.pageInfo;
  } catch { error = true; }

  return (
    <>
      <Masthead />
      <main style={{ minHeight: "80vh", background: "var(--bg)" }}>
        <div style={{ padding: "40px 32px 0", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" }}>// Shop</div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "48px", letterSpacing: "0.06em", color: "var(--text)", margin: 0 }}>
            ALL <span style={{ color: "var(--gold)" }}>PRODUCTS</span>
          </h1>
        </div>
        {error
          ? <div style={{ padding: "80px 32px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>Could not load products. Try refreshing.</div>
          : <ProductGrid products={products} currentCategory={category} />
        }
      </main>
      <Footer />
    </>
  );
}

function buildTagQuery(category: string): string {
  const map: Record<string, string> = {
    "Hunting": "tag:hunting OR tag:elk OR tag:deer OR tag:turkey OR tag:waterfowl OR tag:bow",
    "2A / Patriot": "tag:2a OR tag:patriot OR tag:second-amendment OR tag:1776",
    "Military / Vet": "tag:military OR tag:veteran OR tag:vet OR tag:army OR tag:marines",
    "Long Range": "tag:long-range OR tag:mrad OR tag:milradian OR tag:precision OR tag:sniper",
  };
  return map[category] ?? "";
}
