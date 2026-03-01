import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import ProductCard from "../../../components/cards/ProductCard";
import FloatingCart from "../../../components/ui/FloatingCart";
import ProductImage from "../../../components/ui/ProductImage";
import SearchBar from "../../../components/ui/SearchBar";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useThemeStore } from "../../../stores/themeStore";
import { restockMode as s } from "../../../styles";
import type { RestockItem } from "../../../types";
import { formatPrice } from "../../../utils/format";

export default function ShopListScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const { restockItems, restockCategories, isLoading, error, fetchRestock } =
    useProducts();
  const { addItem, getItemQty, updateQty, removeItem } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selectedItem, setSelectedItem] = useState<RestockItem | null>(null);
  const [hasHandledItemParam, setHasHandledItemParam] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRestock();
  }, []);

  useEffect(() => {
    if (!itemId || hasHandledItemParam || restockItems.length === 0) return;
    const matchedItem = restockItems.find((item) => item.id === itemId);
    if (matchedItem) {
      setSelectedItem(matchedItem);
      setActiveCat(matchedItem.category || "All");
      setHasHandledItemParam(true);
    }
  }, [itemId, hasHandledItemParam, restockItems]);

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
          Quick Restock
        </Text>

        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          placeholder="What do you need?"
        />
        <Text className={s.searchHint} style={{ color: palette.textSecondary }}>
          SEARCH OR BROWSE BY CATEGORY
        </Text>
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
                  color:
                    activeCat === cat
                      ? colors.accent.blue
                      : palette.textSecondary,
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
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            className={s.emptyText}
            style={{ color: palette.textSecondary }}
          >
            NOT IN STOCK YET.
          </Text>
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
                onPress={() => setSelectedItem(item)}
              />
            );
          })}
        </ScrollView>
      )}

      <FloatingCart />

      {selectedItem ? (
        <RestockItemPopup
          item={selectedItem}
          qty={getItemQty(selectedItem.id)}
          onClose={() => setSelectedItem(null)}
          onAdd={() => handleSetQty(selectedItem, 1)}
          onIncrement={() =>
            handleSetQty(selectedItem, getItemQty(selectedItem.id) + 1)
          }
          onDecrement={() =>
            handleSetQty(selectedItem, getItemQty(selectedItem.id) - 1)
          }
          palette={palette}
          isLight={mode === "light"}
        />
      ) : null}
    </View>
  );
}

