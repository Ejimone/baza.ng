import { useCallback } from "react";
import { useCartStore } from "../stores/cartStore";
import { formatPrice } from "../utils/format";
import type { CartItem, CartItemType } from "../types";

type AddItemPayload =
  | { productId: string; itemType: CartItemType; qty?: number }
  | (CartItem & { productId?: string });

export function useCart() {
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addItemStore = useCartStore((s) => s.addItem);
  const removeItemStore = useCartStore((s) => s.removeItem);
  const updateQtyStore = useCartStore((s) => s.updateQty);
  const clearStore = useCartStore((s) => s.clear);

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const formattedTotal = formatPrice(total);
  const isEmpty = items.length === 0;

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      const productId =
        "productId" in payload
          ? String(payload.productId ?? "").trim()
          : String((payload as CartItem).id ?? (payload as CartItem).productId ?? "").trim();
      const itemType =
        "itemType" in payload
          ? (payload.itemType as CartItemType)
          : ((payload as CartItem).itemType as CartItemType);
      const qty = "qty" in payload ? payload.qty : 1;

      if (!productId || !itemType) {
        console.warn("[Cart] addItem skipped: missing productId or itemType", {
          productId,
          itemType,
        });
        return;
      }

      await addItemStore({ productId, itemType, qty });
    },
    [addItemStore],
  );

  const removeItem = useCallback(
    async (idOrProductId: string, itemType?: CartItemType) => {
      if (itemType) {
        const cartItem = items.find(
          (i) => (i.productId ?? i.id) === idOrProductId && i.itemType === itemType,
        );
        if (cartItem) return removeItemStore(cartItem.id);
      }
      return removeItemStore(idOrProductId);
    },
    [items, removeItemStore],
  );

  const updateQty = useCallback(
    async (idOrProductId: string, qty: number, itemType?: CartItemType) => {
      if (itemType) {
        const cartItem = items.find(
          (i) => (i.productId ?? i.id) === idOrProductId && i.itemType === itemType,
        );
        if (cartItem) return updateQtyStore(cartItem.id, qty);
      }
      return updateQtyStore(idOrProductId, qty);
    },
    [items, updateQtyStore],
  );

  const getItemQty = useCallback(
    (productId: string, itemType?: CartItemType): number => {
      const item = items.find(
        (i) => (i.productId ?? i.id) === productId && (!itemType || i.itemType === itemType),
      );
      return item?.qty ?? 0;
    },
    [items],
  );

  const isInCart = useCallback(
    (productId: string, itemType?: CartItemType): boolean => {
      return items.some(
        (i) => (i.productId ?? i.id) === productId && (!itemType || i.itemType === itemType),
      );
    },
    [items],
  );

  const getCartItemByProduct = useCallback(
    (productId: string, itemType: CartItemType): CartItem | undefined => {
      return items.find(
        (i) => (i.productId ?? i.id) === productId && i.itemType === itemType,
      );
    },
    [items],
  );

  return {
    items,
    total,
    count,
    formattedTotal,
    isEmpty,
    isLoading,
    error,
    fetchCart,
    addItem,
    removeItem,
    updateQty,
    clear: clearStore,
    getItemQty,
    isInCart,
    getCartItemByProduct,
  };
}
