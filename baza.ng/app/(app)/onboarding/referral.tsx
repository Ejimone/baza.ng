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
import { getThemePalette } from "../../../constants/appTheme";
import { useAuth } from "../../../hooks/useAuth";
import * as referralService from "../../../services/referral";
import { useThemeStore } from "../../../stores/themeStore";
import { authScreen as s } from "../../../styles";

export default function ReferralOnboardingScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const { completePostSignupReferral } = useAuth();

  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeAndContinue = () => {
    completePostSignupReferral();
  };

  const handleSkip = () => {
    if (isLoading) return;
    setError(null);
    completeAndContinue();
  };

  const handleApply = async () => {
    const code = referralCode.trim();
    if (!code) {
      setError("Please enter a referral code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await referralService.applyCode({ referralCode: code });
      completeAndContinue();
    } catch (err: any) {
      const code = err?.response?.data?.code;
      switch (code) {
        case "REFERRAL_CODE_REQUIRED":
          setError("Please enter a referral code.");
          break;
        case "REFERRAL_CODE_INVALID":
          setError("Referral code is invalid. Please check and try again.");
          break;
        case "REFERRAL_CODE_SELF":
          setError("You cannot apply your own referral code.");
          break;
        case "REFERRAL_ALREADY_SET":
          completeAndContinue();
          return;
        case "AUTH_REQUIRED":
          setError("Session expired. Please sign in again.");
          break;
        default:
          setError(
            err?.response?.data?.error ||
              err?.message ||
              "Could not apply referral code. Please try again.",
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={s.signupContainer}
    >
      <View className={s.signupHeader}>
        <Text className={s.signupLabel}>WELCOME</Text>
        <Text className={s.signupTitle}>Do you have a referral code?</Text>
        <Text
          className="text-[11px] tracking-wide-md mt-2"
          style={{ color: palette.textSecondary }}
        >
          Add it now to activate your referral benefits.
        </Text>
      </View>

      <ScrollView className={s.signupForm} keyboardShouldPersistTaps="handled">
        <Text className={s.signupRefLabel}>REFERRAL CODE (OPTIONAL)</Text>
        <TextInput
          value={referralCode}
          onChangeText={(val) => {
            setReferralCode(val.toUpperCase());
            if (error) {
              setError(null);
            }
          }}
          placeholder="e.g. THRIVE200"
          placeholderTextColor={palette.textSecondary}
          maxLength={16}
          autoCapitalize="characters"
          className={s.signupInput}
        />

        {error ? (
          <Text className="text-3xs text-baza-red tracking-wide-sm mb-4 font-mono">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleApply}
          className={s.signupSubmitBtn}
          disabled={isLoading}
        >
          <Text className="text-[11px] tracking-wide-2xl font-mono font-bold text-center text-black">
            {isLoading ? "APPLYING..." : "APPLY CODE"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          disabled={isLoading}
          className="mt-3 w-full py-3 border border-[#ddd]"
        >
          <Text className="text-center text-[#333] text-[11px] tracking-wide-xl font-mono font-bold">
            SKIP FOR NOW
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
