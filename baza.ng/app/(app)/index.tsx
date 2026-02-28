import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import SearchBar from "../../components/ui/SearchBar";
import { colors } from "../../constants/theme";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
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
  const {
    bundles,
    mealPacks,
    readyEat,
    snacks,
    restockItems,
    fetchBundles,
    fetchMealPacks,
    fetchReadyEat,
    fetchSnacks,
    fetchRestock,
  } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

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
    fetchBundles();
    fetchMealPacks();
    fetchReadyEat();
    fetchSnacks();
    fetchRestock();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchOrders(1, 5)]);
    setRefreshing(false);
  }, [refreshBalance, fetchOrders]);

  const [showTopUp, setShowTopUp] = useState(false);

  const universalResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: Array<{
      key: string;
      title: string;
      subtitle: string;
      emoji: string;
      type:
        | "bundle"
        | "mealpack"
        | "ingredient"
        | "readyeat"
        | "snack"
        | "restock";
      targetId?: string;
    }> = [];
    const seen = new Set<string>();

    const addResult = (item: {
      key: string;
      title: string;
      subtitle: string;
      emoji: string;
      type:
        | "bundle"
        | "mealpack"
        | "ingredient"
        | "readyeat"
        | "snack"
        | "restock";
      targetId?: string;
    }) => {
      if (seen.has(item.key)) return;
      seen.add(item.key);
      results.push(item);
    };

    bundles.forEach((bundle) => {
      const haystack = [bundle.name, bundle.description, ...(bundle.tags ?? [])]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `bundle:${bundle.id}`,
          title: bundle.name,
          subtitle: "Bundle",
          emoji: bundle.emoji,
          type: "bundle",
          targetId: bundle.id,
        });
      }

      bundle.items.forEach((item) => {
        const itemHaystack = item.name.toLowerCase();
        if (itemHaystack.includes(q)) {
          addResult({
            key: `bundle-item:${bundle.id}:${item.id}`,
            title: item.name,
            subtitle: `In bundle · ${bundle.name}`,
            emoji: item.emoji,
            type: "bundle",
            targetId: bundle.id,
          });
        }
      });
    });

    mealPacks.forEach((pack) => {
      const haystack = [pack.name, pack.description].join(" ").toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `mealpack:${pack.id}`,
          title: pack.name,
          subtitle: "Meal pack",
          emoji: pack.emoji,
          type: "mealpack",
          targetId: pack.id,
        });
      }

      pack.ingredients.forEach((ingredient) => {
        if (ingredient.name.toLowerCase().includes(q)) {
          addResult({
            key: `ingredient:${pack.id}:${ingredient.name}`,
            title: ingredient.name,
            subtitle: `Ingredient · ${pack.name}`,
            emoji: ingredient.emoji,
            type: "ingredient",
            targetId: pack.id,
          });
        }
      });
    });

    readyEat.forEach((item) => {
      const haystack = [
        item.name,
        item.kitchen,
        item.description,
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `readyeat:${item.id}`,
          title: item.name,
          subtitle: `Ready to Eat · ${item.kitchen}`,
          emoji: item.emoji,
          type: "readyeat",
          targetId: item.id,
        });
      }
    });

    snacks.forEach((item) => {
      const haystack = [item.name, item.category, item.tag]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `snack:${item.id}`,
          title: item.name,
          subtitle: `Snacks & Drinks · ${item.category}`,
          emoji: item.emoji,
          type: "snack",
          targetId: item.id,
        });
      }
    });

    restockItems.forEach((item) => {
      const haystack = [item.name, item.brand, item.category]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `restock:${item.id}`,
          title: item.name,
          subtitle: `Product · ${item.brand}`,
          emoji: item.emoji,
          type: "restock",
          targetId: item.id,
        });
      }
    });

    return results.slice(0, 12);
  }, [globalQuery, bundles, mealPacks, readyEat, snacks, restockItems]);

  const handleUniversalSelect = (result: {
    type:
      | "bundle"
      | "mealpack"
      | "ingredient"
      | "readyeat"
      | "snack"
      | "restock";
    targetId?: string;
  }) => {
    if (result.type === "bundle" && result.targetId) {
      router.push(`/(app)/modes/stockup/${result.targetId}` as any);
    } else if (
      (result.type === "mealpack" || result.type === "ingredient") &&
      result.targetId
    ) {
      router.push(`/(app)/modes/cookmeal/${result.targetId}` as any);
    } else if (result.type === "readyeat") {
      router.push("/(app)/modes/readyeat" as any);
    } else if (result.type === "snack") {
      router.push("/(app)/modes/snacks" as any);
    } else if (result.type === "restock") {
      router.push("/(app)/modes/shoplist" as any);
    }
    setGlobalQuery("");
  };

  return (
    <View className={s.container}>
      <Header onTopUpPress={() => setShowTopUp(true)} />

      <View className={s.greeting}>
        <Text className={s.greetingTime}>
          {greeting.toUpperCase().replace(" ", "  ")}
        </Text>
        <Text className={s.greetingTitle} style={{ marginBottom: 12 }}>
          What do you want?
        </Text>

        <View style={{ position: "relative", zIndex: 50 }}>
          <SearchBar
            value={globalQuery}
            onChangeText={setGlobalQuery}
            placeholder="Search bundles, packs, ingredients, products..."
            autoFocus={false}
            variant="universal"
          />

          {globalQuery.trim().length >= 2 && (
            <View
              style={{
                position: "absolute",
                top: 58,
                left: 0,
                right: 0,
                borderWidth: 1,
                borderColor: "#1a2a1c",
                backgroundColor: "#0d1a0f",
                zIndex: 60,
                maxHeight: 260,
              }}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {universalResults.length === 0 ? (
                  <Text
                    style={{
                      color: "#2a4a2a",
                      fontSize: 10,
                      letterSpacing: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      fontFamily: "NotoSerif_400Regular",
                    }}
                  >
                    NO RESULTS FOUND
                  </Text>
                ) : (
                  universalResults.map((result) => (
                    <Pressable
                      key={result.key}
                      onPress={() => handleUniversalSelect(result)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#1a2a1c",
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{result.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#f5f5f0",
                            fontSize: 13,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {result.title}
                        </Text>
                        <Text
                          style={{
                            color: "#3a5c3a",
                            fontSize: 10,
                            letterSpacing: 1,
                            marginTop: 2,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {result.subtitle}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
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
