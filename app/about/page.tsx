import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";

export const metadata = {
  title: "Our Story — Down Range Co.",
  description: "From a 2A news portal to a full apparel brand — the story of Down Range Co., built in Washington State by a daily carrier and hunter who got tired of the mainstream narrative.",
};

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <main style={{ background: "var(--bg)" }}>
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
