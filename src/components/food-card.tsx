"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import type { FoodItem } from "@/types/menu";

interface FoodCardProps {
  item: FoodItem;
}

export default function FoodCard({ item }: FoodCardProps) {
  const { addItem, increaseQuantity, decreaseQuantity, getQuantity } =
    useCart();
  const quantity = getQuantity(item.id);
  const isUnavailable = !item.available;
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = item.description && item.description.length > 70;

  return (
    <article
      className={`bg-white rounded-[20px] overflow-hidden border shadow-sm transition-shadow duration-200 flex flex-col h-full ${isUnavailable
          ? "border-cream-200 opacity-60"
          : "border-cream-200 hover:shadow-md hover:border-cream-300"
        }`}
    >
      {/* Image */}
      <div className="relative w-full h-44 overflow-hidden bg-brand-50 shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={`object-cover img-zoom ${isUnavailable ? "grayscale" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">
            🍽️
          </div>
        )}
        {/* Veg/Non-veg dot */}
        <div className="absolute top-2.5 left-2.5">
          <div
            className={`w-5 h-5 rounded bg-white flex items-center justify-center shadow-sm border-2 ${item.isVeg ? "border-leaf" : "border-red-600"
              }`}
            title={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
            aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? "bg-leaf" : "bg-red-600"
                }`}
            />
          </div>
        </div>
        {/* Unavailable overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-ink-950/40 flex items-center justify-center">
            <span className="bg-ink-950/80 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col grow">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-extrabold text-ink-900 text-[15px] leading-snug">
            {item.name}
          </h3>
          <span className="font-black text-brand-700 text-sm shrink-0">
            ₹{item.price}
          </span>
        </div>
        <div className="mb-4 grow flex flex-col items-start w-full">
          <p 
            id={`desc-${item.id}`}
            className={`text-ink-800/80 text-[13px] leading-relaxed whitespace-pre-line w-full break-words ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}
          >
            {item.description}
          </p>
          {isLongDescription && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              aria-expanded={isExpanded}
              aria-controls={`desc-${item.id}`}
              className="text-brand-600 font-bold text-[12px] mt-1 hover:underline focus:outline-none"
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>

        {/* Add / Quantity control */}
        {isUnavailable ? (
          <div className="w-full text-center text-[13px] text-ink-800/50 font-bold py-2 bg-cream-50 rounded-xl mt-auto border border-cream-200">
            Not available today
          </div>
        ) : quantity === 0 ? (
          <button
            type="button"
            onClick={() => addItem(item)}
            className="w-full bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-sm py-3 rounded-xl touch-manipulation cursor-pointer mt-auto shadow-sm active:bg-brand-100"
            aria-label={`Add ${item.name} to cart`}
          >
            + ADD
          </button>
        ) : (
          <div className="flex items-center justify-between bg-brand-600 rounded-xl px-1 py-1 mt-auto shadow-sm">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.id)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-white/20 active:bg-white/30 text-white font-bold text-xl leading-none flex items-center justify-center touch-manipulation cursor-pointer"
              aria-label={`Remove one ${item.name}`}
            >
              −
            </button>
            <span className="text-white font-extrabold text-sm px-2">{quantity}</span>
            <button
              type="button"
              onClick={() => increaseQuantity(item.id)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-white/20 active:bg-white/30 text-white font-bold text-xl leading-none flex items-center justify-center touch-manipulation cursor-pointer"
              aria-label={`Add one more ${item.name}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
