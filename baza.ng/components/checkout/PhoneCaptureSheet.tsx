import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import * as userService from "../../services/user";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { phoneCaptureSheet as s } from "../../styles";
import {
  formatNigerianPhoneInput,
  isValidNigerianPhone,
  normalizePhoneNumber,
} from "../../utils/format";

interface PhoneCaptureSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
}

export default function PhoneCaptureSheet({
  visible,
  onDismiss,
  onSuccess,
}: PhoneCaptureSheetProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handlePhoneChange = (text: string) => {
    setPhone(formatNigerianPhoneInput(text));
  };

  const handleSave = async () => {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      Alert.alert("Required", "Please enter your phone number.");
      return;
    }
    if (!isValidNigerianPhone(normalized)) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid Nigerian phone number (e.g. 0901 234 5678).",
      );
      return;
    }

    setIsSaving(true);
    try {
      const updated = await userService.updatePhone(normalized);
      updateUser({ phone: updated.phone });
      setPhone("");
      onDismiss();
      onSuccess?.();
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.error ?? "Failed to save phone number.";

      if (code === "PHONE_ALREADY_REGISTERED") {
        Alert.alert(
          "Phone Already Used",
          "This phone number is already registered to another account. Please use a different number.",
        );
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <View
      className={s.overlay}
      style={{
        backgroundColor:
          mode === "light" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.85)",
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      <View
        className={s.sheet}
        style={{
          backgroundColor: palette.background,
          borderColor: palette.border,
        }}
      >
        <View
          className={s.handle}
          style={{ backgroundColor: palette.border }}
        />

        <Text className={s.label}>PHONE NUMBER REQUIRED</Text>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Add your phone number
        </Text>
        <Text className={s.desc} style={{ color: palette.textSecondary }}>
          We need your phone number to deliver your order and contact you.
        </Text>

        <Text
          className={s.fieldLabel}
          style={{ color: palette.textSecondary }}
        >
          PHONE NUMBER
        </Text>
        <TextInput
          className={s.input}
          placeholder="0901 234 5678"
          placeholderTextColor={palette.textSecondary}
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.textPrimary,
          }}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          editable={!isSaving}
        />

        <Pressable
          className={s.saveBtn}
          onPress={handleSave}
          disabled={isSaving || !phone.trim()}
          style={{
            backgroundColor:
              isSaving || !phone.trim()
                ? palette.border
                : "#4caf7d",
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text className={s.saveBtnText}>SAVE & CONTINUE</Text>
          )}
        </Pressable>

        <Pressable onPress={onDismiss}>
          <Text
            className={s.cancelBtn}
            style={{ color: palette.textSecondary }}
          >
            CANCEL
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
