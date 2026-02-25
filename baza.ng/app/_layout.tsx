import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../stores/authStore";
import { getRefreshToken } from "../utils/storage";
import * as authService from "../services/auth";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const { accessToken } = await authService.refreshToken();
          setAccessToken(accessToken);
          // Fetch user profile with the new token
          const { default: api } = await import("../services/api");
          const { data: user } = await api.get("/user/me");
          login(user, accessToken);
        }
      } catch {
        // Refresh failed or no token — user stays on auth screen
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 bg-[#060d07] items-center justify-center">
        <ActivityIndicator size="large" color="#4caf7d" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
