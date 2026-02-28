import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import SnackCard from "../../../components/cards/SnackCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { snacksDrinksMode as s } from "../../../styles";
import type { SnackItem } from "../../../types";
import { SNACK_CATEGORIES } from "../../../utils/constants";

export default function SnacksScreen() {
  const router = useRouter();
  const { snacks, isLoading, error, fetchSnacks } = useProducts();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    fetchSnacks();
  }, []);

  const filtered =
    activeCat === "All"
      ? snacks
      : snacks.filter((q) => q.category === activeCat);

  const handleSetQty = useCallback(
    (item: SnackItem, newQty: number) => {
      const clamped = Math.max(0, Math.min(20, newQty));
      const currentQty = getItemQty(item.id);

      if (clamped === 0) {
        removeItem(item.id);
      } else if (currentQty === 0) {
        addItem({
          id: item.id,
          itemType: "snack",
          name: item.name,
          emoji: item.emoji,
          imageUrl: item.imageUrl,
          qty: clamped,
          unitPrice: item.price,
          totalPrice: item.price * clamped,
        });
      } else {
        updateQty(item.id, clamped);
      }
    },
    [addItem, updateQty, removeItem, getItemQty],
  );

  return (
    <View className={s.container}>
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Quickies</Text>
        <Text className={s.subtitle}>IMPULSE BUYS · GRAB & GO</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0 }}
      >
        <View className={s.catFilter}>
          {SNACK_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              className={`${s.catButton} ${activeCat === cat ? s.catButtonActive : s.catButtonInactive}`}
              onPress={() => setActiveCat(cat)}
            >
              <Text
                style={{
                  color: activeCat === cat ? "#c77dff" : "#4a2a6a",
                  fontSize: 9,
                  letterSpacing: 1,
                  fontFamily: "NotoSerif_400Regular",
                }}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {isLoading && snacks.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.purple} size="small" />
        </View>
      ) : error && snacks.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: "#3a1a5a",
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {error}
          </Text>
          <Pressable onPress={() => fetchSnacks()} style={{ marginTop: 16 }}>
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
      ) : filtered.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: "#3a1a5a",
              fontSize: 11,
              letterSpacing: 1,
              textAlign: "center",
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {snacks.length === 0
              ? "NO SNACKS AVAILABLE YET.\nCHECK BACK SOON."
              : "NOTHING IN THIS CATEGORY."}
          </Text>
        </View>
      ) : (
        <ScrollView
          className={s.grid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className={s.gridInner}>
            {filtered.map((item) => {
              const qty = getItemQty(item.id);
              return (
                <SnackCard
                  key={item.id}
                  item={item}
                  qty={qty}
                  onAdd={() => handleSetQty(item, 1)}
                  onIncrement={() => handleSetQty(item, qty + 1)}
                  onDecrement={() => handleSetQty(item, qty - 1)}
                />
              );
            })}
          </View>
        </ScrollView>
      )}

      <FloatingCart />
    </View>
  );
}
