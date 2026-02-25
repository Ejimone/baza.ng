import { View, Text, Pressable } from "react-native";
import { stockUpMode as s } from "../../styles";
import { formatPrice } from "../../utils/format";
import type { Bundle } from "../../types";

interface BundleCardProps {
  bundle: Bundle;
  onPress: () => void;
  isInCart: boolean;
}

export default function BundleCard({
  bundle,
  onPress,
  isInCart,
}: BundleCardProps) {
  return (
    <Pressable
      className={s.bundleButton}
      style={{
        backgroundColor: bundle.color + "08",
        borderWidth: 1,
        borderColor: bundle.color + "22",
      }}
      onPress={onPress}
    >
      <Text className={s.bundleEmoji}>{bundle.emoji}</Text>

      <View style={{ flex: 1 }}>
        <Text className={s.bundleTitle}>{bundle.name}</Text>
        <Text className={s.bundleMeta} style={{ color: bundle.color + "aa" }}>
          {bundle.items.length} items · {bundle.savings}% savings
        </Text>
        <Text className={s.bundleDesc}>{bundle.description}</Text>
        {isInCart ? (
          <Text className={s.bundleInCart}>✓ IN CART</Text>
        ) : (
          <Text
            className={s.bundleCustomise}
            style={{ color: bundle.color + "88" }}
          >
            Customise ›
          </Text>
        )}
      </View>

      <View className={s.bundlePriceCol}>
        <Text className={s.bundlePrice}>{formatPrice(bundle.basePrice)}</Text>
      </View>
    </Pressable>
  );
}
