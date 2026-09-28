import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_ID } from "@/lib/api/menu";
import { redirect } from "next/navigation";
import ClientSettingsPage from "./client-page";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("restaurant_admins")
    .select("*")
    .eq("user_id", user.id)
    .eq("restaurant_id", RESTAURANT_ID)
    .single();

  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 font-bold">Unauthorized for this restaurant.</p>
        <form action="/auth/signout" method="post">
          <button type="submit" className="mt-4 bg-ink-900 text-white px-4 py-2 rounded-full">Sign out</button>
        </form>
      </div>
    );
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", RESTAURANT_ID)
    .single();

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <header className="bg-white border-b border-cream-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-ink-800 hover:text-brand-600 transition-colors p-1" aria-label="Back to admin">
              ←
            </Link>
            <h1 className="font-extrabold text-ink-900 text-lg">Restaurant Settings</h1>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm font-bold text-ink-800 hover:text-red-600 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto p-4 mt-4">
        {restaurant ? (
          <ClientSettingsPage restaurant={restaurant} />
        ) : (
          <div className="text-center p-8 text-ink-800">
            Could not load restaurant settings.
          </div>
        )}
      </main>
    </div>
  );
}
