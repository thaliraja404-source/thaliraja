import type { Metadata } from "next";
import Link from "next/link";
import RestaurantInfo from "@/components/restaurant-info";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_ID } from "@/lib/api/menu";

export const metadata: Metadata = {
  title: "Restaurant Info",
  description:
    "Find Thali Raja's location, opening hours, and contact details. Order fresh food in Shivpuri, Madhya Pradesh.",
};

export default async function InfoPage() {
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", RESTAURANT_ID)
    .single();

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-cream-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/menu"
            className="text-ink-800 hover:text-brand-600 transition-colors p-1"
            aria-label="Back to menu"
          >
            ←
          </Link>
          <h1 className="font-extrabold text-ink-900 text-lg">Restaurant Info</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <RestaurantInfo dbRestaurant={restaurant} />
      </main>
    </div>
  );
}
