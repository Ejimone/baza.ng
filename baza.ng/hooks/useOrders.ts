import { useState, useCallback } from "react";
import * as ordersService from "../services/orders";
import type { Order, OrderDetail, OrderStatus, Pagination } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (page = 1, limit = 20, status?: OrderStatus) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ordersService.getOrders(page, limit, status);
        setOrders((prev) => (page === 1 ? data.orders : [...prev, ...data.orders]));
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.response?.data?.error ?? "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const order = await ordersService.getOrder(id);
      setCurrentOrder(order);
      return order;
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load order");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(
    async (payload: ordersService.CreateOrderPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await ordersService.createOrder(payload);
        return result;
      } catch (err: any) {
        const msg = err.response?.data?.error ?? "Failed to create order";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    orders,
    pagination,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
    clearError: () => setError(null),
  };
}
