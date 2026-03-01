import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "baza_refresh_token";
const THEME_MODE_KEY = "baza_theme_mode";

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch {
    // SecureStore unavailable (e.g. web) — silently fail
  }
}

export async function deleteRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // noop
  }
}

export async function getThemeMode(): Promise<"light" | "dark" | null> {
  try {
    const value = await SecureStore.getItemAsync(THEME_MODE_KEY);
    if (value === "light" || value === "dark") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setThemeMode(mode: "light" | "dark"): Promise<void> {
  try {
    await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
  } catch {
    // SecureStore unavailable (e.g. web) — silently fail
  }
}
