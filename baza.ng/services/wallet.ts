import type {
    Pagination,
    PaystackConfig,
    TopupInitResponse,
    TopupVerifyResponse,
    WalletAccountResponse,
    WalletBalance,
    WalletTransaction,
} from "../types";
import api from "./api";

const BALANCE_CACHE_TTL_MS = 30 * 1000;
const ACCOUNT_CACHE_TTL_MS = 2 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const walletCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

function isFresh(timestamp: number, ttlMs: number): boolean {
  return Date.now() - timestamp < ttlMs;
}

function getCachedValue<T>(key: string, ttlMs: number): T | null {
  const entry = walletCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (!isFresh(entry.timestamp, ttlMs)) {
    walletCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedValue<T>(key: string, data: T) {
  walletCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = getCachedValue<T>(key, ttlMs);
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

function invalidateWalletCache() {
  walletCache.clear();
  inflightRequests.clear();
}

export async function getBalance(): Promise<WalletBalance> {
  return fetchWithCache("wallet:balance", BALANCE_CACHE_TTL_MS, async () => {
    const { data } = await api.get("/wallet/balance");
    return data;
  });
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
  invalidateWalletCache();
  return data;
}

export async function verifyTopup(
  reference: string,
): Promise<TopupVerifyResponse> {
  const { data } = await api.get("/wallet/verify-topup", {
    params: { reference },
  });
  invalidateWalletCache();
  return data;
}

export async function getAccount(): Promise<WalletAccountResponse> {
  return fetchWithCache("wallet:account", ACCOUNT_CACHE_TTL_MS, async () => {
    const { data } = await api.get("/wallet/account");
    return data;
  });
}

export async function prefetchWalletWarmup(): Promise<void> {
  await Promise.allSettled([getBalance(), getAccount()]);
}
