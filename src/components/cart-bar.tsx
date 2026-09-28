"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

export default function CartBar() {
  const { totalItems, total } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pointer-events-none animate-slide-up">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <Link
          href="/order"
          className="flex items-center justify-between w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-2xl px-5 py-4 shadow-[0_8px_30px_rgba(240,100,0,0.3)] border border-brand-500 transition-all duration-150 touch-manipulation"
          aria-label={`View cart — ${totalItems} items, total ₹${total}`}
        >
          <div className="flex items-center gap-3">
            <span className="bg-white text-brand-700 rounded-xl w-9 h-9 flex items-center justify-center text-sm font-black shadow-inner">
              {totalItems}
            </span>
            <span className="font-bold text-[15px] tracking-wide">
              {totalItems === 1 ? "1 item" : `${totalItems} items`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black text-lg">₹{total}</span>
            <span className="text-sm font-bold text-white/90 bg-black/15 px-3 py-1.5 rounded-lg flex items-center gap-1">
              VIEW CART <span>→</span>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
