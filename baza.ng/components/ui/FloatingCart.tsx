import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useCart } from "../../hooks/useCart";
import { useThemeStore } from "../../stores/themeStore";
import { floatingCart as s } from "../../styles";

export default function FloatingCart() {
  const router = useRouter();
  const { count, formattedTotal, isEmpty } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  if (isEmpty) return null;

  return (
    <Pressable
      className={s.button}
      style={{
        backgroundColor: palette.card,
        borderColor: palette.border,
        borderWidth: 1,
      }}
      onPress={() => router.push("/(app)/cart")}
    >
      <View className={s.iconWrap}>
        <View className={s.cartIcon}>
          <Text style={{ fontSize: 27 }}>🛒</Text>
          <View className={s.badge} style={{ borderColor: palette.card }}>
            <Text className={s.badgeText}>{count}</Text>
          </View>
        </View>
        <View>
          <Text className={s.label} style={{ color: palette.textPrimary }}>
            CART
          </Text>
          <Text className={s.sub} style={{ color: palette.textSecondary }}>
            {count} item{count !== 1 ? "s" : ""} · {formattedTotal}
          </Text>
        </View>
      </View>
      <Text className={s.chevron} style={{ color: palette.textPrimary }}>
        ›
      </Text>
    </Pressable>
  );
}
