import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <View
      className={`flex-1 ${className}`}
      style={[
        {
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
