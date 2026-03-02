import type { CartItem, CartItemType } from "../types";
import api from "./api";

export interface CartSummary {
  items: CartItem[];
  count: number;
  total: number;
  totalFormatted: string;
}

export interface AddToCartPayload {
  productId: string;
  itemType: CartItemType;
  qty?: number;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  items: CartItem[];
  count: number;
  total: number;
  totalFormatted: string;
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  items: CartItem[];
  count: number;
  total: number;
  totalFormatted: string;
}

export async function getCart(): Promise<CartSummary> {
  const { data } = await api.get("/orders/cart");
  return {
    items: data.items ?? [],
    count: data.count ?? 0,
    total: data.total ?? 0,
    totalFormatted: data.totalFormatted ?? "₦0",
  };
}

const VALID_ITEM_TYPES = ["product", "bundle", "mealpack", "readyeat", "snack"] as const;

export async function addToCart(
  payload: AddToCartPayload,
): Promise<AddToCartResponse> {
  const productId = String(payload.productId ?? "").trim();
  const itemType = String(payload.itemType ?? "").toLowerCase();

  if (!productId || !itemType) {
    throw new Error("productId and itemType are required");
  }
  if (!VALID_ITEM_TYPES.includes(itemType as (typeof VALID_ITEM_TYPES)[number])) {
    throw new Error(`itemType must be one of: ${VALID_ITEM_TYPES.join(", ")}`);
  }

  const { data } = await api.post("/orders/cart/items", {
    productId,
    itemType,
    qty: Math.max(1, payload.qty ?? 1),
  });
  return {
    success: data.success ?? true,
    message: data.message ?? "",
    items: data.items ?? [],
    count: data.count ?? 0,
    total: data.total ?? 0,
    totalFormatted: data.totalFormatted ?? "₦0",
  };
}

export async function updateCartItemQty(
  itemId: string,
  qty: number,
): Promise<CartMutationResponse> {
  const { data } = await api.patch(`/orders/cart/items/${itemId}`, { qty });
  return {
    success: data.success ?? true,
    message: data.message ?? "",
    items: data.items ?? [],
    count: data.count ?? 0,
    total: data.total ?? 0,
    totalFormatted: data.totalFormatted ?? "₦0",
  };
}

export async function removeCartItem(
  itemId: string,
): Promise<CartMutationResponse> {
  const { data } = await api.delete(`/orders/cart/items/${itemId}`);
  return {
    success: data.success ?? true,
    message: data.message ?? "",
    items: data.items ?? [],
    count: data.count ?? 0,
    total: data.total ?? 0,
    totalFormatted: data.totalFormatted ?? "₦0",
  };
}

export async function clearCart(): Promise<CartMutationResponse> {
  const { data } = await api.delete("/orders/cart/clear");
  return {
    success: data.success ?? true,
    message: data.message ?? "",
    items: data.items ?? [],
    count: data.count ?? 0,
    total: data.total ?? 0,
    totalFormatted: data.totalFormatted ?? "₦0",
  };
}
