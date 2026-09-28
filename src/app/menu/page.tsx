import { getMenuData } from "@/lib/api/menu";
import ClientMenuPage from "./client-page";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_ID } from "@/lib/api/menu";

export default async function MenuPage() {
  const { categories, items } = await getMenuData();
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", RESTAURANT_ID)
    .single();

  return <ClientMenuPage categories={categories} items={items} restaurant={restaurant} />;
}
