import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { bundleDetail as s } from "../../../../styles";
import { useProducts } from "../../../../hooks/useProducts";
import { useCart } from "../../../../hooks/useCart";
import QtyControl from "../../../../components/ui/QtyControl";
import { formatPrice } from "../../../../utils/format";
import type { BundleItem } from "../../../../types";

interface EditableItem extends BundleItem {
  qty: number;
}

export default function BundleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundles, fetchBundles } = useProducts();
  const { addItem } = useCart();

  const bundle = bundles.find((b) => b.id === id);

  useEffect(() => {
    if (!bundle && bundles.length === 0) {
      fetchBundles();
    }
  }, [bundle, bundles.length]);

  const [items, setItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    if (bundle) {
      setItems(
        bundle.items.map((i) => ({ ...i, qty: i.defaultQty }))
      );
    }
  }, [bundle]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items]
  );

  const memberTotal = useMemo(
    () => (bundle ? Math.round(total * (1 - bundle.savings / 100)) : 0),
    [total, bundle]
  );

  const activeItems = useMemo(() => items.filter((i) => i.qty > 0), [items]);

  const setQty = (itemId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty } : i))
    );
  };

  const handleAddToCart = () => {
    if (!bundle || activeItems.length === 0) return;

    addItem({
      id: bundle.id,
      itemType: "bundle",
      name: bundle.name,
      emoji: bundle.emoji,
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
      <View className={s.container} style={{ backgroundColor: "#070e08" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#f5a623" size="small" />
        </View>
      </View>
    );
  }

  return (
    <View className={s.container} style={{ backgroundColor: bundle.color + "08" }}>
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
            <Text
              className={s.heroSavings}
              style={{ color: bundle.color }}
            >
              SAVE {bundle.savings}%
            </Text>
          </View>
        </View>
        <Text className={s.heroDesc}>{bundle.description}</Text>
      </View>

      <ScrollView className={s.listSection} showsVerticalScrollIndicator={false}>
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
            <Text className={s.itemEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text className={s.itemName}>{item.name}</Text>
              <Text className={s.itemPrice}>
                {formatPrice(item.unitPrice)} each
              </Text>
            </View>
            <QtyControl
              value={item.qty}
              onIncrement={() => setQty(item.id, Math.min(item.qty + 1, item.maxQty))}
              onDecrement={() => setQty(item.id, Math.max(item.qty - 1, item.minQty))}
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
          <Text style={{ color: "#2a3a2a", fontSize: 9, letterSpacing: 1 }}>
            RETAIL VALUE
          </Text>
          <Text className={s.retailValue}>{formatPrice(total)}</Text>
        </View>
        <View className={s.memberRow}>
          <Text style={{ color: bundle.color, fontSize: 9, letterSpacing: 1 }}>
            MEMBER PRICE
          </Text>
          <Text className={s.memberPrice}>{formatPrice(memberTotal)}</Text>
        </View>
        <Pressable
          className={s.addToCartBtn}
          style={{
            backgroundColor:
              activeItems.length > 0 ? bundle.color : "#1a2a1c",
          }}
          onPress={handleAddToCart}
          disabled={activeItems.length === 0}
        >
          <Text
            style={{
              color: activeItems.length > 0 ? "#000" : "#2a3a2a",
              textAlign: "center",
              fontFamily: "SpaceMono",
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
    </View>
  );
}
