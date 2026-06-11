import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "Privacy Policy — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow:"// Your data, handled straight",
  title:"PRIVACY\nPOLICY",
  subtitle:"We collect only what we need to run the store. We don't sell your data. We don't run ads. We're a one-person operation — not a data broker.",
  sections:[
    {id:"s1",heading:"What We Collect",body:"When you place an order, Shopify collects your name, email, shipping address, and payment information. We never see your full card number — payments are processed by Shopify's PCI-DSS compliant infrastructure."},
    {id:"s2",heading:"How We Use It",body:"**Order fulfillment** — Your name and address are passed to Printify to print and ship your order.\n**Account management** — Email is used for order confirmations and shipping notifications.\n**Store improvement** — Aggregate, anonymized data helps us improve the store.\n**Legal compliance** — Transaction records retained as required by law."},
    {id:"s3",heading:"What We Don't Do",body:"• Sell or rent your personal information to third parties\n• Share your data with advertisers\n• Use your data to build marketing profiles\n• Send unsolicited marketing emails without consent"},
    {id:"s4",heading:"Third-Party Services",body:"**Shopify** — E-commerce platform, checkout, and customer accounts.\n**Printify** — Receives your shipping address to fulfill orders.\n**Vercel** — Website hosting and infrastructure."},
    {id:"s5",heading:"Your Rights",body:"You can request access to, correction of, or deletion of your personal data at any time. Contact support@downrangeco.com. We'll respond within 30 days.\n\nLast updated: June 2026"},
  ],
};
export default function Page() { return <DynamicPage slug="privacy" defaults={defaults} />; }
