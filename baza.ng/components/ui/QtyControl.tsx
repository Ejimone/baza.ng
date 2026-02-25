import { View, Text, Pressable } from "react-native";
import { qtyControl as s } from "../../styles";

interface QtyControlProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  accentColor?: string;
  small?: boolean;
}

export default function QtyControl({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  accentColor = "#4caf7d",
  small = false,
}: QtyControlProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View className={small ? s.containerSmall : s.container}>
      <Pressable
        className={small ? s.buttonSmall : s.button}
        style={{
          borderColor: atMin ? `${accentColor}22` : `${accentColor}66`,
          opacity: atMin ? 0.4 : 1,
        }}
        onPress={onDecrement}
        disabled={atMin}
      >
        <Text
          className={small ? s.buttonTextSmall : s.buttonText}
          style={{ color: accentColor }}
        >
          −
        </Text>
      </Pressable>

      <Text className={small ? s.valueSmall : s.value}>{value}</Text>

      <Pressable
        className={small ? s.buttonSmall : s.button}
        style={{
          borderColor: atMax ? `${accentColor}22` : `${accentColor}66`,
          opacity: atMax ? 0.4 : 1,
        }}
        onPress={onIncrement}
        disabled={atMax}
      >
        <Text
          className={small ? s.buttonTextSmall : s.buttonText}
          style={{ color: accentColor }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
