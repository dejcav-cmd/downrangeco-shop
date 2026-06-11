"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PolicyLayout from "@/components/PolicyLayout";

const FAQS = [
  {
    category: "Orders & Products",
    questions: [
      { q: "How long will my order take?", a: "Most orders ship within 2–7 business days after production. US transit is typically 3–5 business days after that, so expect your order in about 5–12 business days total. See our full Shipping & Returns page for details." },
      { q: "Can I change or cancel my order?", a: "Orders can be cancelled or modified within 24 hours of placement if they haven't entered production. After that, we can't make changes. Contact us immediately at support@downrangeco.com if you need help." },
      { q: "Do you accept returns?", a: "We don't accept returns for wrong size, change of mind, or buyer's remorse — every item is printed specifically for your order. However, we will replace or refund any item that arrives damaged, defective, or incorrect. See our Shipping & Returns page for details." },
      { q: "Where are products made?", a: "All products are printed on demand by Printify's network of US-based print providers. We don't hold inventory. Your item is printed fresh for your order, typically by a facility close to your delivery address." },
      { q: "What brands are the blanks?", a: "We use quality blanks from Gildan, Bella+Canvas, and similar reputable manufacturers depending on the product and print provider. Specific blank info is listed on each product page." },
    ],
  },
  {
    category: "Sizing & Fit",
    questions: [
      { q: "How do I know what size to order?", a: "Check our Sizing Guide page for detailed measurements. In general, our t-shirts run true to size with a standard/classic fit. When in doubt, size up — a slightly looser fit looks better than one that's too tight." },
      { q: "Will my shirt shrink after washing?", a: "Most garments are pre-shrunk, but you may see 1–5% shrinkage after the first wash. Follow the care instructions on the label. Cold wash, tumble dry low is the safest for printed garments." },
      { q: "I ordered the wrong size. Can I exchange it?", a: "We can't exchange items unless they arrived defective or incorrect. Because everything is made to order, exchanges would mean printing a new item. Please check our sizing guide carefully before ordering." },
    ],
  },
  {
    category: "Shipping & Tracking",
    questions: [
      { q: "Do you offer free shipping?", a: "Yes — free standard shipping on US orders over $60. Shipping costs for smaller orders and international shipments are calculated at checkout." },
      { q: "Do you ship internationally?", a: "Yes, we ship to most countries worldwide. International transit times vary from 5–30 business days depending on your location. Customs duties and import taxes are the customer's responsibility." },
      { q: "My order hasn't arrived — what do I do?", a: "First, check your tracking link from the shipping confirmation email. If tracking shows delivered but you haven't received it, check with neighbors and your local post office. If tracking hasn't updated in 7+ business days, contact us at support@downrangeco.com." },
      { q: "Why doesn't my tracking show any updates?", a: "Tracking updates can take 24–48 hours after the label is created. Once the package is in the carrier network, updates are more frequent. If no movement after 5 business days, contact us." },
    ],
  },
  {
    category: "Payments & Security",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, and Google Pay via Shopify's secure checkout." },
      { q: "Is my payment information secure?", a: "Yes. All payments are processed by Shopify, which is PCI DSS compliant. We never see or store your full card details." },
      { q: "Will I be charged sales tax?", a: "Sales tax is collected where required by law, calculated at checkout based on your delivery address." },
    ],
  },
  {
    category: "About Down Range Co.",
    questions: [
      { q: "Who runs Down Range Co.?", a: "Down Range Co. is a one-man operation based in Washington State. Every design comes from someone who daily carries, hunts, and actively follows Second Amendment legislation. No marketing teams, no corporate backing." },
      { q: "What is the DownRange news portal?", a: "downrangeco.com is our companion intelligence portal — a daily-updated news and research hub covering 2A legislation, court cases, gear reviews, hunting seasons, and CCW laws for all 50 states. Same brand, different side of the mission." },
      { q: "Do you donate to 2A organizations?", a: "We actively support Second Amendment advocacy. A portion of proceeds goes toward supporting pro-2A legal organizations. Details coming soon on a dedicated page." },
      { q: "Can I wholesale or collaborate?", a: "Reach out via our contact page. We're open to conversations with 2A organizations, hunting clubs, and aligned brands." },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout
          eyebrow="// Got questions?"
          title="FREQUENTLY\nASKED"
          subtitle="Everything you need to know about ordering, shipping, sizing, and the brand. Can't find your answer? Hit us up on the contact page."
        >
          {FAQS.map(section => (
            <div key={section.category}>
              <div style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: "0.08em", color: "var(--gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 24, height: 1, background: "var(--gold)", display: "inline-block" }} />
                {section.category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {section.questions.map(item => (
                  <FAQItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}

          {/* Still need help */}
          <div style={{ background: "rgba(200,146,42,0.06)", border: "1px solid rgba(200,146,42,0.2)", padding: "28px 28px" }}>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 24, letterSpacing: "0.06em", color: "var(--text)", marginBottom: 8 }}>
              STILL HAVE A QUESTION?
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 20, fontWeight: 300 }}>
              We're a small operation and we read every message. Reach out and we'll get back to you within 1–2 business days.
            </p>
            <a href="/pages/contact" style={{ display: "inline-block", background: "var(--gold)", color: "#09090B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "11px 24px", textDecoration: "none" }}>
              Contact Us →
            </a>
          </div>
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }}>{question}</span>
        <span style={{ color: "var(--gold)", fontSize: 18, lineHeight: 1, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.75, fontWeight: 300, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ paddingTop: 12 }}>{answer}</div>
        </div>
      )}
    </div>
  );
}
