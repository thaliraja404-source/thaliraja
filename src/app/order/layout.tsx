import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Place Order",
  description: "Review your cart and place your order via WhatsApp.",
  robots: { index: false },
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
