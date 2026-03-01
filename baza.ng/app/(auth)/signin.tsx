import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useAuth } from "../../hooks/useAuth";
import { useThemeStore } from "../../stores/themeStore";
import { authScreen as s } from "../../styles";

export default function SignInScreen() {
  const [phone, setPhone] = useState("");
  const { requestOtp, isLoading, error, clearError } = useAuth();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const isValid = phone.replace(/\s/g, "").length >= 8;

  const handleSendCode = async () => {
    if (!isValid || isLoading) return;
    clearError();
    try {
      await requestOtp(phone.replace(/\s/g, ""));
      router.push({
        pathname: "/(auth)/otp",
        params: { phone: phone.replace(/\s/g, ""), mode: "signin" },
      });
    } catch {
      // error state is set by the hook
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={s.signinContainer}
    >
      <View className={s.signinHeader}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.signinBack}>← BACK</Text>
        </Pressable>
        <Text className={s.signinLabel}>WELCOME BACK</Text>
        <Text className={s.signinTitle}>Sign in</Text>
      </View>

      <View className={s.signinForm}>
        <Text className={s.signinFieldLabel}>PHONE NUMBER</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+234 800 000 0000"
          placeholderTextColor={palette.textSecondary}
          keyboardType="phone-pad"
          autoFocus
          className={s.signinInput}
        />

        {error ? (
          <Text className="text-3xs text-baza-red tracking-wide-sm mb-4 font-mono">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSendCode}
          className={`${s.signinSubmitBtn} ${isValid ? s.signinSubmitActive : s.signinSubmitInactive}`}
          disabled={!isValid || isLoading}
        >
          <Text
            className={`text-[11px] tracking-wide-2xl font-mono font-bold text-center ${isValid ? "text-black" : ""}`}
            style={!isValid ? { color: palette.textSecondary } : undefined}
          >
            {isLoading ? "SENDING..." : "SEND CODE"}
          </Text>
        </Pressable>

        <Text className={s.signinSwitch}>
          Don’t have an account?{" "}
          <Text
            onPress={() => router.replace("/(auth)/signup")}
            className={s.signinSwitchLink}
          >
            SIGN UP
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
