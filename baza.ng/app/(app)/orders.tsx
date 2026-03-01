import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import OrderCard from "../../components/cards/OrderCard";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useOrders } from "../../hooks/useOrders";
import { useThemeStore } from "../../stores/themeStore";
import { ordersScreen as styles } from "../../styles/index";
import type { Order, OrderStatus } from "../../types";

const STATUS_FILTERS: Array<{ key: OrderStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "ALL" },
  { key: "CONFIRMED", label: "ACTIVE" },
  { key: "PREPARING", label: "PREPARING" },
  { key: "DISPATCHED", label: "EN ROUTE" },
  { key: "DELIVERED", label: "DELIVERED" },
  { key: "CANCELLED", label: "CANCELLED" },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, pagination, isLoading, error, fetchOrders } = useOrders();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "ALL">("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    (page = 1) => {
      const status = activeFilter === "ALL" ? undefined : activeFilter;
      return fetchOrders(page, 20, status);
    },
    [activeFilter, fetchOrders],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  }, [load]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !pagination?.hasNext) return;
    setLoadingMore(true);
    await load((pagination?.page ?? 0) + 1);
    setLoadingMore(false);
  }, [loadingMore, pagination, load]);

  const onFilterPress = (key: OrderStatus | "ALL") => {
    if (key === activeFilter) return;
    setActiveFilter(key);
  };

  const navigateToDetail = (id: string) => {
    router.push(`/(app)/orders/${id}`);
  };

  const renderItem = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={navigateToDetail} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.accent.green} />
      </View>
    );
  };

  return (
    <ScreenWrapper className="" backgroundColor={palette.background}>
      <View className={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text
            className={styles.backButton}
            style={{ color: palette.textSecondary }}
          >
            {"← BACK"}
          </Text>
        </Pressable>
        <Text className={styles.title} style={{ color: palette.textPrimary }}>
          Orders
        </Text>
      </View>

      <View className="px-6 pt-2 pb-1">
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: filter }) => {
            const isActive = filter.key === activeFilter;
            return (
              <Pressable
                onPress={() => onFilterPress(filter.key)}
                className="py-[6px] px-3"
                style={{
                  backgroundColor: isActive
                    ? colors.accent.green + "18"
                    : "transparent",
                  borderWidth: 1,
                  borderColor: isActive
                    ? colors.accent.green + "55"
                    : colors.border.default,
                }}
              >
                <Text
                  className="text-[9px] tracking-[0.2em] font-mono font-bold"
                  style={{
                    color: isActive
                      ? colors.accent.green
                      : colors.text.secondary,
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading && !refreshing && orders.length === 0 ? (
        <LoadingSpinner message="LOADING ORDERS" />
      ) : error && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-[11px] tracking-[0.15em] text-center font-mono"
            style={{ color: colors.accent.red }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => load(1)}
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
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          ListEmptyComponent={
            <EmptyState
              title="NO ORDERS YET."
              subtitle="YOUR HISTORY WILL APPEAR HERE."
            />
          }
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.green}
              colors={[colors.accent.green]}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
        />
      )}
    </ScreenWrapper>
  );
}
