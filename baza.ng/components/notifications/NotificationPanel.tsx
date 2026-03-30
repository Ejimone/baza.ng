import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getThemePalette } from "../../constants/appTheme";
import { useNotifications } from "../../hooks/useNotifications";
import { useThemeStore } from "../../stores/themeStore";
import { notificationPanel as s } from "../../styles/index";
import type { AppNotification, NotificationEventType } from "../../types";
import { formatDate } from "../../utils/format";

const ANIM_IN = 320;
const ANIM_OUT = 220;
const PANEL_TOP = 110;

const EVENT_EMOJI: Record<string, string> = {
  order_created: "📦",
  order_status_changed: "🚚",
  payment_success: "✅",
  cart_item_added: "🛒",
  cart_item_updated: "🛒",
  cart_item_removed: "🗑️",
  admin_order_created: "📋",
  admin_order_status_changed: "📋",
  product_status_changed: "📦",
};

function getEventEmoji(eventType: NotificationEventType): string {
  return EVENT_EMOJI[eventType] ?? "🔔";
}

function NotificationItem({
  notification,
  palette,
  onPress,
  onDismiss,
  isLast,
}: {
  notification: AppNotification;
  palette: ReturnType<typeof getThemePalette>;
  onPress: () => void;
  onDismiss: () => void;
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 12,
        },
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        },
      ]}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          marginTop: 6,
          backgroundColor: notification.isRead ? "transparent" : "#4caf7d",
          flexShrink: 0,
        }}
      />
      <Text style={{ fontSize: 20, marginTop: -2 }}>
        {getEventEmoji(notification.eventType)}
      </Text>
      <View style={{ flex: 1 }}>
        <Text
          className={s.itemTitle}
          style={{ color: palette.textPrimary }}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          className={s.itemBody}
          style={{ color: palette.textSecondary }}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        <Text className={s.itemTime} style={{ color: palette.textSecondary }}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>
      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        style={{ padding: 4, flexShrink: 0, marginTop: 2 }}
      >
        <Text
          style={{
            fontSize: 13,
            color: palette.textSecondary,
            fontFamily: "NotoSerif_400Regular",
          }}
        >
          ✕
        </Text>
      </Pressable>
    </Pressable>
  );
}

function NotificationPanel() {
  const { height: screenHeight } = useWindowDimensions();
  const mode = useThemeStore((st) => st.mode);
  const palette = getThemePalette(mode);
  const isDark = mode === "dark";

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    panelOpen,
    markAllRead,
    removeNotification,
    loadMore,
    closePanel,
    navigateToNotification,
  } = useNotifications();

  const [mounted, setMounted] = useState(false);
  const wasOpen = useRef(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (panelOpen && !wasOpen.current) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: ANIM_IN,
        easing: Easing.out(Easing.cubic),
      });
    } else if (!panelOpen && wasOpen.current) {
      progress.value = withTiming(
        0,
        { duration: ANIM_OUT, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
    wasOpen.current = panelOpen;
  }, [panelOpen, progress]);

  const maxPanelHeight = screenHeight * 0.58;

  const panelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-20, 0]);
    return {
      opacity: progress.value,
      transform: [{ translateY }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.82]),
  }));

  const handleItemPress = useCallback(
    (notification: AppNotification) => {
      void navigateToNotification(notification);
    },
    [navigateToNotification],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      void removeNotification(id);
    },
    [removeNotification],
  );

  if (!mounted) return null;

  return (
    <>
      {/* Dark overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 90,
          },
          backdropStyle,
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={closePanel} />
      </Animated.View>

      {/* Dropdown panel */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 16,
            right: 16,
            top: PANEL_TOP,
            maxHeight: maxPanelHeight,
            zIndex: 100,
            backgroundColor: palette.card,
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 18,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.6 : 0.2,
            shadowRadius: 20,
            elevation: 20,
          },
          panelStyle,
        ]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 10,
          }}
        >
          <Text
            className={s.headerLabel}
            style={{ color: palette.textSecondary }}
          >
            NOTIFICATIONS
            {unreadCount > 0 ? ` · ${unreadCount} NEW` : ""}
          </Text>
          {notifications.length > 0 && (
            <Pressable
              style={{ paddingVertical: 2, paddingHorizontal: 8 }}
              onPress={() => void markAllRead()}
            >
              <Text className={s.clearAllText} style={{ color: "#4caf7d" }}>
                MARK ALL READ
              </Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 36 }}>
            <Text
              className={s.emptyText}
              style={{ color: palette.textSecondary }}
            >
              {isLoading ? "LOADING..." : "NO NOTIFICATIONS YET"}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: maxPanelHeight - 60 }}
          >
            {notifications.map((n, index) => (
              <NotificationItem
                key={n.id}
                notification={n}
                palette={palette}
                onPress={() => handleItemPress(n)}
                onDismiss={() => handleDismiss(n.id)}
                isLast={index === notifications.length - 1}
              />
            ))}
            {hasMore && (
              <Pressable
                style={{ paddingVertical: 14, alignItems: "center" }}
                onPress={() => void loadMore()}
              >
                <Text
                  className={s.loadMoreText}
                  style={{ color: "#4caf7d" }}
                >
                  {isLoading ? "LOADING..." : "LOAD MORE"}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}

export default memo(NotificationPanel);
