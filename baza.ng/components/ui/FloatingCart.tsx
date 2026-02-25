import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { intentGateBalance as s } from "../../styles";
import { useCart } from "../../hooks/useCart";

export default function FloatingCart() {
  const router = useRouter();
  const { count, formattedTotal, isEmpty } = useCart();

  if (isEmpty) return null;

  return (
    <Pressable
      className={s.stickyCart}
      onPress={() => router.push("/(app)/cart")}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text className={s.stickyCartIcon}>🛒</Text>
        <View>
          <Text className={s.stickyCartTitle}>
            {count} ITEM{count !== 1 ? "S" : ""}
          </Text>
          <Text className={s.stickyCartSub}>{formattedTotal}</Text>
        </View>
      </View>
      <Text className={s.stickyCartCheckout}>CHECKOUT →</Text>
    </Pressable>
  );
}
