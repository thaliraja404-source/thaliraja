"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESTAURANT_ID } from "@/lib/api/menu";
import { revalidatePath } from "next/cache";

async function verifyAdminAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");

  const { data: adminRow } = await supabase.from("restaurant_admins").select("id").eq("restaurant_id", RESTAURANT_ID).maybeSingle();
  if (!adminRow) throw new Error("Unauthorized: not an admin for this restaurant.");

  const admin = createAdminClient();
  return { supabase, admin, restaurantId: RESTAURANT_ID };
}

export async function addCategoryAction(data: { name: string; emoji: string; display_order: number }) {
  try {
    const { admin, restaurantId } = await verifyAdminAuth();
    const { error } = await admin.from("categories").insert({ ...data, restaurant_id: restaurantId });
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCategoryAction(id: string, data: { name?: string; emoji?: string; display_order?: number }) {
  try {
    requireUUID(id, "category ID");
    const { admin, restaurantId } = await verifyAdminAuth();
    const { error } = await admin.from("categories").update(data).eq("id", id).eq("restaurant_id", restaurantId);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

function requireUUID(id: string, name: string = "ID") {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Invalid ${name}: "${id}". Please refresh the page to ensure you are modifying the live database record, not a static fallback item.`);
  }
  return id;
}

export async function deleteCategoryAction(id: string) {
  try {
    requireUUID(id, "category ID");
    const { admin, restaurantId } = await verifyAdminAuth();
    const { count, error: countErr } = await admin
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countErr) return { error: countErr.message };
    if (count && count > 0) return { error: "Cannot delete category because it contains menu items." };

    const { error } = await admin.from("categories").delete().eq("id", id).eq("restaurant_id", restaurantId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function resolveCategoryId(admin: any, restaurantId: string, categoryValue: string) {
  if (!categoryValue) throw new Error("Category is required.");

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryValue)) {
    return categoryValue;
  }

  const { CATEGORIES } = await import("@/types/menu");
  const staticCat = CATEGORIES.find(c =>
    c.id.toLowerCase() === categoryValue.toLowerCase() ||
    c.label.toLowerCase() === categoryValue.toLowerCase()
  );

  if (!staticCat) {
    throw new Error(`Invalid or unknown category: ${categoryValue}`);
  }

  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("name", staticCat.label)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: newCat, error } = await admin.from("categories").insert({
    restaurant_id: restaurantId,
    name: staticCat.label,
    emoji: staticCat.emoji,
    display_order: 99
  }).select("id").single();

  if (error) throw new Error("Failed to create missing category: " + error.message);
  return newCat.id;
}

export async function addMenuItemAction(data: any) {
  try {
    const { admin, restaurantId } = await verifyAdminAuth();
    const resolvedCatId = await resolveCategoryId(admin, restaurantId, data.category_id);

    const { error } = await admin.from("menu_items").insert({
      ...data,
      category_id: resolvedCatId,
      restaurant_id: restaurantId
    });
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMenuItemAction(id: string, data: any) {
  try {
    requireUUID(id, "menu item ID");
    const { admin, restaurantId } = await verifyAdminAuth();

    let updateData = { ...data };
    if (updateData.category_id) {
      updateData.category_id = await resolveCategoryId(admin, restaurantId, updateData.category_id);
    }

    const { error } = await admin.from("menu_items").update(updateData).eq("id", id).eq("restaurant_id", restaurantId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteMenuItemAction(id: string) {
  try {
    requireUUID(id, "menu item ID");
    const { admin, restaurantId } = await verifyAdminAuth();
    const { error } = await admin.from("menu_items").delete().eq("id", id).eq("restaurant_id", restaurantId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleMenuItemAvailabilityAction(id: string, is_available: boolean) {
  try {
    requireUUID(id, "menu item ID");
    const { admin, restaurantId } = await verifyAdminAuth();
    const { error } = await admin.from("menu_items").update({ is_available }).eq("id", id).eq("restaurant_id", restaurantId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function runDataMigrationAction() {
  try {
    const { supabase, restaurantId } = await verifyAdminAuth();
    const { CATEGORIES } = await import("@/types/menu");
    const { MENU_ITEMS } = await import("@/data/menu");

    const categories = CATEGORIES.filter(c => c.id !== "all");

    // Fetch existing categories to make the import idempotent
    const { data: existingCategories, error: fetchCatErr } = await supabase
      .from("categories")
      .select("id, name")
      .eq("restaurant_id", restaurantId);

    if (fetchCatErr) return { error: fetchCatErr.message };

    const catIdMap: Record<string, string> = {};

    // 1. Upsert Categories
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const existingCat = existingCategories?.find(c => c.name === cat.label);

      if (existingCat) {
        catIdMap[cat.id] = existingCat.id;
      } else {
        const { data, error } = await supabase.from("categories").insert({
          restaurant_id: restaurantId,
          name: cat.label,
          emoji: cat.emoji,
          display_order: i
        }).select("id").single();

        if (error) return { error: error.message };
        catIdMap[cat.id] = data.id;
      }
    }

    // Fetch existing items to make the import idempotent
    const { data: existingItems, error: fetchItemErr } = await supabase
      .from("menu_items")
      .select("id, name")
      .eq("restaurant_id", restaurantId);

    if (fetchItemErr) return { error: fetchItemErr.message };

    // 2. Upsert Menu Items
    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const item = MENU_ITEMS[i];
      const existingItem = existingItems?.find(m => m.name === item.name);

      if (!existingItem) {
        const { error } = await supabase.from("menu_items").insert({
          restaurant_id: restaurantId,
          category_id: catIdMap[item.category],
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image,
          is_veg: item.isVeg,
          is_available: item.available,
          display_order: i
        });
        if (error) return { error: error.message };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateRestaurantAction(data: any) {
  try {
    const { admin, restaurantId } = await verifyAdminAuth();
    const { error } = await admin
      .from("restaurants")
      .update(data)
      .eq("id", restaurantId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/menu");
    revalidatePath("/info");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function uploadMenuImageAction(formData: FormData) {
  try {
    const { supabase } = await verifyAdminAuth();
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image" };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size must be less than 5MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("menus")
      .upload(filePath, file);

    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from("menus").getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err.message };
  }
}
