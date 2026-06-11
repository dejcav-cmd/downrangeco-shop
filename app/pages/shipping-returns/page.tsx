import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "Shipping & Returns — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow: "// Know before you order",
  title: "SHIPPING &\nRETURNS",
  subtitle: "Every item is printed on demand — made specifically for your order by Printify's US print network. No inventory. No waste.",
  sections: [
    { id:"s1", heading:"How It Works", body:"Every product is printed to order. When you place an order:\n\n1. Your order is sent to a Printify print provider (typically US-based)\n2. The provider prints, quality-checks, and packages your item\n3. Your order ships directly from the print facility to your door\n4. You receive a tracking number via email once shipped" },
    { id:"s2", heading:"Production Time", body:"**Standard:** 2–7 business days\n**Holiday / Peak:** Up to 10 business days\n**Express:** 1–2 business days (select products only)\n\nProduction starts when payment clears. Weekend/holiday orders begin the next business day." },
    { id:"s3", heading:"US Shipping", body:"**Standard:** 3–5 business days — Free on orders over $60\n**Priority:** 2–3 business days\n**Express:** 1–2 business days\n\nRates calculated at checkout." },
    { id:"s4", heading:"International Shipping", body:"**Canada:** 5–10 business days\n**UK / Europe:** 5–14 business days\n**Australia / NZ:** 10–20 business days\n**Rest of World:** 10–30 business days\n\nCustoms duties and import taxes are the customer's responsibility." },
    { id:"s5", heading:"Returns & Exchanges", body:"Because every item is made to order, we **do not accept returns** for wrong size selected, change of mind, or buyer's remorse.\n\nWe **will replace or refund** if:\n• The item arrives damaged or defective\n• There is a print quality issue\n• You received the wrong item or size\n• The package was lost in transit (30+ days US, 45+ days international)\n\nContact us within 30 days of delivery with your order number and a photo." },
  ],
};
export default function Page() { return <DynamicPage slug="shipping-returns" defaults={defaults} />; }
