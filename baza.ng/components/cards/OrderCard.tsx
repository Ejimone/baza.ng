import { View, Text, Pressable } from "react-native";
import type { Order, OrderStatus } from "../../types";
import { colors } from "../../constants/theme";
import { ORDER_STATUS_LABELS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/format";
import { ordersScreen as styles } from "../../styles/index";

interface OrderCardProps {
  order: Order;
  onPress: (id: string) => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const statusColor = colors.status[order.status as OrderStatus] ?? colors.accent.green;

  return (
    <Pressable className={styles.orderCard} onPress={() => onPress(order.id)}>
      <View className={styles.orderHeader}>
        <View>
          <Text className={styles.orderId}>{order.id.slice(0, 13).toUpperCase()}</Text>
          <Text className={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text className={styles.orderStatus} style={{ color: statusColor }}>
            {"● " + (ORDER_STATUS_LABELS[order.status] ?? order.status).toUpperCase()}
          </Text>
          <Text className={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      <View className={styles.orderItemsSection}>
        {order.items.slice(0, 3).map((item, idx) => (
          <Text key={idx} className={styles.orderItemText}>
            {item.emoji} {item.name}
            {item.qty > 1 ? ` ×${item.qty}` : ""}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text className={styles.orderMore}>
            +{order.items.length - 3} MORE ITEMS
          </Text>
        )}
      </View>

      {order.note ? (
        <View className={styles.orderNote}>
          <Text className="text-[10px] text-[#3a5c3a] leading-relaxed tracking-[0.05em] font-mono">
            {"💬 \""}{order.note}{"\""}
          </Text>
        </View>
      ) : null}

      {order.eta ? (
        <Text className={styles.orderEta}>{"📦 "}{order.eta}</Text>
      ) : null}
    </Pressable>
  );
}
