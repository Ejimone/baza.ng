import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as userService from "../../../services/user";
import { deliveryAddressScreen as s } from "../../../styles/index";
import { colors } from "../../../constants/theme";
import type { Address } from "../../../types";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function DeliveryAddressScreen() {
  const router = useRouter();
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
        <LoadingSpinner message="LOADING ADDRESSES" color={colors.accent.blue} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-[#070a0c]">
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>{"← PROFILE"}</Text>
        </Pressable>
        <Text className={s.title}>Delivery Address</Text>
        <Text className={s.subtitle}>WHERE SHOULD WE BRING YOUR ORDER?</Text>
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
          >
            <View className={s.addressHeader}>
              <View className={s.addressIconRow}>
                <Text className={s.addressIcon}>
                  {addr.label?.toLowerCase().includes("home") ? "🏠" : "🏢"}
                </Text>
                <Text className={s.addressLabel}>{addr.label}</Text>
              </View>
              {addr.isDefault ? (
                <Text className={s.defaultBadge}>DEFAULT</Text>
              ) : (
                <Pressable onPress={() => handleSetDefault(addr.id)}>
                  <Text className={s.setDefaultBtn}>SET DEFAULT</Text>
                </Pressable>
              )}
            </View>
            <Text className={s.addressText}>{addr.address}</Text>
            {addr.landmark && (
              <Text className={s.addressLandmark}>
                {"📍 "}{addr.landmark}
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
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowForm(false)}
          />
          <View className={s.formSheet}>
            <View className={s.formHandle} />
            <Text className={s.formLabel}>NEW ADDRESS</Text>
            <Text className={s.formTitle}>Where to?</Text>

            <Text className={s.formFieldLabel}>LABEL (e.g. Home, Office)</Text>
            <TextInput
              className={s.formInput}
              placeholder="Home"
              placeholderTextColor="#3a5a7a"
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <Text className={s.formFieldLabel}>FULL ADDRESS</Text>
            <TextInput
              className={s.formInput}
              placeholder="14 Akin Adesola Street, VI"
              placeholderTextColor="#3a5a7a"
              value={newAddr}
              onChangeText={setNewAddr}
            />

            <Text className={s.formFieldLabel}>LANDMARK (optional)</Text>
            <TextInput
              className={s.formInput}
              placeholder="Near Access Bank"
              placeholderTextColor="#3a5a7a"
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
              <Text className={s.formCancelBtn} style={{ textAlign: "center" }}>
                CANCEL
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}
