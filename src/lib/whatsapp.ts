import type { CartItem, CustomerInfo } from "@/types/order";
import { RESTAURANT_CONFIG } from "./config";

/**
 * Cleans and formats any phone number into the international WhatsApp format.
 * Assuming Indian numbers (10 digits), it prefixes with 91.
 */
export function formatWhatsAppNumber(rawNumber: string): string {
  const cleaned = rawNumber.replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("0")) return `91${cleaned.slice(1)}`;
  return cleaned; // Assumes it already includes the country code if it's 12 digits (e.g. 91...)
}

/**
 * Generates a WhatsApp deep-link URL with a pre-filled order message.
 * The WhatsApp number is sourced from RESTAURANT_CONFIG — never hardcoded here.
 */
export function buildWhatsAppOrderUrl(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): string {
  const message = buildOrderMessage(items, customer, total);
  const encodedMessage = encodeURIComponent(message);
  const waNumber = formatWhatsAppNumber(RESTAURANT_CONFIG.whatsappNumber);
  return `https://wa.me/${waNumber}?text=${encodedMessage}`;
}

function buildOrderMessage(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): string {
  const itemLines = items
    .map((item, index) => {
      return `${index + 1}. ${item.food.name} × ${item.quantity} — ₹${
        item.food.price * item.quantity
      }`;
    })
    .join("\n");

  const orderTypeLabel =
    customer.orderType === "pickup" ? "Pickup 🛍️" : "Delivery 🚚";

  const deliveryDetails =
    customer.orderType === "delivery"
      ? `\nAddress: ${customer.address}${
          customer.landmark ? `\nLandmark: ${customer.landmark}` : ""
        }`
      : "";

  const specialNote = customer.specialInstructions
    ? `\nSpecial instructions: ${customer.specialInstructions}`
    : "";

  return `Hello ${RESTAURANT_CONFIG.name}! 👋

I'd like to place an order:

${itemLines}

Total: ₹${total}

Name: ${customer.name}
Phone: ${customer.phone}
Order type: ${orderTypeLabel}${deliveryDetails}${specialNote}

Thank you! 🙏`;
}

/**
 * Generates a simple WhatsApp contact URL (no message).
 */
export function buildWhatsAppContactUrl(customNumber?: string): string {
  const waNumber = formatWhatsAppNumber(customNumber || RESTAURANT_CONFIG.whatsappNumber);
  return `https://wa.me/${waNumber}`;
}
