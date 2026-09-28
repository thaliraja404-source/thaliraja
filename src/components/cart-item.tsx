"use client";

import { useCart } from "@/context/cart-context";
import type { CartItem } from "@/types/order";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart();

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

      {/* Name & price */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-ink-900 text-[15px] leading-snug truncate">
          {item.food.name}
        </p>
        <p className="text-ink-800/70 text-xs font-medium mt-0.5">₹{item.food.price} each</p>
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
