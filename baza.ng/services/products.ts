import type {
    Bundle,
    MealPack,
    ReadyEatItem,
    RestockItem,
    SnackItem,
} from "../types";
import api from "./api";

export interface CatalogBranch<T> {
  categories: string[];
  items: T[];
}

export interface Catalog {
  restock: CatalogBranch<RestockItem>;
  snacks: CatalogBranch<SnackItem>;
  bundles: CatalogBranch<Bundle>;
  mealpacks: CatalogBranch<MealPack>;
  readyeat: CatalogBranch<ReadyEatItem>;
}

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

export function getCachedSnackCategories(): string[] | null {
  return getCachedValue<string[]>("snackCategories");
}

export async function getCatalog(options?: CacheOptions): Promise<Catalog> {
  return fetchWithCache(
    "catalog",
    async () => {
      const { data } = await api.get<{ catalog: Catalog }>("/products/catalog");
      const catalog = data.catalog;

      // Populate individual caches from catalog for compatibility
      setCachedValue("bundles", catalog.bundles.items);
      setCachedValue("mealpacks", catalog.mealpacks.items);
      setCachedValue("readyeat", catalog.readyeat.items);
      setCachedValue("snacks:All", catalog.snacks.items);
      setCachedValue("snackCategories", catalog.snacks.categories);
      setCachedValue(getRestockCacheKey(undefined, undefined), {
        items: catalog.restock.items,
        categories: catalog.restock.categories,
      });

      return catalog;
    },
    options,
  );
}

export async function getBundles(
  category?: string,
  options?: CacheOptions,
): Promise<Bundle[]> {
  const cacheKey =
    category && category !== "All" ? `bundles:${category}` : "bundles";
  return fetchWithCache(
    cacheKey,
    async () => {
      const catalog = getCachedValue<Catalog>("catalog");
      if (!category && catalog && !options?.force) {
        return catalog.bundles.items;
      }
      const params = category && category !== "All" ? { category } : undefined;
      const { data } = await api.get<{ bundles: Bundle[] }>(
        "/products/bundles",
        { params },
      );
      return data.bundles;
    },
    options,
  );
}

export async function getMealPacks(
  category?: string,
  options?: CacheOptions,
): Promise<MealPack[]> {
  const cacheKey =
    category && category !== "All" ? `mealpacks:${category}` : "mealpacks";
  return fetchWithCache(
    cacheKey,
    async () => {
      const catalog = getCachedValue<Catalog>("catalog");
      if (!category && catalog && !options?.force) {
        return catalog.mealpacks.items;
      }
      const params = category && category !== "All" ? { category } : undefined;
      const { data } = await api.get<{ mealPacks: MealPack[] }>(
        "/products/mealpacks",
        { params },
      );
      return data.mealPacks;
    },
    options,
  );
}

export async function getReadyEat(
  category?: string,
  options?: CacheOptions,
): Promise<ReadyEatItem[]> {
  const cacheKey =
    category && category !== "All" ? `readyeat:${category}` : "readyeat";
  return fetchWithCache(
    cacheKey,
    async () => {
      const catalog = getCachedValue<Catalog>("catalog");
      if (!category && catalog && !options?.force) {
        return catalog.readyeat.items;
      }
      const params = category && category !== "All" ? { category } : undefined;
      const { data } = await api.get<{ items: ReadyEatItem[] }>(
        "/products/readyeat",
        { params },
      );
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
      const allCached = getCachedValue<SnackItem[]>("snacks:All");
      if (allCached && !options?.force) {
        if (categoryKey === "All") return allCached;
        return allCached.filter((s) => s.category === category);
      }

      const params = category && category !== "All" ? { category } : undefined;
      const { data } = await api.get<{
        items: SnackItem[];
        categories?: string[];
      }>("/products/snacks", { params });
      if (data.categories) {
        setCachedValue("snackCategories", data.categories);
      }
      if (categoryKey === "All") {
        setCachedValue("snacks:All", data.items);
      }
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

  return fetchWithCache(
    cacheKey,
    async () => {
      const catalogRestock = getCachedValue<{
        items: RestockItem[];
        categories: string[];
      }>(getRestockCacheKey(undefined, undefined));

      if (!q && catalogRestock && !options?.force) {
        const cat = category && category !== "All" ? category : undefined;
        const items = cat
          ? catalogRestock.items.filter((i) => i.category === cat)
          : catalogRestock.items;
        return { items, categories: catalogRestock.categories };
      }

      const params: Record<string, string> = {};
      if (category && category !== "All") params.category = category;
      if (q) params.q = q;

      const { data } = await api.get<{
        items: RestockItem[];
        categories: string[];
      }>("/products/restock", { params });
      return data;
    },
    options,
  );
}

export async function prefetchAllCatalog(): Promise<void> {
  try {
    await getCatalog();
  } catch {
    // Fallback to individual endpoints if catalog fails
    await Promise.allSettled([
      getBundles(),
      getMealPacks(),
      getReadyEat(),
      getSnacks(),
      getRestock(),
    ]);
  }
}

export function clearProductsCache() {
  productsCache.clear();
  inflightRequests.clear();
}
