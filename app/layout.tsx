import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";


const SITE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://shop.downrangeco.com/#organization",
    "name": "Down Range Co.",
    "url": "https://shop.downrangeco.com",
    "logo": { "@type": "ImageObject", "url": "https://shop.downrangeco.com/logo.png", "width": 2170, "height": 263 },
    "description": "Premium print-on-demand apparel for hunters, shooters, and 2A patriots. Washington-owned, American-printed.",
    "foundingDate": "2026",
    "areaServed": "United States",
    "sameAs": ["https://downrangeco.com"],
    "contactPoint": { "@type": "ContactPoint", "email": "support@downrangeco.com", "contactType": "customer service" }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://shop.downrangeco.com/#website",
    "url": "https://shop.downrangeco.com",
    "name": "Down Range Co.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": "https://shop.downrangeco.com/products?search={search_term_string}" },
      "query-input": "required name=search_term_string"
    }
  }
];

export const viewport = {
  themeColor: "#C8922A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Down Range Co. — Gear for Hunters, Shooters & 2A Patriots",
  description: "Premium print-on-demand apparel for hunters, shooters, and those who stand for the Second Amendment.",
  openGraph: {
    title: "Down Range Co.",
    description: "Built for the field. Premium hunting & 2A apparel.",
    url: "https://shop.downrangeco.com",
    siteName: "Down Range Co.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0W94F3WK15"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0W94F3WK15');
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
