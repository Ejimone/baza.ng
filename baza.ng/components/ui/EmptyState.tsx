import { Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <View className="flex-1 items-center justify-center pt-[60px]">
      <Text
        className="text-[11px] tracking-[0.2em] text-center leading-loose font-mono"
        style={{ color: palette.textSecondary }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-[11px] tracking-[0.2em] text-center leading-loose font-mono mt-1"
          style={{ color: palette.textSecondary }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
