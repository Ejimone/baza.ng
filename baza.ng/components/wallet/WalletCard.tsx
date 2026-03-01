import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { profileScreen as styles } from "../../styles/index";
import { formatPrice } from "../../utils/format";

interface WalletCardProps {
  balance: number;
  onTopUp: () => void;
}

export default function WalletCard({ balance, onTopUp }: WalletCardProps) {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <Pressable
      className={styles.walletCard}
      style={{ backgroundColor: palette.card, borderColor: palette.border }}
      onPress={() => router.push("/(app)/wallet" as any)}
    >
      <Text
        className={styles.walletLabel}
        style={{ color: palette.textSecondary }}
      >
        BAZA WALLET
      </Text>
      <Text
        className={styles.walletBalance}
        style={{ color: palette.textPrimary }}
      >
        {formatPrice(balance)}
      </Text>
      <Text
        className={styles.walletAvailable}
        style={{ color: palette.textSecondary }}
      >
        AVAILABLE BALANCE
      </Text>
      <Pressable onPress={onTopUp}>
        <Text className={styles.walletTopUpBtn + " text-center"}>
          + TOP UP WALLET
        </Text>
      </Pressable>
    </Pressable>
  );
}
