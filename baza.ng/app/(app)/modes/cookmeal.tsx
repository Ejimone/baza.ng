import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MealPackCard from "../../../components/cards/MealPackCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useThemeStore } from "../../../stores/themeStore";
import { tonightMode as s } from "../../../styles";

export default function CookMealScreen() {
  const router = useRouter();
  const { mealPacks, isLoading, error, fetchMealPacks } = useProducts();
  const { isInCart } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  useEffect(() => {
    fetchMealPacks();
  }, []);

  return (
    <View
      className={s.container}
      style={{ backgroundColor: palette.background }}
    >
      <View
        className={s.header}
        style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            ← BACK
          </Text>
        </Pressable>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Cook a Meal
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          CHOOSE A MEAL PACK · SET YOUR PLATES
        </Text>
      </View>

      {isLoading && mealPacks.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.red} size="small" />
        </View>
      ) : error && mealPacks.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: palette.textSecondary,
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {error}
          </Text>
          <Pressable onPress={() => fetchMealPacks()} style={{ marginTop: 16 }}>
            <Text
              style={{
                color: colors.accent.green,
                fontSize: 11,
                letterSpacing: 1,
                fontFamily: "NotoSerif_400Regular",
              }}
            >
              RETRY
            </Text>
          </Pressable>
        </View>
      ) : mealPacks.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: palette.textSecondary,
              fontSize: 11,
              letterSpacing: 1,
              textAlign: "center",
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            NO MEAL PACKS AVAILABLE YET.{"\n"}CHECK BACK SOON.
          </Text>
        </View>
      ) : (
        <ScrollView
          className={s.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {mealPacks.map((pack, index) => (
            <View
              key={pack.id}
              style={{ marginBottom: index === mealPacks.length - 1 ? 0 : 14 }}
            >
              <MealPackCard
                pack={pack}
                onPress={() =>
                  router.push(`/(app)/modes/cookmeal/${pack.id}` as any)
                }
                isInCart={isInCart(pack.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <FloatingCart />
    </View>
  );
}
