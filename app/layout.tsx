import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Down Range Co. — Gear for Hunters, Shooters & 2A Patriots",
  description:
    "Premium print-on-demand apparel for hunters, shooters, and those who stand for the Second Amendment. Rifle hunting, bow hunting, waterfowl, military/vet, and 2A patriot designs.",
  openGraph: {
    title: "Down Range Co.",
    description: "Built for the field. Premium hunting & 2A apparel.",
    url: "https://shop.downrangeco.com",
    siteName: "Down Range Co.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Down Range Co.",
    description: "Built for the field. Premium hunting & 2A apparel.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
