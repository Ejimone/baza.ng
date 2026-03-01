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
import { colors } from "../../../../constants/theme";
import { useCart } from "../../../../hooks/useCart";
import { useProducts } from "../../../../hooks/useProducts";
import { useThemeStore } from "../../../../stores/themeStore";
import { addMoreButton, bundleDetail as s } from "../../../../styles";
import type { BundleItem, RestockItem } from "../../../../types";
import { formatPrice } from "../../../../utils/format";

interface EditableItem extends BundleItem {
  qty: number;
}

export default function BundleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundles, fetchBundles } = useProducts();
  const { addItem } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const bundle = bundles.find((b) => b.id === id);

  useEffect(() => {
    if (!bundle && bundles.length === 0) {
      fetchBundles();
    }
  }, [bundle, bundles.length]);

  const [items, setItems] = useState<EditableItem[]>([]);
  const [showAddMore, setShowAddMore] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    imageUrl?: string;
    emoji: string;
  } | null>(null);

  useEffect(() => {
    if (bundle) {
      setItems(bundle.items.map((i) => ({ ...i, qty: i.defaultQty })));
    }
  }, [bundle]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items],
  );

  const memberTotal = useMemo(
    () => (bundle ? Math.round(total * (1 - bundle.savings / 100)) : 0),
    [total, bundle],
  );

  const activeItems = useMemo(() => items.filter((i) => i.qty > 0), [items]);

  const setQty = (itemId: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, qty } : i)));
  };

  const handleItemSelected = (restockItem: RestockItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === restockItem.id);
      if (existing) {
        // Already in list — increment qty
        return prev.map((i) =>
          i.id === restockItem.id
            ? { ...i, qty: Math.min(i.qty + 1, i.maxQty) }
            : i,
        );
      }
      // Append as new editable item
      const newItem: EditableItem = {
        id: restockItem.id,
        productId: restockItem.id,
        name: restockItem.name,
        emoji: restockItem.emoji,
        imageUrl: restockItem.imageUrl,
        unitPrice: restockItem.price,
        defaultQty: 1,
        minQty: 0,
        maxQty: 20,
        qty: 1,
      };
      return [...prev, newItem];
    });
  };

  const handleAddToCart = () => {
    if (!bundle || activeItems.length === 0) return;

    addItem({
      id: bundle.id,
      itemType: "bundle",
      name: bundle.name,
      emoji: bundle.emoji,
      imageUrl: bundle.imageUrl,
      qty: 1,
      unitPrice: memberTotal,
      totalPrice: memberTotal,
      meta: {
        items: activeItems.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      },
    });

    router.back();
  };

  if (!bundle) {
    return (
      <View
        className={s.container}
        style={{ backgroundColor: palette.background }}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent.amber} size="small" />
        </View>
      </View>
    );
  }

  return (
    <View
      className={s.container}
      style={{ backgroundColor: bundle.color + "08" }}
    >
      <StatusBar
        backgroundColor={mode === "light" ? "#ffffff" : palette.background}
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
              {previewTarget?.emoji ?? "🍲"}
            </Text>
          )}
        </View>
      </Modal>

      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton} style={{ color: bundle.color + "aa" }}>
            ← BUNDLES
          </Text>
        </Pressable>
        <View className={s.heroRow}>
          <Text className={s.heroEmoji}>{bundle.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text className={s.heroTitle}>{bundle.name}</Text>
            <Text className={s.heroSavings} style={{ color: bundle.color }}>
              SAVE {bundle.savings}%
            </Text>
          </View>
        </View>
        <Text className={s.heroDesc}>{bundle.description}</Text>
      </View>

      <ScrollView
        className={s.listSection}
        showsVerticalScrollIndicator={false}
      >
        <Text className={s.listLabel}>
          {activeItems.length} OF {items.length} ITEMS
        </Text>

        {items.length === 0 ? (
          <Text className={s.emptyMessage}>LOADING ITEMS...</Text>
        ) : activeItems.length === 0 ? (
          <Text className={s.emptyMessage}>
            ALL ITEMS REMOVED. ADD AT LEAST ONE.
          </Text>
        ) : null}

        {items.map((item) => (
          <View
            key={item.id}
            className={s.itemRow}
            style={{ opacity: item.qty === 0 ? 0.35 : 1 }}
          >
            <Pressable
              style={previewStyles.itemThumb}
              onPress={() =>
                setPreviewTarget({ imageUrl: item.imageUrl, emoji: item.emoji })
              }
            >
              <ProductImage
                imageUrl={item.imageUrl}
                emoji={item.emoji}
                size={28}
                borderRadius={4}
              />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text className={s.itemName}>{item.name}</Text>
              <Text className={s.itemPrice}>
                {formatPrice(item.unitPrice)} each
              </Text>
            </View>
            <QtyControl
              value={item.qty}
              onIncrement={() =>
                setQty(item.id, Math.min(item.qty + 1, item.maxQty))
              }
              onDecrement={() =>
                setQty(item.id, Math.max(item.qty - 1, item.minQty))
              }
              min={item.minQty}
              max={item.maxQty}
              accentColor={bundle.color}
              small
            />
          </View>
        ))}
      </ScrollView>

      <View className={s.footer}>
        <View className={s.retailRow}>
          <Text
            style={{
              color: palette.textSecondary,
              fontSize: 9,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            RETAIL VALUE
          </Text>
          <Text className={s.retailValue}>{formatPrice(total)}</Text>
        </View>
        <View className={s.memberRow}>
          <Text
            style={{
              color: bundle.color,
              fontSize: 9,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            MEMBER PRICE
          </Text>
          <Text className={s.memberPrice}>{formatPrice(memberTotal)}</Text>
        </View>
        <Pressable
          className={addMoreButton.wrapper}
          style={{ borderColor: bundle.color + "44" }}
          onPress={() => setShowAddMore(true)}
        >
          <Text className={addMoreButton.text} style={{ color: bundle.color }}>
            + ADD MORE ITEMS
          </Text>
        </Pressable>

        <Pressable
          className={s.addToCartBtn}
          style={{
            backgroundColor: activeItems.length > 0 ? bundle.color : "#1a2a1c",
          }}
          onPress={handleAddToCart}
          disabled={activeItems.length === 0}
        >
          <Text
            style={{
              color: activeItems.length > 0 ? "#000" : palette.textSecondary,
              textAlign: "center",
              fontFamily: "NotoSerif_400Regular",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            {activeItems.length > 0
              ? `ADD TO CART · ${activeItems.length} ITEMS`
              : "ADD ITEMS FIRST"}
          </Text>
        </Pressable>
      </View>

      <AddMoreItemsSheet
        visible={showAddMore}
        onClose={() => setShowAddMore(false)}
        onItemSelected={handleItemSelected}
        onItemRemoved={(item) => {
          setItems((prev) => {
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
  itemThumb: {
    width: 28,
    height: 28,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 4,
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
});
