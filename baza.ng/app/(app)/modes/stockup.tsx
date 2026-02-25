import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { stockUpMode as s } from "../../../styles";
import { useProducts } from "../../../hooks/useProducts";
import { useCart } from "../../../hooks/useCart";
import BundleCard from "../../../components/cards/BundleCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import { colors } from "../../../constants/theme";

export default function StockUpScreen() {
  const router = useRouter();
  const { bundles, isLoading, error, fetchBundles } = useProducts();
  const { isInCart } = useCart();

  useEffect(() => {
    fetchBundles();
  }, []);

  return (
    <View className={s.container}>
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Stock Up</Text>
        <Text className={s.subtitle}>TAP A BUNDLE TO CUSTOMISE IT</Text>
      </View>

      {isLoading && bundles.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent.amber} size="small" />
        </View>
      ) : error && bundles.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#2a4a2a", fontSize: 11, letterSpacing: 1 }}>
            {error}
          </Text>
          <Pressable onPress={fetchBundles} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent.green, fontSize: 11, letterSpacing: 1 }}>
              RETRY
            </Text>
          </Pressable>
        </View>
      ) : bundles.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#2a4a2a", fontSize: 11, letterSpacing: 1, textAlign: "center" }}>
            NO BUNDLES AVAILABLE YET.{"\n"}CHECK BACK SOON.
          </Text>
        </View>
      ) : (
        <ScrollView
          className={s.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onPress={() =>
                router.push(`/(app)/modes/stockup/${bundle.id}` as any)
              }
              isInCart={isInCart(bundle.id)}
            />
          ))}
        </ScrollView>
      )}

      <FloatingCart />
    </View>
  );
}
