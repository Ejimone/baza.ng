import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { InteractionManager, View } from "react-native";
import BottomNav from "../../components/layout/BottomNav";
import NotificationPanel from "../../components/notifications/NotificationPanel";
import { getThemePalette } from "../../constants/appTheme";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import * as ordersService from "../../services/orders";
import * as productsService from "../../services/products";
import * as walletService from "../../services/wallet";
import { notificationWs } from "../../services/websocket";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { useThemeStore } from "../../stores/themeStore";
import { WALLET_FEATURES_ENABLED } from "../../utils/constants";
import { perfMeasure } from "../../utils/perfLogger";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const needsReferralOnboarding = useAuthStore(
    (s) => s.needsReferralOnboarding,
  );
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);
  const pathname = usePathname();
  const wsConnected = useRef(false);

  const closePanel = useNotificationStore((s) => s.closePanel);

  usePushNotifications();

  const showBottomNav = useMemo(() => {
    const normalizedPath = pathname.replace("/(app)", "");
    const isOrderDetail =
      normalizedPath.startsWith("/orders/") && normalizedPath !== "/orders";
    const isStockupDetail = normalizedPath.startsWith("/modes/stockup/");
    const isCookmealDetail = normalizedPath.startsWith("/modes/cookmeal/");
    const isReferralOnboarding = normalizedPath.startsWith("/onboarding/");
    const isPopupHeavyRoute =
      normalizedPath === "/modes/readyeat" || normalizedPath === "/modes/chat";

    return !(
      isOrderDetail ||
      isStockupDetail ||
      isCookmealDetail ||
      isReferralOnboarding ||
      isPopupHeavyRoute
    );
  }, [pathname]);

  useEffect(() => {
    perfMeasure("nav tap -> transition start", "nav:tap");
    closePanel();
  }, [pathname, closePanel]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const task = InteractionManager.runAfterInteractions(() => {
      const warmupTasks: Promise<unknown>[] = [
        productsService.prefetchAllCatalog(),
        ordersService.prefetchOrdersWarmup(),
        (async () => {
          const { useCartStore } = await import("../../stores/cartStore");
          return useCartStore.getState().fetchCart();
        })(),
        useNotificationStore.getState().fetchNotifications(),
      ];

      if (WALLET_FEATURES_ENABLED) {
        warmupTasks.push(walletService.prefetchWalletWarmup());
      }

      void Promise.allSettled(warmupTasks);

      if (!wsConnected.current) {
        notificationWs.connect(accessToken, (notification) => {
          useNotificationStore.getState().addRealtimeNotification(notification);
        });
        wsConnected.current = true;
      }
    });

    return () => {
      task.cancel();
    };
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    return () => {
      notificationWs.disconnect();
      wsConnected.current = false;
    };
  }, []);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  const normalizedPath = pathname.replace("/(app)", "");
  if (!WALLET_FEATURES_ENABLED && normalizedPath === "/wallet") {
    return <Redirect href="/(app)/profile" />;
  }

  if (needsReferralOnboarding && normalizedPath !== "/onboarding/referral") {
    return <Redirect href="/(app)/onboarding/referral" />;
  }

  if (!needsReferralOnboarding && normalizedPath === "/onboarding/referral") {
    return <Redirect href="/(app)" />;
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
      <NotificationPanel />
      {showBottomNav ? <BottomNav /> : null}
    </View>
  );
}
