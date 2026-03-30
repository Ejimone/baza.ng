import { Bell } from "phosphor-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { useThemeStore } from "../../stores/themeStore";
import { intentGateBalance as s, notificationPanel as np } from "../../styles";

function Header() {
  const userName = useAuthStore((state) => state.user?.name ?? "");
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const panelOpen = useNotificationStore((state) => state.panelOpen);
  const togglePanel = useNotificationStore((state) => state.togglePanel);

  const shortName = userName.split(" ")[0]?.toUpperCase() || "MEMBER";

  return (
    <View className={s.topBar}>
      <View>
        <Text
          className={s.walletLabel}
          style={{ color: palette.textSecondary }}
        >
          BAZA
        </Text>
        <Text
          className={s.balanceAmount}
          style={{ color: palette.textPrimary }}
        >
          {`WELCOME ${shortName}`}
        </Text>
      </View>

      <Pressable
        className={s.avatarButton}
        style={{
          backgroundColor: palette.card,
          borderColor: palette.border,
        }}
        onPress={togglePanel}
      >
        <Bell
          size={20}
          color={palette.textPrimary}
          weight={panelOpen ? "fill" : "regular"}
        />
        {unreadCount > 0 && (
          <View
            className={np.bellBadge}
            style={{
              backgroundColor: "#4caf7d",
              borderColor: palette.background,
            }}
          >
            <Text className={np.bellBadgeText} style={{ color: "#000" }}>
              {unreadCount > 99 ? "99+" : String(unreadCount)}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default memo(Header);
