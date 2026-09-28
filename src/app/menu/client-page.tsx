"use client";

import { useState, useMemo } from "react";
import type { FoodItem } from "@/types/menu";
import type { UICategory } from "@/lib/api/menu";
import RestaurantHeader from "@/components/restaurant-header";
import CategoryTabs from "@/components/category-tabs";
import FoodCard from "@/components/food-card";
import CartBar from "@/components/cart-bar";

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
      <section className="bg-cream-100 px-4 py-6 border-b border-cream-200">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-cream-200 flex flex-col sm:flex-row">
            <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-brand-100">
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" 
                alt="Today's Special Thali"
                className="w-full h-full object-cover img-zoom"
              />
              <div className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                Chef's Special
              </div>
            </div>
            <div className="p-5 sm:w-3/5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-4 h-4 rounded border border-leaf flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-leaf"></span>
                </span>
                <span className="text-leaf font-bold text-xs uppercase tracking-wide">Pure Veg</span>
              </div>
              <h2 className="text-2xl font-black text-ink-900 leading-tight mb-2">Special Thali</h2>
              <p className="text-ink-800 text-sm mb-4 line-clamp-2">
                Paneer sabji, dal makhani, 4 roti, rice, raita, papad & gulab jamun. Our chef's pride.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-black text-brand-700">₹180</span>
                <button 
                  type="button"
                  className="bg-brand-600 active:bg-brand-700 text-white font-bold py-2 px-5 rounded-full shadow-sm touch-manipulation cursor-pointer"
                  onClick={() => {
                    document.querySelector('[aria-label="Food categories"]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
