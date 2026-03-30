import { router } from "expo-router";
import { useCallback } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import type { AppNotification } from "../types";

export function useNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const hasMore = useNotificationStore((s) => s.hasMore);
  const panelOpen = useNotificationStore((s) => s.panelOpen);

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const loadMore = useNotificationStore((s) => s.loadMore);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const togglePanel = useNotificationStore((s) => s.togglePanel);
  const closePanel = useNotificationStore((s) => s.closePanel);

  const navigateToNotification = useCallback(
    async (notification: AppNotification) => {
      if (!notification.isRead) {
        void markRead(notification.id);
      }
      closePanel();

      const { data, eventType } = notification;

      if (
        data?.orderId &&
        (eventType === "order_created" ||
          eventType === "order_status_changed" ||
          eventType === "payment_success")
      ) {
        router.push(`/(app)/orders/${data.orderId}` as any);
        return;
      }

      if (
        eventType === "cart_item_added" ||
        eventType === "cart_item_updated" ||
        eventType === "cart_item_removed"
      ) {
        router.push("/(app)/cart" as any);
        return;
      }
    },
    [markRead, closePanel],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    panelOpen,
    fetchNotifications,
    loadMore,
    markRead,
    markAllRead,
    removeNotification,
    togglePanel,
    closePanel,
    navigateToNotification,
  };
}
