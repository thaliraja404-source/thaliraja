import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the full Thali Raja menu. Fresh thalis, rotis, sabzis, rice, and drinks. Order easily via WhatsApp from Shivpuri.",
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
