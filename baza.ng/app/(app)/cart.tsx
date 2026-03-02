import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useThemeStore } from "../../stores/themeStore";
import { useWalletStore } from "../../stores/walletStore";
import { addMoreButton, cartScreen as s } from "../../styles";
import type { PaymentMethod } from "../../types";
import { formatPrice } from "../../utils/format";

export default function CartScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const { items, total, formattedTotal, isEmpty, removeItem, clear } =
    useCart();
  const { balance, formattedBalance } = useWallet();
  const { createOrder, verifyPayment, isLoading } = useOrders();
  const { user } = useAuth();

  const [done, setDone] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [showInsufficientSheet, setShowInsufficientSheet] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [eta, setEta] = useState("");
  const [showAddMore, setShowAddMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

  // Paystack Inline state
  const [showPaystack, setShowPaystack] = useState(false);
  const [paystackKey, setPaystackKey] = useState("");
  const [paystackRef, setPaystackRef] = useState("");
  const [paystackEmail, setPaystackEmail] = useState("");

  const hasFunds = balance >= total;
  const shortfall = total - balance;

  const handleWalletCheckout = async () => {
    try {
      const payload = {
        items: cartItemsToOrderItems(items),
        total,
        note: orderNote.trim() || undefined,
        paymentMethod: "wallet" as const,
      };

      const result = await createOrder(payload);
      useWalletStore.getState().setBalance(result.walletBalance);
      setEta(result.order.eta ?? "Tomorrow by 10am");
      clear();
      setDone(true);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.error ?? "Failed to place order";

      if (code === "INSUFFICIENT_BALANCE") {
        setShowInsufficientSheet(true);
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
      const message =
        err.response?.data?.error ?? "Failed to initialise payment";
      Alert.alert("Order Failed", message);
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
        clear();
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
            {items.map((item) => (
              <View
                key={item.id}
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
                  <Pressable onPress={() => removeItem(item.id)}>
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
