"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import CartItemRow from "@/components/cart-item";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { CustomerInfo, OrderType } from "@/types/order";

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function OrderPage() {
  const router = useRouter();
  const { items, total, subtotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4 opacity-50">🛒</div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-ink-800 mb-6 text-sm">
          Add some delicious items from the menu first.
        </p>
        <Link
          href="/menu"
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!phone.trim()) newErrors.phone = "Please enter your phone number.";
    else if (!/^[6-9]\d{9}$/.test(phone.trim()))
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    if (orderType === "delivery" && !address.trim())
      newErrors.address = "Please enter your delivery address.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleOrder() {
    if (!validate()) return;
    setIsSubmitting(true);

    const customer: CustomerInfo = {
      name: name.trim(),
      phone: phone.trim(),
      orderType,
      address: address.trim() || undefined,
      landmark: landmark.trim() || undefined,
      specialInstructions: instructions.trim() || undefined,
    };

    const url = buildWhatsAppOrderUrl(items, customer, total);
    clearCart();
    window.open(url, "_blank");
    router.push("/menu");
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-ink-900 placeholder-ink-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition shadow-sm";
  const errorClass = "text-red-600 font-medium text-xs mt-1.5 flex items-center gap-1.5";
  const labelClass = "block text-sm font-bold text-ink-800 mb-1.5";

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-cream-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/menu"
            className="text-ink-800 hover:text-brand-600 transition-colors p-1"
            aria-label="Back to menu"
          >
            ←
          </Link>
          <h1 className="font-extrabold text-ink-900 text-lg">Your Order</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-8">
        {/* Cart Items */}
        <section className="bg-white rounded-[20px] border border-cream-200 px-4 py-3 shadow-sm">
          <h2 className="font-bold text-ink-900 text-sm py-2 border-b border-cream-100 mb-1">
            🛒 Items ({items.length})
          </h2>
          {items.map((item) => (
            <CartItemRow key={item.food.id} item={item} />
          ))}

          {/* Totals */}
          <div className="border-t border-cream-200 pt-3 mt-2 space-y-1.5">
            <div className="flex justify-between text-sm text-ink-800">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-black text-ink-900 text-lg">
              <span>Total</span>
              <span className="text-brand-700">₹{total}</span>
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className="bg-white rounded-[20px] border border-cream-200 p-5 space-y-5 shadow-sm">
          <h2 className="font-bold text-ink-900">📋 Your Details</h2>

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your name"
              className={inputClass}
              autoComplete="name"
            />
            {errors.name && (
              <p className={errorClass}>
                <span>⚠️</span> {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="10-digit mobile number"
              className={inputClass}
              autoComplete="tel"
              inputMode="numeric"
            />
            {errors.phone && (
              <p className={errorClass}>
                <span>⚠️</span> {errors.phone}
              </p>
            )}
          </div>

          {/* Order type */}
          <div>
            <p className={labelClass}>
              Order Type <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(["pickup", "delivery"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setOrderType(type);
                    if (type === "pickup")
                      setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  className={`py-3.5 rounded-xl border-2 text-sm font-bold transition-all touch-manipulation cursor-pointer ${
                    orderType === type
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                      : "border-cream-200 bg-white text-ink-800 hover:border-cream-300"
                  }`}
                >
                  {type === "pickup" ? "🛍️ Pickup" : "🚚 Delivery"}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          {orderType === "delivery" && (
            <div className="space-y-4 animate-fade-in pt-1">
              <div>
                <label htmlFor="address" className={labelClass}>
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="House no., street, area..."
                  rows={2}
                  className={inputClass}
                  autoComplete="street-address"
                />
                {errors.address && (
                  <p className={errorClass}>
                    <span>⚠️</span> {errors.address}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="landmark" className={labelClass}>
                  Landmark{" "}
                  <span className="text-ink-800/50 font-normal">(optional)</span>
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near school, temple, etc."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div>
            <label htmlFor="instructions" className={labelClass}>
              Special Instructions{" "}
              <span className="text-ink-800/50 font-normal">(optional)</span>
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Extra spicy, no onion, etc."
              rows={2}
              className={inputClass}
            />
          </div>
        </section>

        {/* WhatsApp CTA */}
        <button
          onClick={handleOrder}
          disabled={isSubmitting}
          className="w-full bg-leaf hover:bg-leaf-light active:scale-[0.98] disabled:opacity-60 text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_8px_30px_rgba(76,175,80,0.3)] transition-all duration-150 flex items-center justify-center gap-3 touch-manipulation cursor-pointer mt-2"
        >
          <span className="text-2xl">💬</span>
          <span>ORDER ON WHATSAPP</span>
        </button>

        <p className="text-center text-[11px] text-ink-800/60 font-medium px-4">
          Tapping the button will open WhatsApp with your order details. Your
          order is confirmed once the restaurant replies.
        </p>
      </main>
    </div>
  );
}
