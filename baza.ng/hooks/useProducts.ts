import { useCallback, useState } from "react";
import { InteractionManager } from "react-native";
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

type ProductsState = {
  bundles: Bundle[];
  mealPacks: MealPack[];
  readyEat: ReadyEatItem[];
  snacks: SnackItem[];
  restockItems: RestockItem[];
  restockCategories: string[];
  snackCategories: string[];
};

export function useProducts() {
  const [productsState, setProductsState] = useState<ProductsState>(() => {
    const cachedRestock = productsService.getCachedRestock();
    return {
      bundles: productsService.getCachedBundles() ?? [],
      mealPacks: productsService.getCachedMealPacks() ?? [],
      readyEat: productsService.getCachedReadyEat() ?? [],
      snacks: productsService.getCachedSnacks() ?? [],
      restockItems: cachedRestock?.items ?? [],
      restockCategories: cachedRestock?.categories ?? [],
      snackCategories: productsService.getCachedSnackCategories() ?? [],
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    bundles,
    mealPacks,
    readyEat,
    snacks,
    restockItems,
    restockCategories,
    snackCategories,
  } = productsState;

  const commitProductsState = useCallback(
    (
      updater: (prev: ProductsState) => ProductsState,
      options?: FetchOptions,
    ) => {
      if (options?.background) {
        InteractionManager.runAfterInteractions(() => {
          setProductsState(updater);
        });
        return;
      }
      setProductsState(updater);
    },
    [],
  );

  const fetchBundles = useCallback(async (options?: FetchOptions) => {
    if (!options?.background) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await productsService.getBundles(undefined, {
        force: options?.force,
      });
      commitProductsState((prev) => ({ ...prev, bundles: data }), options);
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
      const data = await productsService.getMealPacks(undefined, {
        force: options?.force,
      });
      commitProductsState((prev) => ({ ...prev, mealPacks: data }), options);
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
      const data = await productsService.getReadyEat(undefined, {
        force: options?.force,
      });
      commitProductsState((prev) => ({ ...prev, readyEat: data }), options);
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
        const cats = productsService.getCachedSnackCategories();
        commitProductsState(
          (prev) => ({
            ...prev,
            snacks: data,
            snackCategories:
              cats && cats.length > 0 ? cats : prev.snackCategories,
          }),
          options,
        );
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
    [commitProductsState],
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
        commitProductsState(
          (prev) => ({
            ...prev,
            restockItems: data.items,
            restockCategories:
              data.categories && data.categories.length > 0
                ? data.categories
                : prev.restockCategories,
          }),
          options,
        );
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
    [commitProductsState],
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
    snackCategories,
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
