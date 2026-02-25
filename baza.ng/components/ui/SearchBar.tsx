import { useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { restockMode as s } from "../../styles";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "What do you need?",
  onClear,
  autoFocus = true,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  return (
    <View className={s.searchBox}>
      <Text className={s.searchIcon}>🔍</Text>
      <TextInput
        ref={inputRef}
        className={s.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#3a5a8a"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
        >
          <Text className={s.searchClear}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
