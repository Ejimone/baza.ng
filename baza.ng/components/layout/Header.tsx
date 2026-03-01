import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useWallet } from "../../hooks/useWallet";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { intentGateBalance as s } from "../../styles";

interface HeaderProps {
  onTopUpPress?: () => void;
}

export default function Header({ onTopUpPress }: HeaderProps) {
  const router = useRouter();
  const { formattedBalance } = useWallet();
  const userName = useAuthStore((state) => state.user?.name ?? "");
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const isLight = mode === "light";

  const initial = userName.charAt(0).toUpperCase() || "?";

  return (
    <View className={s.topBar}>
      <View>
        <Text
          className={s.walletLabel}
          style={{ color: palette.textSecondary }}
        >
          WALLET
        </Text>
        <View className={s.balanceRow}>
          <Text
            className={s.balanceAmount}
            style={{ color: palette.textPrimary }}
          >
            {formattedBalance}
          </Text>
          <Pressable
            className={s.topUpButton}
            onPress={onTopUpPress}
            style={{
              backgroundColor: isLight ? "#4caf7d20" : "#4caf7d18",
              borderColor: isLight ? "#4caf7d66" : "#4caf7d44",
            }}
          >
            <Text className={s.topUpText}>TOP UP</Text>
          </Pressable>
        </View>
        {/* <Text className={s.availableLabel}>AVAILABLE</Text> */}
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
