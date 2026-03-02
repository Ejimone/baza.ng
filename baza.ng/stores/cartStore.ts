import { create } from "zustand";
import type { CartItem, CartItemType } from "../types";
import * as cartService from "../services/cart";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  setItems: (items: CartItem[]) => void;
  fetchCart: () => Promise<void>;
  addItem: (payload: {
    productId: string;
    itemType: CartItemType;
    qty?: number;
  }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  clearLocal: () => void;

  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items, error: null }),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await cartService.getCart();
      set({ items: data.items, isLoading: false });
    } catch (err: unknown) {
      const res = err as { response?: { status?: number; data?: { error?: string } } };
      const status = res?.response?.status;
      const msg = res?.response?.data?.error ?? "Failed to load cart";
      set({ items: [], isLoading: false });
      if (status === 401) {
        set({ error: null });
      } else if (status !== 400) {
        set({ error: msg });
      }
      if (__DEV__ && (status === 400 || status === 404)) {
        console.warn("[Cart] fetchCart", status, res?.response?.data);
      }
    }
  },

  addItem: async (payload) => {
    set({ error: null });
    try {
      const data = await cartService.addToCart(payload);
      set({ items: data.items });
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string; code?: string } } };
      const msg = res?.response?.data?.error ?? "Failed to add to cart";
      const code = res?.response?.data?.code ?? "";
      set({ error: msg });
      if (__DEV__) {
        console.warn("[Cart] addItem failed:", code, msg, res?.response?.data);
      }
    }
  },

  removeItem: async (itemId) => {
    if (!itemId?.trim()) return;
    set({ error: null });
    try {
      const data = await cartService.removeCartItem(itemId);
      set({ items: data.items });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to remove item";
      set({ error: msg });
    }
  },

  updateQty: async (itemId, qty) => {
    if (!itemId?.trim()) return;
    set({ error: null });
    try {
      const data = await cartService.updateCartItemQty(itemId, qty);
      set({ items: data.items });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to update quantity";
      set({ error: msg });
    }
  },

  clear: async () => {
    set({ error: null });
    try {
      const data = await cartService.clearCart();
      set({ items: data.items });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to clear cart";
      set({ error: msg });
    }
  },

  clearLocal: () => set({ items: [], error: null }),

  total: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),

  count: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}));
