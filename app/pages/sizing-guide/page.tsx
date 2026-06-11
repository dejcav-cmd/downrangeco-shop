import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout, { Section, Table, Note } from "@/components/PolicyLayout";

export const metadata = { title: "Sizing Guide — Down Range Co." };

export default function SizingGuidePage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout eyebrow="// Gear that fits" title={"SIZING\nGUIDE"} subtitle="All measurements are in inches. Measure yourself and compare before ordering — every brand runs slightly different.">

          <Section title="How to Measure">
            <p style={{ marginBottom: 14 }}>Use a soft tape measure, worn against skin. Don't pull tight.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Chest",   "Around the fullest part, tape horizontal under your arms."],
                ["Waist",   "Around your natural waistline, the narrowest part of your torso."],
                ["Length",  "From the highest point of your shoulder to where you want the hem."],
              ].map(([l,d]) => (
                <div key={l as string} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", paddingTop: 2 }}>{l}</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{d}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Unisex T-Shirts">
            <Table
              headers={["Size", "Chest (in)", "Length (in)", "Sleeve (in)"]}
              rows={[["S","18","27.5","8.5"],["M","20","28.5","8.75"],["L","22","29.5","9"],["XL","24","30.5","9.25"],["2XL","26","31.5","9.5"],["3XL","28","32.5","9.75"],["4XL","30","33.5","10"],["5XL","32","34.5","10.25"]]}
            />
            <Note>Chest = half the full chest measurement (multiply by 2 for circumference). Pre-shrunk, may shrink 1–5% after wash.</Note>
          </Section>

          <Section title="Hoodies">
            <Table
              headers={["Size", "Chest (in)", "Length (in)", "Sleeve (in)"]}
              rows={[["S","20","26","33"],["M","22","27","34"],["L","24","28","35"],["XL","26","29","36"],["2XL","28","30","37"],["3XL","30","31","38"]]}
            />
          </Section>

          <Section title="Fit Guide">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Classic / Regular", "True to size. Room through chest and waist. Most of our catalog."],
                ["Slim Fit",          "Tapered through the torso. Size up if between sizes."],
                ["Oversized",         "Intentionally baggy. Size down for a more fitted look."],
              ].map(([l,d]) => (
                <div key={l as string} style={{ padding: "12px 14px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Hats">
            <Table
              headers={["Style", "Closure", "Fits"]}
              rows={[["Snapback","Plastic snap","Most adults"],["Dad Cap","Velcro / strap","Most adults"],["Trucker","Plastic snap","Most adults"]]}
            />
          </Section>

          <Section title="Still unsure?">
            <p>When in doubt, size up. A slightly looser shirt looks more intentional than one that's too tight. Contact us via the <a href="/pages/contact" style={{ color: "var(--gold)" }}>contact page</a> for specific product questions.</p>
          </Section>

        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
