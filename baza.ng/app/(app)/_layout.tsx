import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import BottomNav from "../../components/layout/BottomNav";
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
  const pathname = usePathname();

  const normalizedPath = pathname.replace("/(app)", "");
  const isOrderDetail =
    normalizedPath.startsWith("/orders/") && normalizedPath !== "/orders";
  const isStockupDetail = normalizedPath.startsWith("/modes/stockup/");
  const isCookmealDetail = normalizedPath.startsWith("/modes/cookmeal/");
  const isPopupHeavyRoute =
    normalizedPath === "/modes/readyeat" || normalizedPath === "/modes/chat";
  const showBottomNav = !(
    isOrderDetail ||
    isStockupDetail ||
    isCookmealDetail ||
    isPopupHeavyRoute
  );

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
          contentStyle: { backgroundColor: palette.background },
        }}
      />
      {showBottomNav ? <BottomNav /> : null}
    </View>
  );
}
