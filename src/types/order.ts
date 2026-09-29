import type { FoodItem } from "./menu";

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export type OrderType = "eat-here" | "parcel";

export interface CustomerInfo {
  name: string;
  phone: string;
  orderType: OrderType;
  tableNumber?: string;
  specialInstructions?: string;
}

export interface Order {
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  total: number;
}
