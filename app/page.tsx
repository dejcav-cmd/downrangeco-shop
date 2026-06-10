import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import StatStrip from "@/components/StatStrip";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import MissionStrip from "@/components/MissionStrip";
import Footer from "@/components/Footer";
import { getProducts, getDefaultImage, getMinPrice, formatPrice, getProductUrl, getCategory } from "@/lib/printify";

export const revalidate = 300; // revalidate every 5 min

export default async function Home() {
  let featured: any[] = [];

  try {
    const data = await getProducts(1, 8);
    featured = data.data
      .filter((p) => p.visible)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        title: p.title,
        image: getDefaultImage(p),
        price: formatPrice(getMinPrice(p)),
        category: getCategory(p),
        url: getProductUrl(p),
      }));
  } catch {
    // fail silently — FeaturedProducts handles empty state
  }

  return (
    <>
      <Nav />
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
