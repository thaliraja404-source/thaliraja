"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import type { CartItem } from "@/types/order";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const clampedRef = useRef<HTMLParagraphElement>(null);
  const fullRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (clampedRef.current && fullRef.current) {
        const clampedHeight = clampedRef.current.clientHeight;
        const fullHeight = fullRef.current.clientHeight;
        // Adding 2px tolerance for sub-pixel rendering issues
        setIsTruncatable(fullHeight > clampedHeight + 2);
      }
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(() => checkTruncation());
    if (clampedRef.current) resizeObserver.observe(clampedRef.current);
    if (fullRef.current) resizeObserver.observe(fullRef.current);

    return () => resizeObserver.disconnect();
  }, [item.food.description]);

  return (
    <div className="flex items-center gap-3 py-4 border-b border-cream-100 last:border-0 animate-fade-in">
      {/* Veg indicator */}
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
          item.food.isVeg ? "border-leaf" : "border-red-600"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            item.food.isVeg ? "bg-leaf" : "bg-red-600"
          }`}
        />
      </div>

      {/* Name, description & price */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-ink-900 text-[15px] leading-snug truncate">
          {item.food.name}
        </p>
        
        {item.food.description && (
          <div className="mt-1 relative">
            {/* Invisible measurement clones */}
            <p 
              ref={clampedRef} 
              className="absolute top-0 left-0 w-full invisible pointer-events-none line-clamp-2 text-ink-800 text-[13px] leading-relaxed whitespace-pre-line break-words"
              aria-hidden="true"
            >
              {item.food.description}
            </p>
            <p 
              ref={fullRef} 
              className="absolute top-0 left-0 w-full invisible pointer-events-none text-ink-800 text-[13px] leading-relaxed whitespace-pre-line break-words"
              aria-hidden="true"
            >
              {item.food.description}
            </p>

            {/* Visible text */}
            <p 
              id={`cart-desc-${item.food.id}`}
              className={`text-ink-800 text-[13px] leading-relaxed whitespace-pre-line break-words ${isExpanded ? "" : "line-clamp-2"}`}
            >
              {item.food.description}
            </p>
            {isTruncatable && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`cart-desc-${item.food.id}`}
                className="text-brand-600 font-bold text-[12px] mt-1 hover:underline focus:outline-none"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
        
        <p className={`text-ink-800/70 text-xs font-medium ${item.food.description ? "mt-1.5" : "mt-0.5"}`}>
          ₹{item.food.price} each
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5 shrink-0 bg-cream-50 rounded-xl p-1 border border-cream-200">
        <button
          onClick={() => decreaseQuantity(item.food.id)}
          className="w-7 h-7 rounded-lg bg-white border border-cream-200 text-ink-900 hover:bg-cream-100 font-black text-base leading-none transition-colors shadow-sm flex items-center justify-center touch-manipulation cursor-pointer"
          aria-label={`Remove one ${item.food.name}`}
        >
          −
        </button>
        <span className="w-6 text-center font-extrabold text-brand-700 text-sm">
          {item.quantity}
        </span>
        <button
          onClick={() => increaseQuantity(item.food.id)}
          className="w-7 h-7 rounded-lg bg-white border border-cream-200 text-ink-900 hover:bg-cream-100 font-black text-base leading-none transition-colors shadow-sm flex items-center justify-center touch-manipulation cursor-pointer"
          aria-label={`Add one more ${item.food.name}`}
        >
          +
        </button>
      </div>

      {/* Line total */}
      <div className="w-14 text-right shrink-0">
        <span className="font-black text-ink-900 text-[15px]">
          ₹{item.food.price * item.quantity}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.food.id)}
        className="text-ink-800/40 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
        aria-label={`Remove ${item.food.name} from cart`}
      >
        ✕
      </button>
    </div>
  );
}
