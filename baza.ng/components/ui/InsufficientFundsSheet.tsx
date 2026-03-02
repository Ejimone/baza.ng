import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { insufficientSheet as s } from "../../styles";
import { formatPrice } from "../../utils/format";

interface InsufficientFundsSheetProps {
  visible: boolean;
  shortfall: number;
  onPayWithCard: () => void;
  onFundWallet: () => void;
  onDismiss: () => void;
}

export default function InsufficientFundsSheet({
  visible,
  shortfall,
  onPayWithCard,
  onFundWallet,
  onDismiss,
}: InsufficientFundsSheetProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  if (!visible) return null;

  return (
    <View
      className={s.overlay}
      style={{
        backgroundColor:
          mode === "light" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.85)",
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      <View
        className={s.sheet}
        style={{
          backgroundColor: palette.background,
          borderColor: palette.border,
        }}
      >
        <View
          className={s.handle}
          style={{ backgroundColor: palette.border }}
        />

        <Text className={s.label}>INSUFFICIENT BALANCE</Text>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Choose how to pay
        </Text>
        <Text className={s.desc} style={{ color: palette.textSecondary }}>
          You need{" "}
          <Text className={s.shortfallAmount}>{formatPrice(shortfall)}</Text>{" "}
          more to pay from wallet. You can pay directly with card instead, or
          fund your wallet first.
        </Text>

        <Pressable className={s.payCardBtn} onPress={onPayWithCard}>
          <Text className={s.payCardBtnText}>PAY WITH CARD</Text>
        </Pressable>

        <Pressable className={s.fundWalletBtn} onPress={onFundWallet}>
          <Text className={s.fundWalletBtnText}>FUND WALLET INSTEAD</Text>
        </Pressable>

        <Pressable className={s.cancelBtn} onPress={onDismiss}>
          <Text
            className="text-xxs tracking-wide-lg font-mono text-center"
            style={{ color: palette.textSecondary }}
          >
            CANCEL
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
