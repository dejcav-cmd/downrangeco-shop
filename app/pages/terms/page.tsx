import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "Terms of Service — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow:"// The rules of the range",
  title:"TERMS OF\nSERVICE",
  subtitle:"By using this store, you agree to these terms. They're straightforward — no fine print traps.",
  sections:[
    {id:"s1",heading:"Orders & Payment",body:"Placing an order is an offer to purchase. We reserve the right to cancel any order for pricing errors or suspected fraud. Prices are in USD. All payments processed securely by Shopify — we never see your full card details."},
    {id:"s2",heading:"Production & Shipping",body:"All products are printed on demand by Printify. Production: 2–7 business days. Delivery estimates are not guarantees. We are not responsible for carrier delays or customs holds."},
    {id:"s3",heading:"Returns & Refunds",body:"We don't accept returns for wrong size, change of mind, or buyer's remorse. We replace or refund items that arrive damaged, defective, or incorrect. Contact us within 30 days of delivery."},
    {id:"s4",heading:"Intellectual Property",body:"All designs and creative content are the property of Down Range Co. or used with permission. You may not reproduce or distribute our designs without written permission."},
    {id:"s5",heading:"Governing Law",body:"These terms are governed by the laws of the State of Washington, USA. Any disputes will be resolved in Washington State courts.\n\nLast updated: June 2026"},
  ],
};
export default function Page() { return <DynamicPage slug="terms" defaults={defaults} />; }
