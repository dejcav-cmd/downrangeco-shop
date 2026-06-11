import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout, { Section, Table, Note } from "@/components/PolicyLayout";

export const metadata = { title: "Sizing Guide — Down Range Co." };

export default function SizingGuidePage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// Gear that fits"
          title={"SIZING\nGUIDE"}
          subtitle="All measurements are in inches. We recommend measuring yourself and comparing to our size charts before ordering. Sizes vary slightly by product and print provider."
        >
          <Section title="How to Measure">
            <p style={{ marginBottom: 12 }}>For the most accurate fit, measure yourself with a soft tape measure while wearing a light shirt. Don't pull the tape tight — keep it snug but comfortable.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Chest", "Measure around the fullest part of your chest, keeping the tape horizontal under your arms."],
                ["Waist", "Measure around your natural waistline, the narrowest part of your torso."],
                ["Hip", "Measure around the fullest part of your hips, about 8 inches below your waistline."],
                ["Length (shirt)", "Measure from the highest point of your shoulder down to where you want the shirt to end."],
              ].map(([label, desc]) => (
                <div key={label as string} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", paddingTop: 2 }}>{label}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Unisex T-Shirts (Standard Fit)">
            <p style={{ marginBottom: 12 }}>Most of our tees are printed on Gildan, Bella+Canvas, or similar quality blanks depending on the print provider. These charts represent typical measurements — check individual product pages for exact specs.</p>
            <Table
              headers={["Size", "Chest (in)", "Length (in)", "Sleeve (in)"]}
              rows={[
                ["S",   "18",    "27.5",  "8.5"],
                ["M",   "20",    "28.5",  "8.75"],
                ["L",   "22",    "29.5",  "9"],
                ["XL",  "24",    "30.5",  "9.25"],
                ["2XL", "26",    "31.5",  "9.5"],
                ["3XL", "28",    "32.5",  "9.75"],
                ["4XL", "30",    "33.5",  "10"],
                ["5XL", "32",    "34.5",  "10.25"],
              ]}
            />
            <Note>Measurements represent laid-flat garment dimensions. Chest measurement is half the full chest (multiply by 2 for full circumference). Shirts are pre-shrunk but may shrink 1–5% after washing.</Note>
          </Section>

          <Section title="Hoodies (Standard Fit)">
            <Table
              headers={["Size", "Chest (in)", "Length (in)", "Sleeve (in)"]}
              rows={[
                ["S",   "20",    "26",    "33"],
                ["M",   "22",    "27",    "34"],
                ["L",   "24",    "28",    "35"],
                ["XL",  "26",    "29",    "36"],
                ["2XL", "28",    "30",    "37"],
                ["3XL", "30",    "31",    "38"],
              ]}
            />
          </Section>

          <Section title="Hats (One Size)">
            <p style={{ marginBottom: 12 }}>Most of our hats are one-size-fits-most with an adjustable strap or snapback closure. Structured caps typically fit head circumferences of 54–62 cm (21–24.5 in).</p>
            <Table
              headers={["Style", "Closure", "Crown", "Fits"]}
              rows={[
                ["Snapback",     "Plastic snap",    "Structured",    "Most adults"],
                ["Dad Cap",      "Velcro / strap",  "Unstructured",  "Most adults"],
                ["Trucker",      "Plastic snap",    "Structured",    "Most adults"],
              ]}
            />
          </Section>

          <Section title="Fit Guide">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Classic / Regular Fit", "Relaxed cut with room through the chest and waist. The most common fit in our catalog. True to size."],
                ["Slim Fit", "Tapered through the torso. We recommend sizing up if you're between sizes or prefer a relaxed look."],
                ["Oversized", "Intentionally baggy. Size down if you want a more fitted look. Width is the dominant measurement."],
              ].map(([label, desc]) => (
                <div key={label as string} style={{ padding: "12px 14px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Still Not Sure?">
            <p>If you're between sizes or unsure, we recommend going up. A slightly larger shirt looks more intentional than one that's too tight. For questions about a specific product, reach out via our <a href="/pages/contact" style={{ color: "var(--gold)" }}>contact page</a> and we'll help you out.</p>
          </Section>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
