import api from "./api";
import type {
  CartItem,
  Order,
  OrderDetail,
  OrderStatus,
  Pagination,
} from "../types";

export interface CreateOrderPayload {
  items: Array<{
    itemType: string;
    productId?: string;
    name: string;
    emoji: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    meta?: Record<string, unknown>;
  }>;
  total: number;
  note?: string;
  addressId?: string;
}

export interface CreateOrderResponse {
  order: OrderDetail;
  walletBalance: number;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const { data } = await api.post("/orders/create", payload);
  return data;
}

export async function getOrders(
  page = 1,
  limit = 20,
  status?: OrderStatus,
): Promise<{ orders: Order[]; pagination: Pagination }> {
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;
  const { data } = await api.get("/orders/", { params });
  return data;
}

export async function getOrder(id: string): Promise<OrderDetail> {
  const { data } = await api.get(`/orders/${id}`);
  return data.order ?? data;
}

export function cartItemsToOrderItems(
  items: CartItem[],
): CreateOrderPayload["items"] {
  return items.map((item) => ({
    itemType: item.itemType,
    productId: item.productId,
    name: item.name,
    emoji: item.emoji,
    qty: item.qty,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    meta: item.meta as Record<string, unknown> | undefined,
  }));
}
