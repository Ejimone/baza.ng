import api from "./api";
import type {
  AppNotification,
  DeviceTokenResponse,
  NotificationsListResponse,
} from "../types";

export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsListResponse> {
  const { data } = await api.get("/notifications", { params });
  return data;
}

export async function markAsRead(
  notificationId: string,
): Promise<{ notification: AppNotification }> {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllAsRead(): Promise<{ status: string }> {
  const { data } = await api.patch("/notifications/read-all");
  return data;
}

export async function deleteNotification(
  notificationId: string,
): Promise<{ status: string }> {
  const { data } = await api.delete(`/notifications/${notificationId}`);
  return data;
}

export async function registerDeviceToken(
  token: string,
  platform: "ios" | "android" | "web" | "unknown" = "unknown",
): Promise<DeviceTokenResponse> {
  const { data } = await api.post("/notifications/device-tokens", {
    token,
    platform,
  });
  return data;
}

export async function removeDeviceToken(
  token: string,
): Promise<{ status: string }> {
  const { data } = await api.delete("/notifications/device-tokens/remove", {
    data: { token },
  });
  return data;
}
