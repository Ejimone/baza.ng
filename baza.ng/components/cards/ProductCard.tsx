import { Minus, Plus } from "phosphor-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
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

function ProductCard({
  item,
  qty,
  onAdd,
  onIncrement,
  onDecrement,
  onPress,
}: ProductCardProps) {
  const inCart = qty > 0;
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <Pressable
      className={s.itemRow}
      onPress={onPress}
      style={{
        backgroundColor: palette.card,
        borderColor: palette.border,
        borderRadius: 4,
        paddingLeft: 0,
        paddingRight: 14,
        paddingVertical: 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        className={`${s.itemThumb} ${inCart ? s.itemThumbActive : s.itemThumbInactive}`}
        onPress={onPress}
        style={{
          width: 84,
          height: 84,
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      >
        <ProductImage
          imageUrl={item.imageUrl}
          emoji={item.emoji}
          size={84}
          borderRadius={0}
        />
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text
          className={`${s.itemName} ${inCart ? s.itemNameActive : s.itemNameInactive}`}
          style={{ color: palette.textPrimary }}
        >
          {item.name}
        </Text>
        <Text className={s.itemBrand} style={{ color: palette.textSecondary }}>
          {item.brand}
        </Text>
        {inCart && (
          <Text
            className={s.itemTotal}
            style={{ color: palette.textSecondary }}
          >
            {formatPrice(item.price * qty)} total
          </Text>
        )}
      </View>

      <View className={s.itemRight}>
        <Text className={s.itemPrice} style={{ color: palette.textPrimary }}>
          {formatPrice(item.price)}
        </Text>

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
              className={s.stepperDec}
              onPress={(e) => {
                e.stopPropagation?.();
                onDecrement();
              }}
            >
              <Minus size={16} color="#6ec6ff" weight="bold" />
            </Pressable>
            <Text
              className={s.stepperValue}
              style={{ color: palette.textPrimary }}
            >
              {qty}
            </Text>
            <Pressable
              className={s.stepperInc}
              onPress={(e) => {
                e.stopPropagation?.();
                onIncrement();
              }}
            >
              <Plus size={16} color="#6ec6ff" weight="bold" />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default memo(ProductCard, (prev, next) => {
  return (
    prev.qty === next.qty &&
    prev.item.id === next.item.id &&
    prev.item.price === next.item.price &&
    prev.item.name === next.item.name &&
    prev.item.brand === next.item.brand &&
    prev.item.imageUrl === next.item.imageUrl
  );
});
