import Link from "next/link";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import type { Restaurant } from "@/types/database";

export default function RestaurantInfo({ dbRestaurant }: { dbRestaurant?: Restaurant | null }) {
  const name = dbRestaurant?.name || RESTAURANT_CONFIG.name;
  const description = dbRestaurant?.description || RESTAURANT_CONFIG.description;
  const location = dbRestaurant?.address || RESTAURANT_CONFIG.location;
  const googleMapsUrl = dbRestaurant?.maps_url || RESTAURANT_CONFIG.googleMapsUrl;
  const phone = dbRestaurant?.phone || RESTAURANT_CONFIG.phone;
  const waUrl = buildWhatsAppContactUrl(dbRestaurant?.whatsapp_number || undefined);

  const openingHours = {
    weekdays: dbRestaurant?.opening_hours_weekdays || RESTAURANT_CONFIG.openingHours.weekdays,
    weekends: dbRestaurant?.opening_hours_weekends || RESTAURANT_CONFIG.openingHours.weekends,
    days: dbRestaurant?.opening_hours_days || RESTAURANT_CONFIG.openingHours.days,
  };

  const coverImage = dbRestaurant?.cover_image_url || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header card with image */}
      <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-cream-200">
        <div className="h-48 bg-brand-100 relative">
          <img 
            src={coverImage} 
            alt={name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent flex flex-col justify-end p-5 text-white">
            <h1 className="text-3xl font-black mb-1 drop-shadow-md">{name}</h1>
            <div className="flex items-center gap-1.5 text-brand-100 text-sm font-medium">
              <span>📍</span>
              <span>{location}</span>
            </div>
          </div>
        </div>
        <div className="p-5 bg-white">
          <p className="text-ink-800 text-[15px] leading-relaxed font-medium">{description}</p>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-white rounded-[20px] p-5 border border-cream-200 shadow-sm">
        <h2 className="font-bold text-ink-900 mb-4 flex items-center gap-2 text-lg">
          <span className="text-xl">🕐</span> Opening Hours
        </h2>
        <div className="space-y-3 text-[15px]">
          <div className="flex justify-between items-center border-b border-cream-100 pb-3">
            <span className="text-ink-800/80 font-medium">{openingHours.days}</span>
            <span className="font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
              {openingHours.weekdays}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-ink-800/80 font-medium">Saturday & Sunday</span>
            <span className="font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
              {openingHours.weekends}
            </span>
          </div>
        </div>
      </div>

      {/* Contact & map */}
      <div className="bg-white rounded-[20px] p-5 border border-cream-200 shadow-sm">
        <h2 className="font-bold text-ink-900 mb-4 flex items-center gap-2 text-lg">
          <span className="text-xl">📞</span> Contact Us
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white hover:bg-cream-50 text-ink-900 border-2 border-cream-200 rounded-xl py-3.5 font-bold text-[15px] transition-colors shadow-sm touch-manipulation cursor-pointer"
          >
            <span className="text-lg">📍</span> Get Directions
          </a>
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 bg-white hover:bg-cream-50 text-ink-900 border-2 border-cream-200 rounded-xl py-3.5 font-bold text-[15px] transition-colors shadow-sm touch-manipulation cursor-pointer"
          >
            <span className="text-lg">📞</span> Call Us: {phone}
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-leaf text-white hover:bg-leaf-light rounded-xl py-3.5 font-extrabold text-[15px] transition-colors shadow-[0_4px_15px_rgba(76,175,80,0.3)] touch-manipulation cursor-pointer"
          >
            <span className="text-lg">💬</span> WhatsApp Us
          </a>

        </div>
      </div>

      {/* Menu link */}
      <Link
        href="/menu"
        className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl py-4 font-extrabold text-lg transition-colors shadow-[0_8px_30px_rgba(240,100,0,0.3)] mt-2 border border-brand-500"
      >
        🍽️ View Menu & Order
      </Link>
    </div>
  );
}
