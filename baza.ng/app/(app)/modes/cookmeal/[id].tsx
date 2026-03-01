import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import AddMoreItemsSheet from "../../../../components/ui/AddMoreItemsSheet";
import ProductImage from "../../../../components/ui/ProductImage";
import QtyControl from "../../../../components/ui/QtyControl";
import { getThemePalette } from "../../../../constants/appTheme";
import { useCart } from "../../../../hooks/useCart";
import { useProducts } from "../../../../hooks/useProducts";
import { useThemeStore } from "../../../../stores/themeStore";
import { addMoreButton, mealPackDetail as s } from "../../../../styles";
import type { RestockItem } from "../../../../types";
import { formatPrice } from "../../../../utils/format";

export default function MealPackDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mealPacks, fetchMealPacks } = useProducts();
  const { addItem } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const pack = mealPacks.find((p) => p.id === id);

  useEffect(() => {
    if (!pack && mealPacks.length === 0) {
      fetchMealPacks();
    }
  }, [pack, mealPacks.length]);

  const [plates, setPlates] = useState(4);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [showAddMore, setShowAddMore] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    imageUrl?: string;
    emoji: string;
  } | null>(null);
  const [extraItems, setExtraItems] = useState<
    Array<{
      id: string;
      name: string;
      emoji: string;
      imageUrl?: string;
      qty: number;
      unitPrice: number;
    }>
  >([]);

  useEffect(() => {
    if (pack) {
      setPlates(pack.basePlates);
    }
  }, [pack]);

  const ratio = pack ? plates / pack.basePlates : 1;
  const basePrice = pack ? Math.round(pack.basePrice * ratio) : 0;
  const extrasTotal = extraItems.reduce(
    (sum, i) => sum + i.unitPrice * i.qty,
    0,
  );
  const price = basePrice + extrasTotal;

  const activeIngredients = useMemo(
    () =>
      (pack?.ingredients ?? []).filter((i) => !removedItems.includes(i.name)),
    [pack, removedItems],
  );

  const toggleIngredient = (name: string) => {
    setRemovedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const formatQty = (val: number): string => {
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(1);
  };

  const handleItemSelected = (restockItem: RestockItem) => {
    setExtraItems((prev) => {
      const existing = prev.find((i) => i.id === restockItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === restockItem.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: restockItem.id,
          name: restockItem.name,
          emoji: restockItem.emoji,
          imageUrl: restockItem.imageUrl,
          qty: 1,
          unitPrice: restockItem.price,
        },
      ];
    });
  };

  const setExtraQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setExtraItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setExtraItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, qty } : i)),
      );
    }
  };

  const handleAddToCart = () => {
    if (!pack) return;

    addItem({
      id: pack.id,
      itemType: "mealpack",
      name: pack.name,
      emoji: pack.emoji,
      imageUrl: pack.imageUrl,
      qty: 1,
      unitPrice: price,
      totalPrice: price,
      meta: {
        plates,
        removedItems,
        extraItems: extraItems.length > 0 ? extraItems : undefined,
      },
    });

    router.back();
  };

  if (!pack) {
    return (
      <View
        className={s.container}
        style={{ backgroundColor: palette.background }}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#e85c3a" size="small" />
        </View>
      </View>
    );
  }

  return (
    <View
      className={s.container}
      style={{ backgroundColor: pack.color + "06" }}
    >
      <StatusBar
        backgroundColor={mode === "light" ? "#ffffff" : "#050505"}
        barStyle={mode === "light" ? "dark-content" : "light-content"}
      />

      <Modal
        visible={Boolean(previewTarget)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewTarget(null)}
      >
        <View style={previewStyles.backdrop}>
          <Pressable
            style={previewStyles.closeBtn}
            onPress={() => setPreviewTarget(null)}
          >
            <Text style={previewStyles.closeText}>×</Text>
          </Pressable>
          {previewTarget?.imageUrl ? (
            <Image
              source={{ uri: previewTarget.imageUrl }}
              style={previewStyles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 120 }}>
              {previewTarget?.emoji ?? pack.emoji}
            </Text>
          )}
        </View>
      </Modal>

      <Pressable
        className={s.hero}
        style={{ backgroundColor: pack.color + "12" }}
        onPress={() =>
          setPreviewTarget({ imageUrl: pack.imageUrl, emoji: pack.emoji })
        }
      >
        <ProductImage
          imageUrl={pack.imageUrl}
          emoji={pack.emoji}
          size={120}
          borderRadius={0}
        />
        {pack.imageUrl ? (
          <View style={previewStyles.tapHint}>
            <Text style={previewStyles.tapHintText}>TAP TO PREVIEW</Text>
          </View>
        ) : null}
        <Pressable className={s.heroBackBtn} onPress={() => router.back()}>
          <Text
            style={{
              color: palette.textSecondary,
              fontSize: 10,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            ← BACK
          </Text>
        </Pressable>
      </Pressable>

      <View className={s.infoSection}>
        <Text className={s.cookTime} style={{ color: pack.color }}>
          🕐 {pack.baseTime} MIN COOK TIME
        </Text>
        <Text className={s.packTitle}>{pack.name}</Text>
        <Text className={s.packDesc}>{pack.description}</Text>

        <View
          className={s.platesBox}
          style={{
            backgroundColor: pack.color + "0a",
            borderWidth: 1,
            borderColor: pack.color + "22",
          }}
        >
          <View>
            <Text className={s.platesLabel} style={{ color: pack.color }}>
              PLATES / SERVINGS
            </Text>
            <Text className={s.platesHint}>
              All ingredients scale automatically
            </Text>
          </View>
          <QtyControl
            value={plates}
            onIncrement={() => setPlates((p) => Math.min(p + 1, 12))}
            onDecrement={() => setPlates((p) => Math.max(p - 1, 1))}
            min={1}
            max={12}
            accentColor={pack.color}
            small
          />
        </View>

        {removedItems.length > 0 && (
          <View
            className={s.removedBanner}
            style={{
              backgroundColor: "#e85c3a08",
              borderWidth: 1,
              borderColor: "#e85c3a22",
            }}
          >
            <Text
              style={{
                color: "#e85c3a",
                fontSize: 9,
                letterSpacing: 1,
                fontFamily: "NotoSerif_400Regular",
              }}
            >
              {removedItems.length} ITEM{removedItems.length > 1 ? "S" : ""}{" "}
              REMOVED
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className={s.ingredientList}
        showsVerticalScrollIndicator={false}
      >
        <Text className={s.ingredientHint}>
          WHAT’S INSIDE FOR {plates} PLATE{plates > 1 ? "S" : ""}
        </Text>

        {(pack.ingredients ?? []).map((item) => {
          const isRemoved = removedItems.includes(item.name);
          const scaledQty = item.perPlate * plates;

          return (
            <View
              key={item.name}
              className={s.ingredientRow}
              style={{
                opacity: isRemoved ? 0.3 : 1,
                borderBottomWidth: 1,
                borderBottomColor: pack.color + "0a",
              }}
            >
              <Pressable
                style={previewStyles.listThumb}
                onPress={() =>
                  setPreviewTarget({
                    imageUrl: item.imageUrl,
                    emoji: item.emoji,
                  })
                }
              >
                <ProductImage
                  imageUrl={item.imageUrl}
                  emoji={item.emoji}
                  size={30}
                  borderRadius={4}
                />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text
                  className={s.ingredientName}
                  style={{
                    color: isRemoved
                      ? palette.textSecondary
                      : palette.textPrimary,
                    textDecorationLine: isRemoved ? "line-through" : "none",
                  }}
                >
                  {item.name}
                </Text>
                <Text className={s.ingredientQty}>
                  <Text style={{ color: pack.color }}>
                    {formatQty(scaledQty)} {item.unit}
                  </Text>
                  <Text className={s.ingredientQtyPrice}>
                    {" "}
                    · {formatPrice(item.pricePerPlate * plates)}
                  </Text>
                </Text>
              </View>

              <Pressable
                className={s.toggleBtn}
                style={{
                  borderColor: isRemoved ? "#e85c3a44" : pack.color + "44",
                  backgroundColor: isRemoved ? "#e85c3a0a" : "transparent",
                }}
                onPress={() => toggleIngredient(item.name)}
              >
                <Text
                  style={{
                    color: isRemoved ? "#e85c3a" : pack.color,
                    fontSize: 12,
                    fontFamily: "NotoSerif_400Regular",
                  }}
                >
                  {isRemoved ? "+" : "×"}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Extra items added via search */}
        {extraItems.length > 0 && (
          <>
            <Text className={s.ingredientHint} style={{ marginTop: 16 }}>
              EXTRA ITEMS ADDED
            </Text>
            {extraItems.map((item) => (
              <View
                key={item.id}
                className={s.ingredientRow}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: pack.color + "0a",
                }}
              >
                <Pressable
                  style={previewStyles.listThumb}
                  onPress={() =>
                    setPreviewTarget({
                      imageUrl: item.imageUrl,
                      emoji: item.emoji,
                    })
                  }
                >
                  <ProductImage
                    imageUrl={item.imageUrl}
                    emoji={item.emoji}
                    size={30}
                    borderRadius={4}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text
                    className={s.ingredientName}
                    style={{ color: palette.textPrimary }}
                  >
                    {item.name}
                  </Text>
                  <Text className={s.ingredientQty}>
                    <Text style={{ color: pack.color }}>
                      {item.qty} × {formatPrice(item.unitPrice)}
                    </Text>
                    <Text className={s.ingredientQtyPrice}>
                      {" "}
                      · {formatPrice(item.unitPrice * item.qty)}
                    </Text>
                  </Text>
                </View>
                <QtyControl
                  value={item.qty}
                  onIncrement={() => setExtraQty(item.id, item.qty + 1)}
                  onDecrement={() => setExtraQty(item.id, item.qty - 1)}
                  min={0}
                  max={20}
                  accentColor={pack.color}
                  small
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View className={s.footer}>
        <View className={s.footerRow}>
          <View>
            <Text className={s.footerLabel}>
              TOTAL FOR {plates} PLATE{plates > 1 ? "S" : ""}
            </Text>
            <Text className={s.footerFree}>FREE DELIVERY · MEMBERS</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text className={s.footerPrice}>{formatPrice(price)}</Text>
          </View>
        </View>

        <Pressable
          className={addMoreButton.wrapper}
          style={{ borderColor: pack.color + "44" }}
          onPress={() => setShowAddMore(true)}
        >
          <Text className={addMoreButton.text} style={{ color: pack.color }}>
            + ADD MORE ITEMS
          </Text>
        </Pressable>

        <Pressable
          className={s.addBtn}
          style={{ backgroundColor: pack.color }}
          onPress={handleAddToCart}
        >
          <Text
            style={{
              color: "#000",
              textAlign: "center",
              fontFamily: "NotoSerif_400Regular",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            ADD TO CART · {plates} PLATE{plates > 1 ? "S" : ""}
          </Text>
        </Pressable>
      </View>

      <AddMoreItemsSheet
        visible={showAddMore}
        onClose={() => setShowAddMore(false)}
        onItemSelected={handleItemSelected}
        onItemRemoved={(item) => {
          setExtraItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (!existing) return prev;
            if (existing.qty <= 1) {
              return prev.filter((i) => i.id !== item.id);
            }
            return prev.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty - 1 } : i,
            );
          });
        }}
      />
    </View>
  );
}

const previewStyles = StyleSheet.create({
  listThumb: {
    width: 30,
    height: 30,
    borderRadius: 4,
    overflow: "hidden",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "80%",
  },
  closeBtn: {
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
  closeText: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 26,
  },
  tapHint: {
    position: "absolute",
    bottom: 8,
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
});
