import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    InteractionManager,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import { getThemePalette } from "../../constants/appTheme";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import { useNotificationStore } from "../../stores/notificationStore";
import { useThemeStore } from "../../stores/themeStore";
import { profileScreen as s } from "../../styles/index";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { orders, fetchOrders } = useOrders();
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const palette = getThemePalette(mode);
  const isLight = mode === "light";

  const [ordersHydrating, setOrdersHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      void fetchOrders(1, 20).finally(() => {
        if (!cancelled) {
          setOrdersHydrating(false);
        }
      });
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [fetchOrders]);

  const memberYear = user?.memberSince
    ? new Date(user.memberSince).getFullYear()
    : new Date().getFullYear();

  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const navRows = [
    {
      icon: "📦",
      label: "My Orders",
      sub: ordersHydrating
        ? "LOADING ORDERS..."
        : orders.length === 0
          ? "NO ORDERS YET"
          : `${orders.length} ORDER${orders.length !== 1 ? "S" : ""}`,
      route: "/(app)/orders",
    },
    {
      icon: "🔔",
      label: "Notifications",
      sub: unreadCount > 0 ? `${unreadCount} UNREAD` : "ALL CAUGHT UP",
      route: "/(app)/settings/notifications",
    },
    {
      icon: "🏠",
      label: "Delivery Address",
      sub: "MANAGE ADDRESSES",
      route: "/(app)/settings/address",
    },
    {
      icon: "👥",
      label: "Refer a Friend",
      sub: "EARN ₦2,000",
      route: "/(app)/settings/refer",
    },
    {
      icon: "💬",
      label: "Contact Support",
      sub: "AI · HUMAN BACKUP",
      route: "/(app)/settings/support",
    },
  ];

  return (
    <ScreenWrapper className="bg-[#060c07]">
      <View className={s.header} style={{ borderBottomColor: palette.border }}>
        <Pressable
          onPress={() => {
            if ((router as any).canGoBack?.()) {
              router.back();
            } else {
              router.replace("/" as any);
            }
          }}
        >
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← HOME"}
          </Text>
        </Pressable>
        <View className={s.avatarRow}>
          <View
            className={s.avatar}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
          >
            <Text
              className="text-[22px] font-serif"
              style={{ color: palette.textPrimary }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "🌿"}
            </Text>
          </View>
          <View>
            <Text className={s.userName} style={{ color: palette.textPrimary }}>
              {user?.name ?? "Member"}
            </Text>
            <Text
              className={s.memberSince}
              style={{ color: palette.textSecondary }}
            >
              MEMBER SINCE {memberYear}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className={s.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Navigation Rows */}
        {navRows.map((row) => (
          <Pressable
            key={row.label}
            className={s.navRow}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
            onPress={() => router.push(row.route as any)}
          >
            <View className="flex-row items-center gap-3.5">
              <Text className={s.navRowIcon}>{row.icon}</Text>
              <View>
                <Text
                  className={s.navRowLabel}
                  style={{ color: palette.textPrimary }}
                >
                  {row.label}
                </Text>
                <Text
                  className={s.navRowSub}
                  style={{ color: palette.textSecondary }}
                >
                  {row.sub}
                </Text>
              </View>
            </View>
            <Text
              className={s.navRowChevron}
              style={{ color: palette.textSecondary }}
            >
              {"›"}
            </Text>
          </Pressable>
        ))}

        <View
          className={s.navRow}
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
          }}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <Text className={s.navRowIcon}>{"🌓"}</Text>
            <View style={{ flex: 1 }}>
              <Text
                className={s.navRowLabel}
                style={{ color: palette.textPrimary }}
              >
                Theme Mode
              </Text>
              <Text
                className={s.navRowSub}
                style={{ color: palette.textSecondary }}
              >
                {isLight ? "LIGHT MODE" : "DARK MODE"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              void toggleMode();
            }}
            className="w-[52px] h-[30px] rounded-full px-1 justify-center"
            style={{ backgroundColor: isLight ? "#4caf7d" : palette.border }}
          >
            <View
              className="w-[22px] h-[22px] rounded-full"
              style={{
                alignSelf: isLight ? "flex-end" : "flex-start",
                backgroundColor: isLight ? "#f4fff7" : "#f5f5f0",
              }}
            />
          </Pressable>
        </View>

        {/* Settings divider */}
        <Text
          className={s.settingsLabel}
          style={{ color: palette.textSecondary }}
        >
          SETTINGS
        </Text>

        <Pressable
          className={s.settingsRow}
          style={{ backgroundColor: palette.card, borderColor: palette.border }}
          onPress={() => router.push("/(app)/settings/account" as any)}
        >
          <View className="flex-row items-center gap-3.5">
            <Text className={s.settingsIcon}>{"⚙️"}</Text>
            <View>
              <Text
                className={s.settingsRowLabel}
                style={{ color: palette.textPrimary }}
              >
                Account Settings
              </Text>
              <Text
                className={s.settingsRowSub}
                style={{ color: palette.textSecondary }}
              >
                NAME · EMAIL · PHONE
              </Text>
            </View>
          </View>
          <Text
            className={s.navRowChevron}
            style={{ color: palette.textSecondary }}
          >
            {"›"}
          </Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable onPress={logout}>
          <Text className={s.signOutBtn} style={{ textAlign: "center" }}>
            SIGN OUT
          </Text>
        </Pressable>

        {/* Spacer for scrollable height */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
