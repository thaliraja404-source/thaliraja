import type { CartItem, CustomerInfo } from "@/types/order";
import { RESTAURANT_CONFIG } from "./config";

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
  return `https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=${encodedMessage}`;
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
export function buildWhatsAppContactUrl(): string {
  return `https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}`;
}
