import { MagnifyingGlass } from "phosphor-react-native";
import { useEffect, useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
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

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  return (
    <View
      className={isUniversal ? undefined : s.searchBox}
      style={
        isUniversal
          ? {
              backgroundColor: "#0d1a0f",
              borderWidth: 1,
              borderColor: "#1a2a1c",
              flexDirection: "row",
              alignItems: "center",
              minHeight: 52,
              paddingVertical: 12,
              paddingHorizontal: 14,
              gap: 10,
            }
          : undefined
      }
    >
      <MagnifyingGlass size={18} color={isUniversal ? "#4caf7d" : "#3a5a8a"} />
      <TextInput
        ref={inputRef}
        className={isUniversal ? undefined : s.searchInput}
        style={
          isUniversal
            ? {
                flex: 1,
                color: "#d9e8dc",
                fontSize: 14,
                fontFamily: "NotoSerif_400Regular",
              }
            : undefined
        }
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isUniversal ? "#3a5c3a" : "#3a5a8a"}
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
                : undefined
            }
          >
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
}
