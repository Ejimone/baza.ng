import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import { addMoreSheet as s } from "../../styles";
import type { RestockItem } from "../../types";
import ProductCard from "../cards/ProductCard";
import BottomSheet from "./BottomSheet";
import SearchBar from "./SearchBar";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.75;

interface AddMoreItemsSheetProps {
  visible: boolean;
  onClose: () => void;
  /** When provided, items are passed to this callback instead of being added to cart */
  onItemSelected?: (item: RestockItem) => void;
}

export default function AddMoreItemsSheet({
  visible,
  onClose,
  onItemSelected,
}: AddMoreItemsSheetProps) {
  const { restockItems, restockCategories, isLoading, error, fetchRestock } =
    useProducts();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      fetchRestock();
      setQuery("");
      setActiveCat("All");
      setAddedIds(new Set());
    }
  }, [visible]);

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

  const handleAppendItem = useCallback(
    (item: RestockItem) => {
      if (!onItemSelected) return;
      onItemSelected(item);
      setAddedIds((prev) => new Set(prev).add(item.id));
    },
    [onItemSelected],
  );

  const categories = restockCategories.length > 0 ? restockCategories : ["All"];

  return (
    <BottomSheet visible={visible} onClose={onClose} heroColor="#070a12">
      <View style={{ height: SHEET_HEIGHT }}>
        {/* Handle */}
        <View className={s.handle} />

        {/* Title */}
        <Text className={s.title}>Add More Items</Text>

        {/* Search */}
        <View className={s.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search all products..."
            autoFocus={false}
          />
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          style={{ flexGrow: 0, flexShrink: 0 }}
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
                    color: activeCat === cat ? "#6ec6ff" : "#5a7aaa",
                    fontSize: 11,
                    letterSpacing: 1.2,
                    fontFamily: "NotoSerif_400Regular",
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Product list — flex: 1 so it fills remaining space without overlaying filters */}
        <View style={{ flex: 1, minHeight: 0 }}>
          {isLoading && restockItems.length === 0 ? (
            <View
              style={{
                height: 200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={colors.accent.blue} size="small" />
            </View>
          ) : error && restockItems.length === 0 ? (
            <View
              style={{
                height: 200,
                alignItems: "center",
                justifyContent: "center",
              }}
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
              style={{
                height: 200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className={s.emptyText}>NO PRODUCTS FOUND.</Text>
            </View>
          ) : (
            <ScrollView
              className={s.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              nestedScrollEnabled
            >
              {restockItems.map((item) => {
                if (onItemSelected) {
                  // Append-to-list mode: simple ADD / ✓ ADDED button
                  const wasAdded = addedIds.has(item.id);
                  return (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: "#0d1220",
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: "#0d1220",
                          borderWidth: 1,
                          borderColor: wasAdded ? "#4caf7d33" : "#1a2540",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {item.emoji}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: wasAdded ? "#f0f8f0" : "#c8d8f0",
                            fontSize: 14,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: "#2a4060",
                            fontSize: 9,
                            letterSpacing: 1,
                            marginTop: 3,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {item.brand}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => !wasAdded && handleAppendItem(item)}
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 18,
                          borderWidth: 1,
                          borderColor: wasAdded ? "#4caf7d55" : "#6ec6ff55",
                          backgroundColor: wasAdded
                            ? "#4caf7d12"
                            : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: wasAdded ? "#4caf7d" : "#6ec6ff",
                            fontSize: 8,
                            letterSpacing: 1,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {wasAdded ? "✓ ADDED" : "ADD"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                }

                // Default cart mode
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
        </View>
      </View>
    </BottomSheet>
  );
}
