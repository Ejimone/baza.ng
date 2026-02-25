import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { floatingCart as s } from "../../styles";
import { useCart } from "../../hooks/useCart";

export default function FloatingCart() {
  const router = useRouter();
  const { count, formattedTotal, isEmpty } = useCart();

  if (isEmpty) return null;

  return (
    <Pressable
      className={s.button}
      onPress={() => router.push("/(app)/cart")}
    >
      <View className={s.iconWrap}>
        <View className={s.cartIcon}>
          <Text style={{ fontSize: 18 }}>🛒</Text>
          <View className={s.badge}>
            <Text className={s.badgeText}>{count}</Text>
          </View>
        </View>
        <View>
          <Text className={s.label}>CART</Text>
          <Text className={s.sub}>
            {count} item{count !== 1 ? "s" : ""} · {formattedTotal}
          </Text>
        </View>
      </View>
      <Text className={s.chevron}>›</Text>
    </Pressable>
  );
}
