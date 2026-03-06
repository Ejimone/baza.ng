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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export default function SignInEmailScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithEmail, signInWithGoogle, isLoading, error, clearError } =
    useAuth();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const isValid = isValidEmail(email) && password.length >= 1;

  const handleSignIn = async () => {
    if (!isValid || isLoading) return;
    clearError();
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
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
        <Text className={s.signinTitle}>Sign in with email</Text>
      </View>

      <View className={s.signinForm}>
        <Text className={s.signinFieldLabel}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          className={s.signinInput}
        />

        <Text className={s.signinFieldLabel}>PASSWORD</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          placeholderTextColor={palette.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          className={s.signinInput}
        />

        {error ? (
          <Text className="text-3xs text-baza-red tracking-wide-sm mb-4 font-mono">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSignIn}
          className={`${s.signinSubmitBtn} ${isValid ? s.signinSubmitActive : s.signinSubmitInactive}`}
          disabled={!isValid || isLoading}
        >
          <Text
            className={`text-[11px] tracking-wide-2xl font-mono font-bold text-center ${isValid ? "text-black" : ""}`}
            style={!isValid ? { color: palette.textSecondary } : undefined}
          >
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </Text>
        </Pressable>

        <Text className={s.signinSwitch}>
          Don&apos;t have an account?{" "}
          <Text
            onPress={() => router.replace("/(auth)/signup-email" as any)}
            className={s.signinSwitchLink}
          >
            SIGN UP
          </Text>
        </Text>

        <Pressable
          onPress={async () => {
            clearError();
            try {
              await signInWithGoogle();
            } catch {
              // error set by hook
            }
          }}
          disabled={isLoading}
          className="mt-3 w-full py-3 bg-white border border-[#ddd]"
        >
          <Text className="text-center text-[#333] text-[11px] tracking-wide-xl font-mono font-bold">
            {isLoading ? "Signing in..." : "Or sign in with Google"}
          </Text>
        </Pressable>

        <Text className={s.signinSwitch}>
          Or sign in with phone?{" "}
          <Text
            onPress={() => router.replace("/(auth)/signin")}
            className={s.signinSwitchLink}
          >
            USE PHONE
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
