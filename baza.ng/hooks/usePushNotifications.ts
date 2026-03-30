import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as notificationService from "../services/notification";
import { useNotificationStore } from "../stores/notificationStore";

let storedDeviceToken: string | null = null;

export function getStoredDeviceToken() {
  return storedDeviceToken;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldPlayBannerSound: true,
    shouldShowList: true,
  }),
});

async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("baza-notifications", {
    name: "Baza Notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4caf7d",
    sound: "notification.wav",
    enableLights: true,
    enableVibrate: true,
  });
}

async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const tokenData = await Notifications.getDevicePushTokenAsync();
  return tokenData.data as string;
}

function handleNotificationTap(
  response: Notifications.NotificationResponse,
) {
  const data = response.notification.request.content.data as
    | Record<string, unknown>
    | undefined;
  if (!data) return;

  const orderId = data.orderId as string | undefined;
  if (orderId) {
    router.push(`/(app)/orders/${orderId}` as any);
    return;
  }

  const eventType = data.eventType as string | undefined;
  if (
    eventType === "cart_item_added" ||
    eventType === "cart_item_updated" ||
    eventType === "cart_item_removed"
  ) {
    router.push("/(app)/cart" as any);
  }
}

export function usePushNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      await setupAndroidChannel();
      const token = await registerForPushNotifications();
      if (!token) return;

      storedDeviceToken = token;
      const platform =
        Platform.OS === "ios"
          ? ("ios" as const)
          : Platform.OS === "android"
            ? ("android" as const)
            : ("unknown" as const);

      try {
        await notificationService.registerDeviceToken(token, platform);
      } catch {
        // Non-critical -- push will still work if token was previously registered
      }
    })();

    const tapSubscription =
      Notifications.addNotificationResponseReceivedListener(handleNotificationTap);

    const receiveSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (data?.id) {
          useNotificationStore.getState().addRealtimeNotification(data as any);
        }
      });

    return () => {
      tapSubscription.remove();
      receiveSubscription.remove();
    };
  }, []);
}
