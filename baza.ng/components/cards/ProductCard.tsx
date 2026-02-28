import { Pressable, Text, View } from "react-native";
import { restockMode as s } from "../../styles";
import type { RestockItem } from "../../types";
import { formatPrice } from "../../utils/format";
import ProductImage from "../ui/ProductImage";

interface ProductCardProps {
  item: RestockItem;
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onPress?: () => void;
}

export default function ProductCard({
  item,
  qty,
  onAdd,
  onIncrement,
  onDecrement,
  onPress,
}: ProductCardProps) {
  const inCart = qty > 0;

  return (
    <Pressable className={s.itemRow} onPress={onPress}>
      <Pressable
        className={`${s.itemThumb} ${inCart ? s.itemThumbActive : s.itemThumbInactive}`}
        onPress={onPress}
      >
        <ProductImage
          imageUrl={item.imageUrl}
          emoji={item.emoji}
          size={40}
          borderRadius={4}
        />
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text
          className={`${s.itemName} ${inCart ? s.itemNameActive : s.itemNameInactive}`}
        >
          {item.name}
        </Text>
        <Text className={s.itemBrand}>{item.brand}</Text>
        {inCart && (
          <Text className={s.itemTotal}>
            {formatPrice(item.price * qty)} total
          </Text>
        )}
      </View>

      <View className={s.itemRight}>
        <Text className={s.itemPrice}>{formatPrice(item.price)}</Text>

        {qty === 0 ? (
          <Pressable
            className={s.addBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onAdd();
            }}
          >
            <Text className="font-mono text-baza-blue">ADD</Text>
          </Pressable>
        ) : (
          <View className={s.stepperRow}>
            <Pressable
              className={`${s.stepperDec} ${qty === 1 ? s.stepperDecRemove : s.stepperDecNormal}`}
              onPress={(e) => {
                e.stopPropagation?.();
                onDecrement();
              }}
            >
              <Text
                style={{
                  color: qty === 1 ? "#e85c3a" : "#6ec6ff",
                  fontFamily: "NotoSerif_400Regular",
                }}
              >
                {qty === 1 ? "×" : "−"}
              </Text>
            </Pressable>
            <Text className={s.stepperValue}>{qty}</Text>
            <Pressable
              className={s.stepperInc}
              onPress={(e) => {
                e.stopPropagation?.();
                onIncrement();
              }}
            >
              <Text
                style={{ color: "#6ec6ff", fontFamily: "NotoSerif_400Regular" }}
              >
                +
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}
