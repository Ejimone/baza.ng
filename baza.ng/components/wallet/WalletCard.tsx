import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { profileScreen as styles } from "../../styles/index";
import { formatPrice } from "../../utils/format";

interface WalletCardProps {
  balance: number;
  onTopUp: () => void;
}

export default function WalletCard({ balance, onTopUp }: WalletCardProps) {
  const router = useRouter();

  return (
    <Pressable
      className={styles.walletCard}
      onPress={() => router.push("/(app)/wallet" as any)}
    >
      <Text className={styles.walletLabel}>BAZA WALLET</Text>
      <Text className={styles.walletBalance}>{formatPrice(balance)}</Text>
      <Text className={styles.walletAvailable}>AVAILABLE BALANCE</Text>
      <Pressable onPress={onTopUp}>
        <Text className={styles.walletTopUpBtn}>+ TOP UP WALLET</Text>
      </Pressable>
    </Pressable>
  );
}
