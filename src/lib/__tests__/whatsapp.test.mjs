/**
 * Unit tests for WhatsApp helper functions.
 * Run with:  node --test src/lib/__tests__/whatsapp.test.mjs
 *
 * These tests duplicate the TypeScript logic in plain JS so they can run
 * without a build step and without any test framework dependency.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

// Inline the function under test — mirrors formatWhatsAppNumber() in src/lib/whatsapp.ts
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
  const waNumber = formatWhatsAppNumber(rawNumber);
  if (!waNumber) return "https://wa.me/";
  return `https://wa.me/${waNumber}`;
}

function buildOrderMessage(items, customer, total) {
  const itemLines = items.map((item, index) => {
    const lineTotal = item.food.price * item.quantity;
    return `${index + 1}. ${item.food.name} x ${item.quantity}  @Rs${item.food.price} = Rs${lineTotal}`;
  }).join("\n");
  const subtotal = items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
  const totalsSection = subtotal !== total ? `Subtotal: Rs${subtotal}\nTotal: Rs${total}` : `Total: Rs${total}`;
  const orderTypeLabel = customer.orderType === "pickup" ? "Pickup" : "Delivery";
  const deliveryDetails = customer.orderType === "delivery"
    ? `\nDelivery Address: ${customer.address}${customer.landmark ? `\nLandmark: ${customer.landmark}` : ""}`
    : "";
  const specialNote = customer.specialInstructions ? `\nSpecial Instructions: ${customer.specialInstructions}` : "";
  return `Hello Thali Raja!\n\nOrder:\n${itemLines}\n\n${totalsSection}\n\nName: ${customer.name}\nPhone: ${customer.phone}\nOrder Type: ${orderTypeLabel}${deliveryDetails}${specialNote}\n\nThank you!`;
}

function buildWhatsAppOrderUrl(items, customer, total, restaurantWaNumber) {
  const raw = restaurantWaNumber || "918269325226";
  const waNumber = formatWhatsAppNumber(raw);
  if (!waNumber) return "";
  const message = buildOrderMessage(items, customer, total);
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

// ---- formatWhatsAppNumber tests ----

test("10-digit plain number", () => {
  assert.equal(formatWhatsAppNumber("8269325226"), "918269325226");
});

test("number with +91 prefix and space", () => {
  assert.equal(formatWhatsAppNumber("+91 8269325226"), "918269325226");
});

test("number with +91 prefix and hyphens", () => {
  assert.equal(formatWhatsAppNumber("+91-826-932-5226"), "918269325226");
});

test("12-digit already-international number is not changed", () => {
  assert.equal(formatWhatsAppNumber("918269325226"), "918269325226");
});

test("12-digit number is NOT double-prefixed with 9191", () => {
  const result = formatWhatsAppNumber("918269325226");
  assert.equal(result.startsWith("9191"), false);
});

test("11-digit number with leading 0", () => {
  assert.equal(formatWhatsAppNumber("08269325226"), "918269325226");
});

test("empty string returns empty string", () => {
  assert.equal(formatWhatsAppNumber(""), "");
});

test("whitespace-only string returns empty string", () => {
  assert.equal(formatWhatsAppNumber("   "), "");
});

test("too-short number returns empty string", () => {
  assert.equal(formatWhatsAppNumber("12345"), "");
});

test("10-digit number with invalid prefix returns empty", () => {
  assert.equal(formatWhatsAppNumber("1234567890"), "");
});

// ---- buildWhatsAppContactUrl tests ----

test("contact URL uses wa.me domain", () => {
  const url = buildWhatsAppContactUrl("8269325226");
  assert.equal(url.startsWith("https://wa.me/"), true);
});

test("contact URL phone is exactly 918269325226", () => {
  assert.equal(buildWhatsAppContactUrl("8269325226"), "https://wa.me/918269325226");
});

test("contact URL has no @ symbol or spaces", () => {
  const url = buildWhatsAppContactUrl("8269325226");
  assert.equal(url.includes("@"), false);
  assert.equal(url.includes(" "), false);
});

test("contact URL fallback for empty number", () => {
  assert.equal(buildWhatsAppContactUrl(""), "https://wa.me/");
});

// ---- buildWhatsAppOrderUrl tests ----

const sampleItems = [
  { food: { id: "1", name: "Thali Special", price: 180 }, quantity: 2 },
  { food: { id: "2", name: "Lassi", price: 40 }, quantity: 1 },
];
const sampleCustomer = { name: "Rajesh Kumar", phone: "9876543210", orderType: "pickup" };

test("order URL starts with correct wa.me number", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.startsWith("https://wa.me/918269325226"), `Got: ${url}`);
});

test("order URL contains encoded text parameter", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes("?text="), `Got: ${url}`);
});

test("item names appear in encoded message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes(encodeURIComponent("Thali Special")));
  assert.ok(url.includes(encodeURIComponent("Lassi")));
});

test("customer name appears in encoded message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes(encodeURIComponent("Rajesh Kumar")));
});

test("total amount appears in encoded message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes(encodeURIComponent("Rs400")));
});

test("delivery address included for delivery orders", () => {
  const c = { ...sampleCustomer, orderType: "delivery", address: "42 MG Road, Shivpuri", landmark: "Near City Bank" };
  const url = buildWhatsAppOrderUrl(sampleItems, c, 400);
  assert.ok(url.includes(encodeURIComponent("42 MG Road, Shivpuri")));
  assert.ok(url.includes(encodeURIComponent("Near City Bank")));
});

test("delivery address NOT included for pickup orders", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(!url.includes(encodeURIComponent("Delivery Address:")));
});

test("special instructions included when provided", () => {
  const c = { ...sampleCustomer, specialInstructions: "No onion please" };
  const url = buildWhatsAppOrderUrl(sampleItems, c, 400);
  assert.ok(url.includes(encodeURIComponent("No onion please")));
});

test("line total 2 x 180 = 360 appears in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes(encodeURIComponent("Rs360")));
});

test("per-item unit prices appear in message", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  assert.ok(url.includes(encodeURIComponent("Rs180")));
  assert.ok(url.includes(encodeURIComponent("Rs40")));
});

test("returns empty string for invalid restaurant number", () => {
  assert.equal(buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400, "invalid"), "");
});

test("no raw spaces or newlines in encoded text part of URL", () => {
  const url = buildWhatsAppOrderUrl(sampleItems, sampleCustomer, 400);
  const textPart = url.split("?text=")[1] ?? "";
  assert.equal(textPart.includes(" "), false, "Raw space in URL");
  assert.equal(textPart.includes("\n"), false, "Raw newline in URL");
});
