import type { FoodItem } from "./menu";

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export type OrderType = "pickup" | "delivery";

export interface CustomerInfo {
  name: string;
  phone: string;
  orderType: OrderType;
  address?: string;
  landmark?: string;
  specialInstructions?: string;
}

export interface Order {
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  total: number;
}
