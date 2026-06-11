import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { ThemeProvider } from "@/context/ThemeContext";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
