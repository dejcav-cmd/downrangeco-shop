import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import StatStrip from "@/components/StatStrip";
import Categories from "@/components/Categories";
import MissionStrip from "@/components/MissionStrip";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatStrip />
        <Categories />
        <MissionStrip />
      </main>
      <Footer />
    </>
  );
}
