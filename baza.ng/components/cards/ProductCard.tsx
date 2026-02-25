import { View, Text, Pressable } from "react-native";
import { restockMode as s } from "../../styles";
import { formatPrice } from "../../utils/format";
import type { RestockItem } from "../../types";

interface ProductCardProps {
  item: RestockItem;
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function ProductCard({
  item,
  qty,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const inCart = qty > 0;

  return (
    <View className={s.itemRow}>
      <View
        className={`${s.itemThumb} ${inCart ? s.itemThumbActive : s.itemThumbInactive}`}
      >
        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
      </View>

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
          <Pressable className={s.addBtn} onPress={onAdd}>
            <Text>ADD</Text>
          </Pressable>
        ) : (
          <View className={s.stepperRow}>
            <Pressable
              className={`${s.stepperDec} ${qty === 1 ? s.stepperDecRemove : s.stepperDecNormal}`}
              onPress={onDecrement}
            >
              <Text style={{ color: qty === 1 ? "#e85c3a" : "#6ec6ff" }}>
                {qty === 1 ? "×" : "−"}
              </Text>
            </Pressable>
            <Text className={s.stepperValue}>{qty}</Text>
            <Pressable className={s.stepperInc} onPress={onIncrement}>
              <Text style={{ color: "#6ec6ff" }}>+</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
