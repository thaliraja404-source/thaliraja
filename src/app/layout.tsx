import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { RESTAURANT_CONFIG } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Thali Raja | Fresh Food in Shivpuri",
    template: "%s | Thali Raja",
  },
  description:
    "View the Thali Raja menu, check today's food, and order easily through WhatsApp. Fresh home-style food in Shivpuri, Madhya Pradesh.",
  keywords: [
    "Thali Raja",
    "Shivpuri",
    "Madhya Pradesh",
    "dhaba",
    "restaurant",
    "thali",
    "online menu",
    "WhatsApp order",
  ],
  openGraph: {
    title: "Thali Raja | Fresh Food in Shivpuri",
    description:
      "View the Thali Raja menu, check today's food, and order easily through WhatsApp.",
    siteName: RESTAURANT_CONFIG.name,
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-cream-50 text-ink-900 font-sans antialiased selection:bg-brand-200 selection:text-ink-950">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
