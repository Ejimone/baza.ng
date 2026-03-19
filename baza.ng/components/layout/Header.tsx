import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { intentGateBalance as s } from "../../styles";

function Header() {
  const router = useRouter();
  const userName = useAuthStore((state) => state.user?.name ?? "");
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const initial = userName.charAt(0).toUpperCase() || "?";
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
          {/*           {`WELCOME ${shortName}`}
           */}
          {`WELCOME ${shortName}`}
        </Text>
      </View>

      <Pressable
        className={s.avatarButton}
        style={{
          backgroundColor: palette.card,
          borderColor: palette.border,
        }}
        onPress={() => router.push("/(app)/profile")}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "NotoSerif_400Regular",
            color: palette.textPrimary,
          }}
        >
          {initial}
        </Text>
      </Pressable>
    </View>
  );
}

export default memo(Header);
