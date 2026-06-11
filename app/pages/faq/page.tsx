import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "FAQ — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow: "// Got questions?",
  title: "FREQUENTLY\nASKED.",
  subtitle: "Everything you need to know about ordering, shipping, sizing, and the brand. Can't find your answer? Hit us on the contact page.",
  sections: [
    { id:"s1", heading:"Orders", body:"**How long does my order take?**\nProduction: 2–7 business days. US transit: 3–5 days. Total: ~5–12 business days.\n\n**Can I cancel or change my order?**\nWithin 24 hours if not in production. Email support@downrangeco.com immediately.\n\n**Why can't I return my order?**\nEvery item is printed specifically for you. We replace defective or incorrect items — not buyer's remorse." },
    { id:"s2", heading:"Sizing", body:"**How do I know what size to order?**\nCheck our Sizing Guide. Tees run true to size. When in doubt, size up.\n\n**Will my shirt shrink?**\nPre-shrunk but may see 1–5% after first wash. Cold wash, tumble dry low is safest for printed garments." },
    { id:"s3", heading:"Shipping", body:"**Free shipping?**\nYes — free standard shipping on US orders over $60.\n\n**International?**\nYes, most countries. 5–30 business days. Customs duties are the customer's responsibility.\n\n**Tracking not updating?**\n24–48 hours after label creation. No movement after 5 business days — contact us." },
    { id:"s4", heading:"About Down Range Co.", body:"**Who runs this?**\nOne person — a daily carrier and hunter based in Washington State. Every design comes from someone who lives this lifestyle.\n\n**What is the DownRange portal?**\ndownrangeco.com — daily 2A legislation updates, court case tracking, and a CCW guide for all 50 states. Free." },
  ],
};
export default function Page() { return <DynamicPage slug="faq" defaults={defaults} />; }
