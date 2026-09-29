"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import type { CartItem } from "@/types/order";
import type { FoodItem } from "@/types/menu";

// ── State & Actions ──────────────────────────────────────────

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD_ITEM"; food: FoodItem }
  | { type: "INCREASE"; id: string }
  | { type: "DECREASE"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "INIT"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      if (!action.food.available) return state; // guard: unavailable items
      const existing = state.items.find((i) => i.food.id === action.food.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.food.id === action.food.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { food: action.food, quantity: 1 }] };
    }
    case "INCREASE": {
      return {
        items: state.items.map((i) =>
          i.food.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    case "DECREASE": {
      return {
        items: state.items
          .map((i) =>
            i.food.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0),
      };
    }
    case "REMOVE": {
      return { items: state.items.filter((i) => i.food.id !== action.id) };
    }
    case "CLEAR": {
      return { items: [] };
    }
    case "INIT": {
      return { items: action.items };
    }
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  addItem: (food: FoodItem) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getQuantity: (id: string) => number;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("thali_raja_cart_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out items with invalid quantities just in case
          const validItems = parsed.filter(i => i && i.food && i.food.id && typeof i.quantity === 'number' && i.quantity > 0);
          dispatch({ type: "INIT", items: validItems });
        }
      }
    } catch (e) {
      console.error("Failed to restore cart", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("thali_raja_cart_v1", JSON.stringify(state.items));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [state.items, isLoaded]);

  const addItem = useCallback(
    (food: FoodItem) => dispatch({ type: "ADD_ITEM", food }),
    []
  );
  const increaseQuantity = useCallback(
    (id: string) => dispatch({ type: "INCREASE", id }),
    []
  );
  const decreaseQuantity = useCallback(
    (id: string) => dispatch({ type: "DECREASE", id }),
    []
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE", id }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const getQuantity = useCallback(
    (id: string) => state.items.find((i) => i.food.id === id)?.quantity ?? 0,
    [state.items]
  );

  const totalItems = useMemo(
    () => state.items.reduce((acc, i) => acc + i.quantity, 0),
    [state.items]
  );
  const subtotal = useMemo(
    () =>
      state.items.reduce((acc, i) => acc + i.food.price * i.quantity, 0),
    [state.items]
  );
  const total = subtotal; // No taxes/delivery charge in V1

  const value = useMemo<CartContextType>(
    () => ({
      items: state.items,
      totalItems,
      subtotal,
      total,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      getQuantity,
      isLoaded,
    }),
    [
      state.items,
      totalItems,
      subtotal,
      total,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      getQuantity,
      isLoaded,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return ctx;
}
