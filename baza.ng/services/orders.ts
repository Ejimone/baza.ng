import type {
    CartItem,
    Order,
    OrderDetail,
    OrderPaymentVerifyResponse,
    OrderStatus,
    Pagination,
} from "../types";
import api from "./api";

const ORDERS_CACHE_TTL_MS = 2 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const ordersCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

function isFresh(timestamp: number): boolean {
  return Date.now() - timestamp < ORDERS_CACHE_TTL_MS;
}

function getCachedValue<T>(key: string): T | null {
  const entry = ordersCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (!isFresh(entry.timestamp)) {
    ordersCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedValue<T>(key: string, data: T) {
  ordersCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = getCachedValue<T>(key);
  if (cached) return cached;

  const inflight = inflightRequests.get(key) as Promise<T> | undefined;
  if (inflight) return inflight;

  const requestPromise = fetcher()
    .then((result) => {
      setCachedValue(key, result);
      return result;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, requestPromise);
  return requestPromise;
}

function invalidateOrdersCache() {
  ordersCache.clear();
  inflightRequests.clear();
}

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
  invalidateOrdersCache();
  return data;
}

export async function getOrders(
  page = 1,
  limit = 20,
  status?: OrderStatus,
): Promise<{ orders: Order[]; pagination: Pagination }> {
  const cacheKey = `orders:${page}:${limit}:${status ?? "ALL"}`;
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;

  return fetchWithCache(cacheKey, async () => {
    const { data } = await api.get("/orders/", { params });
    return data;
  });
}

export async function getOrder(id: string): Promise<OrderDetail> {
  return fetchWithCache(`order:${id}`, async () => {
    const { data } = await api.get(`/orders/${id}`);
    return data.order ?? data;
  });
}

export async function verifyOrderPayment(
  reference: string,
  orderId: string,
): Promise<OrderPaymentVerifyResponse> {
  const { data } = await api.get("/orders/verify-payment", {
    params: { reference, orderId },
  });
  invalidateOrdersCache();
  return data;
}

export async function prefetchOrdersWarmup(): Promise<void> {
  await getOrders(1, 20);
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
