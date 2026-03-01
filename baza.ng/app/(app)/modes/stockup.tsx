import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import BundleCard from "../../../components/cards/BundleCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useThemeStore } from "../../../stores/themeStore";
import { stockUpMode as s } from "../../../styles";

export default function StockUpScreen() {
  const router = useRouter();
  const { bundles, isLoading, error, fetchBundles } = useProducts();
  const { isInCart } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  useEffect(() => {
    fetchBundles();
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
          Stock Up
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          TAP A BUNDLE TO CUSTOMISE IT
        </Text>
      </View>

      {isLoading && bundles.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.amber} size="small" />
        </View>
      ) : error && bundles.length === 0 ? (
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
          <Pressable onPress={fetchBundles} style={{ marginTop: 16 }}>
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
      ) : bundles.length === 0 ? (
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
            NO BUNDLES AVAILABLE YET.{"\n"}CHECK BACK SOON.
          </Text>
        </View>
      ) : (
        <ScrollView
          className={s.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {bundles.map((bundle, index) => (
            <View
              key={bundle.id}
              style={{ marginBottom: index === bundles.length - 1 ? 0 : 14 }}
            >
              <BundleCard
                bundle={bundle}
                onPress={() =>
                  router.push(`/(app)/modes/stockup/${bundle.id}` as any)
                }
                isInCart={isInCart(bundle.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <FloatingCart />
    </View>
  );
}
