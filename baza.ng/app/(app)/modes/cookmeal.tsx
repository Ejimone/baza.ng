import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import MealPackCard from "../../../components/cards/MealPackCard";
import AddMoreItemsSheet from "../../../components/ui/AddMoreItemsSheet";
import FloatingCart from "../../../components/ui/FloatingCart";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { addMoreButton, tonightMode as s } from "../../../styles";

export default function CookMealScreen() {
  const router = useRouter();
  const { mealPacks, isLoading, error, fetchMealPacks } = useProducts();
  const { isInCart } = useCart();
  const [showAddMore, setShowAddMore] = useState(false);

  useEffect(() => {
    fetchMealPacks();
  }, []);

  return (
    <View className={s.container}>
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Cook a Meal</Text>
        <Text className={s.subtitle}>CHOOSE A MEAL PACK · SET YOUR PLATES</Text>
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
              color: "#4a6a2a",
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {error}
          </Text>
          <Pressable onPress={fetchMealPacks} style={{ marginTop: 16 }}>
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
              color: "#4a6a2a",
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
          {mealPacks.map((pack) => (
            <MealPackCard
              key={pack.id}
              pack={pack}
              onPress={() =>
                router.push(`/(app)/modes/cookmeal/${pack.id}` as any)
              }
              isInCart={isInCart(pack.id)}
            />
          ))}

          <Pressable
            className={addMoreButton.wrapper}
            style={{ borderColor: "#7a8a4a55" }}
            onPress={() => setShowAddMore(true)}
          >
            <Text className={addMoreButton.text} style={{ color: "#7a8a4a" }}>
              + ADD MORE ITEMS
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <FloatingCart />

      <AddMoreItemsSheet
        visible={showAddMore}
        onClose={() => setShowAddMore(false)}
      />
    </View>
  );
}
