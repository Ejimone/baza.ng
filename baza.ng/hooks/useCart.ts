import { useCartStore } from "../stores/cartStore";
import { formatPrice } from "../utils/format";
import type { CartItem } from "../types";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);
  const totalKobo = useCartStore((s) => s.total);
  const itemCount = useCartStore((s) => s.count);

  const total = totalKobo();
  const count = itemCount();
  const formattedTotal = formatPrice(total);
  const isEmpty = items.length === 0;

  const getItemQty = (id: string): number => {
    const item = items.find((i) => i.id === id);
    return item?.qty ?? 0;
  };

  const isInCart = (id: string): boolean =>
    items.some((i) => i.id === id);

  return {
    items,
    total,
    count,
    formattedTotal,
    isEmpty,
    addItem,
    removeItem,
    updateQty,
    clear,
    getItemQty,
    isInCart,
  };
}
