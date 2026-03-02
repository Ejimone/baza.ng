import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import { useThemeStore } from "../../stores/themeStore";
import { addMoreSheet as s } from "../../styles";
import type { RestockItem } from "../../types";
import ProductCard from "../cards/ProductCard";
import BottomSheet from "./BottomSheet";
import ProductImage from "./ProductImage";
import SearchBar from "./SearchBar";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.75;

interface AddMoreItemsSheetProps {
  visible: boolean;
  onClose: () => void;
  /** When provided, items are passed to this callback instead of being added to cart */
  onItemSelected?: (item: RestockItem) => void;
  /** Called when an item is decremented/removed in append-to-list mode */
  onItemRemoved?: (item: RestockItem) => void;
}

export default function AddMoreItemsSheet({
  visible,
  onClose,
  onItemSelected,
  onItemRemoved,
}: AddMoreItemsSheetProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const { restockItems, restockCategories, isLoading, error, fetchRestock } =
    useProducts();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [addedQtys, setAddedQtys] = useState<Map<string, number>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      fetchRestock();
      setQuery("");
      setActiveCat("All");
      setAddedQtys(new Map());
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
      setAddedQtys((prev) => {
        const next = new Map(prev);
        next.set(item.id, (prev.get(item.id) ?? 0) + 1);
        return next;
      });
    },
    [onItemSelected],
  );

  const handleDecrementItem = useCallback(
    (item: RestockItem) => {
      setAddedQtys((prev) => {
        const currentQty = prev.get(item.id) ?? 0;
        const next = new Map(prev);
        if (currentQty <= 1) {
          next.delete(item.id);
        } else {
          next.set(item.id, currentQty - 1);
        }
        return next;
      });
      onItemRemoved?.(item);
    },
    [onItemRemoved],
  );

  const categories = restockCategories.length > 0 ? restockCategories : ["All"];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heroColor={palette.background}
    >
      <View style={{ height: SHEET_HEIGHT }}>
        {/* Handle */}
        <View className={s.handle} />

        {/* Title */}
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Add More Items
        </Text>

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
                    color:
                      activeCat === cat
                        ? colors.accent.blue
                        : palette.textSecondary,
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
                  color: palette.textSecondary,
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
                  // Append-to-list mode: ADD / qty stepper
                  const itemQty = addedQtys.get(item.id) ?? 0;
                  const wasAdded = itemQty > 0;
                  return (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: palette.border,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderWidth: 1,
                          borderColor: wasAdded ? "#4caf7d33" : palette.border,
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <ProductImage
                          imageUrl={item.imageUrl}
                          emoji={item.emoji}
                          size={44}
                          borderRadius={4}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: palette.textPrimary,
                            fontSize: 14,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: palette.textSecondary,
                            fontSize: 9,
                            letterSpacing: 1,
                            marginTop: 3,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {item.brand}
                        </Text>
                      </View>
                      {!wasAdded ? (
                        <Pressable
                          onPress={() => handleAppendItem(item)}
                          style={{
                            paddingVertical: 7,
                            paddingHorizontal: 18,
                            borderWidth: 1,
                            borderColor: "#6ec6ff55",
                            backgroundColor: "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color: "#6ec6ff",
                              fontSize: 8,
                              letterSpacing: 1,
                              fontFamily: "NotoSerif_400Regular",
                            }}
                          >
                            ADD
                          </Text>
                        </Pressable>
                      ) : (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Pressable
                            onPress={() => handleDecrementItem(item)}
                            style={{
                              width: 32,
                              height: 32,
                              borderWidth: 1,
                              borderColor: "#4caf7d55",
                              backgroundColor: "#4caf7d12",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#4caf7d",
                                fontSize: 16,
                                fontFamily: "NotoSerif_400Regular",
                              }}
                            >
                              −
                            </Text>
                          </Pressable>
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              alignItems: "center",
                              justifyContent: "center",
                              borderTopWidth: 1,
                              borderBottomWidth: 1,
                              borderColor: "#4caf7d33",
                            }}
                          >
                            <Text
                              style={{
                                color: palette.textPrimary,
                                fontSize: 11,
                                fontFamily: "NotoSerif_400Regular",
                              }}
                            >
                              {itemQty}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => handleAppendItem(item)}
                            style={{
                              width: 32,
                              height: 32,
                              borderWidth: 1,
                              borderColor: "#4caf7d55",
                              backgroundColor: "#4caf7d12",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#4caf7d",
                                fontSize: 16,
                                fontFamily: "NotoSerif_400Regular",
                              }}
                            >
                              +
                            </Text>
                          </Pressable>
                        </View>
                      )}
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
