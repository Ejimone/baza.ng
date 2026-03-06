import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useAuth } from "../../hooks/useAuth";
import { useThemeStore } from "../../stores/themeStore";
import { authScreen as s } from "../../styles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export default function SignUpEmailScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [refApplied, setRefApplied] = useState(false);
  const { signUpWithEmail, signInWithGoogle, isLoading, error, clearError } =
    useAuth();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const isValid =
    name.trim().length >= 1 &&
    isValidEmail(email) &&
    passwordValid &&
    passwordsMatch;

  const handleSignUp = async () => {
    if (!isValid || isLoading) return;
    clearError();
    try {
      await signUpWithEmail(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        refApplied ? refCode : undefined,
      );
    } catch {
      // error state is set by the hook
    }
  };

  const handleApplyRef = () => {
    if (refCode.length >= 4) setRefApplied(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={s.signupContainer}
    >
      <View className={s.signupHeader}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.signupBack}>← BACK</Text>
        </Pressable>
        <Text className={s.signupLabel}>NEW MEMBER</Text>
        <Text className={s.signupTitle}>Create account with email</Text>
      </View>

      <ScrollView className={s.signupForm} keyboardShouldPersistTaps="handled">
        <Text className={s.signupFieldLabel}>YOUR NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Thrive"
          placeholderTextColor={palette.textSecondary}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          className={s.signupInput}
        />

        <Text className={s.signupFieldLabel}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          className={s.signupInput}
        />

        <Text className={s.signupFieldLabel}>PASSWORD</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          placeholderTextColor={palette.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          className={s.signupInput}
        />

        <Text className={s.signupFieldLabel}>CONFIRM PASSWORD</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          placeholderTextColor={palette.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          className={s.signupInput}
        />

        <Text className={s.signupRefLabel}>
          REFERRAL CODE <Text className={s.signupRefOptional}>(OPTIONAL)</Text>
        </Text>
        <View className={s.signupRefRow}>
          <TextInput
            value={refCode}
            onChangeText={(val) => {
              setRefCode(val.toUpperCase());
              setRefApplied(false);
            }}
            placeholder="e.g. THRIVE200"
            placeholderTextColor={palette.textSecondary}
            maxLength={12}
            autoCapitalize="characters"
            className={`${s.signupRefInput} ${refApplied ? s.signupRefInputApplied : ""}`}
          />
          <Pressable
            onPress={handleApplyRef}
            className={`${s.signupApplyBtn} ${refApplied ? s.signupApplyActive : s.signupApplyInactive}`}
          >
            <Text
              className={`text-3xs tracking-wide-md font-mono ${refApplied ? "text-baza-green" : ""}`}
              style={!refApplied ? { color: palette.textSecondary } : undefined}
            >
              {refApplied ? "✓ APPLIED" : "APPLY"}
            </Text>
          </Pressable>
        </View>

        {refApplied ? (
          <Text className={s.signupRefCredit}>
            ₦1,000 credit will be added after your first order.
          </Text>
        ) : null}

        <Text className={`${s.signupHint} mt-5`}>
          Create an account with your email and password.
        </Text>

        {error ? (
          <Text className="text-3xs text-baza-red tracking-wide-sm mb-4 font-mono">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSignUp}
          className={`${s.signupSubmitBtn} ${isValid ? s.signupSubmitActive : s.signupSubmitInactive}`}
          disabled={!isValid || isLoading}
        >
          <Text
            className={`text-[11px] tracking-wide-2xl font-mono font-bold text-center ${isValid ? "text-black" : ""}`}
            style={!isValid ? { color: palette.textSecondary } : undefined}
          >
            {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </Text>
        </Pressable>

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
            {isLoading ? "Signing in..." : "Or sign up with Google"}
          </Text>
        </Pressable>

        <Text className={s.signinSwitch}>
          Or sign up with phone?{" "}
          <Text
            onPress={() => router.replace("/(auth)/signup" as any)}
            className={s.signinSwitchLink}
          >
            USE PHONE
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
