import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import { useOrders } from "../../../hooks/useOrders";
import * as ordersService from "../../../services/orders";
import { useThemeStore } from "../../../stores/themeStore";
import type { Order, OrderStatus } from "../../../types";
import { ORDER_STATUS_LABELS } from "../../../utils/constants";
import { formatDate, formatPrice } from "../../../utils/format";

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
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, any>>(
    {},
  );
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id, fetchOrder]);

  useEffect(() => {
    (async () => {
      setLoadingHistory(true);
      try {
        const data = await ordersService.getOrders(1, 10);
        setPastOrders(data.orders);
      } catch {}
      setLoadingHistory(false);
    })();
  }, []);

  if (isLoading && !currentOrder) {
    return (
      <ScreenWrapper className="" backgroundColor={palette.background}>
        <LoadingSpinner message="LOADING ORDER" />
      </ScreenWrapper>
    );
  }

  if (error && !currentOrder) {
    return (
      <ScreenWrapper className="" backgroundColor={palette.background}>
        <View
          className="pt-[52px] px-6 pb-4 border-b"
          style={{ borderColor: palette.border }}
        >
          <Pressable onPress={() => router.back()}>
            <Text
              className="bg-transparent text-[11px] tracking-[0.2em] mb-3 p-0 font-mono"
              style={{ color: palette.textSecondary }}
            >
              {"← ORDERS"}
            </Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-[11px] tracking-[0.15em] text-center font-mono"
            style={{ color: colors.accent.red }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => id && fetchOrder(id)}
            className="mt-4 py-2 px-4 border"
            style={{ borderColor: palette.border }}
          >
            <Text
              className="text-[10px] tracking-[0.2em] font-mono"
              style={{ color: palette.textSecondary }}
            >
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
    <ScreenWrapper className="" backgroundColor={palette.background}>
      <View
        className="px-6 pb-4 border-b"
        style={{ borderColor: palette.border }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            className="bg-transparent text-[11px] tracking-[0.2em] mb-3 p-0 font-mono"
            style={{ color: palette.textSecondary }}
          >
            {"← ORDERS"}
          </Text>
        </Pressable>
        <Text
          className="text-[26px] font-serif tracking-[-1px]"
          style={{ color: palette.textPrimary }}
        >
          Order Detail
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {/* Status & ID header */}
        <View
          className="border p-4 mb-3"
          style={{ backgroundColor: palette.card, borderColor: palette.border }}
        >
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text
                className="text-[9px] tracking-[0.2em] font-mono mb-1"
                style={{ color: palette.textSecondary }}
              >
                ORDER ID
              </Text>
              <Text
                className="text-[12px] tracking-[0.1em] font-mono"
                style={{ color: palette.textPrimary }}
              >
                {order.id.slice(0, 13).toUpperCase()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                className="text-[9px] tracking-[0.2em] font-mono font-bold"
                style={{ color: statusColor }}
              >
                {"● " +
                  (
                    ORDER_STATUS_LABELS[order.status] ?? order.status
                  ).toUpperCase()}
              </Text>
              <Text
                className="text-[9px] tracking-[0.15em] font-mono mt-1"
                style={{ color: palette.textSecondary }}
              >
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>

          {/* Status progress (only for non-cancelled orders) */}
          {!isCancelled && (
            <View className="flex-row items-center mt-2 mb-1">
              {STATUS_STEPS.map((step, idx) => {
                const reached = currentStepIdx >= idx;
                const stepColor = reached ? statusColor : palette.border;
                const lineReached = currentStepIdx > idx;
                const lineColor = lineReached ? statusColor : palette.border;
                return (
                  <View
                    key={step}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: idx < STATUS_STEPS.length - 1 ? 1 : undefined,
                    }}
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stepColor }}
                    />
                    {idx < STATUS_STEPS.length - 1 && (
                      <View
                        className="flex-1 h-[1px]"
                        style={{ backgroundColor: lineColor }}
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
                        ? statusColor
                        : palette.textSecondary,
                  }}
                >
                  {ORDER_STATUS_LABELS[step]?.toUpperCase()}
                </Text>
              ))}
            </View>
          )}

          {isCancelled && (
            <View
              className="border p-2.5 mt-2"
              style={{ backgroundColor: "#1a0a0a", borderColor: "#e85c3a22" }}
            >
              <Text
                className="text-[10px] tracking-[0.1em] font-mono text-center"
                style={{ color: colors.accent.red }}
              >
                THIS ORDER WAS CANCELLED
              </Text>
            </View>
          )}
        </View>

        {/* ETA */}
        {order.eta && !isCancelled && (
          <View
            className="border p-3 px-4 mb-3 flex-row items-center"
            style={{ backgroundColor: palette.card, borderColor: "#4caf7d22" }}
          >
            <Text className="text-base mr-2">{"📦"}</Text>
            <View>
              <Text
                className="text-[9px] tracking-[0.2em] font-mono mb-[2px]"
                style={{ color: palette.textSecondary }}
              >
                ESTIMATED DELIVERY
              </Text>
              <Text
                className="text-[12px] tracking-[0.05em] font-mono"
                style={{ color: palette.textPrimary }}
              >
                {order.eta}
              </Text>
            </View>
          </View>
        )}

        {/* Items */}
        <View className="mb-3">
          <Text
            className="text-[9px] tracking-[0.2em] font-mono mb-2"
            style={{ color: palette.textSecondary }}
          >
            ITEMS ({order.items.length})
          </Text>
          {order.items.map((item, idx) => (
            <View
              key={item.id ?? idx}
              className="border p-3 px-4 mb-[6px] flex-row items-center justify-between"
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-lg">{item.emoji}</Text>
                <View className="flex-1">
                  <Text
                    className="text-[11px] font-mono"
                    style={{ color: palette.textPrimary }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-[9px] mt-[2px] tracking-[0.2em] font-mono uppercase"
                    style={{ color: palette.textSecondary }}
                  >
                    {item.itemType}
                    {item.qty > 1 ? ` × ${item.qty}` : ""}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  className="text-[12px] font-mono"
                  style={{ color: palette.textPrimary }}
                >
                  {formatPrice(item.totalPrice)}
                </Text>
                {item.qty > 1 && (
                  <Text
                    className="text-[9px] mt-[2px] tracking-[0.1em] font-mono"
                    style={{ color: palette.textSecondary }}
                  >
                    {formatPrice(item.unitPrice)} each
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Note */}
        {order.note ? (
          <View
            className="border p-3 px-3.5 mb-3"
            style={{
              backgroundColor: palette.background,
              borderColor: palette.border,
            }}
          >
            <Text
              className="text-[9px] tracking-[0.2em] font-mono mb-1.5"
              style={{ color: palette.textSecondary }}
            >
              ORDER NOTE
            </Text>
            <Text
              className="text-[10px] leading-relaxed tracking-[0.05em] font-mono"
              style={{ color: palette.textSecondary }}
            >
              {'💬 "'}
              {order.note}
              {'"'}
            </Text>
          </View>
        ) : null}

        {/* Total */}
        <View
          className="border p-4 mb-3"
          style={{ backgroundColor: palette.card, borderColor: palette.border }}
        >
          <View className="flex-row justify-between mb-1">
            <Text
              className="text-[9px] tracking-[0.2em] font-mono"
              style={{ color: palette.textSecondary }}
            >
              SUBTOTAL
            </Text>
            <Text
              className="text-[11px] font-mono"
              style={{ color: palette.textPrimary }}
            >
              {formatPrice(order.total)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text
              className="text-[9px] tracking-[0.2em] font-mono"
              style={{ color: palette.textSecondary }}
            >
              DELIVERY
            </Text>
            <Text
              className="text-[11px] font-mono"
              style={{ color: colors.accent.green }}
            >
              FREE
            </Text>
          </View>
          <View
            className="border-t pt-3 flex-row justify-between"
            style={{ borderColor: palette.border }}
          >
            <Text
              className="text-[9px] tracking-[0.2em] font-mono font-bold"
              style={{ color: palette.textSecondary }}
            >
              TOTAL PAID
            </Text>
            <Text
              className="text-[16px] font-mono font-bold"
              style={{ color: palette.textPrimary }}
            >
              {formatPrice(order.total)}
            </Text>
          </View>
        </View>

        {/* Order History */}
        <View className="mt-4 mb-3">
          <Text
            className="text-[9px] tracking-[0.2em] font-mono mb-2"
            style={{ color: palette.textSecondary }}
          >
            ORDER HISTORY
          </Text>
          {loadingHistory ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={colors.accent.green} />
            </View>
          ) : pastOrders.filter((o) => o.id !== order.id).length === 0 ? (
            <View
              className="border p-4 items-center"
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <Text
                className="text-[10px] tracking-[0.15em] font-mono"
                style={{ color: palette.textSecondary }}
              >
                NO OTHER ORDERS YET
              </Text>
            </View>
          ) : (
            pastOrders
              .filter((o) => o.id !== order.id)
              .map((pastOrder) => {
                const pastStatusColor =
                  colors.status[pastOrder.status as OrderStatus] ??
                  colors.accent.green;
                const isExpanded = expandedOrderId === pastOrder.id;
                const detail = expandedDetails[pastOrder.id];
                return (
                  <View key={pastOrder.id}>
                    <Pressable
                      className="border p-3.5 px-4 mb-[6px]"
                      style={{
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      }}
                      onPress={async () => {
                        if (isExpanded) {
                          setExpandedOrderId(null);
                          return;
                        }
                        setExpandedOrderId(pastOrder.id);
                        if (!expandedDetails[pastOrder.id]) {
                          try {
                            const full = await ordersService.getOrder(
                              pastOrder.id,
                            );
                            setExpandedDetails((prev) => ({
                              ...prev,
                              [pastOrder.id]: full,
                            }));
                          } catch {}
                        }
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text
                            className="text-[10px] tracking-[0.1em] font-mono"
                            style={{ color: palette.textPrimary }}
                          >
                            {pastOrder.id.slice(0, 13).toUpperCase()}
                          </Text>
                          <Text
                            className="text-[9px] tracking-[0.1em] font-mono mt-[2px]"
                            style={{ color: palette.textSecondary }}
                          >
                            {formatDate(pastOrder.createdAt)}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            className="text-[9px] tracking-[0.15em] font-mono font-bold"
                            style={{ color: pastStatusColor }}
                          >
                            {"● " +
                              (
                                ORDER_STATUS_LABELS[pastOrder.status] ??
                                pastOrder.status
                              ).toUpperCase()}
                          </Text>
                          <Text
                            className="text-[11px] font-mono mt-[2px]"
                            style={{ color: palette.textPrimary }}
                          >
                            {formatPrice(pastOrder.total)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row flex-wrap gap-1 flex-1">
                          {pastOrder.items.slice(0, 3).map((item, idx) => (
                            <Text
                              key={idx}
                              className="text-[9px] tracking-[0.05em] font-mono"
                              style={{ color: palette.textSecondary }}
                            >
                              {item.emoji} {item.name}
                              {idx < Math.min(pastOrder.items.length, 3) - 1
                                ? ","
                                : ""}
                            </Text>
                          ))}
                          {pastOrder.items.length > 3 && (
                            <Text
                              className="text-[9px] tracking-[0.1em] font-mono"
                              style={{ color: palette.textSecondary }}
                            >
                              +{pastOrder.items.length - 3} more
                            </Text>
                          )}
                        </View>
                        <Text
                          className="text-[10px] font-mono ml-2"
                          style={{ color: palette.textSecondary }}
                        >
                          {isExpanded ? "▲" : "▼"}
                        </Text>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View
                        className="border border-t-0 px-4 pt-3 pb-4 mb-[6px] -mt-[6px]"
                        style={{
                          backgroundColor: palette.background,
                          borderColor: palette.border,
                        }}
                      >
                        {!detail ? (
                          <View className="py-3 items-center">
                            <ActivityIndicator
                              size="small"
                              color={colors.accent.green}
                            />
                          </View>
                        ) : (
                          <>
                            <Text
                              className="text-[9px] tracking-[0.2em] font-mono mb-2"
                              style={{ color: palette.textSecondary }}
                            >
                              ITEMS ({detail.items.length})
                            </Text>
                            {detail.items.map((item: any, idx: number) => (
                              <View
                                key={item.id ?? idx}
                                className="border p-2.5 px-3 mb-[4px] flex-row items-center justify-between"
                                style={{
                                  backgroundColor: palette.card,
                                  borderColor: palette.border,
                                }}
                              >
                                <View className="flex-row items-center gap-2.5 flex-1">
                                  <Text className="text-base">
                                    {item.emoji}
                                  </Text>
                                  <View className="flex-1">
                                    <Text
                                      className="text-[10px] font-mono"
                                      style={{ color: palette.textPrimary }}
                                    >
                                      {item.name}
                                    </Text>
                                    <Text
                                      className="text-[8px] mt-[1px] tracking-[0.15em] font-mono uppercase"
                                      style={{ color: palette.textSecondary }}
                                    >
                                      {item.itemType}
                                      {item.qty > 1 ? ` × ${item.qty}` : ""}
                                    </Text>
                                  </View>
                                </View>
                                <Text
                                  className="text-[11px] font-mono"
                                  style={{ color: palette.textPrimary }}
                                >
                                  {formatPrice(item.totalPrice)}
                                </Text>
                              </View>
                            ))}

                            {detail.note ? (
                              <View
                                className="border p-2.5 px-3 mt-2"
                                style={{
                                  backgroundColor: palette.background,
                                  borderColor: palette.border,
                                }}
                              >
                                <Text
                                  className="text-[9px] tracking-[0.2em] font-mono mb-1"
                                  style={{ color: palette.textSecondary }}
                                >
                                  NOTE
                                </Text>
                                <Text
                                  className="text-[9px] leading-relaxed tracking-[0.05em] font-mono"
                                  style={{ color: palette.textSecondary }}
                                >
                                  {'💬 "'}
                                  {detail.note}
                                  {'"'}
                                </Text>
                              </View>
                            ) : null}

                            <View
                              className="border p-3 mt-2"
                              style={{
                                backgroundColor: palette.card,
                                borderColor: palette.border,
                              }}
                            >
                              <View className="flex-row justify-between mb-1">
                                <Text
                                  className="text-[8px] tracking-[0.2em] font-mono"
                                  style={{ color: palette.textSecondary }}
                                >
                                  SUBTOTAL
                                </Text>
                                <Text
                                  className="text-[10px] font-mono"
                                  style={{ color: palette.textPrimary }}
                                >
                                  {formatPrice(detail.total)}
                                </Text>
                              </View>
                              <View className="flex-row justify-between mb-2">
                                <Text
                                  className="text-[8px] tracking-[0.2em] font-mono"
                                  style={{ color: palette.textSecondary }}
                                >
                                  DELIVERY
                                </Text>
                                <Text
                                  className="text-[10px] font-mono"
                                  style={{ color: colors.accent.green }}
                                >
                                  FREE
                                </Text>
                              </View>
                              <View
                                className="border-t pt-2 flex-row justify-between"
                                style={{ borderColor: palette.border }}
                              >
                                <Text
                                  className="text-[8px] tracking-[0.2em] font-mono font-bold"
                                  style={{ color: palette.textSecondary }}
                                >
                                  TOTAL PAID
                                </Text>
                                <Text
                                  className="text-[14px] font-mono font-bold"
                                  style={{ color: palette.textPrimary }}
                                >
                                  {formatPrice(detail.total)}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </View>

        {/* View all orders */}
        <Pressable
          onPress={() => router.push("/(app)/orders" as any)}
          className="py-3 border items-center mb-2"
          style={{ borderColor: palette.border }}
        >
          <Text
            className="text-[10px] tracking-[0.2em] font-mono"
            style={{ color: colors.accent.green }}
          >
            VIEW ALL ORDERS
          </Text>
        </Pressable>

        {/* Back to orders button */}
        <Pressable
          onPress={() => router.back()}
          className="py-3 border items-center mt-2"
          style={{ borderColor: palette.border }}
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
