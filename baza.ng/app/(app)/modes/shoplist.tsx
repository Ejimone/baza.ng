import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import ProductCard from "../../../components/cards/ProductCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import SearchBar from "../../../components/ui/SearchBar";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { restockMode as s } from "../../../styles";
import type { RestockItem } from "../../../types";

export default function ShopListScreen() {
  const router = useRouter();
  const { restockItems, restockCategories, isLoading, error, fetchRestock } =
    useProducts();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRestock();
  }, []);

  const doFetch = useCallback(
    (cat: string, q: string) => {
      fetchRestock(cat === "All" ? undefined : cat, q || undefined);
    },
    [fetchRestock],
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCat(cat);
    doFetch(cat, query);
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(activeCat, text);
    }, 400);
  };

  const handleSetQty = useCallback(
    (item: RestockItem, newQty: number) => {
      const clamped = Math.max(0, Math.min(20, newQty));
      const currentQty = getItemQty(item.id);

      if (clamped === 0) {
        removeItem(item.id);
      } else if (currentQty === 0) {
        addItem({
          id: item.id,
          itemType: "product",
          productId: item.id,
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

  const categories = restockCategories.length > 0 ? restockCategories : ["All"];

  return (
    <View className={s.container}>
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Quick Restock</Text>

        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          placeholder="What do you need?"
        />
        <Text className={s.searchHint}>SEARCH OR BROWSE BY CATEGORY</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0 }}
      >
        <View className={s.catFilter}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              className={`${s.catButton} ${activeCat === cat ? s.catButtonActive : s.catButtonInactive}`}
              onPress={() => handleCategoryChange(cat)}
            >
              <Text
                style={{
                  color: activeCat === cat ? "#6ec6ff" : "#3a5a8a",
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

      {isLoading && restockItems.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.blue} size="small" />
        </View>
      ) : error && restockItems.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: "#3a5a8a",
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => doFetch(activeCat, query)}
            style={{ marginTop: 16 }}
          >
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
      ) : restockItems.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text className={s.emptyText}>NOT IN STOCK YET.</Text>
        </View>
      ) : (
        <ScrollView
          className={s.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {restockItems.map((item) => {
            const qty = getItemQty(item.id);
            return (
              <ProductCard
                key={item.id}
                item={item}
                qty={qty}
                onAdd={() => handleSetQty(item, 1)}
                onIncrement={() => handleSetQty(item, qty + 1)}
                onDecrement={() => handleSetQty(item, qty - 1)}
              />
            );
          })}
        </ScrollView>
      )}

      <FloatingCart />
    </View>
  );
}
