import { create } from "zustand";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  qty: i.qty + item.qty,
                  totalPrice: (i.qty + item.qty) * i.unitPrice,
                }
              : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQty: (id, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.id !== id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty, totalPrice: qty * i.unitPrice } : i,
        ),
      };
    }),

  clear: () => set({ items: [] }),

  total: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),

  count: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}));
