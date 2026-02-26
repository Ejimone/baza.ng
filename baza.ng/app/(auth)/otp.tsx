import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { authScreen as s } from "../../styles";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "../../utils/constants";

export default function OTPScreen() {
  const { phone, name, referralCode, mode } = useLocalSearchParams<{
    phone: string;
    name?: string;
    referralCode?: string;
    mode?: string;
  }>();

  const { verifyOtp, requestOtp, isLoading, error, clearError } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = useCallback(
    (value: string, index: number) => {
      if (!/^[0-9]?$/.test(value)) return;

      const next = [...otp];
      next[index] = value;
      setOtp(next);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits filled
      if (next.every((d) => d !== "")) {
        const code = next.join("");
        handleVerify(code);
      }
    },
    [otp],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    },
    [otp],
  );

  const handleVerify = async (code?: string) => {
    const otpCode = code ?? otp.join("");
    if (otpCode.length !== OTP_LENGTH || isLoading) return;
    clearError();
    try {
      await verifyOtp({
        phone: phone!,
        otp: otpCode,
        name: name || undefined,
        referralCode: referralCode || undefined,
      });
    } catch {
      // error state managed by hook
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    clearError();
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    try {
      await requestOtp(phone!);
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } catch {
      // error state managed by hook
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={s.otpContainer}
    >
      <View className={s.otpHeader}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.otpBack}>← BACK</Text>
        </Pressable>
        <Text className={s.otpLabel}>VERIFICATION</Text>
        <Text className={s.otpTitle}>Enter the code</Text>
        <Text className={s.otpSentTo}>
          Sent to <Text className={s.otpPhone}>{phone}</Text>
        </Text>
      </View>

      <View className={s.otpForm}>
        <View className={s.otpBoxRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              value={digit}
              onChangeText={(val) => handleChange(val, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              maxLength={1}
              keyboardType="number-pad"
              autoFocus={i === 0}
              selectTextOnFocus
              className={`${s.otpBox} ${digit ? s.otpBoxFilled : s.otpBoxEmpty}`}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-center text-3xs text-baza-red tracking-wide-md mb-4 font-mono">
            {error}
          </Text>
        ) : (
          <Text className={s.otpHint}>
            {isLoading
              ? "Verifying..."
              : "Enter the 6-digit code sent to your phone"}
          </Text>
        )}

        <Pressable
          onPress={() => handleVerify()}
          className={s.otpVerifyBtn}
          style={isComplete ? { backgroundColor: "#4caf7d" } : undefined}
          disabled={!isComplete || isLoading}
        >
          <Text
            className={`text-[11px] tracking-wide-2xl font-mono font-bold text-center ${isComplete ? "text-black" : "text-[#2a3a2a]"}`}
          >
            {isLoading ? "VERIFYING..." : "VERIFY →"}
          </Text>
        </Pressable>

        <Pressable onPress={handleResend} disabled={cooldown > 0}>
          <Text className={s.otpResendBtn}>
            {cooldown > 0 ? `RESEND CODE (${cooldown}s)` : "RESEND CODE"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
