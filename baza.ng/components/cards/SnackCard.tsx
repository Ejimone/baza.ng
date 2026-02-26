import { Pressable, Text, View } from "react-native";
import { snacksDrinksMode as s } from "../../styles";
import type { SnackItem } from "../../types";
import { formatPrice } from "../../utils/format";

interface SnackCardProps {
  item: SnackItem;
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function SnackCard({
  item,
  qty,
  onAdd,
  onIncrement,
  onDecrement,
}: SnackCardProps) {
  const inCart = qty > 0;

  return (
    <View
      className={`${s.card} ${inCart ? s.cardActive : s.cardInactive}`}
      style={{ borderColor: inCart ? item.color + "44" : undefined }}
    >
      <Text className={s.cardEmoji}>{item.emoji}</Text>
      <Text className={s.cardName}>{item.name}</Text>
      <Text className={s.cardTag} style={{ color: item.color + "99" }}>
        {item.tag}
      </Text>

      <View className={s.cardFooter}>
        <Text className={s.cardPrice}>{formatPrice(item.price)}</Text>

        {qty === 0 ? (
          <Pressable
            className={s.addBtn}
            style={{ borderWidth: 1, borderColor: "#c77dff55" }}
            onPress={onAdd}
          >
            <Text
              style={{
                color: "#c77dff",
                fontSize: 7,
                letterSpacing: 1,
                fontFamily: "NotoSerif_400Regular",
              }}
            >
              ADD
            </Text>
          </Pressable>
        ) : (
          <View className={s.stepperRow}>
            <Pressable
              className={`${s.stepperDec} ${qty === 1 ? s.stepperDecRemove : s.stepperDecNormal}`}
              onPress={onDecrement}
            >
              <Text
                style={{
                  color: qty === 1 ? "#e85c3a" : "#c77dff",
                  fontFamily: "NotoSerif_400Regular",
                }}
              >
                {qty === 1 ? "×" : "−"}
              </Text>
            </Pressable>
            <Text className={s.stepperValue}>{qty}</Text>
            <Pressable className={s.stepperInc} onPress={onIncrement}>
              <Text
                style={{ color: "#c77dff", fontFamily: "NotoSerif_400Regular" }}
              >
                +
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
