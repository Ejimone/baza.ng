import { useState, useCallback } from "react";
import * as productsService from "../services/products";
import type {
  Bundle,
  MealPack,
  ReadyEatItem,
  SnackItem,
  RestockItem,
} from "../types";

export function useProducts() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [mealPacks, setMealPacks] = useState<MealPack[]>([]);
  const [readyEat, setReadyEat] = useState<ReadyEatItem[]>([]);
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [restockCategories, setRestockCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getBundles();
      setBundles(data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load bundles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMealPacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getMealPacks();
      setMealPacks(data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load meal packs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReadyEat = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getReadyEat();
      setReadyEat(data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load ready-to-eat items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSnacks = useCallback(async (category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getSnacks(category);
      setSnacks(data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load snacks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRestock = useCallback(async (category?: string, q?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getRestock(category, q);
      setRestockItems(data.items);
      setRestockCategories(data.categories);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    clearError: () => setError(null),
  };
}