function RestockItemPopup({
  item,
  qty,
  onClose,
  onAdd,
  onIncrement,
  onDecrement,
  palette,
  isLight,
}: {
  item: RestockItem;
  qty: number;
  onClose: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  palette: ReturnType<typeof getThemePalette>;
  isLight: boolean;
}) {
  const [imagePreview, setImagePreview] = useState(false);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar
        backgroundColor={
          isLight ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.92)"
        }
        barStyle={isLight ? "dark-content" : "light-content"}
      />

      <Modal
        visible={imagePreview}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagePreview(false)}
      >
        <View
          style={[
            popupStyles.previewBackdrop,
            { backgroundColor: isLight ? "#ffffff" : "#000000" },
          ]}
        >
          <Pressable
            style={popupStyles.previewCloseBtn}
            onPress={() => setImagePreview(false)}
          >
            <Text
              style={[
                popupStyles.previewCloseText,
                { color: palette.textPrimary },
              ]}
            >
              ×
            </Text>
          </Pressable>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={popupStyles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 120 }}>{item.emoji}</Text>
          )}
        </View>
      </Modal>

      <View
        style={[
          popupStyles.overlay,
          {
            backgroundColor: isLight
              ? "rgba(255,255,255,0.92)"
              : "rgba(0,0,0,0.92)",
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          style={[
            popupStyles.sheet,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <Pressable
            style={[
              popupStyles.closeBtn,
              {
                backgroundColor: isLight
                  ? "rgba(0,0,0,0.08)"
                  : "rgba(255,255,255,0.08)",
              },
            ]}
            onPress={onClose}
          >
            <Text
              style={[popupStyles.closeText, { color: palette.textSecondary }]}
            >
              ×
            </Text>
          </Pressable>

          <Pressable
            style={popupStyles.heroWrap}
            onPress={() => setImagePreview(true)}
          >
            <ProductImage
              imageUrl={item.imageUrl}
              emoji={item.emoji}
              size={110}
              borderRadius={8}
            />
            {item.imageUrl ? (
              <View style={popupStyles.tapHint}>
                <Text
                  style={[
                    popupStyles.tapHintText,
                    {
                      color: isLight
                        ? "rgba(0,0,0,0.6)"
                        : "rgba(255,255,255,0.6)",
                    },
                  ]}
                >
                  TAP TO PREVIEW
                </Text>
              </View>
            ) : null}
          </Pressable>

          <Text style={[popupStyles.name, { color: palette.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[popupStyles.brand, { color: palette.textSecondary }]}>
            {item.brand}
          </Text>

          <View style={popupStyles.priceRow}>
            <Text style={[popupStyles.price, { color: palette.textPrimary }]}>
              {formatPrice(item.price)}
            </Text>
            {qty > 0 ? (
              <Text style={[popupStyles.total, { color: colors.accent.blue }]}>
                {formatPrice(item.price * qty)} total
              </Text>
            ) : null}
          </View>

          {qty === 0 ? (
            <Pressable
              style={[
                popupStyles.addBtn,
                {
                  borderColor: `${colors.accent.blue}66`,
                  backgroundColor: isLight ? "#e8f4ff" : "#102034",
                },
              ]}
              onPress={onAdd}
            >
              <Text
                style={[popupStyles.addBtnText, { color: colors.accent.blue }]}
              >
                ADD TO CART
              </Text>
            </Pressable>
          ) : (
            <View style={popupStyles.stepperRow}>
              <Pressable
                style={[
                  popupStyles.stepperBtn,
                  qty === 1
                    ? popupStyles.stepperDanger
                    : popupStyles.stepperNormal,
                  {
                    backgroundColor:
                      qty === 1
                        ? isLight
                          ? "#ffeaea"
                          : "#1a0a0a"
                        : isLight
                          ? "#e8f4ff"
                          : "#0d1a2a",
                  },
                ]}
                onPress={onDecrement}
              >
                <Text
                  style={[
                    popupStyles.stepperText,
                    qty === 1
                      ? popupStyles.stepperDangerText
                      : popupStyles.stepperNormalText,
                  ]}
                >
                  {qty === 1 ? "×" : "−"}
                </Text>
              </Pressable>
              <Text
                style={[
                  popupStyles.stepperValue,
                  { color: palette.textPrimary },
                ]}
              >
                {qty}
              </Text>
              <Pressable
                style={[
                  popupStyles.stepperBtn,
                  popupStyles.stepperNormal,
                  { backgroundColor: isLight ? "#e8f4ff" : "#0d1a2a" },
                ]}
                onPress={onIncrement}
              >
                <Text
                  style={[
                    popupStyles.stepperText,
                    popupStyles.stepperNormalText,
                  ]}
                >
                  +
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "flex-end",
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
  previewCloseBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCloseText: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 26,
  },
  sheet: {
    backgroundColor: "#070a12",
    borderTopWidth: 1,
    borderColor: "#1a2540",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  closeText: {
    color: "#98b8d8",
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "NotoSerif_400Regular",
  },
  heroWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  tapHint: {
    position: "absolute",
    bottom: -2,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tapHintText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 8,
    letterSpacing: 1.5,
    fontFamily: "NotoSerif_400Regular",
  },
  name: {
    color: "#e6eef8",
    fontSize: 22,
    fontFamily: "NotoSerif_400Regular",
    textAlign: "center",
  },
  brand: {
    color: "#3a5a8a",
    fontSize: 11,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
    fontFamily: "NotoSerif_400Regular",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  price: {
    color: "#e6eef8",
    fontSize: 22,
    fontFamily: "NotoSerif_400Regular",
    fontWeight: "bold",
  },
  total: {
    color: "#6ec6ff",
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "NotoSerif_400Regular",
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "#6ec6ff66",
    backgroundColor: "#102034",
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: {
    color: "#6ec6ff",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "NotoSerif_400Regular",
    fontWeight: "bold",
  },
  stepperRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#6ec6ff44",
    alignItems: "center",
    overflow: "hidden",
  },
  stepperBtn: {
    width: 54,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperNormal: {
    backgroundColor: "#0d1a2a",
  },
  stepperDanger: {
    backgroundColor: "#1a0a0a",
  },
  stepperText: {
    fontSize: 22,
    fontFamily: "NotoSerif_400Regular",
  },
  stepperNormalText: {
    color: "#6ec6ff",
  },
  stepperDangerText: {
    color: "#e85c3a",
  },
  stepperValue: {
    flex: 1,
    textAlign: "center",
    color: "#e6eef8",
    fontSize: 18,
    fontFamily: "NotoSerif_400Regular",
    fontWeight: "bold",
  },
});
