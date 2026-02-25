import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { authScreen as s } from "../../styles";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");
  const [refApplied, setRefApplied] = useState(false);
  const { requestOtp, isLoading, error, clearError } = useAuth();

  const isValid = name.trim().length >= 1 && phone.replace(/\s/g, "").length >= 8;

  const handleSendCode = async () => {
    if (!isValid || isLoading) return;
    clearError();
    try {
      await requestOtp(phone.replace(/\s/g, ""));
      router.push({
        pathname: "/(auth)/otp",
        params: {
          phone: phone.replace(/\s/g, ""),
          name: name.trim(),
          referralCode: refApplied ? refCode : "",
          mode: "signup",
        },
      });
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
        <Text className={s.signupTitle}>Create account</Text>
      </View>

      <ScrollView className={s.signupForm} keyboardShouldPersistTaps="handled">
        <Text className={s.signupFieldLabel}>YOUR NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Thrive"
          placeholderTextColor="#2a4a2a"
          autoFocus
          className={s.signupInput}
        />

        <Text className={s.signupFieldLabel}>PHONE NUMBER</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+234 800 000 0000"
          placeholderTextColor="#2a4a2a"
          keyboardType="phone-pad"
          className={s.signupInput}
        />

        <Text className={s.signupRefLabel}>
          REFERRAL CODE{" "}
          <Text className={s.signupRefOptional}>(OPTIONAL)</Text>
        </Text>
        <View className={s.signupRefRow}>
          <TextInput
            value={refCode}
            onChangeText={(val) => {
              setRefCode(val.toUpperCase());
              setRefApplied(false);
            }}
            placeholder="e.g. THRIVE200"
            placeholderTextColor="#2a4a2a"
            maxLength={12}
            autoCapitalize="characters"
            className={`${s.signupRefInput} ${refApplied ? s.signupRefInputApplied : ""}`}
          />
          <Pressable
            onPress={handleApplyRef}
            className={`${s.signupApplyBtn} ${refApplied ? s.signupApplyActive : s.signupApplyInactive}`}
          >
            <Text
              className={`text-3xs tracking-wide-md font-mono ${refApplied ? "text-baza-green" : "text-[#3a5c3a]"}`}
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
          We'll send a verification code to your number.{"\n"}
          <Text className={s.signupHintDim}>
            Standard SMS rates may apply.
          </Text>
        </Text>

        {error ? (
          <Text className="text-3xs text-baza-red tracking-wide-sm mb-4">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSendCode}
          className={`${s.signupSubmitBtn} ${isValid ? s.signupSubmitActive : s.signupSubmitInactive}`}
          disabled={!isValid || isLoading}
        >
          <Text
            className={`text-[11px] tracking-wide-2xl font-mono font-bold text-center ${isValid ? "text-black" : "text-[#2a3a2a]"}`}
          >
            {isLoading ? "SENDING..." : "SEND VERIFICATION CODE"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
