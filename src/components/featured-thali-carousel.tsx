"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import type { FoodItem } from "@/types/menu";
import type { UICategory } from "@/lib/api/menu";

interface FeaturedThaliCarouselProps {
  items: FoodItem[];
  categories: UICategory[];
}

export default function FeaturedThaliCarousel({ items, categories }: FeaturedThaliCarouselProps) {
  const { addItem, getQuantity, increaseQuantity } = useCart();
  
  // Find the category ID for "Thali"
  const thaliCategory = categories.find(
    (c) => c.label.toLowerCase() === "thali"
  );
  
  // Filter for available thalis. Prioritize "Special Thali" to be first if it exists.
  const featuredItems = items.filter(
    (item) => thaliCategory && item.category === thaliCategory.id && item.available
  ).sort((a, b) => {
    if (a.name.toLowerCase().includes("special thali")) return -1;
    if (b.name.toLowerCase().includes("special thali")) return 1;
    return 0;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  }, [featuredItems.length]);

  useEffect(() => {
    if (featuredItems.length <= 1 || isPaused || prefersReducedMotion) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [featuredItems.length, isPaused, prefersReducedMotion, nextSlide]);

  if (featuredItems.length === 0) {
    return null; // Don't show the section if no thalis are available
  }

  return (
    <section 
      className="bg-cream-100 px-4 py-6 border-b border-cream-200 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-2xl mx-auto relative h-[400px] sm:h-[200px]">
        {/* Navigation controls - only show if there's more than 1 item */}
        {featuredItems.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-20 flex justify-between pointer-events-none px-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md text-ink-900 hover:bg-white transition-colors border border-cream-200"
              aria-label="Previous featured thali"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md text-ink-900 hover:bg-white transition-colors border border-cream-200"
              aria-label="Next featured thali"
            >
              →
            </button>
          </div>
        )}

        {/* Stacked Cards */}
        <div className="relative w-full h-full flex justify-center perspective-[1000px]">
          {featuredItems.map((item, index) => {
            // Calculate relative position based on current index
            // e.g. 0 is front, 1 is back 1, 2 is back 2
            let diff = (index - currentIndex + featuredItems.length) % featuredItems.length;
            
            // If there's 3 or more items, we only show diff=0, 1, 2. Others are hidden.
            // If only 2 items, we show diff=0, 1.
            const isVisible = diff <= 2;
            
            // Handle edge case for smooth looping back
            if (!prefersReducedMotion && featuredItems.length > 2) {
              const reverseDiff = (currentIndex - index + featuredItems.length) % featuredItems.length;
              if (reverseDiff === 1) {
                // Item just moved to the back (slide out left/fade out)
                diff = -1;
              }
            }

            // Calculate styles based on position
            let zIndex = 10 - Math.abs(diff);
            let opacity = 1;
            let transform = "translate3d(0, 0, 0) scale(1)";
            
            if (diff === 0) {
              transform = "translate3d(0, 0, 0) scale(1)";
              opacity = 1;
            } else if (diff === 1) {
              transform = "translate3d(0px, 12px, -40px) scale(0.95)";
              opacity = 0.9;
            } else if (diff === 2) {
              transform = "translate3d(0px, 24px, -80px) scale(0.9)";
              opacity = 0.7;
            } else if (diff === -1) {
              transform = "translate3d(-20px, 0px, 0px) scale(1.05)";
              opacity = 0;
            } else {
              opacity = 0;
              zIndex = -1;
            }

            if (prefersReducedMotion) {
              transform = "none";
              opacity = diff === 0 ? 1 : 0;
            }

            return (
              <div
                key={item.id}
                className="absolute inset-0 w-full max-w-[95%] sm:max-w-full mx-auto"
                style={{
                  zIndex,
                  opacity,
                  transform,
                  visibility: isVisible || diff === -1 ? "visible" : "hidden",
                  transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
                onClick={() => {
                  if (diff !== 0 && featuredItems.length > 1) {
                    setCurrentIndex(index);
                  }
                }}
              >
                <div 
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-cream-200 flex flex-col sm:flex-row h-full w-full ${diff !== 0 ? "cursor-pointer" : ""}`}
                >
                  <div className="sm:w-2/5 h-40 sm:h-auto relative overflow-hidden bg-brand-100 shrink-0">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 40vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl select-none">
                        🍽️
                      </div>
                    )}
                    {item.name.toLowerCase().includes("special") && (
                      <div className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                        Chef's Special
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 sm:w-3/5 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-leaf' : 'border-red-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-leaf' : 'bg-red-600'}`}></span>
                      </span>
                      <span className={`font-bold text-xs uppercase tracking-wide ${item.isVeg ? 'text-leaf' : 'text-red-600'}`}>
                        {item.isVeg ? 'Pure Veg' : 'Non Veg'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-ink-900 leading-tight mb-2">{item.name}</h2>
                    <div className="flex flex-col mb-4 grow w-full">
                      <p 
                        id={`carousel-desc-${item.id}`}
                        className={`text-ink-800 text-sm whitespace-pre-line break-words w-full ${expandedItems[item.id] ? "overflow-y-auto max-h-[100px] sm:max-h-[80px] pr-2 line-clamp-none" : "line-clamp-2 sm:line-clamp-3"}`}
                      >
                        {item.description}
                      </p>
                      {item.description && item.description.length > 70 && diff === 0 && (
                        <button
                          type="button"
                          aria-expanded={expandedItems[item.id]}
                          aria-controls={`carousel-desc-${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                          }}
                          className="text-brand-600 font-bold text-xs mt-1 self-start hover:underline focus:outline-none cursor-pointer relative z-20"
                        >
                          {expandedItems[item.id] ? "Read less" : "Read more"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-black text-brand-700">₹{item.price}</span>
                      <button 
                        type="button"
                        disabled={diff !== 0} // Prevent clicks when it's a background card
                        className="bg-brand-600 active:bg-brand-700 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-full shadow-sm touch-manipulation cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (getQuantity(item.id) > 0) {
                            increaseQuantity(item.id);
                          } else {
                            addItem(item);
                          }
                        }}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
