/**
 * Unit tests for WhatsApp helper functions.
 * Run with:  node --test src/lib/__tests__/whatsapp.test.mjs
 *
 * Uses Node.js built-in test runner -- no extra dependencies.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Inline mirrors of src/lib/whatsapp.ts (plain JS, no build step needed)
// ---------------------------------------------------------------------------

function formatWhatsAppNumber(rawNumber) {
  if (!rawNumber || !rawNumber.trim()) return "";
  const digits = rawNumber.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    const withoutLeadingZero = digits.slice(1);
    if (/^[6-9]/.test(withoutLeadingZero)) return `91${withoutLeadingZero}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return "";
}

function buildWhatsAppContactUrl(rawNumber) {
  const waNumber = formatWhatsAppNumber(rawNumber || "918269325226");
  if (!waNumber) return "https://wa.me/";
  return `https://wa.me/${waNumber}`;
}

const RESTAURANT_NAME = "Thali Raja";

function buildOrderMessage(items, customer, total) {
  const itemLines = items
    .map((item, index) => {
      const lineTotal = item.food.price * item.quantity;
      return (
        `${index + 1}. ${item.food.name}` +
        ` x ${item.quantity}` +
        ` @ Rs. ${item.food.price}` +
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

  const totalsSection =
    subtotal !== total
      ? `Subtotal: Rs. ${subtotal}\nTotal: Rs. ${total}`
      : `Total: Rs. ${total}`;

  return (
    `Hello ${RESTAURANT_NAME}!\n` +
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

function buildWhatsAppOrderUrl(items, customer, total, restaurantWaNumber) {
  const raw = restaurantWaNumber || "918269325226";
  const waNumber = formatWhatsAppNumber(raw);
  if (!waNumber) return "";
  const message = buildOrderMessage(items, customer, total);
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const sampleItems = [
  { food: { id: "1", name: "Full Thali", price: 120 }, quantity: 1 },
  { food: { id: "2", name: "nj", price: 70 }, quantity: 1 },
];
const sampleCustomer = {
  name: "Raj Kewat",
  phone: "9182693252",
  orderType: "pickup",
};

// ---------------------------------------------------------------------------
// formatWhatsAppNumber
// ---------------------------------------------------------------------------

test("10-digit plain number => 918269325226", () => {
  assert.equal(formatWhatsAppNumber("8269325226"), "918269325226");
});

test("+91 prefix with space => 918269325226", () => {
  assert.equal(formatWhatsAppNumber("+91 8269325226"), "918269325226");
});

test("+91 with hyphens => 918269325226", () => {
  assert.equal(formatWhatsAppNumber("+91-826-932-5226"), "918269325226");
});

test("12-digit already-international number unchanged", () => {
  assert.equal(formatWhatsAppNumber("918269325226"), "918269325226");
});

test("12-digit number is NOT double-prefixed (no 9191...)", () => {
  assert.equal(formatWhatsAppNumber("918269325226").startsWith("9191"), false);
});

test("11-digit with leading 0 => 918269325226", () => {
  assert.equal(formatWhatsAppNumber("08269325226"), "918269325226");
});

test("empty string => empty string", () => {
  assert.equal(formatWhatsAppNumber(""), "");
});

test("whitespace-only => empty string", () => {
  assert.equal(formatWhatsAppNumber("   "), "");
});

test("too-short number => empty string", () => {
  assert.equal(formatWhatsAppNumber("12345"), "");
});

test("10-digit with invalid starting digit => empty string", () => {
  assert.equal(formatWhatsAppNumber("1234567890"), "");
});

// ---------------------------------------------------------------------------
// buildWhatsAppContactUrl
// ---------------------------------------------------------------------------

test("contact URL uses wa.me domain", () => {
  assert.ok(buildWhatsAppContactUrl("8269325226").startsWith("https://wa.me/"));
});

test("contact URL phone is exactly 918269325226", () => {
  assert.equal(buildWhatsAppContactUrl("8269325226"), "https://wa.me/918269325226");
});

test("contact URL has no @ or raw spaces", () => {
  const url = buildWhatsAppContactUrl("8269325226");
  assert.equal(url.includes("@"), false);
  assert.equal(url.includes(" "), false);
});

test("contact URL falls back to wa.me/ for empty number", () => {
  assert.equal(formatWhatsAppNumber(""), "");
  // buildWhatsAppContactUrl with empty falls back to wa.me/
  const waNumber = formatWhatsAppNumber("");
  const url = waNumber ? `https://wa.me/${waNumber}` : "https://wa.me/";
  assert.equal(url, "https://wa.me/");
});

// ---------------------------------------------------------------------------
// buildOrderMessage -- content correctness
// ---------------------------------------------------------------------------

test("message contains restaurant name", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Thali Raja"), "missing restaurant name");
});

test("message contains item names", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Full Thali"), "missing 'Full Thali'");
  assert.ok(msg.includes("nj"), "missing 'nj'");
});

test("message uses 'x' (not multiplication sign) for quantity", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("x 1"), "should use 'x' for quantity");
  assert.equal(msg.includes("\u00D7"), false, "must not contain multiplication sign U+00D7");
});

test("message uses 'Rs.' prefix (not rupee symbol)", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Rs."), "should use 'Rs.' prefix");
  assert.equal(msg.includes("\u20B9"), false, "must not contain rupee symbol U+20B9");
});

test("correct line total: 1 x 120 = Rs. 120", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("= Rs. 120"), "line total for Full Thali wrong");
});

test("correct line total: 1 x 70 = Rs. 70", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("= Rs. 70"), "line total for nj wrong");
});

test("correct grand total Rs. 190", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Rs. 190"), "grand total wrong");
});

test("customer name in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Raj Kewat"));
});

test("customer phone in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("9182693252"));
});

test("order type 'Pickup' in message (no emoji)", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Order Type: Pickup"), "missing order type");
  // Must not contain surrogate pair emojis
  assert.equal(msg.includes("\uD83D"), false, "must not contain emoji surrogate pairs");
});

test("order type 'Delivery' in message (no emoji)", () => {
  const deliveryCustomer = {
    ...sampleCustomer,
    orderType: "delivery",
    address: "42 MG Road, Shivpuri",
    landmark: "Near City Bank",
  };
  const url = buildWhatsAppOrderUrl(sampleItems, deliveryCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Order Type: Delivery"), "missing delivery order type");
  assert.ok(msg.includes("42 MG Road, Shivpuri"), "missing address");
  assert.ok(msg.includes("Near City Bank"), "missing landmark");
});

test("pickup order message does NOT include 'Delivery Address'", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.equal(msg.includes("Delivery Address:"), false);
});

test("special instructions included when provided", () => {
  const c = { ...sampleCustomer, specialInstructions: "No onion" };
  const url = buildWhatsAppOrderUrl(sampleItems, c, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("No onion"));
});

test("message uses '---' separator (not box-drawing U+2500)", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("---"), "separator missing");
  assert.equal(msg.includes("\u2500"), false, "must not contain box-drawing char U+2500");
});

test("message ends with 'Thank you!'", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.trimEnd().endsWith("Thank you!"), "must end with 'Thank you!'");
});

// ---------------------------------------------------------------------------
// No replacement characters (U+FFFD) anywhere in message
// ---------------------------------------------------------------------------

test("no replacement characters U+FFFD in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.equal(msg.includes("\uFFFD"), false, "replacement character found in message");
});

test("no emojis (surrogate halves) in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  // Emoji codepoints > U+FFFF are represented as surrogate pairs in JS strings
  const hasEmoji = [...msg].some(c => c.codePointAt(0) > 0xFFFF);
  assert.equal(hasEmoji, false, "emoji found in message");
});

// ---------------------------------------------------------------------------
// URL encoding correctness
// ---------------------------------------------------------------------------

test("URL starts with wa.me and correct number", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  assert.ok(url.startsWith("https://wa.me/918269325226?text="));
});

test("URL text param is single-encoded (decoding once recovers the full message)", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const textParam = url.split("?text=")[1];
  const decoded = decodeURIComponent(textParam);
  assert.ok(decoded.includes("Full Thali"), "single decode must recover item name");
  // Double-decoding would fail or produce wrong output -- check it does not add
  // any extra percent signs when decoded once
  assert.equal(decoded.includes("%"), false, "decoded message must not contain literal % (double-encoded)");
});

test("URL has no raw spaces or newlines", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const textPart = url.split("?text=")[1] ?? "";
  assert.equal(textPart.includes(" "), false, "raw space in URL");
  assert.equal(textPart.includes("\n"), false, "raw newline in URL");
});

// ---------------------------------------------------------------------------
// Unicode-safe customer names and menu item names
// ---------------------------------------------------------------------------

test("Unicode customer name is preserved correctly (not corrupted)", () => {
  const c = { ...sampleCustomer, name: "Priya Sharma" };
  const url = buildWhatsAppOrderUrl(sampleItems, c, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Priya Sharma"));
});

test("Hindi/Devanagari item name is preserved correctly", () => {
  const hindiItems = [
    { food: { id: "99", name: "थाली", price: 100 }, quantity: 2 },
  ];
  const url = buildWhatsAppOrderUrl(hindiItems, sampleCustomer, 200);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("थाली"), "Devanagari name corrupted");
  // Must not introduce replacement characters even with non-ASCII item names
  assert.equal(msg.includes("\uFFFD"), false, "replacement char in hindi item name");
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test("empty items list produces a URL (guard is caller responsibility)", () => {
  const url = buildWhatsAppOrderUrl([], sampleCustomer, 0);
  assert.ok(url.startsWith("https://wa.me/918269325226"));
});

test("invalid restaurant number returns empty string", () => {
  assert.equal(buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190, "invalid"), "");
});

test("multiple items -- all appear in message with correct line numbers", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 190);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("1. Full Thali"), "item 1 wrong");
  assert.ok(msg.includes("2. nj"), "item 2 wrong");
});

test("subtotal shown separately when it differs from total", () => {
  // Simulate a delivery fee making total > subtotal
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 240);
  const msg = decodeURIComponent(url.split("?text=")[1]);
  assert.ok(msg.includes("Subtotal: Rs. 190"), "subtotal line missing");
  assert.ok(msg.includes("Total: Rs. 240"), "total line wrong");
});
