import { Minus, Plus } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
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
  const iconSize = small ? 14 : 16;

  return (
    <View
      className={small ? s.stepperRowSmall : s.stepperRow}
      style={{
        borderColor: `${accentColor}44`,
      }}
    >
      <Pressable
        className={small ? s.stepperBtnSmall : s.stepperBtn}
        onPress={onDecrement}
        disabled={atMin}
        style={{ opacity: atMin ? 0.4 : 1 }}
      >
        <Minus size={iconSize} color={accentColor} weight="bold" />
      </Pressable>

      <Text
        className={small ? s.stepperValueSmall : s.stepperValue}
        style={{ color: "#f0f0e8" }}
      >
        {value}
      </Text>

      <Pressable
        className={small ? s.stepperBtnSmall : s.stepperBtn}
        onPress={onIncrement}
        disabled={atMax}
        style={{ opacity: atMax ? 0.4 : 1 }}
      >
        <Plus size={iconSize} color={accentColor} weight="bold" />
      </Pressable>
    </View>
  );
}
