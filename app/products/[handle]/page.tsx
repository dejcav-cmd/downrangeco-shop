import { getProduct } from "@/lib/shopify";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  );
}
