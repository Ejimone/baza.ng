import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useWallet } from "../../hooks/useWallet";
import { fundPrompt as s } from "../../styles";
import { formatPrice } from "../../utils/format";

const QUICK_AMOUNTS = [500000, 1000000, 2000000, 5000000];

interface FundPromptProps {
  shortfall: number;
  onDismiss: () => void;
  onFunded: () => void;
}

export default function FundPrompt({
  shortfall,
  onDismiss,
  onFunded,
}: FundPromptProps) {
  const { accountNumber, bankName, initTopup, verifyTopup, refreshBalance } =
    useWallet();

  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopy = async () => {
    if (!accountNumber) return;
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!selected) return;

    setIsProcessing(true);
    try {
      const { authorizationUrl, reference } = await initTopup(selected);

      await WebBrowser.openBrowserAsync(authorizationUrl, {
        dismissButtonStyle: "close",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      });

      const result = await verifyTopup(reference);

      if (result.status === "success") {
        await refreshBalance();
        onFunded();
      } else {
        Alert.alert(
          "Top-up Pending",
          "Payment is still being verified. Your balance will update shortly.",
        );
        await refreshBalance();
        onFunded();
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? "Top-up failed. Please try again.";
      Alert.alert("Top-up Failed", message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className={s.overlay}>
      <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      <View className={s.sheet}>
        <View className={s.handle} />

        <Text className={s.insufficientLabel}>INSUFFICIENT BALANCE</Text>
        <Text className={s.title}>Top up to complete</Text>
        <Text className={s.desc}>
          You need{" "}
          <Text className={s.shortfallAmount}>{formatPrice(shortfall)}</Text>{" "}
          more to place this order. Fund via card or bank transfer below.
        </Text>

        {accountNumber && (
          <View className={s.acctBox}>
            <Text className={s.acctLabel}>YOUR BAZA ACCOUNT</Text>
            <View className={s.acctRow}>
              <View>
                <Text className={s.acctNumber}>{accountNumber}</Text>
                <Text className={s.acctBank}>{bankName ?? "Wema Bank"}</Text>
              </View>
              <Pressable className={s.acctCopyBtn} onPress={handleCopy}>
                <Text className="text-baza-green text-3xs tracking-wide-lg font-mono">
                  {copied ? "COPIED" : "COPY"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text className={s.quickLabel}>QUICK TOP-UP VIA CARD</Text>
        <View className={s.quickGrid}>
          {QUICK_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              className={`${s.quickBtn} ${
                selected === amount ? s.quickBtnActive : s.quickBtnInactive
              }`}
              onPress={() => setSelected(amount)}
              style={{ alignItems: "center" }}
            >
              <Text
                className={
                  selected === amount
                    ? "text-baza-green text-xs tracking-wide-xs font-mono"
                    : "text-[#6a8a6a] text-xs tracking-wide-xs font-mono"
                }
              >
                {formatPrice(amount)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          className={`${s.confirmBtn} ${
            selected ? s.confirmBtnActive : s.confirmBtnInactive
          }`}
          onPress={handleConfirm}
          disabled={!selected || isProcessing}
          style={{ alignItems: "center" }}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text
              className={
                selected
                  ? "text-black text-[11px] tracking-wide-2xl font-mono font-bold"
                  : "text-[#2a3a2a] text-[11px] tracking-wide-2xl font-mono font-bold"
              }
            >
              {selected
                ? `ADD ${formatPrice(selected)} TO WALLET`
                : "SELECT AN AMOUNT"}
            </Text>
          )}
        </Pressable>

        <Pressable className={s.cancelBtn} onPress={onDismiss}>
          <Text className="text-[#2a3a2a] text-xxs tracking-wide-lg font-mono text-center">
            CANCEL
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
