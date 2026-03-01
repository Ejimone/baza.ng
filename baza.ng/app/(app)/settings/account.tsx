import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import { getThemePalette } from "../../../constants/appTheme";
import * as userService from "../../../services/user";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import { accountSettingsScreen as s } from "../../../styles/index";

export default function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((st) => st.user);
  const updateUser = useAuthStore((st) => st.updateUser);
  const mode = useThemeStore((st) => st.mode);
  const toggleMode = useThemeStore((st) => st.toggleMode);

  const palette = getThemePalette(mode);
  const isLight = mode === "light";

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    setSaved(false);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      updateUser({ name: updated.name, email: updated.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error ?? "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper className="bg-[#060d07]">
      <View className={s.header} style={{ borderBottomColor: palette.border }}>
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← PROFILE"}
          </Text>
        </Pressable>
        <Text
          className={s.headerLabel}
          style={{ color: palette.textSecondary }}
        >
          ACCOUNT
        </Text>
        <Text className={s.headerTitle} style={{ color: palette.textPrimary }}>
          Settings
        </Text>
      </View>

      <ScrollView
        className={s.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className={s.fieldLabel} style={{ color: palette.textSecondary }}>
          FULL NAME
        </Text>
        <TextInput
          className={s.fieldInput}
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.textPrimary,
          }}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={palette.textSecondary}
          autoCapitalize="words"
        />

        <Text className={s.fieldLabel} style={{ color: palette.textSecondary }}>
          EMAIL ADDRESS
        </Text>
        <TextInput
          className={s.fieldInput}
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.textPrimary,
          }}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text className={s.emailHint} style={{ color: palette.textSecondary }}>
          Used for receipts and account recovery.
        </Text>

        <Text
          className={`${s.fieldLabel} mt-4`}
          style={{ color: palette.textSecondary }}
        >
          PHONE NUMBER
        </Text>
        <TextInput
          className={s.fieldInput}
          value={user?.phone ?? ""}
          editable={false}
          style={{
            opacity: 0.7,
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.textPrimary,
          }}
        />
        <Text className={s.phoneHint} style={{ color: palette.textSecondary }}>
          Phone number cannot be changed here. Contact support to update.
        </Text>

        <View
          className="mt-6 p-4"
          style={{
            backgroundColor: palette.card,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text
            className="text-xs tracking-wide-xl font-mono"
            style={{ color: palette.textPrimary }}
          >
            APP THEME
          </Text>
          <Text
            className="text-3xs mt-1 tracking-wide-sm font-mono"
            style={{ color: palette.textSecondary }}
          >
            Switch between Light mode and Dark mode.
          </Text>

          <View className="mt-4 flex-row items-center justify-between">
            <Text
              className="text-2xs tracking-wide-md font-mono"
              style={{ color: palette.textSecondary }}
            >
              {isLight ? "LIGHT MODE" : "DARK MODE"}
            </Text>

            <Pressable
              onPress={() => {
                void toggleMode();
              }}
              className="w-[52px] h-[30px] rounded-full px-1 justify-center"
              style={{ backgroundColor: isLight ? "#4caf7d" : palette.border }}
            >
              <View
                className="w-[22px] h-[22px] rounded-full"
                style={{
                  alignSelf: isLight ? "flex-end" : "flex-start",
                  backgroundColor: isLight ? "#f4fff7" : "#f5f5f0",
                }}
              />
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={{ alignItems: "center" }}
          >
            <Text className={s.saveBtn + " text-center"}>
              {isSaving ? "SAVING..." : "SAVE CHANGES"}
            </Text>
          </Pressable>

          {saved && <Text className={s.savedConfirm}>{"✓ CHANGES SAVED"}</Text>}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
