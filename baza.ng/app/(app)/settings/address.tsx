import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import * as userService from "../../../services/user";
import { useThemeStore } from "../../../stores/themeStore";
import { deliveryAddressScreen as s } from "../../../styles/index";
import type { Address } from "../../../types";

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await userService.getAddresses();
      setAddresses(data.addresses);
    } catch {
      Alert.alert("Error", "Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    } catch {
      Alert.alert("Error", "Failed to set default address.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await userService.deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete address.");
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!newAddr.trim()) return;
    setIsSaving(true);
    try {
      const created = await userService.createAddress({
        label: newLabel.trim() || "New Address",
        address: newAddr.trim(),
        landmark: newLandmark.trim() || undefined,
      });
      setAddresses((prev) => [...prev, created]);
      setNewLabel("");
      setNewAddr("");
      setNewLandmark("");
      setShowForm(false);
    } catch {
      Alert.alert("Error", "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-[#070a0c]">
        <LoadingSpinner
          message="LOADING ADDRESSES"
          color={colors.accent.blue}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-[#070a0c]">
      <View className={s.header} style={{ borderBottomColor: palette.border }}>
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← PROFILE"}
          </Text>
        </Pressable>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Delivery Address
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          WHERE SHOULD WE BRING YOUR ORDER?
        </Text>
      </View>

      <ScrollView
        className={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
      >
        {addresses.map((addr) => (
          <Pressable
            key={addr.id}
            onLongPress={() => handleDelete(addr.id)}
            className={`${s.addressCard} ${
              addr.isDefault ? s.addressCardDefault : s.addressCardNormal
            }`}
            style={
              addr.isDefault
                ? undefined
                : { backgroundColor: palette.card, borderColor: palette.border }
            }
          >
            <View className={s.addressHeader}>
              <View className={s.addressIconRow}>
                <Text className={s.addressIcon}>
                  {addr.label?.toLowerCase().includes("home") ? "🏠" : "🏢"}
                </Text>
                <Text
                  className={s.addressLabel}
                  style={{ color: palette.textPrimary }}
                >
                  {addr.label}
                </Text>
              </View>
              {addr.isDefault ? (
                <Text className={s.defaultBadge}>DEFAULT</Text>
              ) : (
                <Pressable onPress={() => handleSetDefault(addr.id)}>
                  <Text
                    className={s.setDefaultBtn}
                    style={{ color: palette.textSecondary }}
                  >
                    SET DEFAULT
                  </Text>
                </Pressable>
              )}
            </View>
            <Text
              className={s.addressText}
              style={{ color: palette.textPrimary }}
            >
              {addr.address}
            </Text>
            {addr.landmark && (
              <Text
                className={s.addressLandmark}
                style={{ color: palette.textSecondary }}
              >
                {"📍 "}
                {addr.landmark}
              </Text>
            )}
          </Pressable>
        ))}

        <Pressable onPress={() => setShowForm(true)}>
          <Text className={s.addNewBtn} style={{ textAlign: "center" }}>
            + ADD NEW ADDRESS
          </Text>
        </Pressable>
      </ScrollView>

      {/* Add Address Form Sheet */}
      {showForm && (
        <View className={s.formOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowForm(false)} />
          <View
            className={s.formSheet}
            style={{
              backgroundColor: palette.background,
              borderTopColor: palette.border,
            }}
          >
            <View
              className={s.formHandle}
              style={{ backgroundColor: palette.border }}
            />
            <Text
              className={s.formLabel}
              style={{ color: palette.textSecondary }}
            >
              NEW ADDRESS
            </Text>
            <Text
              className={s.formTitle}
              style={{ color: palette.textPrimary }}
            >
              Where to?
            </Text>

            <Text
              className={s.formFieldLabel}
              style={{ color: palette.textSecondary }}
            >
              LABEL (e.g. Home, Office)
            </Text>
            <TextInput
              className={s.formInput}
              placeholder="Home"
              placeholderTextColor={palette.textSecondary}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                color: palette.textPrimary,
              }}
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <Text
              className={s.formFieldLabel}
              style={{ color: palette.textSecondary }}
            >
              FULL ADDRESS
            </Text>
            <TextInput
              className={s.formInput}
              placeholder="14 Akin Adesola Street, VI"
              placeholderTextColor={palette.textSecondary}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                color: palette.textPrimary,
              }}
              value={newAddr}
              onChangeText={setNewAddr}
            />

            <Text
              className={s.formFieldLabel}
              style={{ color: palette.textSecondary }}
            >
              LANDMARK (optional)
            </Text>
            <TextInput
              className={s.formInput}
              placeholder="Near Access Bank"
              placeholderTextColor={palette.textSecondary}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                color: palette.textPrimary,
              }}
              value={newLandmark}
              onChangeText={setNewLandmark}
            />

            <Pressable
              onPress={handleSave}
              disabled={isSaving || !newAddr.trim()}
              style={{ alignItems: "center" }}
            >
              <Text className={s.formSaveBtn}>
                {isSaving ? "SAVING..." : "SAVE ADDRESS"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowForm(false)}>
              <Text
                className={s.formCancelBtn}
                style={{ textAlign: "center", color: palette.textSecondary }}
              >
                CANCEL
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}
