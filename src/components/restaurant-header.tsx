"use client";

import Link from "next/link";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";

import type { Restaurant } from "@/types/database";

function getOpenStatus(dbRestaurant?: Restaurant | null): { isOpen: boolean; label: string } {
  const now = new Date();
  const openMinutes = dbRestaurant?.opening_time 
    ? parseInt(dbRestaurant.opening_time.split(":")[0]) * 60 + parseInt(dbRestaurant.opening_time.split(":")[1])
    : RESTAURANT_CONFIG.operatingHours.open.hour * 60 + RESTAURANT_CONFIG.operatingHours.open.minute;
    
  const closeMinutes = dbRestaurant?.closing_time
    ? parseInt(dbRestaurant.closing_time.split(":")[0]) * 60 + parseInt(dbRestaurant.closing_time.split(":")[1])
    : RESTAURANT_CONFIG.operatingHours.close.hour * 60 + RESTAURANT_CONFIG.operatingHours.close.minute;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = dbRestaurant?.is_open ?? (nowMinutes >= openMinutes && nowMinutes < closeMinutes);

  const formatHour = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = String(mins % 60).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hr}:${m} ${ampm}`;
  };

  return {
    isOpen,
    label: isOpen
      ? `Open until ${formatHour(closeMinutes)}`
      : `Opens at ${formatHour(openMinutes)}`,
  };
}

export default function RestaurantHeader({ dbRestaurant }: { dbRestaurant?: Restaurant | null }) {
  const { isOpen, label } = getOpenStatus(dbRestaurant);
  const name = dbRestaurant?.name || RESTAURANT_CONFIG.name;
  const tagline = dbRestaurant?.tagline || RESTAURANT_CONFIG.tagline;
  const mapsUrl = dbRestaurant?.maps_url || RESTAURANT_CONFIG.googleMapsUrl;
  const waUrl = buildWhatsAppContactUrl(dbRestaurant?.whatsapp_number || undefined);

  return (
    <header className="bg-cream-50 border-b border-cream-200 sticky top-0 z-30 shadow-sm">
      {/* Top bar — brand */}
      <div className="bg-brand-600 text-white px-4 py-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shrink-0 shadow-md border-2 border-brand-200">
              🥘
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                {name}
              </h1>
              <p className="text-brand-100 text-xs font-medium leading-tight truncate drop-shadow-sm">
                {tagline} • Shivpuri
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-leaf active:bg-leaf-light transition-colors rounded-full px-3 py-1.5 text-xs font-bold shadow-sm touch-manipulation cursor-pointer"
              aria-label="Contact Thali Raja on WhatsApp"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-cream-100 border-b border-cream-200 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${isOpen ? "text-leaf" : "text-red-700"
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOpen ? "bg-leaf animate-pulse shadow-[0_0_4px_#4caf50]" : "bg-red-600"
                }`}
            />
            {label}
          </span>
          <div className="flex items-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-800 font-medium flex items-center gap-1 touch-manipulation cursor-pointer min-h-[36px] px-1"
            >
              <span>📍</span> Map
            </a>
            <span className="text-cream-200">|</span>
            <Link
              href="/info"
              className="text-xs text-brand-700 font-bold flex items-center gap-0.5 touch-manipulation cursor-pointer min-h-[36px] px-1"
            >
              Info <span className="text-[10px]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
