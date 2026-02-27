import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import WalletCard from "../../components/wallet/WalletCard";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import { useWallet } from "../../hooks/useWallet";
import { profileScreen as s } from "../../styles/index";
import { formatPrice } from "../../utils/format";

const TOP_UP_AMOUNTS = [500000, 1000000, 2000000, 5000000, 10000000];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    balance,
    accountNumber,
    bankName,
    refreshBalance,
    initTopup,
    verifyTopup,
  } = useWallet();
  const { orders, fetchOrders } = useOrders();

  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmt, setSelectedAmt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  useEffect(() => {
    refreshBalance();
    fetchOrders(1, 100);
  }, []);

  const memberYear = user?.memberSince
    ? new Date(user.memberSince).getFullYear()
    : new Date().getFullYear();

  const handleCopy = async () => {
    if (!accountNumber) return;
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectQuick = (amt: number) => {
    setSelectedAmt(amt);
    setIsCustom(false);
    setCustomAmount("");
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

  const navRows = [
    {
      icon: "📦",
      label: "My Orders",
      sub:
        orders.length === 0
          ? "NO ORDERS YET"
          : `${orders.length} ORDER${orders.length !== 1 ? "S" : ""}`,
      route: "/(app)/orders",
    },
    {
      icon: "🔔",
      label: "Notifications",
      sub: "MANAGE PREFERENCES",
      route: "/(app)/settings/notifications",
    },
    {
      icon: "🏠",
      label: "Delivery Address",
      sub: "MANAGE ADDRESSES",
      route: "/(app)/settings/address",
    },
    {
      icon: "👥",
      label: "Refer a Friend",
      sub: "EARN ₦2,000",
      route: "/(app)/settings/refer",
    },
    {
      icon: "💬",
      label: "Contact Support",
      sub: "AI · HUMAN BACKUP",
      route: "/(app)/settings/support",
    },
  ];

  return (
    <ScreenWrapper className="bg-[#060c07]">
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>{"← HOME"}</Text>
        </Pressable>
        <View className={s.avatarRow}>
          <View className={s.avatar}>
            <Text className="text-[22px] font-serif">
              {user?.name ? user.name.charAt(0).toUpperCase() : "🌿"}
            </Text>
          </View>
          <View>
            <Text className={s.userName}>{user?.name ?? "Member"}</Text>
            <Text className={s.memberSince}>MEMBER SINCE {memberYear}</Text>
          </View>
        </View>
      </View>

      <ScrollView className={s.scrollBody} showsVerticalScrollIndicator={false}>
        <WalletCard balance={balance} onTopUp={() => setShowTopUp(true)} />

        {/* DVA Account Box */}
        {accountNumber && (
          <View className={s.acctBox}>
            <Text className={s.acctLabel}>YOUR DEDICATED ACCOUNT</Text>
            <View className={s.acctRow}>
              <View>
                <Text className={s.acctNumber}>{accountNumber}</Text>
                <Text className={s.acctBank}>
                  {bankName ?? "PROVIDUS BANK"} · BAZA NG LTD
                </Text>
                <Text className={s.acctHint}>
                  Transfer here to fund your wallet instantly
                </Text>
              </View>
              <Pressable onPress={handleCopy}>
                <Text
                  className={
                    copied
                      ? `${s.acctCopyBtn} ${s.acctCopyBtnActive}`
                      : s.acctCopyBtn
                  }
                >
                  {copied ? "COPIED ✓" : "COPY"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Navigation Rows */}
        {navRows.map((row) => (
          <Pressable
            key={row.label}
            className={s.navRow}
            onPress={() => router.push(row.route as any)}
          >
            <View className="flex-row items-center gap-3.5">
              <Text className={s.navRowIcon}>{row.icon}</Text>
              <View>
                <Text className={s.navRowLabel}>{row.label}</Text>
                <Text className={s.navRowSub}>{row.sub}</Text>
              </View>
            </View>
            <Text className={s.navRowChevron}>{"›"}</Text>
          </Pressable>
        ))}

        {/* Settings divider */}
        <Text className={s.settingsLabel}>SETTINGS</Text>

        <Pressable
          className={s.settingsRow}
          onPress={() => router.push("/(app)/settings/account" as any)}
        >
          <View className="flex-row items-center gap-3.5">
            <Text className={s.settingsIcon}>{"⚙️"}</Text>
            <View>
              <Text className={s.settingsRowLabel}>Account Settings</Text>
              <Text className={s.settingsRowSub}>NAME · EMAIL · PHONE</Text>
            </View>
          </View>
          <Text className={s.navRowChevron}>{"›"}</Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable onPress={logout}>
          <Text className={s.signOutBtn} style={{ textAlign: "center" }}>
            SIGN OUT
          </Text>
        </Pressable>
      </ScrollView>

      {/* Top-up Sheet */}
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
                    className={
                      selectedAmt === amt
                        ? "text-[#4caf7d] text-[13px] font-mono"
                        : "text-[#5a8a5a] text-[13px] font-mono"
                    }
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
                <Text className={s.topUpTransferLabel}>TRANSFER TO</Text>
                <Text className={s.topUpTransferNumber}>{accountNumber}</Text>
                <Text className={s.topUpTransferBank}>
                  {bankName ?? "PROVIDUS BANK"} · BAZA NG LTD
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
                  className={
                    canConfirm
                      ? "text-black text-[11px] tracking-[0.3em] font-mono font-bold"
                      : "text-[#2a3a2a] text-[11px] tracking-[0.3em] font-mono font-bold"
                  }
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
