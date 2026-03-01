import { NotoSerif_400Regular } from "@expo-google-fonts/noto-serif";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getThemePalette } from "../constants/appTheme";
import "../global.css";
import * as authService from "../services/auth";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in environments where native splash isn't registered.
});

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const mode = useThemeStore((s) => s.mode);
  const themeHydrated = useThemeStore((s) => s.hydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  const palette = getThemePalette(mode);

  const [fontsLoaded] = useFonts({
    NotoSerif_400Regular,
  });

  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await authService.refreshToken();
        setAccessToken(accessToken);
        const { default: api } = await import("../services/api");
        const { data: user } = await api.get("/user/me");
        login(user, accessToken);
      } catch {
        // Refresh failed or no valid session — user stays on auth screen
      } finally {
        setAuthReady(true);
      }
    })();
  }, [login, setAccessToken]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && authReady) {
      await SplashScreen.hideAsync().catch(() => {
        // Ignore when splash is already hidden or unavailable.
      });
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady || !themeHydrated) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: palette.background }}
      >
        <ActivityIndicator size="large" color="#4caf7d" />
        <StatusBar style={palette.statusBar} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style={palette.statusBar} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </View>
  );
}
