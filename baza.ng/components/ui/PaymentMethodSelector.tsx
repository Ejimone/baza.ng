import { Pressable, Text, View } from "react-native";
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

  return (
    <View className={s.container}>
      <Text className={s.label}>PAYMENT METHOD</Text>
      <View className={s.row}>
        {/* Wallet option */}
        <Pressable
          className={`${s.option} ${selected === "wallet" ? s.optionActive : s.optionInactive}`}
          onPress={() => onSelect("wallet")}
        >
          <Text className={s.optionIcon}>👛</Text>
          <Text className={s.optionLabel}>WALLET</Text>
          <Text
            className={insufficientWallet ? s.optionDetailRed : s.optionDetail}
          >
            {formatPrice(walletBalance)}
            {insufficientWallet ? " · LOW" : ""}
          </Text>
        </Pressable>

        {/* Card option */}
        <Pressable
          className={`${s.option} ${selected === "paystack" ? s.optionActive : s.optionInactive}`}
          onPress={() => onSelect("paystack")}
        >
          <Text className={s.optionIcon}>💳</Text>
          <Text className={s.optionLabel}>PAY WITH CARD</Text>
          <Text className={s.optionDetail}>PAYSTACK · CARD</Text>
        </Pressable>
      </View>
    </View>
  );
}
