import { getProducts, getDefaultImage, getMinPrice, formatPrice, getProductUrl, getCategory } from "@/lib/printify";
import ProductGrid from "@/components/ProductGrid";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "All Products — Down Range Co.",
  description: "Browse all hunting, 2A patriot, military/vet, and long range apparel from Down Range Co.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const category = params.category ?? "All";

  let products: any[] = [];
  let totalPages = 1;
  let error = false;

  try {
    const data = await getProducts(page, 24);
    products = data.data
      .filter((p) => p.visible)
      .map((p) => ({
        id: p.id,
        title: p.title,
        image: getDefaultImage(p),
        price: formatPrice(getMinPrice(p)),
        category: getCategory(p),
        url: getProductUrl(p),
        tags: p.tags,
      }));
    totalPages = data.last_page;
  } catch (e) {
    error = true;
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: "80vh", background: "var(--bg)" }}>
        <div style={{ padding: "40px 32px 0", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
            // Shop
          </div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "48px", letterSpacing: "0.06em", color: "var(--text)", marginBottom: "0" }}>
            ALL <span style={{ color: "var(--gold)" }}>PRODUCTS</span>
          </h1>
        </div>
        {error ? (
          <div style={{ padding: "80px 32px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            Could not load products. Try refreshing.
          </div>
        ) : (
          <ProductGrid products={products} currentCategory={category} currentPage={page} totalPages={totalPages} />
        )}
      </main>
      <Footer />
    </>
  );
}
