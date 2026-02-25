import { View, Text } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center pt-[60px]">
      <Text className="text-[#1a2a1a] text-[11px] tracking-[0.2em] text-center leading-loose font-mono">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-[#0f1a0f] text-[11px] tracking-[0.2em] text-center leading-loose font-mono mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
