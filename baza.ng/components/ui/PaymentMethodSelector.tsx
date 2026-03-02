import { CreditCard, Wallet } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { paymentSelector as s } from "../../styles";
import type { PaymentMethod } from "../../types";
import { formatPrice } from "../../utils/format";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  walletBalance: number;
  total: number;
}

export default function PaymentMethodSelector({
  selected,
  onSelect,
  walletBalance,
  total,
}: PaymentMethodSelectorProps) {
  const insufficientWallet = walletBalance < total;
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <View className={s.container}>
      <Text className={s.label} style={{ color: palette.textSecondary }}>
        PAYMENT METHOD
      </Text>
      <View className={s.row}>
        {/* Wallet option */}
        <Pressable
          className={`${s.option} ${selected === "wallet" ? s.optionActive : s.optionInactive}`}
          style={{
            backgroundColor: selected === "wallet" ? "#4caf7d0e" : palette.card,
            borderColor: selected === "wallet" ? "#4caf7d55" : palette.border,
          }}
          onPress={() => onSelect("wallet")}
        >
          <Wallet
            size={18}
            color={selected === "wallet" ? "#4caf7d" : palette.textSecondary}
            weight={selected === "wallet" ? "fill" : "regular"}
          />
          <Text
            className={s.optionLabel}
            style={{ color: palette.textPrimary }}
          >
            WALLET
          </Text>
          <Text
            className={insufficientWallet ? s.optionDetailRed : s.optionDetail}
            style={{
              color: insufficientWallet ? "#e85c3a" : palette.textSecondary,
            }}
          >
            {formatPrice(walletBalance)}
            {insufficientWallet ? " · LOW" : ""}
          </Text>
        </Pressable>

        {/* Card option */}
        <Pressable
          className={`${s.option} ${selected === "paystack" ? s.optionActive : s.optionInactive}`}
          style={{
            backgroundColor:
              selected === "paystack" ? "#4caf7d0e" : palette.card,
            borderColor: selected === "paystack" ? "#4caf7d55" : palette.border,
          }}
          onPress={() => onSelect("paystack")}
        >
          <CreditCard
            size={18}
            color={selected === "paystack" ? "#4caf7d" : palette.textSecondary}
            weight={selected === "paystack" ? "fill" : "regular"}
          />
          <Text
            className={s.optionLabel}
            style={{ color: palette.textPrimary }}
          >
            PAY WITH CARD
          </Text>
          <Text
            className={s.optionDetail}
            style={{ color: palette.textSecondary }}
          >
            PAYSTACK · CARD
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
