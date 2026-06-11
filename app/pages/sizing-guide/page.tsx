import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "Sizing Guide — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow: "// Gear that fits",
  title: "SIZING\nGUIDE",
  subtitle: "All measurements are in inches. Measure yourself and compare before ordering — every brand runs slightly different.",
  sections: [
    { id:"s1", heading:"How to Measure", body:"Use a soft tape measure, worn against skin. Don't pull tight.\n\n**Chest** — Around the fullest part, tape horizontal under your arms.\n**Waist** — Around your natural waistline, the narrowest part of your torso.\n**Length** — From the highest point of your shoulder to where you want the hem." },
    { id:"s2", heading:"Unisex T-Shirts", body:"Sizes S–5XL. Standard fit runs true to size with room through chest and waist.\n\nS: 18\" chest · 27.5\" length\nM: 20\" chest · 28.5\" length\nL: 22\" chest · 29.5\" length\nXL: 24\" chest · 30.5\" length\n2XL: 26\" chest · 31.5\" length\n3XL: 28\" chest · 32.5\" length" },
    { id:"s3", heading:"Fit Guide", body:"**Classic / Regular** — True to size. Room through chest and waist. Most of our catalog.\n**Slim Fit** — Tapered through the torso. Size up if between sizes.\n**Oversized** — Intentionally baggy. Size down for a more fitted look." },
    { id:"s4", heading:"Still Unsure?", body:"When in doubt, size up. A slightly looser shirt looks more intentional than one that's too tight. Contact us via the contact page for specific product questions." },
  ],
};
export default function Page() { return <DynamicPage slug="sizing-guide" defaults={defaults} />; }
