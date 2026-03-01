import { View, type ViewProps } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";

interface CardProps extends ViewProps {
  padded?: boolean;
}

export default function Card({
  padded = true,
  style,
  children,
  ...rest
}: CardProps) {
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  return (
    <View
      className={padded ? "border p-4" : "border"}
      style={[
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
