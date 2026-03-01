import { MagnifyingGlass } from "phosphor-react-native";
import { useEffect, useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { restockMode as s } from "../../styles";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  variant?: "restock" | "universal";
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "What do you need?",
  onClear,
  autoFocus = true,
  variant = "restock",
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const isUniversal = variant === "universal";
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  return (
    <View
      className={isUniversal ? undefined : s.searchBox}
      style={{
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
        flexDirection: "row",
        alignItems: "center",
        minHeight: 52,
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 10,
      }}
    >
      <MagnifyingGlass
        size={18}
        color={isUniversal ? "#4caf7d" : palette.textSecondary}
      />
      <TextInput
        ref={inputRef}
        className={isUniversal ? undefined : s.searchInput}
        style={{
          flex: 1,
          color: palette.textPrimary,
          fontSize: isUniversal ? 14 : 13,
          fontFamily: "NotoSerif_400Regular",
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textSecondary}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
        >
          <Text
            className={isUniversal ? undefined : s.searchClear}
            style={
              isUniversal
                ? {
                    color: "#4caf7d",
                    fontSize: 18,
                    lineHeight: 18,
                    fontFamily: "NotoSerif_400Regular",
                  }
                : {
                    color: palette.textSecondary,
                    fontSize: 18,
                    lineHeight: 18,
                    fontFamily: "NotoSerif_400Regular",
                  }
            }
          >
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
}
