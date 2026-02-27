import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { useWallet } from "../../hooks/useWallet";
import { cartItemsToOrderItems } from "../../services/orders";
import { useWalletStore } from "../../stores/walletStore";
import { addMoreButton, cartScreen as s } from "../../styles";
import type { PaymentMethod } from "../../types";
import { formatPrice } from "../../utils/format";

export default function CartScreen() {
  const router = useRouter();
  const { items, total, formattedTotal, isEmpty, removeItem, clear } =
    useCart();
  const { balance, formattedBalance } = useWallet();
  const { createOrder, verifyPayment, isLoading } = useOrders();

  const [done, setDone] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [showInsufficientSheet, setShowInsufficientSheet] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [eta, setEta] = useState("");
  const [showAddMore, setShowAddMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

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
      const payload = {
        items: cartItemsToOrderItems(items),
        total,
        note: orderNote.trim() || undefined,
        paymentMethod: "paystack" as const,
        callbackUrl: "https://baza.ng/payment/callback",
      };

      const result = await createOrder(payload);
      const { authorizationUrl, reference } = result;
      const orderId = result.order.id;

      if (!authorizationUrl) {
        Alert.alert(
          "Payment Error",
          "Could not initialise card payment. Please try again.",
        );
        return;
      }

      await WebBrowser.openBrowserAsync(authorizationUrl, {
        dismissButtonStyle: "close",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      });

      // After browser closes, verify payment
      if (reference && orderId) {
        try {
          const verifyResult = await verifyPayment(reference, orderId);
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
      }
    } catch (err: any) {
      const message = err.response?.data?.error ?? "Failed to place order";
      Alert.alert("Order Failed", message);
    }
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
      <View className={s.container}>
        <View className={s.header}>
          <Text className={s.title}>Cart</Text>
        </View>
        <View className={s.confirmDone}>
          <Text className={s.confirmIcon}>✓</Text>
          <Text className={s.confirmLabel}>ORDER CONFIRMED</Text>
          <Text className={s.confirmEta}>
            {eta ? eta.toUpperCase() : "ARRIVING TOMORROW BY 10AM"}
          </Text>
          <Pressable
            className={s.confirmBackBtn}
            onPress={() => router.replace("/(app)/")}
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
      style={{ flex: 1 }}
    >
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
        <Text className={s.title}>Cart</Text>
      </View>

      {!isEmpty && (
        <View
          className={`${s.balanceBar} ${hasFunds ? s.balanceBarOk : s.balanceBarLow}`}
        >
          <View>
            <Text className={hasFunds ? s.balanceLabelOk : s.balanceLabelLow}>
              WALLET BALANCE
            </Text>
            <Text className={hasFunds ? s.balanceAmountOk : s.balanceAmountLow}>
              {formattedBalance}
            </Text>
          </View>
          {!hasFunds && (
            <Pressable className={s.topUpBtn} onPress={() => setShowFund(true)}>
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
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {isEmpty ? (
          <Text className={s.emptyText}>CART IS EMPTY</Text>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.id} className={s.itemRow}>
                <Text className={s.itemEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text className={s.itemName}>{item.name}</Text>
                  <Text className={s.itemType}>
                    {item.itemType}
                    {item.qty > 1 ? ` × ${item.qty}` : ""}
                  </Text>
                </View>
                <View className={s.itemRight}>
                  <Text className={s.itemPrice}>
                    {formatPrice(item.totalPrice)}
                  </Text>
                  <Pressable onPress={() => removeItem(item.id)}>
                    <Text className={s.itemRemoveBtn}>×</Text>
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
              <Text className="text-3xs text-[#2a3a2a] tracking-wide-lg font-mono">
                SUBTOTAL
              </Text>
              <Text className={s.subtotalValue}>{formattedTotal}</Text>
            </View>
            <View className={s.deliveryRow}>
              <Text className="text-3xs text-[#2a3a2a] tracking-wide-lg font-mono">
                DELIVERY
              </Text>
              <Text className={s.deliveryValue}>FREE</Text>
            </View>

            <View className={s.noteSection}>
              <Text className={s.noteLabel}>
                NOTE FOR RIDER / KITCHEN{" "}
                <Text className={s.noteOptional}>(OPTIONAL)</Text>
              </Text>
              <TextInput
                className={s.noteInput}
                value={orderNote}
                onChangeText={setOrderNote}
                placeholder="e.g. Leave at gate, call on arrival, no pepper..."
                placeholderTextColor="#2a3a2a"
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
    </KeyboardAvoidingView>
  );
}
