import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout, { Section, Table, Note } from "@/components/PolicyLayout";

export const metadata = { title: "Shipping & Returns — Down Range Co." };

export default function ShippingReturnsPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// Know before you order"
          title={"SHIPPING &\nRETURNS"}
          subtitle="All products are printed on demand and fulfilled by Printify's network of US-based print providers. We don't hold inventory — your order is made specifically for you."
        >
          <Section title="How It Works">
            <p style={{ marginBottom: 14 }}>Every product in our store is printed to order. When you place an order:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {[
                "Your order is sent to a Printify print provider (typically US-based)",
                "The provider prints, quality-checks, and packages your item",
                "Your order ships directly from the print facility to your door",
                "You receive a tracking number via email once shipped",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-bebas)", fontSize: 18, color: "var(--gold)", lineHeight: 1.2, flexShrink: 0, minWidth: 20 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>
            <Note>Because products are made to order, we cannot cancel or modify orders once they enter production (typically within 24 hours of placement).</Note>
          </Section>

          <Section title="Production Time">
            <p style={{ marginBottom: 12 }}>Before shipping, your order needs to be printed. This is separate from shipping time.</p>
            <Table
              headers={["Type", "Production Time", "Notes"]}
              rows={[
                ["Standard",        "2–7 business days",   "Most orders ship within 3–4 days"],
                ["Holiday / Peak",  "Up to 10 business days", "Q4 and holiday seasons"],
                ["Express",         "1–2 business days",   "Select products only — see product page"],
              ]}
            />
            <Note>Production time starts when your order is submitted and payment clears. Orders placed on weekends or holidays begin production on the next business day.</Note>
          </Section>

          <Section title="US Shipping Rates & Times">
            <Table
              headers={["Method", "Transit Time", "Cost"]}
              rows={[
                ["Standard",   "3–5 business days",  "Calculated at checkout"],
                ["Priority",   "2–3 business days",  "Calculated at checkout"],
                ["Express",    "1–2 business days",  "Calculated at checkout"],
              ]}
            />
            <p style={{ marginTop: 12 }}>Free standard shipping on US orders over $60.</p>
          </Section>

          <Section title="International Shipping">
            <Table
              headers={["Region", "Estimated Transit", "Notes"]}
              rows={[
                ["Canada",         "5–10 business days",   "Customs may cause delays"],
                ["UK / Europe",    "5–14 business days",   "VAT may apply at delivery"],
                ["Australia / NZ", "10–20 business days",  "Local fulfillment where available"],
                ["Rest of World",  "10–30 business days",  "Varies by carrier and destination"],
              ]}
            />
            <Note>International customers are responsible for any customs duties, taxes, or import fees charged by their country. These are not included in our prices and will be collected at delivery.</Note>
          </Section>

          <Section title="Tracking Your Order">
            <p style={{ marginBottom: 10 }}>Once your order ships, you'll receive an email with a tracking number. You can track directly:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Your Account", "Log in at shop.downrangeco.com/account — tracking shows in your order history"],
                ["Email", "Check your order confirmation email for the tracking link"],
                ["Carrier site", "Use your tracking number directly at USPS, UPS, DHL, or your carrier's website"],
              ].map(([label, desc]) => (
                <div key={label as string} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", paddingTop: 1 }}>{label}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Returns & Exchanges">
            <p style={{ marginBottom: 14 }}>Because every item is printed specifically for you, we <strong style={{ color: "var(--text)" }}>do not accept returns or exchanges</strong> for buyer's remorse, wrong size selected, or change of mind. Please review our sizing guide carefully before ordering.</p>

            <p style={{ marginBottom: 12 }}>We <strong style={{ color: "var(--gold)" }}>will replace or refund</strong> your order if:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {[
                "The item arrives damaged or defective",
                "There is a print quality issue (misalignment, fading, incorrect placement)",
                "You received the wrong item or size",
                "The package was lost in transit (after 30 days for US, 45 days international)",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--gold)", fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <Note>To request a replacement or refund, contact us within 30 days of delivery with your order number and a clear photo of the issue. We'll make it right.</Note>
          </Section>

          <Section title="Damaged or Defective Items">
            <p style={{ marginBottom: 12 }}>If your order arrives damaged or has a quality issue, please contact us within <strong style={{ color: "var(--text)" }}>30 days of delivery</strong> with:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Your order number", "A photo of the item showing the issue", "A brief description of the problem"].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", fontSize: 12, flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12 }}>Contact us at: <a href="mailto:support@downrangeco.com" style={{ color: "var(--gold)" }}>support@downrangeco.com</a> or via our <a href="/pages/contact" style={{ color: "var(--gold)" }}>contact page</a>.</p>
          </Section>

          <Section title="Order Cancellations">
            <p>Orders can be cancelled within <strong style={{ color: "var(--text)" }}>24 hours of placement</strong> if they have not yet entered production. After that, cancellations are not possible as the item is already being made. Contact us immediately at <a href="mailto:support@downrangeco.com" style={{ color: "var(--gold)" }}>support@downrangeco.com</a> if you need to cancel.</p>
          </Section>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
