import type { FoodItem } from "@/types/menu";

// ============================================================
// MENU DATA
// Replace these placeholder items with the real menu items.
// Structure each item with the FoodItem interface from @/types/menu.
//
// For images: use a URL to a hosted image, or place images in
// /public/images/ and reference them as "/images/filename.jpg"
// ============================================================

export const MENU_ITEMS: FoodItem[] = [
  // --- THALI ---
  {
    id: "thali-001",
    name: "Full Thali",
    description:
      "Dal, 2 sabji, 4 roti, rice, raita, papad, pickle & sweet. A complete satisfying meal.",
    price: 120,
    category: "thali",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "thali-002",
    name: "Mini Thali",
    description:
      "Dal, 1 sabji, 2 roti, rice & pickle. Perfect for a light meal.",
    price: 70,
    category: "thali",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "thali-003",
    name: "Special Thali",
    description:
      "Paneer sabji, dal makhani, 4 roti, rice, raita, papad & gulab jamun. Our chef's pride.",
    price: 180,
    category: "thali",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
    isVeg: true,
    available: true,
  },

  // --- ROTI ---
  {
    id: "roti-001",
    name: "Tandoori Roti",
    description: "Fresh whole-wheat roti baked in clay oven, served hot.",
    price: 12,
    category: "roti",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "roti-002",
    name: "Butter Roti",
    description: "Soft roti topped with fresh home-made butter.",
    price: 15,
    category: "roti",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "roti-003",
    name: "Paratha",
    description: "Layered whole-wheat flatbread cooked on tawa with ghee.",
    price: 20,
    category: "roti",
    image:
      "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "roti-004",
    name: "Aloo Paratha",
    description:
      "Crispy stuffed paratha with spiced mashed potato filling. Served with curd.",
    price: 35,
    category: "roti",
    image:
      "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&q=80",
    isVeg: true,
    available: true,
  },

  // --- SABJI ---
  {
    id: "sabji-001",
    name: "Dal Fry",
    description:
      "Yellow lentils tempered with cumin, garlic, and fresh tomatoes.",
    price: 60,
    category: "sabji",
    image:
      "https://images.unsplash.com/photo-1645177628172-a5d83a2e0e68?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "sabji-002",
    name: "Aloo Matar",
    description: "Classic potato and green peas curry in onion-tomato masala.",
    price: 60,
    category: "sabji",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "sabji-003",
    name: "Paneer Butter Masala",
    description:
      "Cottage cheese cubes in rich, creamy tomato-cashew gravy. A crowd favourite.",
    price: 110,
    category: "sabji",
    image:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "sabji-004",
    name: "Mix Veg",
    description:
      "Seasonal vegetables cooked in light spices. Healthy and delicious.",
    price: 70,
    category: "sabji",
    image:
      "https://images.unsplash.com/photo-1645177628172-a5d83a2e0e68?w=400&q=80",
    isVeg: true,
    available: false, // Example of unavailable item
  },

  // --- RICE ---
  {
    id: "rice-001",
    name: "Plain Rice",
    description: "Steamed basmati rice, fluffy and fragrant.",
    price: 40,
    category: "rice",
    image:
      "https://images.unsplash.com/photo-1536304993881-ff86e6cee4c7?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "rice-002",
    name: "Jeera Rice",
    description: "Basmati rice tempered with cumin seeds, ghee & whole spices.",
    price: 60,
    category: "rice",
    image:
      "https://images.unsplash.com/photo-1596560548464-f010aa39f0a6?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "rice-003",
    name: "Veg Biryani",
    description:
      "Fragrant basmati rice layered with mixed vegetables and whole spices.",
    price: 100,
    category: "rice",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    isVeg: true,
    available: true,
  },

  // --- DRINKS ---
  {
    id: "drink-001",
    name: "Lassi (Sweet)",
    description: "Thick chilled yogurt drink blended with sugar & cardamom.",
    price: 30,
    category: "drinks",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "drink-002",
    name: "Lassi (Salted)",
    description: "Refreshing buttermilk with roasted cumin and fresh coriander.",
    price: 25,
    category: "drinks",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "drink-003",
    name: "Masala Chai",
    description: "Strong Indian tea brewed with ginger, cardamom & spices.",
    price: 15,
    category: "drinks",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "drink-004",
    name: "Cold Water Bottle",
    description: "500ml chilled mineral water.",
    price: 20,
    category: "drinks",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
    isVeg: true,
    available: true,
  },

  // --- OTHER ---
  {
    id: "other-001",
    name: "Gulab Jamun (2 pcs)",
    description: "Soft milk-solid dumplings soaked in rose-cardamom sugar syrup.",
    price: 30,
    category: "other",
    image:
      "https://images.unsplash.com/photo-1605197161470-5d5a9397b45d?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "other-002",
    name: "Papad",
    description: "Crispy roasted lentil wafers. Served with chutney.",
    price: 10,
    category: "other",
    image:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80",
    isVeg: true,
    available: true,
  },
  {
    id: "other-003",
    name: "Raita",
    description: "Chilled yogurt with cucumber, tomato, and a pinch of spices.",
    price: 25,
    category: "other",
    image:
      "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=400&q=80",
    isVeg: true,
    available: true,
  },
];
