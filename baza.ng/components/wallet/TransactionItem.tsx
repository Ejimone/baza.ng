import { Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useThemeStore } from "../../stores/themeStore";
import type { WalletTransaction } from "../../types";
import { formatDate, formatPrice } from "../../utils/format";

interface TransactionItemProps {
  transaction: WalletTransaction;
}

const TYPE_LABELS: Record<string, string> = {
  CREDIT_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Card Payment",
  CREDIT_REFERRAL: "Referral Bonus",
  DEBIT_ORDER: "Order Payment",
  DEBIT_REFUND: "Refund",
};

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type.startsWith("CREDIT");
  const amountColor = isCredit ? colors.accent.green : colors.accent.red;
  const prefix = isCredit ? "+" : "-";
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <View
      className="flex-row items-center justify-between py-3 border-b"
      style={{ borderBottomColor: palette.border }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-[11px] font-mono"
          style={{ color: palette.textPrimary }}
        >
          {TYPE_LABELS[transaction.type] ?? transaction.type}
        </Text>
        {transaction.description && (
          <Text
            className="text-[9px] tracking-[0.1em] font-mono mt-[2px]"
            style={{ color: palette.textSecondary }}
          >
            {transaction.description}
          </Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          className="text-[12px] font-mono font-bold"
          style={{ color: amountColor }}
        >
          {prefix}
          {formatPrice(transaction.amount)}
        </Text>
        <Text
          className="text-[9px] tracking-[0.1em] font-mono mt-[2px]"
          style={{ color: palette.textSecondary }}
        >
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
    </View>
  );
}
