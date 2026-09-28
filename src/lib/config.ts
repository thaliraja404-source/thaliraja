// ============================================================
// RESTAURANT CONFIGURATION
// Update these values to configure your restaurant.
// All WhatsApp, maps, and contact settings live here.
// ============================================================

export const RESTAURANT_CONFIG = {
  name: "Thali Raja",
  tagline: "Ghar Jaisa Khana, Dil Se Banaya",
  description:
    "Authentic home-style Indian food served fresh every day. Wholesome thalis, hot rotis, and hearty sabzis — made with love in the heart of Shivpuri.",
  location: "Shivpuri, Madhya Pradesh, India",

  // ⚠️ Replace with the actual WhatsApp number (with country code, no + or spaces)
  whatsappNumber: "918269325226",

  // ⚠️ Replace with the actual phone number
  phone: "+91 8269325226",

  // Google Maps link provided by the restaurant owner
  googleMapsUrl: "https://maps.app.goo.gl/Hj9RPu5zhe2dzyu86",

  openingHours: {
    // ⚠️ Replace with actual hours
    weekdays: "8:00 AM – 10:00 PM",
    weekends: "7:30 AM – 10:30 PM",
    days: "Monday – Sunday",
  },

  // Used to determine open/closed status on the menu header
  // 24-hour format: [openHour, openMinute, closeHour, closeMinute]
  operatingHours: {
    open: { hour: 8, minute: 0 },
    close: { hour: 22, minute: 0 },
  },
} as const;
