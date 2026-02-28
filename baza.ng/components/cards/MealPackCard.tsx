import { Pressable, Text, View } from "react-native";
import { tonightMode as s } from "../../styles";
import type { MealPack } from "../../types";
import { formatPrice } from "../../utils/format";
import ProductImage from "../ui/ProductImage";

interface MealPackCardProps {
  pack: MealPack;
  onPress: () => void;
  isInCart: boolean;
}

export default function MealPackCard({
  pack,
  onPress,
  isInCart,
}: MealPackCardProps) {
  return (
    <Pressable
      className={s.packButton}
      style={{
        backgroundColor: pack.color + "08",
        borderWidth: 1,
        borderColor: pack.color + "22",
      }}
      onPress={onPress}
    >
      <ProductImage
        imageUrl={pack.imageUrl}
        emoji={pack.emoji}
        size={44}
        borderRadius={6}
      />

      <View style={{ flex: 1 }}>
        <Text className={s.packTitle}>{pack.name}</Text>
        <Text className={s.packMeta} style={{ color: pack.color + "aa" }}>
          {pack.baseTime} min · {pack.basePlates} plates
        </Text>
        <Text className={s.packDesc}>{pack.description}</Text>
        {isInCart && <Text className={s.packAdded}>✓ ADDED</Text>}
      </View>

      <View style={{ alignItems: "flex-end", minWidth: 70 }}>
        <Text className={s.packPrice}>{formatPrice(pack.basePrice)}</Text>
      </View>
    </Pressable>
  );
}
