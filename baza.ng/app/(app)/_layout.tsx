import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useMemo } from "react";
import { InteractionManager, View } from "react-native";
import BottomNav from "../../components/layout/BottomNav";
import { getThemePalette } from "../../constants/appTheme";
import * as ordersService from "../../services/orders";
import * as productsService from "../../services/products";
import * as walletService from "../../services/wallet";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { WALLET_FEATURES_ENABLED } from "../../utils/constants";
import { perfMeasure } from "../../utils/perfLogger";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);
  const pathname = usePathname();

  const showBottomNav = useMemo(() => {
    const normalizedPath = pathname.replace("/(app)", "");
    const isOrderDetail =
      normalizedPath.startsWith("/orders/") && normalizedPath !== "/orders";
    const isStockupDetail = normalizedPath.startsWith("/modes/stockup/");
    const isCookmealDetail = normalizedPath.startsWith("/modes/cookmeal/");
    const isPopupHeavyRoute =
      normalizedPath === "/modes/readyeat" || normalizedPath === "/modes/chat";

    return !(
      isOrderDetail ||
      isStockupDetail ||
      isCookmealDetail ||
      isPopupHeavyRoute
    );
  }, [pathname]);

  useEffect(() => {
    perfMeasure("nav tap -> transition start", "nav:tap");
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const task = InteractionManager.runAfterInteractions(() => {
      const warmupTasks: Promise<unknown>[] = [
        productsService.prefetchAllCatalog(),
        ordersService.prefetchOrdersWarmup(),
        (async () => {
          const { useCartStore } = await import("../../stores/cartStore");
          return useCartStore.getState().fetchCart();
        })(),
      ];

      if (WALLET_FEATURES_ENABLED) {
        warmupTasks.push(walletService.prefetchWalletWarmup());
      }

      void Promise.allSettled(warmupTasks);
    });

    return () => {
      task.cancel();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  const normalizedPath = pathname.replace("/(app)", "");
  if (!WALLET_FEATURES_ENABLED && normalizedPath === "/wallet") {
    return <Redirect href="/(app)/profile" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.background,
        paddingBottom: showBottomNav ? 82 : 0,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          contentStyle: { backgroundColor: palette.background },
        }}
      />
      {showBottomNav ? <BottomNav /> : null}
    </View>
  );
}
