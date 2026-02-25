import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { cartScreen as s } from "../../styles";
import { useCart } from "../../hooks/useCart";
import { useWallet } from "../../hooks/useWallet";
import { useOrders } from "../../hooks/useOrders";
import { cartItemsToOrderItems } from "../../services/orders";
import { useWalletStore } from "../../stores/walletStore";
import { formatPrice } from "../../utils/format";
import FundPrompt from "../../components/ui/FundPrompt";

export default function CartScreen() {
  const router = useRouter();
  const { items, total, formattedTotal, isEmpty, removeItem, clear } =
    useCart();
  const { balance, formattedBalance } = useWallet();
  const { createOrder, isLoading } = useOrders();

  const [done, setDone] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [eta, setEta] = useState("");

  const hasFunds = balance >= total;
  const shortfall = total - balance;

  const handleCheckout = async () => {
    if (!hasFunds) {
      setShowFund(true);
      return;
    }

    try {
      const payload = {
        items: cartItemsToOrderItems(items),
        total,
        note: orderNote.trim() || undefined,
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
        setShowFund(true);
      } else {
        Alert.alert("Order Failed", message);
      }
    }
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
    <View className={s.container}>
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
            <Text
              className={
                hasFunds ? s.balanceLabelOk : s.balanceLabelLow
              }
            >
              WALLET BALANCE
            </Text>
            <Text
              className={
                hasFunds ? s.balanceAmountOk : s.balanceAmountLow
              }
            >
              {formattedBalance}
            </Text>
          </View>
          {!hasFunds && (
            <Pressable
              className={s.topUpBtn}
              onPress={() => setShowFund(true)}
            >
              <Text className="text-baza-red text-3xs tracking-wide-lg">
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
      >
        {isEmpty ? (
          <Text className={s.emptyText}>CART IS EMPTY</Text>
        ) : (
          items.map((item) => (
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
          ))
        )}
      </ScrollView>

      {!isEmpty && (
        <View className={s.footer}>
          <View className={s.subtotalRow}>
            <Text className="text-3xs text-[#2a3a2a] tracking-wide-lg">
              SUBTOTAL
            </Text>
            <Text className={s.subtotalValue}>{formattedTotal}</Text>
          </View>
          <View className={s.deliveryRow}>
            <Text className="text-3xs text-[#2a3a2a] tracking-wide-lg">
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

          <Pressable
            className={`${s.confirmBtn} ${hasFunds ? s.confirmBtnOk : s.confirmBtnLow}`}
            onPress={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text
                className="text-black text-[11px] tracking-wide-2xl font-mono font-bold text-center"
              >
                {hasFunds
                  ? "CONFIRM ORDER"
                  : `FUND WALLET · NEED ${formatPrice(shortfall)} MORE`}
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {showFund && (
        <FundPrompt
          shortfall={shortfall}
          onDismiss={() => setShowFund(false)}
          onFunded={handleFunded}
        />
      )}
    </View>
  );
}
