import { Pressable, Text, View } from "react-native";
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
  if (!visible) return null;

  return (
    <View className={s.overlay}>
      <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      <View className={s.sheet}>
        <View className={s.handle} />

        <Text className={s.label}>INSUFFICIENT BALANCE</Text>
        <Text className={s.title}>Choose how to pay</Text>
        <Text className={s.desc}>
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
          <Text className="text-[#2a3a2a] text-xxs tracking-wide-lg font-mono text-center">
            CANCEL
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
