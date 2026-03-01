import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import { getThemePalette } from "../../../constants/appTheme";
import * as userService from "../../../services/user";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import { notificationsScreen as s } from "../../../styles/index";
import type { NotificationPreferences } from "../../../types";

const NOTIF_ROWS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  desc: string;
}> = [
  {
    key: "orders",
    label: "Order updates",
    desc: "Confirmation, dispatch, delivery",
  },
  {
    key: "delivery",
    label: "Rider on the way",
    desc: "Real-time delivery tracking alerts",
  },
  {
    key: "deals",
    label: "Member deals",
    desc: "Flash sales and exclusive drops",
  },
  {
    key: "reminders",
    label: "Restock reminders",
    desc: "When your usual items run low",
  },
  {
    key: "newsletter",
    label: "Weekly digest",
    desc: "New products and meal ideas",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const user = useAuthStore((st) => st.user);
  const updateUser = useAuthStore((st) => st.updateUser);
  const mode = useThemeStore((st) => st.mode);
  const palette = getThemePalette(mode);

  const [prefs, setPrefs] = useState<NotificationPreferences>(
    user?.notifications ?? {
      orders: true,
      delivery: true,
      deals: true,
      reminders: false,
      newsletter: false,
    },
  );

  const toggle = async (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      const result = await userService.updateNotifications(next);
      updateUser({ notifications: result.notifications });
    } catch {
      setPrefs(prefs);
    }
  };

  return (
    <ScreenWrapper className="bg-[#070c08]">
      <View className={s.header} style={{ borderBottomColor: palette.border }}>
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← PROFILE"}
          </Text>
        </Pressable>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Notifications
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          CHOOSE WHAT YOU HEAR ABOUT
        </Text>
      </View>

      <ScrollView className={s.list} showsVerticalScrollIndicator={false}>
        {NOTIF_ROWS.map((row) => {
          const isOn = prefs[row.key];
          return (
            <View
              key={row.key}
              className={s.row}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <View className="flex-1 mr-4">
                <Text
                  className={s.rowLabel}
                  style={{ color: palette.textPrimary }}
                >
                  {row.label}
                </Text>
                <Text
                  className={s.rowDesc}
                  style={{ color: palette.textSecondary }}
                >
                  {row.desc}
                </Text>
              </View>
              <Pressable
                onPress={() => toggle(row.key)}
                className={`${s.togglePill} ${isOn ? s.togglePillOn : s.togglePillOff}`}
                style={
                  !isOn
                    ? {
                        borderColor: palette.border,
                        backgroundColor: palette.card,
                      }
                    : undefined
                }
              >
                <View
                  className={`${s.toggleDot} ${isOn ? s.toggleDotOn : s.toggleDotOff}`}
                />
              </Pressable>
            </View>
          );
        })}

        <View className={s.pushNotice}>
          <Text
            className={s.pushLabel}
            style={{ color: palette.textSecondary }}
          >
            PUSH NOTIFICATIONS
          </Text>
          <Text className={s.pushText} style={{ color: palette.textSecondary }}>
            Enabled via your phone settings.{"\n"}
            <Text className={s.pushHint} style={{ color: palette.textPrimary }}>
              Baza will never spam you.
            </Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
