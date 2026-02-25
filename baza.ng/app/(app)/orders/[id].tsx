import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrders } from "../../../hooks/useOrders";
import { colors } from "../../../constants/theme";
import { ORDER_STATUS_LABELS } from "../../../utils/constants";
import { formatPrice, formatDate } from "../../../utils/format";
import type { OrderStatus } from "../../../types";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const STATUS_STEPS: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "DISPATCHED",
  "DELIVERED",
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentOrder, isLoading, error, fetchOrder } = useOrders();

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id, fetchOrder]);

  if (isLoading && !currentOrder) {
    return (
      <ScreenWrapper className="bg-[#050a06]">
        <LoadingSpinner message="LOADING ORDER" />
      </ScreenWrapper>
    );
  }

  if (error && !currentOrder) {
    return (
      <ScreenWrapper className="bg-[#050a06]">
        <View className="pt-[52px] px-6 pb-4 border-b border-[#0a120a]">
          <Pressable onPress={() => router.back()}>
            <Text className="bg-transparent text-[11px] text-[#3a5c3a] tracking-[0.2em] mb-3 p-0 font-mono">
              {"← ORDERS"}
            </Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#e85c3a] text-[11px] tracking-[0.15em] text-center font-mono">
            {error}
          </Text>
          <Pressable
            onPress={() => id && fetchOrder(id)}
            className="mt-4 py-2 px-4 border border-[#1a2a1c]"
          >
            <Text className="text-[#3a5c3a] text-[10px] tracking-[0.2em] font-mono">
              RETRY
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  if (!currentOrder) return null;

  const order = currentOrder;
  const statusColor =
    colors.status[order.status as OrderStatus] ?? colors.accent.green;
  const isCancelled = order.status === "CANCELLED";
  const currentStepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <ScreenWrapper className="bg-[#050a06]">
      <View className="px-6 pb-4 border-b border-[#0a120a]">
        <Pressable onPress={() => router.back()}>
          <Text className="bg-transparent text-[11px] text-[#3a5c3a] tracking-[0.2em] mb-3 p-0 font-mono">
            {"← ORDERS"}
          </Text>
        </Pressable>
        <Text className="text-[26px] text-[#f5f5f0] font-serif tracking-[-1px]">
          Order Detail
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* Status & ID header */}
        <View className="bg-[#0a120a] border border-[#1a2a1c] p-4 mb-3">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-[9px] text-[#2a4a2a] tracking-[0.2em] font-mono mb-1">
                ORDER ID
              </Text>
              <Text className="text-[12px] text-[#f5f5f0] tracking-[0.1em] font-mono">
                {order.id.slice(0, 13).toUpperCase()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                className="text-[9px] tracking-[0.2em] font-mono font-bold"
                style={{ color: statusColor }}
              >
                {"● " + (ORDER_STATUS_LABELS[order.status] ?? order.status).toUpperCase()}
              </Text>
              <Text className="text-[9px] text-[#2a4a2a] tracking-[0.15em] font-mono mt-1">
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>

          {/* Status progress (only for non-cancelled orders) */}
          {!isCancelled && (
            <View className="flex-row items-center mt-2 mb-1">
              {STATUS_STEPS.map((step, idx) => {
                const reached = currentStepIdx >= idx;
                const stepColor = reached ? statusColor : "#1a2a1c";
                return (
                  <View key={step} className="flex-1 flex-row items-center">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stepColor }}
                    />
                    {idx < STATUS_STEPS.length - 1 && (
                      <View
                        className="flex-1 h-[1px]"
                        style={{
                          backgroundColor:
                            currentStepIdx > idx ? statusColor : "#1a2a1c",
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
          {!isCancelled && (
            <View className="flex-row justify-between mt-1">
              {STATUS_STEPS.map((step) => (
                <Text
                  key={step}
                  className="text-[7px] tracking-[0.1em] font-mono"
                  style={{
                    color:
                      currentStepIdx >= STATUS_STEPS.indexOf(step)
                        ? "#3a5c3a"
                        : "#1a2a1c",
                  }}
                >
                  {ORDER_STATUS_LABELS[step]?.toUpperCase()}
                </Text>
              ))}
            </View>
          )}

          {isCancelled && (
            <View className="bg-[#1a0a0a] border border-[#e85c3a22] p-2.5 mt-2">
              <Text className="text-[10px] text-[#e85c3a] tracking-[0.1em] font-mono text-center">
                THIS ORDER WAS CANCELLED
              </Text>
            </View>
          )}
        </View>

        {/* ETA */}
        {order.eta && !isCancelled && (
          <View className="bg-[#0d1a0f] border border-[#4caf7d22] p-3 px-4 mb-3 flex-row items-center">
            <Text className="text-base mr-2">{"📦"}</Text>
            <View>
              <Text className="text-[9px] text-[#2a4a2a] tracking-[0.2em] font-mono mb-[2px]">
                ESTIMATED DELIVERY
              </Text>
              <Text className="text-[12px] text-[#f5f5f0] tracking-[0.05em] font-mono">
                {order.eta}
              </Text>
            </View>
          </View>
        )}

        {/* Items */}
        <View className="mb-3">
          <Text className="text-[9px] text-[#2a4a2a] tracking-[0.2em] font-mono mb-2">
            ITEMS ({order.items.length})
          </Text>
          {order.items.map((item, idx) => (
            <View
              key={item.id ?? idx}
              className="bg-[#0a120a] border border-[#1a2a1c] p-3 px-4 mb-[6px] flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-lg">{item.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-[11px] text-[#d0e0d0] font-mono">
                    {item.name}
                  </Text>
                  <Text className="text-[9px] text-[#2a3a2a] mt-[2px] tracking-[0.2em] font-mono uppercase">
                    {item.itemType}
                    {item.qty > 1 ? ` × ${item.qty}` : ""}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text className="text-[12px] text-[#f5f5f0] font-mono">
                  {formatPrice(item.totalPrice)}
                </Text>
                {item.qty > 1 && (
                  <Text className="text-[9px] text-[#2a4a2a] mt-[2px] tracking-[0.1em] font-mono">
                    {formatPrice(item.unitPrice)} each
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Note */}
        {order.note ? (
          <View className="bg-[#050a06] border border-[#0f1a10] p-3 px-3.5 mb-3">
            <Text className="text-[9px] text-[#2a4a2a] tracking-[0.2em] font-mono mb-1.5">
              ORDER NOTE
            </Text>
            <Text className="text-[10px] text-[#3a5c3a] leading-relaxed tracking-[0.05em] font-mono">
              {"💬 \""}{order.note}{"\""}
            </Text>
          </View>
        ) : null}

        {/* Total */}
        <View className="bg-[#0a120a] border border-[#1a2a1c] p-4 mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-[9px] text-[#2a3a2a] tracking-[0.2em] font-mono">
              SUBTOTAL
            </Text>
            <Text className="text-[11px] text-[#f5f5f0] font-mono">
              {formatPrice(order.total)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-[9px] text-[#2a3a2a] tracking-[0.2em] font-mono">
              DELIVERY
            </Text>
            <Text
              className="text-[11px] font-mono"
              style={{ color: colors.accent.green }}
            >
              FREE
            </Text>
          </View>
          <View className="border-t border-[#1a2a1c] pt-3 flex-row justify-between">
            <Text className="text-[9px] text-[#3a5c3a] tracking-[0.2em] font-mono font-bold">
              TOTAL PAID
            </Text>
            <Text className="text-[16px] text-[#f5f5f0] font-mono font-bold">
              {formatPrice(order.total)}
            </Text>
          </View>
        </View>

        {/* Back to orders button */}
        <Pressable
          onPress={() => router.back()}
          className="py-3 border border-[#1a2a1c] items-center mt-2"
        >
          <Text
            className="text-[10px] tracking-[0.2em] font-mono"
            style={{ color: colors.accent.green }}
          >
            {"← BACK TO ORDERS"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
}
