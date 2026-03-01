import { create } from "zustand";
import type { ThemeMode } from "../constants/appTheme";
import { getThemeMode, setThemeMode } from "../utils/storage";

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark",
  hydrated: false,

  hydrate: async () => {
    const savedMode = await getThemeMode();
    set({ mode: savedMode ?? "dark", hydrated: true });
  },

  setMode: async (mode) => {
    set({ mode });
    await setThemeMode(mode);
  },

  toggleMode: async () => {
    const nextMode: ThemeMode = get().mode === "dark" ? "light" : "dark";
    set({ mode: nextMode });
    await setThemeMode(nextMode);
  },
}));
