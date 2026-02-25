import "../global.css";
import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import { useAuthStore } from "../stores/authStore";
import * as authService from "../services/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    SpaceMono_400Regular,
  });

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
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    return (
      <View className="flex-1 bg-[#060d07] items-center justify-center">
        <ActivityIndicator size="large" color="#4caf7d" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </View>
  );
}
