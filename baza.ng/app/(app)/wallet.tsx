import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import TransactionItem from "../../components/wallet/TransactionItem";
import { colors } from "../../constants/theme";
import { useWallet } from "../../hooks/useWallet";
import { walletScreen as s } from "../../styles";
import type { WalletTransaction, WalletTxnType } from "../../types";
import { formatPrice } from "../../utils/format";

const TOP_UP_AMOUNTS = [500000, 1000000, 2000000, 5000000];

type TxFilter = "ALL" | "TOP-UPS" | "ORDERS" | "REFERRALS";
const TX_FILTERS: TxFilter[] = ["ALL", "TOP-UPS", "ORDERS", "REFERRALS"];

function matchesFilter(type: WalletTxnType, filter: TxFilter): boolean {
  switch (filter) {
    case "ALL":
      return true;
    case "TOP-UPS":
      return type === "CREDIT_TRANSFER" || type === "CREDIT_CARD";
    case "ORDERS":
      return type === "DEBIT_ORDER";
    case "REFERRALS":
      return type === "CREDIT_REFERRAL";
  }
}

export default function WalletScreen() {
  const router = useRouter();
  const {
    balance,
    formattedBalance,
    accountNumber,
    bankName,
    accountName,
    isRefreshing,
    transactions,
    txPagination,
    isLoadingTx,
    error,
    refreshBalance,
    fetchTransactions,
    fetchAccount,
    initTopup,
    verifyTopup,
    startPolling,
    stopPolling,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmt, setSelectedAmt] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TxFilter>("ALL");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const customAmountKobo = Math.round(parseFloat(customAmount || "0") * 100);
  const isValidCustom = isCustom && customAmountKobo >= 10000; // min ₦100
  const effectiveAmount = isCustom
    ? isValidCustom
      ? customAmountKobo
      : null
    : selectedAmt;
  const canConfirm = effectiveAmount !== null && effectiveAmount > 0;

  const filteredTransactions = transactions.filter((tx) =>
    matchesFilter(tx.type as WalletTxnType, activeFilter),
  );

  useEffect(() => {
    refreshBalance();
    fetchAccount();
    fetchTransactions(1, 50);
    startPolling();
    return () => stopPolling();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchTransactions(1, 50)]);
    setRefreshing(false);
  }, [refreshBalance, fetchTransactions]);

  const handleCopy = async () => {
    if (!accountNumber) return;
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectQuick = (amt: number) => {
    setSelectedAmt(amt);
    setIsCustom(false);
    setCustomAmount(String(amt / 100));
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedAmt(null);
  };

  const handleCustomChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setCustomAmount(sanitized);
    setIsCustom(true);
    setSelectedAmt(null);
  };

  const handleTopUp = async () => {
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
        await fetchTransactions(1, 50);
      } else {
        Alert.alert("Top-up Pending", "Your balance will update shortly.");
        await refreshBalance();
      }
      setShowTopUp(false);
      setSelectedAmt(null);
      setCustomAmount("");
      setIsCustom(false);
    } catch (err: any) {
      Alert.alert(
        "Top-up Failed",
        err.response?.data?.error ?? "Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => (
    <TransactionItem transaction={item} />
  );

  const listHeader = (
    <View>
      <View className={s.balanceSection}>
        <Text className={s.balanceLabel}>BAZA WALLET</Text>
        <Text className={s.balanceAmount}>{formattedBalance}</Text>
        <Text className={s.balanceAvailable}>AVAILABLE BALANCE</Text>
        <View className={s.topUpRow}>
          <Pressable
            className={s.topUpCardBtn}
            onPress={() => setShowTopUp(true)}
          >
            <Text className={s.topUpCardBtnText}>+ TOP UP</Text>
          </Pressable>
          <Pressable
            className={s.topUpTransferBtn}
            onPress={() => {
              if (accountNumber) handleCopy();
            }}
          >
            <Text className={s.topUpTransferBtnText}>
              {copied ? "COPIED ✓" : "COPY ACCT NO."}
            </Text>
          </Pressable>
        </View>
      </View>

      {accountNumber && (
        <View className={s.acctBox}>
          <Text className={s.acctLabel}>YOUR DEDICATED ACCOUNT</Text>
          <View className={s.acctRow}>
            <View>
              <Text className={s.acctNumber}>{accountNumber}</Text>
              <Text className={s.acctBank}>
                {bankName ?? "PROVIDUS BANK"} · {accountName ?? "BAZA NG LTD"}
              </Text>
              <Text className={s.acctHint}>
                Transfer here to fund your wallet instantly
              </Text>
            </View>
            <Pressable onPress={handleCopy}>
              <View
                className={`${s.acctCopyBtn} ${copied ? s.acctCopyBtnActive : ""}`}
              >
                <Text
                  className={
                    copied ? s.acctCopyBtnTextActive : s.acctCopyBtnText
                  }
                >
                  {copied ? "COPIED ✓" : "COPY"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}

      <View className={s.divider} />

      <View className={s.filterRow}>
        {TX_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            className={`${s.filterTab} ${
              activeFilter === filter ? s.filterTabActive : s.filterTabInactive
            }`}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              className={`${s.filterTabText} ${
                activeFilter === filter
                  ? s.filterTabTextActive
                  : s.filterTabTextInactive
              }`}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className={s.txHeader}>
        <Text className={s.txTitle}>
          {activeFilter === "ALL" ? "TRANSACTION HISTORY" : activeFilter}
        </Text>
        <Text className={s.txCount}>
          {filteredTransactions.length} TRANSACTION
          {filteredTransactions.length !== 1 ? "S" : ""}
        </Text>
      </View>
    </View>
  );

  const listEmpty = isLoadingTx ? (
    <View className={s.emptyTx}>
      <ActivityIndicator color={colors.accent.green} size="small" />
      <Text className={`${s.emptyTxSub} mt-3`}>LOADING TRANSACTIONS...</Text>
    </View>
  ) : (
    <View className={s.emptyTx}>
      <Text className={s.emptyTxText}>NO TRANSACTIONS YET</Text>
      <Text className={s.emptyTxSub}>Top up your wallet to get started</Text>
    </View>
  );

  return (
    <ScreenWrapper className="bg-[#060c07]">
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>← BACK</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.green}
          />
        }
        onEndReached={() => {
          if (txPagination?.hasNext && !isLoadingTx) {
            fetchTransactions((txPagination.page ?? 1) + 1, 50);
          }
        }}
        onEndReachedThreshold={0.3}
      />

      {showTopUp && (
        <View className={s.topUpSheet}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              setShowTopUp(false);
              setSelectedAmt(null);
              setCustomAmount("");
              setIsCustom(false);
            }}
          />
          <View className={s.topUpSheetInner}>
            <View className={s.topUpHandle} />
            <Text className={s.topUpLabel}>ADD FUNDS</Text>
            <Text className={s.topUpTitle}>How much?</Text>

            <View className={s.topUpGrid}>
              {TOP_UP_AMOUNTS.map((amt) => (
                <Pressable
                  key={amt}
                  onPress={() => handleSelectQuick(amt)}
                  className={`${s.topUpBtn} ${
                    selectedAmt === amt ? s.topUpBtnActive : s.topUpBtnInactive
                  }`}
                  style={{ alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: selectedAmt === amt ? "#4caf7d" : "#5a8a5a",
                      fontFamily: "NotoSerif_400Regular",
                      fontSize: 13,
                    }}
                  >
                    {formatPrice(amt)}
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
              <View className={s.topUpTransferBox}>
                <Text className={s.topUpTransferLabel}>OR TRANSFER TO</Text>
                <Text className={s.topUpTransferNumber}>{accountNumber}</Text>
                <Text className={s.topUpTransferBank}>
                  {bankName ?? "PROVIDUS BANK"} · {accountName ?? "BAZA NG LTD"}
                </Text>
              </View>
            )}

            <Pressable
              className={`${s.topUpConfirmBtn} ${
                canConfirm ? s.topUpConfirmActive : s.topUpConfirmInactive
              }`}
              onPress={handleTopUp}
              disabled={!canConfirm || isProcessing}
              style={{ alignItems: "center" }}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text
                  style={{
                    color: canConfirm ? "#000" : "#2a3a2a",
                    fontFamily: "NotoSerif_400Regular",
                    fontSize: 11,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textAlign: "center",
                  }}
                >
                  {canConfirm
                    ? `CONFIRM ${formatPrice(effectiveAmount!)}`
                    : "SELECT AMOUNT"}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setShowTopUp(false);
                setSelectedAmt(null);
                setCustomAmount("");
                setIsCustom(false);
              }}
            >
              <Text
                className={s.topUpCancelBtn}
                style={{ textAlign: "center" }}
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
