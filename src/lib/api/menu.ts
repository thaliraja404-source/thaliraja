import { createClient } from "@/lib/supabase/server";
import { MENU_ITEMS } from "@/data/menu";
import { CATEGORIES } from "@/types/menu";
import type { FoodItem, Category as MenuCategory } from "@/types/menu";

export const RESTAURANT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"; // As defined in seed.sql

export type UICategory = {
  id: string;
  label: string;
  emoji: string;
};

export async function getMenuData() {
  const supabase = await createClient();

  try {
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .order("display_order", { ascending: true });

    if (catError) throw catError;

    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .order("display_order", { ascending: true });

    if (itemsError) throw itemsError;

    if (categories && categories.length > 0) {
      const mappedCategories: UICategory[] = categories.map((c) => ({
        id: c.id,
        label: c.name,
        emoji: c.emoji || "",
      }));

      const mappedItems: FoodItem[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category_id as any,
        image: item.image_url || null,
        isVeg: item.is_veg,
        available: item.is_available,
      }));

      return { categories: mappedCategories, items: mappedItems, fromDb: true };
    }
    
    return getStaticMenuData();
  } catch (error) {
    console.error("Supabase fetch failed, falling back to static menu.ts:", error);
    return getStaticMenuData();
  }
}

function getStaticMenuData() {
  const categories: UICategory[] = CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
  }));

  return { categories, items: MENU_ITEMS, fromDb: false };
}
