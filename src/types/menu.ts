export type Category =
  | "all"
  | "thali"
  | "roti"
  | "sabji"
  | "rice"
  | "drinks"
  | "other";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  category: Exclude<Category, "all">;
  image: string | null; // URL or path (null when no image set)
  isVeg: boolean;
  available: boolean;
}

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "thali", label: "Thali", emoji: "🥘" },
  { id: "roti", label: "Roti", emoji: "🫓" },
  { id: "sabji", label: "Sabji", emoji: "🍲" },
  { id: "rice", label: "Rice", emoji: "🍚" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "other", label: "Other", emoji: "✨" },
];
