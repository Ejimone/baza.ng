import { useCartStore } from "../stores/cartStore";
import { formatPrice } from "../utils/format";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const formattedTotal = formatPrice(total);
  const isEmpty = items.length === 0;

  const getItemQty = (id: string): number => {
    const item = items.find((i) => i.id === id);
    return item?.qty ?? 0;
  };

  const isInCart = (id: string): boolean => items.some((i) => i.id === id);

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
