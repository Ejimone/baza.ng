import type {
    Bundle,
    MealPack,
    ReadyEatItem,
    RestockItem,
    SnackItem,
} from "../types";
import api from "./api";

const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type CacheOptions = {
  force?: boolean;
};

const productsCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

function isFresh(timestamp: number): boolean {
  return Date.now() - timestamp < PRODUCTS_CACHE_TTL_MS;
}

function getCachedValue<T>(key: string): T | null {
  const entry = productsCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (!isFresh(entry.timestamp)) {
    productsCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedValue<T>(key: string, data: T) {
  productsCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> {
  if (!options?.force) {
    const cached = getCachedValue<T>(key);
    if (cached) return cached;
  }

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

function getRestockCacheKey(category?: string, q?: string) {
  const categoryKey = category && category !== "All" ? category : "All";
  const queryKey = q?.trim().toLowerCase() ?? "";
  return `restock:${categoryKey}:${queryKey}`;
}

export function getCachedBundles(): Bundle[] | null {
  return getCachedValue<Bundle[]>("bundles");
}

export function getCachedMealPacks(): MealPack[] | null {
  return getCachedValue<MealPack[]>("mealpacks");
}

export function getCachedReadyEat(): ReadyEatItem[] | null {
  return getCachedValue<ReadyEatItem[]>("readyeat");
}

export function getCachedSnacks(category?: string): SnackItem[] | null {
  const categoryKey = category && category !== "All" ? category : "All";
  return getCachedValue<SnackItem[]>(`snacks:${categoryKey}`);
}

export function getCachedRestock(
  category?: string,
  q?: string,
): { items: RestockItem[]; categories: string[] } | null {
  return getCachedValue<{ items: RestockItem[]; categories: string[] }>(
    getRestockCacheKey(category, q),
  );
}

export async function getBundles(options?: CacheOptions): Promise<Bundle[]> {
  return fetchWithCache(
    "bundles",
    async () => {
      const { data } = await api.get("/products/bundles");
      return data.bundles;
    },
    options,
  );
}

export async function getMealPacks(
  options?: CacheOptions,
): Promise<MealPack[]> {
  return fetchWithCache(
    "mealpacks",
    async () => {
      const { data } = await api.get("/products/mealpacks");
      return data.mealPacks;
    },
    options,
  );
}

export async function getReadyEat(
  options?: CacheOptions,
): Promise<ReadyEatItem[]> {
  return fetchWithCache(
    "readyeat",
    async () => {
      const { data } = await api.get("/products/readyeat");
      return data.items;
    },
    options,
  );
}

export async function getSnacks(
  category?: string,
  options?: CacheOptions,
): Promise<SnackItem[]> {
  const categoryKey = category && category !== "All" ? category : "All";
  const cacheKey = `snacks:${categoryKey}`;

  return fetchWithCache(
    cacheKey,
    async () => {
      const params = category && category !== "All" ? { category } : undefined;
      const { data } = await api.get("/products/snacks", { params });
      return data.items;
    },
    options,
  );
}

export async function getRestock(
  category?: string,
  q?: string,
  options?: CacheOptions,
): Promise<{ items: RestockItem[]; categories: string[] }> {
  const cacheKey = getRestockCacheKey(category, q);

  const params: Record<string, string> = {};
  if (category && category !== "All") params.category = category;
  if (q) params.q = q;

  return fetchWithCache(
    cacheKey,
    async () => {
      const { data } = await api.get("/products/restock", { params });
      return data;
    },
    options,
  );
}

export async function prefetchAllCatalog(): Promise<void> {
  await Promise.allSettled([
    getBundles(),
    getMealPacks(),
    getReadyEat(),
    getSnacks(),
    getRestock(),
  ]);
}

export function clearProductsCache() {
  productsCache.clear();
  inflightRequests.clear();
}
