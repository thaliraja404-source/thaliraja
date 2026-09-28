"use client";

import { useCallback } from "react";
import type { UICategory } from "@/lib/api/menu";

interface CategoryTabsProps {
  categories: UICategory[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const handleClick = useCallback(
    (id: string) => () => onChange(id),
    [onChange]
  );

  const allTab = { id: "all", label: "All", emoji: "🍽️" };
  const tabs = [allTab, ...categories];

  return (
    <div className="bg-cream-50 border-b border-cream-200 sticky top-[112px] z-20 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <div
          className="flex gap-1.5 px-3 py-2.5 overflow-x-auto scrollbar-none items-center"
          role="tablist"
          aria-label="Food categories"
        >
          {tabs.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={handleClick(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold whitespace-nowrap shrink-0 touch-manipulation cursor-pointer border ${isActive
                  ? "bg-brand-600 text-white border-brand-600 shadow-md"
                  : "bg-white text-ink-800 border-cream-200 active:bg-cream-100 shadow-sm"
                  }`}
              >
                <span className="pointer-events-none text-base">{cat.emoji}</span>
                <span className="pointer-events-none tracking-wide">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
