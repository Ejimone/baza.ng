import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";

interface ScreenWrapperProps extends ViewProps {
  className?: string;
  padTop?: boolean;
  padBottom?: boolean;
}

export default function ScreenWrapper({
  children,
  className = "",
  padTop = true,
  padBottom = false,
  style,
  ...rest
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  return (
    <View
      className={`flex-1 ${className}`}
      style={[
        {
          backgroundColor: palette.background,
          paddingTop: padTop ? insets.top : 0,
          paddingBottom: padBottom ? insets.bottom : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
