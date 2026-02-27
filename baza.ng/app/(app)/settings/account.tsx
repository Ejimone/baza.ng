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
import * as userService from "../../../services/user";
import { useAuthStore } from "../../../stores/authStore";
import { accountSettingsScreen as s } from "../../../styles/index";

export default function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((st) => st.user);
  const updateUser = useAuthStore((st) => st.updateUser);

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
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>{"← PROFILE"}</Text>
        </Pressable>
        <Text className={s.headerLabel}>ACCOUNT</Text>
        <Text className={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        className={s.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className={s.fieldLabel}>FULL NAME</Text>
        <TextInput
          className={s.fieldInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#2a4a2a"
          autoCapitalize="words"
        />

        <Text className={s.fieldLabel}>EMAIL ADDRESS</Text>
        <TextInput
          className={s.fieldInput}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#2a4a2a"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text className={s.emailHint}>
          Used for receipts and account recovery.
        </Text>

        <Text className={`${s.fieldLabel} mt-4`}>PHONE NUMBER</Text>
        <TextInput
          className={s.fieldInput}
          value={user?.phone ?? ""}
          editable={false}
          style={{ opacity: 0.5 }}
        />
        <Text className={s.phoneHint}>
          Phone number cannot be changed here. Contact support to update.
        </Text>

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
