import { getProduct, getDefaultImage, getAllImages, getMinPrice, getMaxPrice, formatPrice, getProductUrl, getCategory } from "@/lib/printify";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: any = null;
  try {
    const raw = await getProduct(id);
    product = {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      images: getAllImages(raw),
      defaultImage: getDefaultImage(raw),
      variants: raw.variants.filter((v) => v.is_enabled),
      tags: raw.tags,
      category: getCategory(raw),
      minPrice: formatPrice(getMinPrice(raw)),
      maxPrice: formatPrice(getMaxPrice(raw)),
      buyUrl: getProductUrl(raw),
    };
  } catch {
    notFound();
  }

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
