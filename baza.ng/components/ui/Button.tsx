import { Pressable, Text, type PressableProps } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useThemeStore } from "../../stores/themeStore";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  label,
  variant = "primary",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  const variantStyles = {
    primary: {
      backgroundColor: colors.accent.green,
      borderColor: colors.accent.green,
      textColor: "#000000",
    },
    secondary: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      textColor: palette.textPrimary,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: palette.border,
      textColor: palette.textSecondary,
    },
  }[variant];

  return (
    <Pressable
      disabled={disabled}
      className="w-full py-[15px] items-center justify-center border"
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        className="font-mono text-[11px] tracking-wide-2xl font-bold"
        style={{ color: variantStyles.textColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
