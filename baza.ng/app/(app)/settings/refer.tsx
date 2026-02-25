import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Share,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as referralService from "../../../services/referral";
import { referScreen as s } from "../../../styles/index";
import type { ReferralStats, Referral } from "../../../types";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { colors } from "../../../constants/theme";

const PERKS = [
  { who: "YOU", earn: "₦2,000", when: "Friend places first order" },
  { who: "FRIEND", earn: "₦1,000", when: "Off their first order" },
];

export default function ReferScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputPhone, setInputPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await referralService.getStats();
        setStats(data);
      } catch {
        Alert.alert("Error", "Failed to load referral stats.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCopy = async () => {
    if (!stats?.code) return;
    await Clipboard.setStringAsync(stats.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!inputPhone.trim() || !stats?.code) return;
    try {
      await Share.share({
        message: `Join Baza.ng with my referral code ${stats.code} and get ₦1,000 off your first order! Download: https://baza.ng`,
      });
      setInputPhone("");
    } catch {
      // user cancelled share
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-[#0a0a08]">
        <LoadingSpinner message="LOADING" color={colors.accent.amber} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-[#0a0a08]">
      <View className={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text className={s.backButton}>{"← PROFILE"}</Text>
        </Pressable>
        <Text className={s.title}>Refer a Friend</Text>
        <Text className={s.subtitle}>BOTH OF YOU WIN</Text>
      </View>

      <ScrollView className={s.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Perk Cards */}
        <View className={s.perkGrid}>
          {PERKS.map((perk) => (
            <View key={perk.who} className={s.perkCard}>
              <Text className={s.perkLabel}>{perk.who} GET</Text>
              <Text className={s.perkAmount}>{perk.earn}</Text>
              <Text className={s.perkWhen}>{perk.when}</Text>
            </View>
          ))}
        </View>

        {/* Referral Code Box */}
        <View className={s.codeBox}>
          <Text className={s.codeLabel}>YOUR REFERRAL CODE</Text>
          <View className={s.codeRow}>
            <Text className={s.codeValue}>
              {stats?.code?.toUpperCase() ?? "---"}
            </Text>
            <Pressable onPress={handleCopy}>
              <Text
                className={`${s.codeCopyBtn} ${
                  copied ? s.codeCopyActive : s.codeCopyInactive
                }`}
              >
                {copied ? "COPIED ✓" : "COPY"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Invite by Phone */}
        <Text className={s.inviteLabel}>SHARE YOUR CODE</Text>
        <View className={s.inviteRow}>
          <TextInput
            className={s.inviteInput}
            placeholder="+234 800 000 0000"
            placeholderTextColor="#5a5a3a"
            value={inputPhone}
            onChangeText={setInputPhone}
            keyboardType="phone-pad"
          />
          <Pressable onPress={handleSendInvite}>
            <Text className={s.inviteSendBtn}>SEND</Text>
          </Pressable>
        </View>

        {/* Referral List */}
        {stats && stats.referrals.length > 0 && (
          <>
            <Text className={s.sentLabel}>
              REFERRED ({stats.totalReferrals})
            </Text>
            {stats.referrals.map((ref: Referral, idx: number) => (
              <View key={idx} className={s.sentRow}>
                <Text className={s.sentCheck}>
                  {ref.firstOrderPlaced ? "✓" : "○"}
                </Text>
                <Text className="text-[11px] text-[#5a5a3a] font-mono">
                  {ref.name}
                </Text>
                <Text className={s.sentStatus}>
                  {ref.firstOrderPlaced ? "FIRST ORDER ✓" : "PENDING"}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text className={s.disclaimer}>
          Reward credited within 24hrs of friend's first delivery.{"\n"}
          No cap on referrals. Invite as many as you want.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}
