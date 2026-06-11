import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout, { Section, Note } from "@/components/PolicyLayout";

export const metadata = { title: "Privacy Policy — Down Range Co." };

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// Your data, handled straight"
          title={"PRIVACY\nPOLICY"}
          subtitle="We collect only what we need to run the store. We don't sell your data. We don't run ads. We're a one-person operation — not a data broker."
        >
          <Section title="What We Collect">
            <p style={{ marginBottom: 12 }}>When you place an order or create an account, Shopify collects your name, email, shipping address, and payment information. We receive order details but <strong style={{ color: "var(--text)" }}>never see your full card number</strong> — payments are processed directly by Shopify's PCI-DSS compliant infrastructure.</p>
            <p>We may also collect your browsing behavior on this site (pages visited, products viewed) via standard analytics to improve the store experience.</p>
          </Section>

          <Section title="How We Use It">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Order fulfillment", "Your name and address are passed to Printify to print and ship your order. That's it."],
                ["Account management", "Email is used to send order confirmations, shipping notifications, and account access links."],
                ["Store improvement", "Aggregate, anonymized data helps us understand which products resonate and how to improve the store."],
                ["Legal compliance", "We retain transaction records as required by applicable tax and business law."],
              ].map(([label, desc]) => (
                <div key={label as string} style={{ padding: "12px 14px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="What We Don't Do">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Sell or rent your personal information to third parties",
                "Share your data with advertisers",
                "Use your data to build marketing profiles",
                "Send unsolicited marketing emails without your consent",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>×</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Third-Party Services">
            <p style={{ marginBottom: 12 }}>We use the following services to operate the store:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                ["Shopify", "E-commerce platform, checkout, and customer accounts. Privacy policy at shopify.com/legal/privacy"],
                ["Printify", "Print-on-demand fulfillment. Receives your shipping address to produce and ship orders. Privacy policy at printify.com/privacy-policy"],
                ["Vercel", "Website hosting and infrastructure."],
              ].map(([name, desc], i) => (
                <div key={name as string} style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "12px 16px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", background: "var(--card)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", paddingTop: 2 }}>{name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65 }}>{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Cookies">
            <p>This site uses session cookies to maintain your shopping cart and keep you logged in. We don't use tracking cookies or third-party advertising cookies. You can disable cookies in your browser but your cart won't persist between sessions.</p>
          </Section>

          <Section title="Your Rights">
            <p style={{ marginBottom: 12 }}>You can request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us at <a href="mailto:support@downrangeco.com" style={{ color: "var(--gold)" }}>support@downrangeco.com</a>. We'll respond within 30 days.</p>
            <Note>For account deletion or data export, you can also manage your data directly through your Shopify customer account at <a href="https://shopify.com/83728892116/account" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>shopify.com/83728892116/account</a>.</Note>
          </Section>

          <Section title="Contact">
            <p>Questions about this policy? Email us at <a href="mailto:support@downrangeco.com" style={{ color: "var(--gold)" }}>support@downrangeco.com</a> or use the <a href="/pages/contact" style={{ color: "var(--gold)" }}>contact page</a>.</p>
            <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>Last updated: June 2026</p>
          </Section>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
