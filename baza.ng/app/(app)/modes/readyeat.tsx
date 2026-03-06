import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import AddMoreItemsSheet from "../../../components/ui/AddMoreItemsSheet";
import FloatingCart from "../../../components/ui/FloatingCart";
import ProductImage from "../../../components/ui/ProductImage";
import QtyControl from "../../../components/ui/QtyControl";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useThemeStore } from "../../../stores/themeStore";
import {
  addMoreButton,
  readyEatMode,
  readyEatMode as s,
} from "../../../styles";
import type { ReadyEatItem } from "../../../types";
import { formatPrice } from "../../../utils/format";

export default function ReadyEatScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const { readyEat, isLoading, error, fetchReadyEat } = useProducts();
  const { addItem, isInCart, getItemQty, updateQty, removeItem } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const [selected, setSelected] = useState<ReadyEatItem | null>(null);
  const [showAddMore, setShowAddMore] = useState(false);
  const [hasHandledItemParam, setHasHandledItemParam] = useState(false);

  useEffect(() => {
    fetchReadyEat();
  }, []);

  useEffect(() => {
    if (!itemId || hasHandledItemParam || readyEat.length === 0) return;
    const matchedItem = readyEat.find((item) => item.id === itemId);
    if (matchedItem) {
      setSelected(matchedItem);
      setHasHandledItemParam(true);
    }
  }, [itemId, hasHandledItemParam, readyEat]);

  const handleAdd = async (item: ReadyEatItem) => {
    await addItem({
      productId: item.id,
      itemType: "readyeat",
      qty: 1,
    });
  };

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
          Ready to Eat
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          HOT FOOD · DELIVERED FAST · FROM LOCAL KITCHENS
        </Text>
      </View>

      {isLoading && readyEat.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.red} size="small" />
        </View>
      ) : error && readyEat.length === 0 ? (
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
          <Pressable onPress={() => fetchReadyEat()} style={{ marginTop: 16 }}>
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
      ) : readyEat.length === 0 ? (
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
            NO READY-TO-EAT ITEMS YET.{"\n"}CHECK BACK SOON.
          </Text>
        </View>
      ) : (
        <ScrollView
          className={s.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {readyEat.map((item, index) => {
            const qty = getItemQty(item.id, "readyeat");
            const inCart = qty > 0;

            return (
              <View
                key={item.id}
                style={{ marginBottom: index === readyEat.length - 1 ? 0 : 14 }}
              >
                <Pressable
                  className={s.itemRow}
                  style={{
                    backgroundColor: item.color + "08",
                    borderWidth: 1,
                    borderColor: inCart ? item.color + "44" : item.color + "15",
                    paddingLeft: 0,
                    paddingRight: 14,
                    paddingVertical: 0,
                    overflow: "hidden",
                  }}
                  onPress={() => setSelected(item)}
                >
                  <View
                    className={s.itemEmoji}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 0,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                      overflow: "hidden",
                      backgroundColor: item.color + "12",
                    }}
                  >
                    <ProductImage
                      imageUrl={item.imageUrl}
                      emoji={item.emoji}
                      size={84}
                      borderRadius={0}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      className={s.itemKitchen}
                      style={{ color: item.color + "99" }}
                    >
                      {item.kitchen.toUpperCase()}
                    </Text>
                    <Text
                      className={s.itemName}
                      style={{ color: palette.textPrimary }}
                    >
                      {item.name}
                    </Text>
                    <View className={s.itemMeta}>
                      <Text
                        className={s.itemTime}
                        style={{ color: palette.textSecondary }}
                      >
                        {item.deliveryTime}
                      </Text>
                      {item.oldPrice && (
                        <Text
                          className={s.itemOldPrice}
                          style={{ color: palette.textSecondary }}
                        >
                          {formatPrice(item.oldPrice)}
                        </Text>
                      )}
                      <Text
                        className={s.itemPrice}
                        style={{ color: palette.textPrimary }}
                      >
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                  </View>

                  {!inCart ? (
                    <Pressable
                      className={s.addBtn}
                      style={{
                        borderWidth: 1,
                        borderColor: item.color + "55",
                      }}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleAdd(item);
                      }}
                    >
                      <Text
                        style={{
                          color: item.color,
                          fontSize: 10,
                          letterSpacing: 1,
                          fontFamily: "NotoSerif_400Regular",
                        }}
                      >
                        ADD
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      className={s.stepperCol}
                      onStartShouldSetResponder={() => true}
                    >
                      <QtyControl
                        value={qty}
                        onIncrement={() =>
                          updateQty(item.id, qty + 1, "readyeat")
                        }
                        onDecrement={() => {
                          if (qty === 1) removeItem(item.id, "readyeat");
                          else updateQty(item.id, qty - 1, "readyeat");
                        }}
                        min={0}
                        max={99}
                        accentColor={item.color}
                      />
                      <Text
                        className={s.stepperLabel}
                        style={{ color: item.color + "88" }}
                      >
                        {formatPrice(item.price * qty)}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}

          <Pressable
            className={addMoreButton.wrapper}
            style={{
              borderColor: mode === "light" ? palette.border : "#7a3a1a55",
            }}
            onPress={() => setShowAddMore(true)}
          >
            <Text
              className={addMoreButton.text}
              style={{
                color: mode === "light" ? palette.textSecondary : "#7a3a1a",
              }}
            >
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

      {selected && (
        <ReadyEatPopup
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
          isAdded={isInCart(selected.id, "readyeat")}
          isLight={mode === "light"}
          palette={palette}
        />
      )}
    </View>
  );
}

function ReadyEatPopup({
  item,
  onClose,
  onAdd,
  isAdded,
  isLight,
  palette,
}: {
  item: ReadyEatItem;
  onClose: () => void;
  onAdd: (item: ReadyEatItem) => void;
  isAdded: boolean;
  isLight: boolean;
  palette: ReturnType<typeof getThemePalette>;
}) {
  const [imagePreview, setImagePreview] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { getItemQty, updateQty, removeItem } = useCart();
  const qty = getItemQty(item.id, "readyeat");
  const [pendingQty, setPendingQty] = useState(1);

  useEffect(() => {
    setPendingQty(qty > 0 ? qty : 1);
  }, [item.id, qty]);

  const selectedQty = qty > 0 ? qty : pendingQty;
  const selectedTotal = item.price * selectedQty;

  const handleDecrease = () => {
    if (qty > 0) {
      if (qty === 1) {
        removeItem(item.id, "readyeat");
      } else {
        updateQty(item.id, qty - 1, "readyeat");
      }
      return;
    }

    setPendingQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (qty > 0) {
      updateQty(item.id, qty + 1, "readyeat");
      return;
    }

    setPendingQty((prev) => prev + 1);
  };

  const handleAddFromPopup = async () => {
    if (qty === 0) {
      await onAdd(item);
      if (selectedQty > 1) {
        updateQty(item.id, selectedQty, "readyeat");
      }
      return;
    }

    updateQty(item.id, selectedQty, "readyeat");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <StatusBar
        backgroundColor={isLight ? "#ffffff" : palette.background}
        barStyle={isLight ? "dark-content" : "light-content"}
      />

      {/* Full-screen image preview */}
      <Modal
        visible={imagePreview}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagePreview(false)}
      >
        <View
          style={[
            previewStyles.backdrop,
            { backgroundColor: isLight ? "#ffffff" : "#000000" },
          ]}
        >
          <Pressable
            style={previewStyles.closeBtn}
            onPress={() => setImagePreview(false)}
          >
            <Text style={previewStyles.closeText}>×</Text>
          </Pressable>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={previewStyles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 120 }}>{item.emoji}</Text>
          )}
        </View>
      </Modal>

      <View
        style={[
          previewStyles.popupScreen,
          { backgroundColor: palette.background },
        ]}
      >
        <View
          style={[
            previewStyles.overlay,
            { backgroundColor: isLight ? "#ffffff" : palette.background },
          ]}
        >
          <Pressable
            style={[
              previewStyles.topMask,
              { backgroundColor: palette.background },
            ]}
            onPress={handleDismiss}
          />

          <View
            className={readyEatMode.popupSheet}
            style={{ backgroundColor: item.color + "0f" }}
          >
            {/* ── Hero (tap to preview image) ── */}
            <Pressable
              className={readyEatMode.popupHero}
              style={{ backgroundColor: item.color + "20" }}
              onPress={() => setImagePreview(true)}
            >
              <ProductImage
                imageUrl={item.imageUrl}
                emoji={item.emoji}
                size={140}
                borderRadius={0}
              />

              {item.imageUrl ? (
                <View style={previewStyles.tapHint}>
                  <Text style={previewStyles.tapHintText}>TAP TO PREVIEW</Text>
                </View>
              ) : null}

              {/* Close button lives inside hero so it's above the image */}
              <Pressable
                className={readyEatMode.popupCloseBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleDismiss();
                }}
              >
                <Text className={readyEatMode.popupCloseText}>×</Text>
              </Pressable>

              <View
                className={readyEatMode.popupTimeBadge}
                style={{
                  backgroundColor: item.color + "22",
                  borderWidth: 1,
                  borderColor: item.color + "44",
                }}
              >
                <Text
                  className={readyEatMode.popupTimeText}
                  style={{ color: item.color }}
                >
                  🕐 {item.deliveryTime}
                </Text>
              </View>
            </Pressable>

            {/* ── Content ── */}
            <View className={readyEatMode.popupContent}>
              <Text
                className={readyEatMode.popupKitchen}
                style={{ color: item.color }}
              >
                {item.kitchen.toUpperCase()}
              </Text>
              <Text
                className={readyEatMode.popupName}
                style={{ color: palette.textPrimary }}
              >
                {item.name}
              </Text>
              <Text
                className={readyEatMode.popupDesc}
                style={{ color: palette.textSecondary }}
              >
                {item.description}
              </Text>

              <View className={readyEatMode.popupTags}>
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: item.color + "12",
                      borderWidth: 1,
                      borderColor: item.color + "33",
                    }}
                  >
                    <Text
                      className={readyEatMode.popupTag}
                      style={{ color: item.color + "cc" }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                className={readyEatMode.popupPlatesBox}
                style={{ borderWidth: 1, borderColor: item.color + "33" }}
              >
                <View>
                  <Text className={readyEatMode.popupPlatesLabel}>PLATES</Text>
                  <Text
                    className={readyEatMode.popupPlatesEach}
                    style={{ color: palette.textSecondary }}
                  >
                    {formatPrice(item.price)} each
                  </Text>
                </View>

                <QtyControl
                  value={selectedQty}
                  onIncrement={handleIncrease}
                  onDecrement={handleDecrease}
                  min={qty > 0 ? 0 : 1}
                  max={20}
                  accentColor={item.color}
                />
              </View>

              <View className={readyEatMode.popupPriceRow}>
                <View>
                  {item.oldPrice && (
                    <Text className={readyEatMode.popupOldPrice}>
                      {formatPrice(item.oldPrice)}
                    </Text>
                  )}
                  <Text className={readyEatMode.popupFreeDelivery}>
                    FREE DELIVERY · MEMBERS
                  </Text>
                </View>
                <Text className={readyEatMode.popupPrice}>
                  {formatPrice(selectedTotal)}
                </Text>
              </View>

              <Pressable
                className={readyEatMode.popupAddBtn}
                style={{ backgroundColor: item.color }}
                onPress={handleAddFromPopup}
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
                  ADD {selectedQty} {selectedQty === 1 ? "PLATE" : "PLATES"} ·{" "}
                  {formatPrice(selectedTotal)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const previewStyles = StyleSheet.create({
  popupScreen: {
    flex: 1,
    backgroundColor: "#050505",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "flex-end",
  },
  topMask: {
    flex: 1,
    backgroundColor: "#050505",
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
