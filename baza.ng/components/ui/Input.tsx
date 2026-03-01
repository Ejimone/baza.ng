import { Text, TextInput, View, type TextInputProps } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useThemeStore } from "../../stores/themeStore";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...rest }: InputProps) {
  const mode = useThemeStore((s) => s.mode);
  const palette = getThemePalette(mode);

  return (
    <View>
      {label ? (
        <Text
          className="text-2xs tracking-wide-xl mb-2 font-mono"
          style={{ color: palette.textSecondary }}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        className="w-full border py-[13px] px-4 text-sm font-mono"
        style={[
          {
            backgroundColor: palette.card,
            borderColor: error ? colors.accent.red : palette.border,
            color: palette.textPrimary,
          },
          style,
        ]}
        placeholderTextColor={palette.textSecondary}
        {...rest}
      />

      {error ? (
        <Text
          className="text-3xs tracking-wide-sm mt-2 font-mono"
          style={{ color: colors.accent.red }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
