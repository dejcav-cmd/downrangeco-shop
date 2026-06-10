import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        bg: "#09090B",
        bg2: "#111113",
        bg3: "#1A1A1D",
        gold: "#C8922A",
        "gold-light": "#E0A840",
        card: "#141416",
        muted: "#888888",
        brand: "#F0EDE8",
      },
    },
  },
  plugins: [],
};

export default config;
