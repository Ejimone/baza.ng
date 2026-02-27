import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import ModeCard from "../../components/cards/ModeCard";
import Header from "../../components/layout/Header";
import FloatingCart from "../../components/ui/FloatingCart";
import { colors } from "../../constants/theme";
import { useOrders } from "../../hooks/useOrders";
import { useWallet } from "../../hooks/useWallet";
import { useAuthStore } from "../../stores/authStore";
import { intentGateBalance as s } from "../../styles";
import { SHOPPING_MODES } from "../../utils/constants";
import { formatPrice, getGreeting } from "../../utils/format";

export default function IntentGateScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { refreshBalance } = useWallet();
  const { orders, fetchOrders, isLoading: isLoadingOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] ?? "";

  const activeOrder = orders.find(
    (o) =>
      o.status === "PENDING" ||
      o.status === "CONFIRMED" ||
      o.status === "PREPARING" ||
      o.status === "DISPATCHED",
  );

  useEffect(() => {
    refreshBalance();
    fetchOrders(1, 5);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchOrders(1, 5)]);
    setRefreshing(false);
  }, [refreshBalance, fetchOrders]);

  const [showTopUp, setShowTopUp] = useState(false);

  return (
    <View className={s.container}>
      <Header onTopUpPress={() => setShowTopUp(true)} />

      <View className={s.greeting}>
        <Text className={s.greetingTime}>
          {greeting.toUpperCase().replace(" ", "  ")}
        </Text>
        <Text className={s.greetingTitle}>What are we{"\n"}doing today?</Text>
      </View>

      <ScrollView
        className={s.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.green}
          />
        }
      >
        {activeOrder && (
          <Pressable
            className={s.orderCard}
            onPress={() =>
              router.push(`/(app)/orders/${activeOrder.id}` as any)
            }
          >
            <View className={s.orderIcon}>
              <Text style={{ fontSize: 16 }}>📦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text className={s.orderLabel}>ACTIVE ORDER</Text>
              <Text className={s.orderTitle}>
                {activeOrder.items
                  .slice(0, 2)
                  .map((i) => `${i.emoji} ${i.name}`)
                  .join(", ")}
                {activeOrder.items.length > 2
                  ? ` +${activeOrder.items.length - 2}`
                  : ""}
              </Text>
              {activeOrder.eta && (
                <Text className={s.orderEta}>{activeOrder.eta}</Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                className={s.orderStatus}
                style={{
                  color:
                    colors.status[
                      activeOrder.status as keyof typeof colors.status
                    ] ?? colors.accent.amber,
                }}
              >
                {activeOrder.status}
              </Text>
              <Text className={s.orderView}>View →</Text>
            </View>
          </Pressable>
        )}

        <View className={s.modeList}>
          {SHOPPING_MODES.map((mode) => (
            <ModeCard key={mode.key} mode={mode} />
          ))}
        </View>
      </ScrollView>

      <FloatingCart />

      {showTopUp && <TopUpSheet onClose={() => setShowTopUp(false)} />}
    </View>
  );
}

function TopUpSheet({ onClose }: { onClose: () => void }) {
  const {
    accountNumber,
    bankName,
    accountName,
    initTopup,
    verifyTopup,
    refreshBalance,
  } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  const quickAmounts = [500000, 1000000, 2000000, 5000000];

  const customAmountKobo = Math.round(parseFloat(customAmount || "0") * 100);
  const isValidCustom = isCustom && customAmountKobo >= 10000; // min ₦100
  const effectiveAmount = isCustom
    ? isValidCustom
      ? customAmountKobo
      : null
    : selectedAmount;
  const canConfirm = effectiveAmount !== null && effectiveAmount > 0;

  const handleSelectQuick = (amt: number) => {
    setSelectedAmount(amt);
    setIsCustom(false);
    setCustomAmount(String(amt / 100));
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleCustomChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setCustomAmount(sanitized);
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleConfirm = async () => {
    if (!effectiveAmount) return;
    setIsProcessing(true);
    try {
      const { authorizationUrl, reference } = await initTopup(effectiveAmount);
      await WebBrowser.openBrowserAsync(authorizationUrl, {
        dismissButtonStyle: "close",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      });
      const result = await verifyTopup(reference);
      if (result.status === "success") {
        await refreshBalance();
      } else {
        Alert.alert("Top-up Pending", "Your balance will update shortly.");
        await refreshBalance();
      }
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Top-up Failed",
        err.response?.data?.error ?? "Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const height = event.endCoordinates?.height ?? 0;
      Animated.timing(keyboardTranslateY, {
        toValue: -height,
        duration: event.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: event?.duration ?? 220,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardTranslateY]);

  return (
    <View className={s.topUpSheet}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <Animated.View
        style={{ transform: [{ translateY: keyboardTranslateY }] }}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0 }}
        >
          <View className={s.topUpSheetInner}>
            <View className={s.topUpHandle} />
            <Text className={s.topUpLabel}>FUND YOUR WALLET</Text>
            <Text className={s.topUpTitle}>How much?</Text>

            <View className={s.topUpGrid}>
              {quickAmounts.map((amount) => (
                <Pressable
                  key={amount}
                  style={{
                    width: "48%",
                    paddingVertical: 13,
                    alignItems: "center",
                    backgroundColor:
                      selectedAmount === amount ? "#4caf7d18" : "transparent",
                    borderWidth: 1,
                    borderColor:
                      selectedAmount === amount ? "#4caf7d66" : "#1a2a1c",
                  }}
                  onPress={() => handleSelectQuick(amount)}
                >
                  <Text
                    style={{
                      color: selectedAmount === amount ? "#4caf7d" : "#5a8a5a",
                      fontFamily: "NotoSerif_400Regular",
                      fontSize: 13,
                    }}
                  >
                    {formatPrice(amount)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className={s.topUpCustomLabel}>OR ENTER CUSTOM AMOUNT</Text>
            <View
              className={`${s.topUpCustomRow} ${isCustom ? s.topUpCustomRowActive : ""}`}
            >
              <Text className={s.topUpCustomPrefix}>₦</Text>
              <TextInput
                className={s.topUpCustomInput}
                placeholder="e.g. 2500"
                placeholderTextColor="#2a4a2a"
                keyboardType="decimal-pad"
                value={customAmount}
                onFocus={handleCustomFocus}
                onChangeText={handleCustomChange}
                selectionColor="#4caf7d"
              />
            </View>

            {accountNumber && (
              <View className={s.topUpAcctBox}>
                <Text className={s.topUpAcctLabel}>OR TRANSFER TO</Text>
                <Text className={s.topUpAcctNumber}>{accountNumber}</Text>
                <Text className={s.topUpAcctBank}>
                  {bankName ?? "Providus Bank"} · {accountName ?? "Baza NG Ltd"}
                </Text>
              </View>
            )}

            <Pressable
              className={s.topUpConfirmBtn}
              style={{
                backgroundColor: canConfirm ? "#4caf7d" : "#1a2a1c",
                alignItems: "center",
              }}
              onPress={handleConfirm}
              disabled={!canConfirm || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text
                  style={{
                    color: canConfirm ? "#000" : "#2a3a2a",
                    textAlign: "center",
                    fontFamily: "NotoSerif_400Regular",
                    fontSize: 11,
                    fontWeight: "bold",
                    letterSpacing: 2,
                  }}
                >
                  {canConfirm
                    ? `CONFIRM ${formatPrice(effectiveAmount!)}`
                    : "SELECT AMOUNT"}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={onClose}>
              <Text
                className={s.topUpCancelBtn}
                style={{ textAlign: "center" }}
              >
                CANCEL
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
