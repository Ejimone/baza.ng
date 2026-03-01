import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import * as referralService from "../../../services/referral";
import { useThemeStore } from "../../../stores/themeStore";
import { referScreen as s } from "../../../styles/index";
import type { Referral, ReferralStats } from "../../../types";

const PERKS = [
  { who: "YOU", earn: "₦2,000", when: "Friend places first order" },
  { who: "FRIEND", earn: "₦1,000", when: "Off their first order" },
];

export default function ReferScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
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
      <View className={s.header} style={{ borderBottomColor: palette.border }}>
        <Pressable onPress={() => router.back()}>
          <Text
            className={s.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← PROFILE"}
          </Text>
        </Pressable>
        <Text className={s.title} style={{ color: palette.textPrimary }}>
          Refer a Friend
        </Text>
        <Text className={s.subtitle} style={{ color: palette.textSecondary }}>
          BOTH OF YOU WIN
        </Text>
      </View>

      <ScrollView className={s.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Perk Cards */}
        <View className={s.perkGrid}>
          {PERKS.map((perk) => (
            <View
              key={perk.who}
              className={s.perkCard}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <Text
                className={s.perkLabel}
                style={{ color: palette.textSecondary }}
              >
                {perk.who} GET
              </Text>
              <Text className={s.perkAmount}>{perk.earn}</Text>
              <Text
                className={s.perkWhen}
                style={{ color: palette.textSecondary }}
              >
                {perk.when}
              </Text>
            </View>
          ))}
        </View>

        {/* Referral Code Box */}
        <View
          className={s.codeBox}
          style={{ backgroundColor: palette.card, borderColor: palette.border }}
        >
          <Text
            className={s.codeLabel}
            style={{ color: palette.textSecondary }}
          >
            YOUR REFERRAL CODE
          </Text>
          <View className={s.codeRow}>
            <Text className={s.codeValue}>
              {stats?.code?.toUpperCase() ?? "---"}
            </Text>
            <Pressable onPress={handleCopy}>
              <Text
                className={`${s.codeCopyBtn} ${
                  copied ? s.codeCopyActive : s.codeCopyInactive
                }`}
                style={
                  !copied
                    ? {
                        borderColor: palette.border,
                        color: palette.textSecondary,
                      }
                    : undefined
                }
              >
                {copied ? "COPIED ✓" : "COPY"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Invite by Phone */}
        <Text
          className={s.inviteLabel}
          style={{ color: palette.textSecondary }}
        >
          SHARE YOUR CODE
        </Text>
        <View className={s.inviteRow}>
          <TextInput
            className={s.inviteInput}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              color: palette.textPrimary,
            }}
            placeholder="+234 800 000 0000"
            placeholderTextColor={palette.textSecondary}
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
            <Text
              className={s.sentLabel}
              style={{ color: palette.textSecondary }}
            >
              REFERRED ({stats.totalReferrals})
            </Text>
            {stats.referrals.map((ref: Referral, idx: number) => (
              <View key={idx} className={s.sentRow}>
                <Text className={s.sentCheck}>
                  {ref.firstOrderPlaced ? "✓" : "○"}
                </Text>
                <Text
                  className="text-[11px] font-mono"
                  style={{ color: palette.textSecondary }}
                >
                  {ref.name}
                </Text>
                <Text
                  className={s.sentStatus}
                  style={{ color: palette.textSecondary }}
                >
                  {ref.firstOrderPlaced ? "FIRST ORDER ✓" : "PENDING"}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text
          className={s.disclaimer}
          style={{
            color: palette.textSecondary,
            borderTopColor: palette.border,
          }}
        >
          Reward credited within 24hrs of friend’s first delivery.{"\n"}
          No cap on referrals. Invite as many as you want.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}
