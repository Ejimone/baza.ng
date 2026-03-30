import { create } from "zustand";
import type { AppNotification } from "../types";
import * as notificationService from "../services/notification";

const PAGE_SIZE = 20;

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  panelOpen: boolean;
  offset: number;

  fetchNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  addRealtimeNotification: (n: AppNotification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  togglePanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  panelOpen: false,
  offset: 0,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationService.getNotifications({
        limit: PAGE_SIZE,
        offset: 0,
      });
      set({
        notifications: res.notifications,
        unreadCount: res.unreadCount,
        hasMore: res.notifications.length < res.count,
        offset: res.notifications.length,
      });
    } catch {
      // Silently fail -- notifications are non-critical
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { hasMore, isLoading, offset } = get();
    if (!hasMore || isLoading) return;
    set({ isLoading: true });
    try {
      const res = await notificationService.getNotifications({
        limit: PAGE_SIZE,
        offset,
      });
      set((state) => ({
        notifications: [...state.notifications, ...res.notifications],
        hasMore: state.notifications.length + res.notifications.length < res.count,
        offset: state.offset + res.notifications.length,
      }));
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  addRealtimeNotification: (n) => {
    set((state) => {
      if (state.notifications.some((existing) => existing.id === n.id)) {
        return state;
      }
      return {
        notifications: [n, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        offset: state.offset + 1,
      };
    });
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(
        0,
        state.unreadCount -
          (state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0),
      ),
    }));
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Optimistic update stays -- not worth reverting for read status
    }
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Optimistic update stays
    }
  },

  removeNotification: async (id) => {
    const target = get().notifications.find((n) => n.id === id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: Math.max(
        0,
        state.unreadCount - (target && !target.isRead ? 1 : 0),
      ),
      offset: Math.max(0, state.offset - 1),
    }));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      // Optimistic removal stays
    }
  },

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  closePanel: () => set({ panelOpen: false }),

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      hasMore: false,
      panelOpen: false,
      offset: 0,
    }),
}));
