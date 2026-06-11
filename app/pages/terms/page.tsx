import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout, { Section, Note } from "@/components/PolicyLayout";

export const metadata = { title: "Terms of Service — Down Range Co." };

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// The rules of the range"
          title={"TERMS OF\nSERVICE"}
          subtitle="By using this store, you agree to these terms. They're straightforward — no fine print traps."
        >
          <Section title="Who We Are">
            <p>Down Range Co. is a print-on-demand apparel brand operated from Washington State. We design and sell hunting, shooting sports, and Second Amendment-themed merchandise through our Shopify storefront. Products are printed and fulfilled by Printify's network of US print providers.</p>
          </Section>

          <Section title="Orders & Payment">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Order acceptance", "Placing an order is an offer to purchase. We reserve the right to cancel any order for reasons including product unavailability, pricing errors, or suspected fraud. You'll be notified and fully refunded if we cancel."],
                ["Pricing", "Prices are in USD and subject to change without notice. The price at time of checkout is the price you pay."],
                ["Payment", "Processed securely by Shopify. We accept major credit cards, PayPal, Apple Pay, and Google Pay. We never see or store your full card details."],
                ["Sales tax", "Collected where required by law, calculated at checkout based on your delivery address."],
              ].map(([label, desc]) => (
                <div key={label as string} style={{ padding: "12px 14px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Production & Shipping">
            <p>All products are printed on demand and fulfilled by Printify. Production takes 2–7 business days. Shipping times vary by method and destination. See our <a href="/pages/shipping-returns" style={{ color: "var(--gold)" }}>Shipping & Returns page</a> for full details.</p>
            <Note>Delivery estimates are not guarantees. We are not responsible for carrier delays, customs holds, or weather-related shipping disruptions.</Note>
          </Section>

          <Section title="Returns & Refunds">
            <p>Because every product is made to order, we don't accept returns for wrong size, change of mind, or buyer's remorse. We will replace or refund items that arrive damaged, defective, or incorrect. Contact us within 30 days of delivery. Full policy at <a href="/pages/shipping-returns" style={{ color: "var(--gold)" }}>Shipping & Returns</a>.</p>
          </Section>

          <Section title="Intellectual Property">
            <p style={{ marginBottom: 12 }}>All designs, graphics, and creative content on this site are the property of Down Range Co. or are used with permission. You may not reproduce, distribute, or create derivative works from our designs without written permission.</p>
            <p>You retain ownership of any content you submit to us (e.g. custom design requests). By submitting, you grant us a license to use it for fulfilling your order.</p>
          </Section>

          <Section title="Acceptable Use">
            <p style={{ marginBottom: 12 }}>You agree not to use this site to:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Submit fraudulent orders or use stolen payment credentials",
                "Attempt to hack, scrape, or disrupt the site or its infrastructure",
                "Impersonate Down Range Co. or its staff",
                "Purchase products for resale without our written authorization",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Limitation of Liability">
            <p>Down Range Co. is not liable for indirect, incidental, or consequential damages arising from the use of this site or our products. Our total liability for any claim is limited to the amount you paid for the specific order in question.</p>
          </Section>

          <Section title="Governing Law">
            <p>These terms are governed by the laws of the State of Washington, USA. Any disputes will be resolved in Washington State courts.</p>
          </Section>

          <Section title="Changes to These Terms">
            <p>We may update these terms at any time. Continued use of the store after changes constitutes acceptance. Check this page periodically for updates.</p>
            <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>Last updated: June 2026</p>
          </Section>

          <Section title="Contact">
            <p>Questions? <a href="mailto:support@downrangeco.com" style={{ color: "var(--gold)" }}>support@downrangeco.com</a> or use the <a href="/pages/contact" style={{ color: "var(--gold)" }}>contact page</a>.</p>
          </Section>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
