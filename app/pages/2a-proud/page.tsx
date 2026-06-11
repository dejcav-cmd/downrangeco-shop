import DynamicPage from "@/components/DynamicPage";
export const metadata = { title: "2A Proud — Down Range Co." };
export const dynamic = "force-dynamic";
const defaults = {
  eyebrow:"// Washington State · Est. 2024",
  title:"2A PROUD.\nNO APOLOGIES.",
  subtitle:"The Second Amendment isn't a privilege. It's a right — written in plain English, confirmed by the Supreme Court, and non-negotiable. We wear it on our backs because some things are worth stating out loud.",
  sections:[
    {id:"s1",heading:"The Right to Keep & Bear Arms",body:"Not just for hunting. Not just for sport. The Second Amendment was written as a check on tyranny. That's not paranoia — it's the plain reading of the text and the intent of the founders."},
    {id:"s2",heading:"Constitutional Carry",body:"Law-abiding citizens shouldn't need government permission to exercise a constitutional right. We support permitless carry nationwide and follow Washington's CPL laws until that day comes."},
    {id:"s3",heading:"Responsible Ownership",body:"Rights come with responsibility. Safe storage, proper training, knowing your target and what's beyond it. The best argument for gun ownership is a gun owner who handles firearms with discipline and respect."},
    {id:"s4",heading:"The Hunting Tradition",body:"Two million acres of public land in Washington State. Elk, whitetail, mule deer, bear, turkey, waterfowl. Hunting is conservation, it's tradition, and it's how families stay connected to the land."},
    {id:"s5",heading:"The Brand",body:"Down Range Co. started because every hunting and shooting apparel brand either looked like a big-box store logo or was so tactical it was unwearable off the range.\n\nWashington State. One person. 400+ designs and growing. Every design comes from someone who daily carries, hunts public land, and reads 2A case law for fun."},
  ],
};
export default function Page() { return <DynamicPage slug="2a-proud" defaults={defaults} />; }
