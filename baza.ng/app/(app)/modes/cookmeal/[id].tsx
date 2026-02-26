import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import QtyControl from "../../../../components/ui/QtyControl";
import { useCart } from "../../../../hooks/useCart";
import { useProducts } from "../../../../hooks/useProducts";
import { mealPackDetail as s } from "../../../../styles";
import { formatPrice } from "../../../../utils/format";

export default function MealPackDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mealPacks, fetchMealPacks } = useProducts();
  const { addItem } = useCart();

  const pack = mealPacks.find((p) => p.id === id);

  useEffect(() => {
    if (!pack && mealPacks.length === 0) {
      fetchMealPacks();
    }
  }, [pack, mealPacks.length]);

  const [plates, setPlates] = useState(4);
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  useEffect(() => {
    if (pack) {
      setPlates(pack.basePlates);
    }
  }, [pack]);

  const ratio = pack ? plates / pack.basePlates : 1;
  const price = pack ? Math.round(pack.basePrice * ratio) : 0;

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

  const handleAddToCart = () => {
    if (!pack) return;

    addItem({
      id: pack.id,
      itemType: "mealpack",
      name: pack.name,
      emoji: pack.emoji,
      qty: 1,
      unitPrice: price,
      totalPrice: price,
      meta: {
        plates,
        removedItems,
      },
    });

    router.back();
  };

  if (!pack) {
    return (
      <View className={s.container} style={{ backgroundColor: "#080a04" }}>
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
      <View className={s.hero} style={{ backgroundColor: pack.color + "12" }}>
        <Text className={s.heroEmoji}>{pack.emoji}</Text>
        <Pressable className={s.heroBackBtn} onPress={() => router.back()}>
          <Text
            style={{
              color: "#aaa",
              fontSize: 10,
              letterSpacing: 1,
              fontFamily: "NotoSerif_400Regular",
            }}
          >
            ← BACK
          </Text>
        </Pressable>
      </View>

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
          WHAT'S INSIDE FOR {plates} PLATE{plates > 1 ? "S" : ""}
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
              <Text className={s.ingredientEmoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  className={s.ingredientName}
                  style={{
                    color: isRemoved ? "#555" : "#d0e0d0",
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
    </View>
  );
}
