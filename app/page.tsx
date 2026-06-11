import Masthead from "@/components/Masthead";
import Hero from "@/components/Hero";
import StatStrip from "@/components/StatStrip";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import MissionStrip from "@/components/MissionStrip";
import Footer from "@/components/Footer";
import { getProducts, getCategory, formatMoney } from "@/lib/shopify";

export const revalidate = 300;

export default async function Home() {
  let featured: any[] = [];
  try {
    const data = await getProducts(8);
    featured = data.nodes.map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      image: p.featuredImage?.url ?? "",
      price: formatMoney(p.priceRange.minVariantPrice.amount),
      category: getCategory(p),
    }));
  } catch {}

  return (
    <>
      <Masthead />
      <main>
        <Hero />
        <StatStrip />
        <Categories />
        <FeaturedProducts products={featured} />
        <MissionStrip />
      </main>
      <Footer />
    </>
  );
}
