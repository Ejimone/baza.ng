import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import PhoneCaptureSheet from "../../components/checkout/PhoneCaptureSheet";
import AddMoreItemsSheet from "../../components/ui/AddMoreItemsSheet";
import FundPrompt from "../../components/ui/FundPrompt";
import InsufficientFundsSheet from "../../components/ui/InsufficientFundsSheet";
import PaymentMethodSelector from "../../components/ui/PaymentMethodSelector";
import PaystackInline from "../../components/ui/PaystackInline";
import { getThemePalette } from "../../constants/appTheme";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { useWallet } from "../../hooks/useWallet";
import {
    cartItemsToOrderItems,
    initDirectCheckout,
} from "../../services/orders";
import * as userService from "../../services/user";
import { useThemeStore } from "../../stores/themeStore";
import { useWalletStore } from "../../stores/walletStore";
import { addMoreButton, cartScreen as s } from "../../styles";
import type { Address, PaymentMethod } from "../../types";
import { formatPrice } from "../../utils/format";

export default function CartScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const { items, total, formattedTotal, isEmpty, error: cartError, removeItem, clear, fetchCart } =
    useCart();
  const { balance, formattedBalance } = useWallet();
  const { createOrder, verifyPayment, isLoading } = useOrders();
  const { user } = useAuth();

  const [done, setDone] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [showInsufficientSheet, setShowInsufficientSheet] = useState(false);
  const [showPhoneCapture, setShowPhoneCapture] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [eta, setEta] = useState("");
  const [showAddMore, setShowAddMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Paystack Inline state
  const [showPaystack, setShowPaystack] = useState(false);
  const [paystackKey, setPaystackKey] = useState("");
  const [paystackRef, setPaystackRef] = useState("");
  const [paystackEmail, setPaystackEmail] = useState("");

  const hasFunds = balance >= total;
  const shortfall = total - balance;

  const defaultAddressId =
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
  const effectiveAddressId = selectedAddressId ?? defaultAddressId;

  const fetchAddresses = useCallback(async () => {
    try {
      const { addresses: addrs } = await userService.getAddresses();
      setAddresses(addrs);
      setSelectedAddressId((prev) => {
        if (prev && addrs.some((a) => a.id === prev)) return prev;
        const defaultId = addrs.find((a) => a.isDefault)?.id ?? addrs[0]?.id;
        return defaultId ?? null;
      });
    } catch {
      // Ignore — user may not have addresses yet
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!isEmpty) fetchAddresses();
  }, [isEmpty, fetchAddresses]);

  useFocusEffect(
    useCallback(() => {
      if (!isEmpty) fetchAddresses();
    }, [isEmpty, fetchAddresses]),
  );

  const handleWalletCheckout = async () => {
    try {
      const payload = {
        items: cartItemsToOrderItems(items),
        total,
        note: orderNote.trim() || undefined,
        paymentMethod: "wallet" as const,
        addressId: effectiveAddressId!,
      };

      const result = await createOrder(payload);
      useWalletStore.getState().setBalance(result.walletBalance);
      setEta(result.order.eta ?? "Tomorrow by 10am");
      await clear();
      setDone(true);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.error ?? "Failed to place order";

      if (code === "INSUFFICIENT_BALANCE") {
        setShowInsufficientSheet(true);
      } else if (code === "PHONE_REQUIRED") {
        setShowPhoneCapture(true);
      } else if (code === "ADDRESS_REQUIRED" || code === "ADDRESS_NOT_FOUND") {
        Alert.alert(
          "Address Required",
          "Please add a delivery address before placing your order.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add Address",
              onPress: () =>
                router.push("/(app)/settings/address" as any),
            },
          ],
        );
      } else {
        Alert.alert("Order Failed", message);
      }
    }
  };

  const handleCardCheckout = async () => {
    try {
      // 1. Initialise direct checkout (no order is created yet)
      const payload = {
        items: cartItemsToOrderItems(items),
        total,
        note: orderNote.trim() || undefined,
        paymentMethod: "paystack_direct" as const,
        addressId: effectiveAddressId!,
      };

      const result = await initDirectCheckout(payload);
      const email = user?.email || `${user?.phone ?? "customer"}@baza.ng`;
      const ref = result.reference;

      // 2. Show Paystack Inline modal
      setPaystackKey(result.publicKey);
      setPaystackRef(ref);
      setPaystackEmail(email);
      setShowPaystack(true);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.error ?? "Failed to initialise payment";

      if (code === "PHONE_REQUIRED") {
        setShowPhoneCapture(true);
      } else if (code === "ADDRESS_REQUIRED" || code === "ADDRESS_NOT_FOUND") {
        Alert.alert(
          "Address Required",
          "Please add a delivery address before placing your order.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add Address",
              onPress: () =>
                router.push("/(app)/settings/address" as any),
            },
          ],
        );
      } else {
        Alert.alert("Order Failed", message);
      }
    }
  };

  const handlePaystackSuccess = async (data: {
    reference: string;
    message: string;
  }) => {
    setShowPaystack(false);
    try {
      const verifyResult = await verifyPayment(data.reference);
      if (verifyResult.status === "success") {
        setEta(verifyResult.order.eta ?? "Tomorrow by 10am");
        await clear();
        setDone(true);
      } else {
        Alert.alert(
          "Payment Pending",
          "Your payment is still being verified. Your order will be confirmed shortly.",
        );
      }
    } catch {
      Alert.alert(
        "Verification Pending",
        "We could not verify your payment right now. If you completed the payment, your order will be confirmed automatically.",
      );
    }
  };

  const handlePaystackCancel = () => {
    setShowPaystack(false);
    Alert.alert(
      "Payment Cancelled",
      "No order was created. You can retry checkout whenever you're ready.",
    );
  };

  const handlePaystackError = (message: string) => {
    setShowPaystack(false);
    Alert.alert("Payment Error", message || "Unable to complete payment");
  };

  const handleCheckout = async () => {
    // Prerequisite: phone number
    if (!user?.phone?.trim()) {
      setShowPhoneCapture(true);
      return;
    }

    // Prerequisite: at least one address
    if (addresses.length === 0) {
      Alert.alert(
        "Address Required",
        "Please add a delivery address before placing your order.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Address",
            onPress: () => router.push("/(app)/settings/address" as any),
          },
        ],
      );
      return;
    }

    // Prerequisite: address selected (effectiveAddressId is set from default or selection)
    if (!effectiveAddressId) {
      Alert.alert(
        "Select Address",
        "Please select a delivery address before placing your order.",
      );
      return;
    }

    if (paymentMethod === "paystack") {
      await handleCardCheckout();
      return;
    }

    // Wallet flow
    if (!hasFunds) {
      setShowInsufficientSheet(true);
      return;
    }

    await handleWalletCheckout();
  };

  const handleInsufficientPayWithCard = () => {
    setShowInsufficientSheet(false);
    setPaymentMethod("paystack");
    // Trigger card checkout after state update
    setTimeout(() => handleCardCheckout(), 100);
  };

  const handleInsufficientFundWallet = () => {
    setShowInsufficientSheet(false);
    setShowFund(true);
  };

  const handleFunded = () => {
    setShowFund(false);
  };

  if (done) {
    return (
      <View
        className={s.container}
        style={{ backgroundColor: palette.background }}
      >
        <View
          className={s.header}
          style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}
        >
          <Text className={s.title} style={{ color: palette.textPrimary }}>
            Cart
          </Text>
        </View>
        <View className={s.confirmDone}>
          <Text className={s.confirmIcon}>✓</Text>
          <Text className={s.confirmLabel}>ORDER CONFIRMED</Text>
          <Text
            className={s.confirmEta}
            style={{ color: palette.textSecondary }}
          >
            {eta ? eta.toUpperCase() : "ARRIVING TOMORROW BY 10AM"}
          </Text>
          <Pressable
            className={s.confirmBackBtn}
            style={{ borderColor: palette.border }}
            onPress={() => router.replace("/(app)" as any)}
          >
            <Text className="text-baza-green text-xxs tracking-wide-lg font-mono">
              BACK TO HOME
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className={s.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <View
        className={s.header}
        style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            ← BACK
          </Text>
        </Pressable>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Cart
        </Text>
      </View>

      {!isEmpty && (
        <View
          className={`${s.balanceBar} ${hasFunds ? s.balanceBarOk : s.balanceBarLow}`}
          style={{
            backgroundColor: hasFunds ? "#4caf7d12" : "#e85c3a12",
            borderColor: hasFunds ? "#4caf7d44" : "#e85c3a44",
            borderWidth: 1,
          }}
        >
          <View>
            <Text
              className={hasFunds ? s.balanceLabelOk : s.balanceLabelLow}
              style={{ color: hasFunds ? "#4caf7d" : "#e85c3a" }}
            >
              WALLET BALANCE
            </Text>
            <Text
              className={hasFunds ? s.balanceAmountOk : s.balanceAmountLow}
              style={{ color: hasFunds ? "#4caf7d" : "#e85c3a" }}
            >
              {formattedBalance}
            </Text>
          </View>
          {!hasFunds && (
            <Pressable
              className={s.topUpBtn}
              style={{ borderColor: "#e85c3a66" }}
              onPress={() => setShowFund(true)}
            >
              <Text className="text-baza-red text-3xs tracking-wide-lg font-mono">
                TOP UP
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {cartError ? (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            padding: 12,
            backgroundColor: "#e85c3a18",
            borderWidth: 1,
            borderColor: "#e85c3a66",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ flex: 1, fontSize: 11, color: "#e85c3a" }}>
            {cartError}
          </Text>
          <Pressable onPress={() => void fetchCart()} style={{ padding: 8 }}>
            <Text style={{ fontSize: 10, color: "#e85c3a", fontWeight: "600" }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        className={s.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {isEmpty ? (
          <Text
            className={s.emptyText}
            style={{ color: palette.textSecondary }}
          >
            CART IS EMPTY
          </Text>
        ) : (
          <>
            {items.map((item, index) => (
              <View
                key={item.id ?? `cart-item-${index}`}
                className={s.itemRow}
                style={{ borderBottomColor: palette.border }}
              >
                <Text className={s.itemEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    className={s.itemName}
                    style={{ color: palette.textPrimary }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className={s.itemType}
                    style={{ color: palette.textSecondary }}
                  >
                    {item.itemType}
                    {item.qty > 1 ? ` × ${item.qty}` : ""}
                  </Text>
                </View>
                <View className={s.itemRight}>
                  <Text
                    className={s.itemPrice}
                    style={{ color: palette.textPrimary }}
                  >
                    {formatPrice(item.totalPrice)}
                  </Text>
                  <Pressable onPress={() => void removeItem(item.id)}>
                    <Text
                      className={s.itemRemoveBtn}
                      style={{ color: palette.textSecondary }}
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Pressable
              className={addMoreButton.wrapper}
              style={{ borderColor: "#4caf7d55" }}
              onPress={() => setShowAddMore(true)}
            >
              <Text className={addMoreButton.text} style={{ color: "#4caf7d" }}>
                + ADD MORE ITEMS
              </Text>
            </Pressable>
          </>
        )}

        {!isEmpty && (
          <View className={s.footer}>
            <View className={s.subtotalRow}>
              <Text
                className="text-3xs tracking-wide-lg font-mono"
                style={{ color: palette.textSecondary }}
              >
                SUBTOTAL
              </Text>
              <Text
                className={s.subtotalValue}
                style={{ color: palette.textPrimary }}
              >
                {formattedTotal}
              </Text>
            </View>
            <View className={s.deliveryRow}>
              <Text
                className="text-3xs tracking-wide-lg font-mono"
                style={{ color: palette.textSecondary }}
              >
                DELIVERY
              </Text>
              <Text className={s.deliveryValue}>FREE</Text>
            </View>

            <View className={s.addressSection}>
              <Text
                className={s.addressLabel}
                style={{ color: palette.textSecondary }}
              >
                DELIVERY ADDRESS
              </Text>
              {addresses.length === 0 ? (
                <Pressable
                  className={s.addressAddBtn}
                  style={{ borderColor: palette.border }}
                  onPress={() =>
                    router.push("/(app)/settings/address" as any)
                  }
                >
                  <Text
                    className="text-baza-green text-3xs tracking-wide-lg font-mono text-center"
                    style={{ color: "#4caf7d" }}
                  >
                    + ADD DELIVERY ADDRESS
                  </Text>
                </Pressable>
              ) : (
                <>
                  {addresses.map((addr) => (
                    <Pressable
                      key={addr.id}
                      className={`${s.addressCard} ${
                        effectiveAddressId === addr.id
                          ? s.addressCardSelected
                          : ""
                      }`}
                      style={{
                        borderColor:
                          effectiveAddressId === addr.id
                            ? "#4caf7d"
                            : palette.border,
                        backgroundColor:
                          effectiveAddressId === addr.id
                            ? "#4caf7d12"
                            : palette.card,
                      }}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <Text
                        className={s.addressCardText}
                        style={{ color: palette.textPrimary }}
                      >
                        {addr.label}: {addr.address}
                        {addr.landmark ? ` · ${addr.landmark}` : ""}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() =>
                      router.push("/(app)/settings/address" as any)
                    }
                  >
                    <Text
                      className="text-3xs text-baza-green tracking-wide-md font-mono mt-2"
                      style={{ color: "#4caf7d" }}
                    >
                      + ADD ANOTHER ADDRESS
                    </Text>
                  </Pressable>
                </>
              )}
            </View>

            <View className={s.noteSection}>
              <Text
                className={s.noteLabel}
                style={{ color: palette.textSecondary }}
              >
                NOTE FOR RIDER / KITCHEN{" "}
                <Text
                  className={s.noteOptional}
                  style={{ color: palette.textSecondary }}
                >
                  (OPTIONAL)
                </Text>
              </Text>
              <TextInput
                className={s.noteInput}
                style={{
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                  borderWidth: 1,
                  color: palette.textPrimary,
                }}
                value={orderNote}
                onChangeText={setOrderNote}
                placeholder="e.g. Leave at gate, call on arrival, no pepper..."
                placeholderTextColor={palette.textSecondary}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              walletBalance={balance}
              total={total}
            />

            <Pressable
              className={`${s.confirmBtn} ${
                paymentMethod === "paystack"
                  ? s.confirmBtnCard
                  : hasFunds
                    ? s.confirmBtnOk
                    : s.confirmBtnLow
              }`}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text className="text-black text-[11px] tracking-wide-2xl font-mono font-bold text-center">
                  {paymentMethod === "paystack"
                    ? `PAY ${formattedTotal} WITH CARD`
                    : hasFunds
                      ? "CONFIRM ORDER"
                      : `FUND WALLET · NEED ${formatPrice(shortfall)} MORE`}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      <AddMoreItemsSheet
        visible={showAddMore}
        onClose={() => setShowAddMore(false)}
      />

      {showFund && (
        <FundPrompt
          shortfall={shortfall}
          onDismiss={() => setShowFund(false)}
          onFunded={handleFunded}
        />
      )}

      <InsufficientFundsSheet
        visible={showInsufficientSheet}
        shortfall={shortfall}
        onPayWithCard={handleInsufficientPayWithCard}
        onFundWallet={handleInsufficientFundWallet}
        onDismiss={() => setShowInsufficientSheet(false)}
      />

      <PhoneCaptureSheet
        visible={showPhoneCapture}
        onDismiss={() => setShowPhoneCapture(false)}
      />

      <PaystackInline
        visible={showPaystack}
        publicKey={paystackKey}
        email={paystackEmail}
        amount={total}
        reference={paystackRef}
        metadata={{ purpose: "order_payment_direct" }}
        onSuccess={handlePaystackSuccess}
        onCancel={handlePaystackCancel}
        onError={handlePaystackError}
      />
    </KeyboardAvoidingView>
  );
}
