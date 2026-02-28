import type {
    CartItem,
    Order,
    OrderDetail,
    OrderPaymentVerifyResponse,
    OrderStatus,
    Pagination,
} from "../types";
import api from "./api";

export interface CreateOrderPayload {
  items: Array<{
    itemType: string;
    productId?: string;
    name: string;
    emoji: string;
    imageUrl?: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    meta?: Record<string, unknown>;
  }>;
  total: number;
  note?: string;
  addressId?: string;
  paymentMethod?: string;
  callbackUrl?: string;
}

export interface CreateOrderResponse {
  order: OrderDetail;
  walletBalance: number;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
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

export async function verifyOrderPayment(
  reference: string,
  orderId: string,
): Promise<OrderPaymentVerifyResponse> {
  const { data } = await api.get("/orders/verify-payment", {
    params: { reference, orderId },
  });
  return data;
}

export function cartItemsToOrderItems(
  items: CartItem[],
): CreateOrderPayload["items"] {
  return items.map((item) => ({
    itemType: item.itemType,
    productId: item.productId,
    name: item.name,
    emoji: item.emoji,
    imageUrl: item.imageUrl,
    qty: item.qty,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    meta: item.meta as Record<string, unknown> | undefined,
  }));
}
