import { useCallback, useState } from "react";
import * as productsService from "../services/products";
import type {
    Bundle,
    MealPack,
    ReadyEatItem,
    RestockItem,
    SnackItem,
} from "../types";

interface FetchOptions {
  background?: boolean;
  force?: boolean;
}

export function useProducts() {
  const [bundles, setBundles] = useState<Bundle[]>(
    () => productsService.getCachedBundles() ?? [],
  );
  const [mealPacks, setMealPacks] = useState<MealPack[]>(
    () => productsService.getCachedMealPacks() ?? [],
  );
  const [readyEat, setReadyEat] = useState<ReadyEatItem[]>(
    () => productsService.getCachedReadyEat() ?? [],
  );
  const [snacks, setSnacks] = useState<SnackItem[]>(
    () => productsService.getCachedSnacks() ?? [],
  );
  const [restockItems, setRestockItems] = useState<RestockItem[]>(
    () => productsService.getCachedRestock()?.items ?? [],
  );
  const [restockCategories, setRestockCategories] = useState<string[]>(
    () => productsService.getCachedRestock()?.categories ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = useCallback(async (options?: FetchOptions) => {
    if (!options?.background) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await productsService.getBundles({ force: options?.force });
      setBundles(data);
    } catch (err: any) {
      if (!options?.background) {
        setError(err.response?.data?.error ?? "Failed to load bundles");
      }
    } finally {
      if (!options?.background) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchMealPacks = useCallback(async (options?: FetchOptions) => {
    if (!options?.background) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await productsService.getMealPacks({
        force: options?.force,
      });
      setMealPacks(data);
    } catch (err: any) {
      if (!options?.background) {
        setError(err.response?.data?.error ?? "Failed to load meal packs");
      }
    } finally {
      if (!options?.background) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchReadyEat = useCallback(async (options?: FetchOptions) => {
    if (!options?.background) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await productsService.getReadyEat({ force: options?.force });
      setReadyEat(data);
    } catch (err: any) {
      if (!options?.background) {
        setError(
          err.response?.data?.error ?? "Failed to load ready-to-eat items",
        );
      }
    } finally {
      if (!options?.background) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchSnacks = useCallback(
    async (category?: string, options?: FetchOptions) => {
      if (!options?.background) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const data = await productsService.getSnacks(category, {
          force: options?.force,
        });
        setSnacks(data);
      } catch (err: any) {
        if (!options?.background) {
          setError(err.response?.data?.error ?? "Failed to load snacks");
        }
      } finally {
        if (!options?.background) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const fetchRestock = useCallback(
    async (category?: string, q?: string, options?: FetchOptions) => {
      if (!options?.background) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const data = await productsService.getRestock(category, q, {
          force: options?.force,
        });
        setRestockItems(data.items);
        setRestockCategories(data.categories);
      } catch (err: any) {
        if (!options?.background) {
          setError(err.response?.data?.error ?? "Failed to load products");
        }
      } finally {
        if (!options?.background) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const prefetchAll = useCallback(async () => {
    await Promise.allSettled([
      fetchBundles({ background: true }),
      fetchMealPacks({ background: true }),
      fetchReadyEat({ background: true }),
      fetchSnacks(undefined, { background: true }),
      fetchRestock(undefined, undefined, { background: true }),
    ]);
  }, [fetchBundles, fetchMealPacks, fetchReadyEat, fetchSnacks, fetchRestock]);

  return {
    bundles,
    mealPacks,
    readyEat,
    snacks,
    restockItems,
    restockCategories,
    isLoading,
    error,
    fetchBundles,
    fetchMealPacks,
    fetchReadyEat,
    fetchSnacks,
    fetchRestock,
    prefetchAll,
    clearError: () => setError(null),
  };
}
