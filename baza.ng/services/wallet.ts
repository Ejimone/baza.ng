import api from "./api";
import type {
  WalletBalance,
  WalletTransaction,
  TopupInitResponse,
  TopupVerifyResponse,
  PaystackConfig,
  Pagination,
} from "../types";

export async function getBalance(): Promise<WalletBalance> {
  const { data } = await api.get("/wallet/balance");
  return data;
}

export async function getTransactions(
  page = 1,
  limit = 20,
): Promise<{ transactions: WalletTransaction[]; pagination?: Pagination }> {
  const { data } = await api.get("/wallet/transactions", {
    params: { page, limit },
  });
  return data;
}

export async function getPaystackConfig(): Promise<PaystackConfig> {
  const { data } = await api.get("/wallet/paystack-config");
  return data;
}

export async function initTopup(
  amount: number,
  callbackUrl: string,
): Promise<TopupInitResponse> {
  const { data } = await api.post("/wallet/topup", { amount, callbackUrl });
  return data;
}

export async function verifyTopup(
  reference: string,
): Promise<TopupVerifyResponse> {
  const { data } = await api.get("/wallet/verify-topup", {
    params: { reference },
  });
  return data;
}
