import type { CartItem, CustomerInfo } from "@/types/order";
import { RESTAURANT_CONFIG } from "./config";

// --- Phone Number Formatting --------------------------------------------------

/**
 * Cleans and formats any phone number string into the E.164 format required
 * by WhatsApp Click-to-Chat (digits only, country code first, no +).
 *
 * Rules for Indian numbers:
 *   - 10 digits starting with 6-9  => prepend "91"
 *   - 11 digits starting with "0"  => strip leading 0, prepend "91"
 *   - 12 digits starting with "91" => already in correct format, return as-is
 *   - Anything else                => returns empty string (caller must handle)
 *
 * @example
 *   formatWhatsAppNumber("8269325226")     => "918269325226"
 *   formatWhatsAppNumber("+91 8269325226") => "918269325226"
 *   formatWhatsAppNumber("918269325226")   => "918269325226"
 *   formatWhatsAppNumber("08269325226")    => "918269325226"
 *   formatWhatsAppNumber("")               => ""
 */
export function formatWhatsAppNumber(rawNumber: string): string {
  if (!rawNumber || !rawNumber.trim()) return "";

  // Strip all non-digit characters (+, spaces, hyphens, brackets, etc.)
  const digits = rawNumber.replace(/\D/g, "");

  // 10-digit Indian mobile number (starts with 6, 7, 8 or 9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `91${digits}`;
  }

  // 11-digit number with leading STD 0 (0XXXXXXXXXX)
  if (digits.length === 11 && digits.startsWith("0")) {
    const withoutLeadingZero = digits.slice(1);
    if (/^[6-9]/.test(withoutLeadingZero)) {
      return `91${withoutLeadingZero}`;
    }
  }

  // 12-digit number already starting with 91
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  // Unrecognised format -- return empty so callers can surface an error
  return "";
}

// --- WhatsApp URL Builders ----------------------------------------------------

/**
 * Generates a simple WhatsApp Click-to-Chat URL (no pre-filled message).
 * Falls back to the RESTAURANT_CONFIG number when no customNumber is supplied.
 *
 * Uses the canonical wa.me domain which works on Android, iOS, desktop browsers
 * and WhatsApp Web without popup-blocking issues when triggered by a user click.
 */
export function buildWhatsAppContactUrl(customNumber?: string): string {
  const raw = customNumber || RESTAURANT_CONFIG.whatsappNumber;
  const waNumber = formatWhatsAppNumber(raw);
  if (!waNumber) {
    // Graceful degradation: open wa.me root rather than a broken URL
    return "https://wa.me/";
  }
  return `https://wa.me/${waNumber}`;
}

/**
 * Generates a WhatsApp Click-to-Chat URL with a pre-filled order message.
 *
 * @param items              Cart items (must be non-empty -- caller should validate)
 * @param customer           Validated customer details
 * @param total              Calculated order total (from the cart context)
 * @param restaurantWaNumber Optional override; defaults to RESTAURANT_CONFIG
 * @returns                  Full wa.me URL with encoded message, or empty string on error
 */
export function buildWhatsAppOrderUrl(
  items: CartItem[],
  customer: CustomerInfo,
  total: number,
  restaurantWaNumber?: string
): string {
  const raw = restaurantWaNumber || RESTAURANT_CONFIG.whatsappNumber;
  const waNumber = formatWhatsAppNumber(raw);
  if (!waNumber) return "";

  const message = buildOrderMessage(items, customer, total);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${waNumber}?text=${encodedMessage}`;
}

// --- Internal helpers ---------------------------------------------------------

/**
 * Builds the plain-text order message.
 *
 * Intentionally uses only ASCII-safe characters so the message renders
 * correctly on every Android/iOS version and WhatsApp Web without producing
 * replacement characters (U+FFFD). Specifically:
 *   - No emojis  (multi-byte surrogate pairs break older Android WebViews)
 *   - "Rs." instead of the rupee symbol (U+20B9)
 *   - "x" instead of the multiplication sign (U+00D7)
 *   - "---" separator instead of box-drawing characters (U+2500)
 */
function buildOrderMessage(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): string {
  const itemLines = items
    .map((item, index) => {
      const lineTotal = item.food.price * item.quantity;
      return (
        `${index + 1}. ${item.food.name}` +
        ` x ${item.quantity}` +
        ` (Rs. ${item.food.price} each)` +
        ` = Rs. ${lineTotal}`
      );
    })
    .join("\n");

  const subtotal = items.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  const orderTypeLabel =
    customer.orderType === "pickup" ? "Pickup" : "Delivery";

  const deliveryDetails =
    customer.orderType === "delivery"
      ? "\nDelivery Address: " +
        (customer.address ?? "") +
        (customer.landmark ? "\nLandmark: " + customer.landmark : "")
      : "";

  const specialNote = customer.specialInstructions
    ? "\nSpecial Instructions: " + customer.specialInstructions
    : "";

  // Only show a separate subtotal line when it differs from total
  // (e.g. when a delivery fee or discount is applied in future).
  const totalsSection =
    subtotal !== total
      ? `Subtotal: Rs. ${subtotal}\nTotal: Rs. ${total}`
      : `Total: Rs. ${total}`;

  return (
    `Hello ${RESTAURANT_CONFIG.name}!\n` +
    "\n" +
    "I'd like to place an order:\n" +
    "\n" +
    itemLines +
    "\n" +
    "\n" +
    "---\n" +
    "\n" +
    `## ${totalsSection}\n` +
    "\n" +
    "Customer Details:\n" +
    `Name: ${customer.name}\n` +
    `Phone: ${customer.phone}\n` +
    `Order Type: ${orderTypeLabel}` +
    deliveryDetails +
    specialNote +
    "\n" +
    "\n" +
    "Thank you!"
  );
}
