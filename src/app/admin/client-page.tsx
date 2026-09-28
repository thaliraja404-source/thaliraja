"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FoodItem } from "@/types/menu";
import type { UICategory } from "@/lib/api/menu";
import {
  addMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
  runDataMigrationAction,
} from "./actions";

type FormState = Omit<FoodItem, "id">;

export default function ClientAdminPage({
  initialCategories,
  initialItems,
  fromDb,
}: {
  initialCategories: UICategory[];
  initialItems: FoodItem[];
  fromDb: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const categories = initialCategories;
  const items = initialItems;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [newItem, setNewItem] = useState<FormState>({
    category: categories.length > 0 ? categories[0].id as any : "thali",
    name: "",
    description: "",
    price: 0,
    image: "",
    isVeg: true,
    available: true,
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function showNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  }

  const filtered =
    filterCat === "all" ? items : items.filter((i) => i.category === filterCat);

  function startEdit(item: FoodItem) {
    setEditingId(item.id);
    setEditForm({ ...item });
    setShowAddForm(false);
  }

  function saveEdit() {
    if (!editingId || !editForm) return;
    startTransition(async () => {
      const res = await updateMenuItemAction(editingId, {
        category_id: editForm.category,
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        image_url: editForm.image,
        is_veg: editForm.isVeg,
        is_available: editForm.available,
      });
      if (res?.error) {
        alert(res.error);
      } else {
        showNotice("✅ Item updated.");
        setEditingId(null);
        setEditForm(null);
      }
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => {
      const res = await deleteMenuItemAction(id);
      if (res?.error) {
        alert(res.error);
      } else {
        showNotice("🗑️ Item deleted.");
      }
    });
  }

  function toggleAvailability(id: string, current: boolean) {
    startTransition(async () => {
      const res = await toggleMenuItemAvailabilityAction(id, !current);
      if (res?.error) alert(res.error);
    });
  }

  function addItem() {
    if (!newItem.name.trim() || newItem.price <= 0) {
      alert("Name and valid price are required.");
      return;
    }
    startTransition(async () => {
      const res = await addMenuItemAction({
        category_id: newItem.category,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        image_url: newItem.image,
        is_veg: newItem.isVeg,
        is_available: newItem.available,
      });
      if (res?.error) {
        alert(res.error);
      } else {
        showNotice("✅ Item added.");
        setShowAddForm(false);
        setNewItem({
          ...newItem,
          name: "",
          description: "",
          price: 0,
          image: "",
        });
      }
    });
  }

  async function handleMigrate() {
    if (!confirm("Migrate existing menu to the database?")) return;
    startTransition(async () => {
      const res = await runDataMigrationAction();
      if (res?.error) {
        alert(res.error);
      } else {
        showNotice("🚀 Migration successful!");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white disabled:opacity-50";

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="text-ink-800 hover:text-brand-600 p-1 transition-colors">
              ←
            </Link>
            <h1 className="font-extrabold text-ink-900">Admin — Menu Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
            <Link
              href="/admin/settings"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Settings
            </Link>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
              }}
              disabled={!fromDb}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Item
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {notice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm animate-fade-in">
            {notice}
          </div>
        )}

        {!fromDb && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-amber-900">⚠️ Database not seeded</h2>
              <p className="text-amber-800 text-sm mt-1">
                You are viewing the static fallback menu. You must migrate the menu to the database before you can edit items.
              </p>
            </div>
            <button
              onClick={handleMigrate}
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {isPending ? "Migrating..." : "Run Migration"}
            </button>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              filterCat === "all"
                ? "bg-brand-600 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            🍽️ All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                filterCat === cat.id
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl border-2 border-brand-200 p-4 space-y-3 animate-fade-in">
            <h2 className="font-bold text-stone-800">Add New Item</h2>
            <ItemForm
              form={newItem}
              onChange={setNewItem}
              inputCls={inputCls}
              categories={categories}
              disabled={isPending}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={addItem}
                disabled={isPending}
                className="bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {isPending ? "Adding..." : "Add Item"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={isPending}
                className="text-stone-500 text-sm px-3 py-2.5 disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-stone-400 font-medium">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.map((item) => {
            const cat = categories.find((c) => c.id === item.category);
            return editingId === item.id && editForm ? (
              <div
                key={item.id}
                className="bg-white rounded-2xl border-2 border-brand-200 p-4 space-y-3 animate-fade-in"
              >
                <h3 className="font-bold text-stone-800 text-sm">Edit: {item.name}</h3>
                <ItemForm 
                  form={editForm} 
                  onChange={setEditForm} 
                  inputCls={inputCls} 
                  categories={categories} 
                  disabled={isPending}
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={isPending}
                    className="bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isPending}
                    className="text-stone-500 text-sm px-3 py-2.5 disabled:opacity-50 touch-manipulation cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={item.id}
                className={`bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0 relative">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-stone-800 text-sm">
                      {item.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({cat?.label || "Unknown"})
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        item.isVeg
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                  <div className="text-brand-600 font-bold text-sm">
                    ₹{item.price}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item.id, item.available)}
                    disabled={!fromDb || isPending}
                    className={`text-xs font-semibold px-3 py-3 min-h-[44px] rounded-lg border transition-colors disabled:opacity-50 touch-manipulation cursor-pointer ${
                      item.available
                        ? "border-green-300 text-green-700 bg-green-50 active:bg-green-100"
                        : "border-stone-300 text-stone-500 bg-stone-50 active:bg-stone-100"
                    }`}
                  >
                    {item.available ? "✓ Avail" : "✗ N/A"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    disabled={!fromDb || isPending}
                    className="text-xs font-semibold px-3 py-3 min-h-[44px] rounded-lg border border-stone-200 text-stone-600 bg-stone-50 active:bg-stone-100 transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    disabled={!fromDb || isPending}
                    className="text-xs font-semibold px-3 py-3 min-h-[44px] rounded-lg border border-red-200 text-red-600 bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
                  >
                    Del
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function ItemForm({
  form,
  onChange,
  inputCls,
  categories,
  disabled
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  inputCls: string;
  categories: UICategory[];
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={inputCls}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Price (₹) *</label>
        <input
          type="number"
          value={form.price || ""}
          onChange={(e) => onChange({ ...form, price: Number(e.target.value) || 0 })}
          className={inputCls}
          disabled={disabled}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Description</label>
        <input
          type="text"
          value={form.description || ""}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className={inputCls}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Category</label>
        <select
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value as any })}
          className={inputCls}
          disabled={disabled}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Image URL</label>
        <input
          type="url"
          value={form.image || ""}
          onChange={(e) => onChange({ ...form, image: e.target.value })}
          className={inputCls}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={form.isVeg}
            onChange={(e) => onChange({ ...form, isVeg: e.target.checked })}
            className="w-4 h-4 accent-green-600"
            disabled={disabled}
          />
          <span className="font-medium text-stone-700">Vegetarian</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => onChange({ ...form, available: e.target.checked })}
            className="w-4 h-4 accent-brand-600"
            disabled={disabled}
          />
          <span className="font-medium text-stone-700">Available</span>
        </label>
      </div>
    </div>
  );
}
