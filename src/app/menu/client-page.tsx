"use client";

import { useState, useMemo } from "react";
import type { FoodItem } from "@/types/menu";
import type { UICategory } from "@/lib/api/menu";
import RestaurantHeader from "@/components/restaurant-header";
import CategoryTabs from "@/components/category-tabs";
import FoodCard from "@/components/food-card";
import CartBar from "@/components/cart-bar";
import FeaturedThaliCarousel from "@/components/featured-thali-carousel";

import type { Restaurant } from "@/types/database";

export default function ClientMenuPage({
  categories,
  items,
  restaurant
}: {
  categories: UICategory[];
  items: FoodItem[];
  restaurant?: Restaurant | null;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  return (
    <>
      <RestaurantHeader dbRestaurant={restaurant} />
      
      {/* Hero Section */}
      <FeaturedThaliCarousel items={items} />

      <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-800 bg-white rounded-2xl border border-cream-200 shadow-sm mt-4">
            <span className="text-5xl mb-4">🍽️</span>
            <p className="font-bold text-lg">Nothing here yet</p>
            <p className="text-sm text-ink-800/70 mt-1">Check back later for new items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        )}
      </main>

      <CartBar />
    </>
  );
}
