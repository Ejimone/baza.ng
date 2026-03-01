import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { snacksDrinksMode as s } from "../../styles";
import type { SnackItem } from "../../types";
import { formatPrice } from "../../utils/format";
import ProductImage from "../ui/ProductImage";

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
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const inCart = qty > 0;

  return (
    <View
      className={`${s.card} ${inCart ? s.cardActive : s.cardInactive}`}
      style={{
        backgroundColor: palette.card,
        borderColor: inCart ? item.color + "44" : palette.border,
      }}
    >
      <ProductImage
        imageUrl={item.imageUrl}
        emoji={item.emoji}
        size={40}
        borderRadius={6}
      />
      <Text className={s.cardName} style={{ color: palette.textPrimary }}>
        {item.name}
      </Text>
      <Text className={s.cardTag} style={{ color: item.color + "99" }}>
        {item.tag}
      </Text>

      <View className={s.cardFooter}>
        <Text className={s.cardPrice} style={{ color: palette.textPrimary }}>
          {formatPrice(item.price)}
        </Text>

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
            <Text
              className={s.stepperValue}
              style={{ color: palette.textPrimary }}
            >
              {qty}
            </Text>
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
