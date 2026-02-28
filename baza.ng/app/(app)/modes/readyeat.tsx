import { useRouter } from "expo-router";
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
import { colors } from "../../../constants/theme";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import {
  addMoreButton,
  readyEatMode,
  readyEatMode as s,
} from "../../../styles";
import type { ReadyEatItem } from "../../../types";
import { formatPrice } from "../../../utils/format";

export default function ReadyEatScreen() {
  const router = useRouter();
  const { readyEat, isLoading, error, fetchReadyEat } = useProducts();
  const { addItem, isInCart, getItemQty, updateQty, removeItem } = useCart();
  const [selected, setSelected] = useState<ReadyEatItem | null>(null);
  const [showAddMore, setShowAddMore] = useState(false);

  useEffect(() => {
    fetchReadyEat();
  }, []);

  const handleAdd = (item: ReadyEatItem) => {
    addItem({
      id: item.id,
      itemType: "readyeat",
      name: item.name,
      emoji: item.emoji,
      imageUrl: item.imageUrl,
      qty: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    });
  };

  return (
    <View className={s.container}>
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Ready to Eat</Text>
        <Text className={s.subtitle}>
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
              color: "#4a2a1a",
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            {error}
          </Text>
          <Pressable onPress={fetchReadyEat} style={{ marginTop: 16 }}>
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
              color: "#4a2a1a",
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
          {readyEat.map((item) => {
            const qty = getItemQty(item.id);
            const inCart = qty > 0;

            return (
              <Pressable
                key={item.id}
                className={s.itemRow}
                style={{
                  backgroundColor: item.color + "08",
                  borderWidth: 1,
                  borderColor: inCart ? item.color + "44" : item.color + "15",
                }}
                onPress={() => setSelected(item)}
              >
                <View
                  className={s.itemEmoji}
                  style={{ backgroundColor: item.color + "12" }}
                >
                  <ProductImage
                    imageUrl={item.imageUrl}
                    emoji={item.emoji}
                    size={48}
                    borderRadius={6}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    className={s.itemKitchen}
                    style={{ color: item.color + "99" }}
                  >
                    {item.kitchen.toUpperCase()}
                  </Text>
                  <Text className={s.itemName}>{item.name}</Text>
                  <View className={s.itemMeta}>
                    <Text className={s.itemTime}>{item.deliveryTime}</Text>
                    {item.oldPrice && (
                      <Text className={s.itemOldPrice}>
                        {formatPrice(item.oldPrice)}
                      </Text>
                    )}
                    <Text className={s.itemPrice}>
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
                  <View className={s.stepperCol}>
                    <View
                      className={s.stepperRow}
                      style={{ borderWidth: 1, borderColor: item.color + "44" }}
                    >
                      <Pressable
                        className={s.stepperBtn}
                        style={{
                          backgroundColor:
                            qty === 1 ? "#2a0a0a" : item.color + "12",
                        }}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          if (qty === 1) removeItem(item.id);
                          else updateQty(item.id, qty - 1);
                        }}
                      >
                        <Text
                          style={{
                            color: qty === 1 ? "#e85c3a" : item.color,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {qty === 1 ? "×" : "−"}
                        </Text>
                      </Pressable>
                      <Text className={s.stepperValue}>{qty}</Text>
                      <Pressable
                        className={s.stepperBtn}
                        style={{ backgroundColor: item.color + "12" }}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          updateQty(item.id, qty + 1);
                        }}
                      >
                        <Text
                          style={{
                            color: item.color,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>
                    <Text
                      className={s.stepperLabel}
                      style={{ color: item.color + "88" }}
                    >
                      {formatPrice(item.price * qty)}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          <Pressable
            className={addMoreButton.wrapper}
            style={{ borderColor: "#7a3a1a55" }}
            onPress={() => setShowAddMore(true)}
          >
            <Text className={addMoreButton.text} style={{ color: "#7a3a1a" }}>
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
          isAdded={isInCart(selected.id)}
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
}: {
  item: ReadyEatItem;
  onClose: () => void;
  onAdd: (item: ReadyEatItem) => void;
  isAdded: boolean;
}) {
  const [imagePreview, setImagePreview] = useState(false);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />

      {/* Full-screen image preview */}
      <Modal
        visible={imagePreview}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagePreview(false)}
      >
        <View style={previewStyles.backdrop}>
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

      <View style={previewStyles.overlay}>
        {/* Tap outside to dismiss */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

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
                onClose();
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
            <Text className={readyEatMode.popupName}>{item.name}</Text>
            <Text className={readyEatMode.popupDesc}>{item.description}</Text>

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
                {formatPrice(item.price)}
              </Text>
            </View>

            <Pressable
              className={readyEatMode.popupAddBtn}
              style={{ backgroundColor: isAdded ? "#4caf7d" : item.color }}
              onPress={() => {
                if (!isAdded) onAdd(item);
                onClose();
              }}
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
                {isAdded ? "✓ ADDED TO CART" : "ADD 1 PLATE"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const previewStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "flex-end",
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
