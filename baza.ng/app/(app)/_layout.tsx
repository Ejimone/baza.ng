import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { getThemePalette } from "../../constants/appTheme";
import * as ordersService from "../../services/orders";
import * as productsService from "../../services/products";
import * as walletService from "../../services/wallet";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  useEffect(() => {
    if (!isAuthenticated) return;

    void Promise.allSettled([
      productsService.prefetchAllCatalog(),
      ordersService.prefetchOrdersWarmup(),
      walletService.prefetchWalletWarmup(),
    ]);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
