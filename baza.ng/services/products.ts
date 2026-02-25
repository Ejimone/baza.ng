import api from "./api";
import type {
  Bundle,
  MealPack,
  ReadyEatItem,
  SnackItem,
  RestockItem,
} from "../types";

export async function getBundles(): Promise<Bundle[]> {
  const { data } = await api.get("/products/bundles");
  return data.bundles;
}

export async function getMealPacks(): Promise<MealPack[]> {
  const { data } = await api.get("/products/mealpacks");
  return data.mealPacks;
}

export async function getReadyEat(): Promise<ReadyEatItem[]> {
  const { data } = await api.get("/products/readyeat");
  return data.items;
}

export async function getSnacks(category?: string): Promise<SnackItem[]> {
  const params = category && category !== "All" ? { category } : undefined;
  const { data } = await api.get("/products/snacks", { params });
  return data.items;
}

export async function getRestock(
  category?: string,
  q?: string,
): Promise<{ items: RestockItem[]; categories: string[] }> {
  const params: Record<string, string> = {};
  if (category && category !== "All") params.category = category;
  if (q) params.q = q;
  const { data } = await api.get("/products/restock", { params });
  return data;
}
