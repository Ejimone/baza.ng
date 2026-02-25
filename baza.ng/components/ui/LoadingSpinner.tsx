import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "../../constants/theme";

interface LoadingSpinnerProps {
  message?: string;
  color?: string;
  size?: "small" | "large";
}

export default function LoadingSpinner({
  message,
  color = colors.accent.green,
  size = "large",
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text
          className="text-[11px] tracking-[0.2em] mt-4 font-mono"
          style={{ color: colors.text.secondary }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
