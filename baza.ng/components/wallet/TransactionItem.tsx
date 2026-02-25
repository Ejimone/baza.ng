import { View, Text } from "react-native";
import type { WalletTransaction } from "../../types";
import { formatPrice, formatDate } from "../../utils/format";
import { colors } from "../../constants/theme";

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

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-[#0f1a10]">
      <View className="flex-1 mr-3">
        <Text className="text-[11px] text-[#d0e0d0] font-mono">
          {TYPE_LABELS[transaction.type] ?? transaction.type}
        </Text>
        {transaction.description && (
          <Text className="text-[9px] text-[#2a4a2a] tracking-[0.1em] font-mono mt-[2px]">
            {transaction.description}
          </Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          className="text-[12px] font-mono font-bold"
          style={{ color: amountColor }}
        >
          {prefix}{formatPrice(transaction.amount)}
        </Text>
        <Text className="text-[9px] text-[#2a4a2a] tracking-[0.1em] font-mono mt-[2px]">
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
    </View>
  );
}
