import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { intentGateBalance as s } from "../../styles";
import { useWallet } from "../../hooks/useWallet";
import { useAuthStore } from "../../stores/authStore";

interface HeaderProps {
  onTopUpPress?: () => void;
}

export default function Header({ onTopUpPress }: HeaderProps) {
  const router = useRouter();
  const { formattedBalance } = useWallet();
  const userName = useAuthStore((state) => state.user?.name ?? "");

  const initial = userName.charAt(0).toUpperCase() || "?";

  return (
    <View className={s.topBar}>
      <View>
        <Text className={s.walletLabel}>WALLET BALANCE</Text>
        <View className={s.balanceRow}>
          <Text className={s.balanceAmount}>{formattedBalance}</Text>
          <Pressable className={s.topUpButton} onPress={onTopUpPress}>
            <Text className={s.topUpText}>TOP UP</Text>
          </Pressable>
        </View>
        <Text className={s.availableLabel}>available</Text>
      </View>

      <Pressable
        className={s.avatarButton}
        onPress={() => router.push("/(app)/profile")}
      >
        <Text style={{ fontSize: 18 }}>{initial}</Text>
      </Pressable>
    </View>
  );
}
