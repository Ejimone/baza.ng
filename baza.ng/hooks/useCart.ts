import { useCallback, useMemo } from "react";
import { useCartStore } from "../stores/cartStore";
import type { CartItem, CartItemType } from "../types";
import { formatPrice } from "../utils/format";

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

  const { total, count, itemLookup } = useMemo(() => {
    const lookup = new Map<string, CartItem>();
    let totalAccumulator = 0;
    let countAccumulator = 0;

    for (const item of items) {
      const id = String(item.productId ?? item.id);
      lookup.set(`${item.itemType}:${id}`, item);
      lookup.set(`any:${id}`, item);
      totalAccumulator += item.totalPrice;
      countAccumulator += item.qty;
    }

    return {
      total: totalAccumulator,
      count: countAccumulator,
      itemLookup: lookup,
    };
  }, [items]);

  const formattedTotal = formatPrice(total);
  const isEmpty = items.length === 0;

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      const productId =
        "productId" in payload
          ? String(payload.productId ?? "").trim()
          : String(
              (payload as CartItem).id ?? (payload as CartItem).productId ?? "",
            ).trim();
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
        const cartItem = itemLookup.get(`${itemType}:${idOrProductId}`);
        if (cartItem) return removeItemStore(cartItem.id);
      }
      return removeItemStore(idOrProductId);
    },
    [itemLookup, removeItemStore],
  );

  const updateQty = useCallback(
    async (idOrProductId: string, qty: number, itemType?: CartItemType) => {
      if (itemType) {
        const cartItem = itemLookup.get(`${itemType}:${idOrProductId}`);
        if (cartItem) return updateQtyStore(cartItem.id, qty);
      }
      return updateQtyStore(idOrProductId, qty);
    },
    [itemLookup, updateQtyStore],
  );

  const getItemQty = useCallback(
    (productId: string, itemType?: CartItemType): number => {
      const key = itemType ? `${itemType}:${productId}` : `any:${productId}`;
      const item = itemLookup.get(key);
      return item?.qty ?? 0;
    },
    [itemLookup],
  );

  const isInCart = useCallback(
    (productId: string, itemType?: CartItemType): boolean => {
      const key = itemType ? `${itemType}:${productId}` : `any:${productId}`;
      return itemLookup.has(key);
    },
    [itemLookup],
  );

  const getCartItemByProduct = useCallback(
    (productId: string, itemType: CartItemType): CartItem | undefined => {
      return itemLookup.get(`${itemType}:${productId}`);
    },
    [itemLookup],
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
