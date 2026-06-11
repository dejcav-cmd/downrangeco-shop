import { getProduct } from "@/lib/shopify";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ handle: string }> }
): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product Not Found — Down Range Co." };

  const title = `${product.title} — Hunting & 2A Apparel | Down Range Co.`;
  const description = product.description
    ? product.description.slice(0, 155) + (product.description.length > 155 ? "…" : "")
    : `${product.title} — premium print-on-demand apparel from Down Range Co. Built for hunters, shooters, and 2A patriots. Washington-owned, American-printed.`;
  const image = (product.images as any)?.[0]?.url ?? "https://shop.downrangeco.com/og-default.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://shop.downrangeco.com/products/${handle}`,
      images: [{ url: image, width: 800, height: 800, alt: product.title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  // JSON-LD Product schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? "",
    image: (product.images as any)?.map?.((i: any) => i.url) ?? [],
    url: `https://shop.downrangeco.com/products/${product.handle}`,
    brand: { "@type": "Brand", name: "Down Range Co." },
    offers: {
      "@type": "Offer",
      url: `https://shop.downrangeco.com/products/${product.handle}`,
      priceCurrency: (product.variants as any)?.[0]?.price?.currencyCode ?? "USD",
      price: (product.variants as any)?.[0]?.price?.amount ?? "0",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Down Range Co." },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Masthead />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  );
}
