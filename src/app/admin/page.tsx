import { getMenuData } from "@/lib/api/menu";
import ClientAdminPage from "./client-page";

export default async function AdminPage() {
  const { categories, items, fromDb } = await getMenuData();

  return (
    <ClientAdminPage
      initialCategories={categories}
      initialItems={items}
      fromDb={fromDb}
    />
  );
}
