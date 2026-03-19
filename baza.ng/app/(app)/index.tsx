import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InteractionManager,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import ModeCard from "../../components/cards/ModeCard";
import Header from "../../components/layout/Header";
import ProductImage from "../../components/ui/ProductImage";
import SearchBar from "../../components/ui/SearchBar";
import { getThemePalette } from "../../constants/appTheme";
import { colors } from "../../constants/theme";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { useThemeStore } from "../../stores/themeStore";
import { intentGateBalance as s } from "../../styles";
import { SHOPPING_MODES } from "../../utils/constants";
import { getGreeting } from "../../utils/format";
import { perfMeasure } from "../../utils/perfLogger";

export default function IntentGateScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const { orders, fetchOrders, isLoading: isLoadingOrders } = useOrders();
  const {
    bundles,
    mealPacks,
    readyEat,
    snacks,
    restockItems,
    fetchBundles,
    fetchMealPacks,
    fetchReadyEat,
    fetchSnacks,
    fetchRestock,
  } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [isCatalogPending, setIsCatalogPending] = useState(false);

  const greeting = getGreeting();

  const activeOrder = orders.find(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "PREPARING" ||
      o.status === "DISPATCHED",
  );

  useEffect(() => {
    perfMeasure("nav tap -> first shell paint", "nav:tap");
    fetchOrders(1, 5);

    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      setIsCatalogPending(true);
      void Promise.allSettled([
        fetchBundles({ background: true }),
        fetchMealPacks({ background: true }),
        fetchReadyEat({ background: true }),
        fetchSnacks(undefined, { background: true }),
        fetchRestock(undefined, undefined, { background: true }),
      ]).finally(() => {
        if (!cancelled) {
          setIsCatalogPending(false);
        }
      });
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [
    fetchBundles,
    fetchMealPacks,
    fetchOrders,
    fetchReadyEat,
    fetchRestock,
    fetchSnacks,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders(1, 5);
    setRefreshing(false);
  }, [fetchOrders]);

  const universalResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: {
      key: string;
      title: string;
      subtitle: string;
      emoji: string;
      imageUrl?: string;
      type:
        | "bundle"
        | "mealpack"
        | "ingredient"
        | "readyeat"
        | "snack"
        | "restock";
      targetId?: string;
    }[] = [];
    const seen = new Set<string>();

    const addResult = (item: {
      key: string;
      title: string;
      subtitle: string;
      emoji: string;
      imageUrl?: string;
      type:
        | "bundle"
        | "mealpack"
        | "ingredient"
        | "readyeat"
        | "snack"
        | "restock";
      targetId?: string;
    }) => {
      if (seen.has(item.key)) return;
      seen.add(item.key);
      results.push(item);
    };

    bundles.forEach((bundle) => {
      const haystack = [bundle.name, bundle.description, ...(bundle.tags ?? [])]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `bundle:${bundle.id}`,
          title: bundle.name,
          subtitle: "Bundle",
          emoji: bundle.emoji,
          imageUrl: bundle.imageUrl,
          type: "bundle",
          targetId: bundle.id,
        });
      }

      bundle.items.forEach((item) => {
        const itemHaystack = item.name.toLowerCase();
        if (itemHaystack.includes(q)) {
          addResult({
            key: `bundle-item:${bundle.id}:${item.id}`,
            title: item.name,
            subtitle: `In bundle · ${bundle.name}`,
            emoji: item.emoji,
            imageUrl: item.imageUrl,
            type: "bundle",
            targetId: bundle.id,
          });
        }
      });
    });

    mealPacks.forEach((pack) => {
      const haystack = [pack.name, pack.description].join(" ").toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `mealpack:${pack.id}`,
          title: pack.name,
          subtitle: "Meal pack",
          emoji: pack.emoji,
          imageUrl: pack.imageUrl,
          type: "mealpack",
          targetId: pack.id,
        });
      }

      pack.ingredients.forEach((ingredient) => {
        if (ingredient.name.toLowerCase().includes(q)) {
          addResult({
            key: `ingredient:${pack.id}:${ingredient.name}`,
            title: ingredient.name,
            subtitle: `Ingredient · ${pack.name}`,
            emoji: ingredient.emoji,
            imageUrl: ingredient.imageUrl,
            type: "ingredient",
            targetId: pack.id,
          });
        }
      });
    });

    readyEat.forEach((item) => {
      const haystack = [
        item.name,
        item.kitchen,
        item.description,
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `readyeat:${item.id}`,
          title: item.name,
          subtitle: `Ready to Eat · ${item.kitchen}`,
          emoji: item.emoji,
          imageUrl: item.imageUrl,
          type: "readyeat",
          targetId: item.id,
        });
      }
    });

    snacks.forEach((item) => {
      const haystack = [item.name, item.category, item.tag]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `snack:${item.id}`,
          title: item.name,
          subtitle: `Snacks & Drinks · ${item.category}`,
          emoji: item.emoji,
          imageUrl: item.imageUrl,
          type: "snack",
          targetId: item.id,
        });
      }
    });

    restockItems.forEach((item) => {
      const haystack = [item.name, item.brand, item.category]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        addResult({
          key: `restock:${item.id}`,
          title: item.name,
          subtitle: `Product · ${item.brand}`,
          emoji: item.emoji,
          imageUrl: item.imageUrl,
          type: "restock",
          targetId: item.id,
        });
      }
    });

    return results.slice(0, 12);
  }, [globalQuery, bundles, mealPacks, readyEat, snacks, restockItems]);

  const handleUniversalSelect = (result: {
    type:
      | "bundle"
      | "mealpack"
      | "ingredient"
      | "readyeat"
      | "snack"
      | "restock";
    targetId?: string;
  }) => {
    if (result.type === "bundle" && result.targetId) {
      router.push(`/(app)/modes/stockup/${result.targetId}` as any);
    } else if (
      (result.type === "mealpack" || result.type === "ingredient") &&
      result.targetId
    ) {
      router.push(`/(app)/modes/cookmeal/${result.targetId}` as any);
    } else if (result.type === "readyeat" && result.targetId) {
      router.push({
        pathname: "/(app)/modes/readyeat",
        params: { itemId: result.targetId },
      } as any);
    } else if (result.type === "snack") {
      router.push("/(app)/modes/snacks" as any);
    } else if (result.type === "restock" && result.targetId) {
      router.push({
        pathname: "/(app)/modes/shoplist",
        params: { itemId: result.targetId },
      } as any);
    }
    setGlobalQuery("");
  };

  const isSearchOpen = globalQuery.trim().length >= 2;
  const hasCatalogData =
    bundles.length > 0 ||
    mealPacks.length > 0 ||
    readyEat.length > 0 ||
    snacks.length > 0 ||
    restockItems.length > 0;
  const showCatalogSkeleton = isCatalogPending && !hasCatalogData;

  return (
    <View
      className={s.container}
      style={{ backgroundColor: palette.background }}
    >
      <Header />

      {isSearchOpen && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              mode === "dark" ? "rgba(0,0,0,0.46)" : "rgba(0,0,0,0.16)",
            zIndex: 40,
          }}
          onPress={() => setGlobalQuery("")}
        />
      )}

      <View className={s.greeting} style={{ position: "relative", zIndex: 50 }}>
        <Text
          className={s.greetingTime}
          style={{ color: palette.textSecondary }}
        >
          {greeting.toUpperCase().replace(" ", "  ")}
        </Text>
        <Text
          className={s.greetingTitle}
          style={{ marginBottom: 12, color: palette.textPrimary }}
        >
          What do you want?
        </Text>

        <View style={{ position: "relative", zIndex: 50 }}>
          <SearchBar
            value={globalQuery}
            onChangeText={setGlobalQuery}
            placeholder="Search bundles, packs, ingredients, products..."
            autoFocus={false}
            variant="universal"
          />

          {isSearchOpen && (
            <View
              style={{
                position: "absolute",
                top: 58,
                left: 0,
                right: 0,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.card,
                zIndex: 60,
                maxHeight: 260,
              }}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {universalResults.length === 0 ? (
                  isCatalogPending ? (
                    <View
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          height: 12,
                          width: "60%",
                          backgroundColor: palette.border,
                        }}
                      />
                      <View
                        style={{
                          height: 12,
                          width: "76%",
                          backgroundColor: palette.border,
                        }}
                      />
                      <View
                        style={{
                          height: 12,
                          width: "52%",
                          backgroundColor: palette.border,
                        }}
                      />
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: palette.textSecondary,
                        fontSize: 10,
                        letterSpacing: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        fontFamily: "NotoSerif_400Regular",
                      }}
                    >
                      NO RESULTS FOUND
                    </Text>
                  )
                ) : (
                  universalResults.map((result) => (
                    <Pressable
                      key={result.key}
                      onPress={() => handleUniversalSelect(result)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        paddingLeft: 0,
                        paddingRight: 14,
                        paddingVertical: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: palette.border,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: 84,
                          height: 84,
                          overflow: "hidden",
                        }}
                      >
                        <ProductImage
                          imageUrl={result.imageUrl}
                          emoji={result.emoji}
                          size={84}
                          borderRadius={0}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: palette.textPrimary,
                            fontSize: 13,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {result.title}
                        </Text>
                        <Text
                          style={{
                            color: palette.textSecondary,
                            fontSize: 10,
                            letterSpacing: 1,
                            marginTop: 2,
                            fontFamily: "NotoSerif_400Regular",
                          }}
                        >
                          {result.subtitle}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className={s.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.green}
          />
        }
      >
        {!activeOrder && isLoadingOrders ? (
          <View
            className={s.orderCard}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              borderRadius: 4,
              gap: 8,
            }}
          >
            <View
              style={{
                height: 10,
                width: "30%",
                backgroundColor: palette.border,
              }}
            />
            <View
              style={{
                height: 12,
                width: "70%",
                backgroundColor: palette.border,
              }}
            />
            <View
              style={{
                height: 10,
                width: "44%",
                backgroundColor: palette.border,
              }}
            />
          </View>
        ) : null}

        {activeOrder && (
          <Pressable
            className={s.orderCard}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              borderRadius: 4,
            }}
            onPress={() =>
              router.push(`/(app)/orders/${activeOrder.id}` as any)
            }
          >
            <View className={s.orderIcon}>
              <Text style={{ fontSize: 16 }}>📦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                className={s.orderLabel}
                style={{ color: palette.textSecondary }}
              >
                ACTIVE ORDER
              </Text>
              <Text
                className={s.orderTitle}
                style={{ color: palette.textPrimary }}
              >
                {activeOrder.items
                  .slice(0, 2)
                  .map((i) => `${i.emoji} ${i.name}`)
                  .join(", ")}
                {activeOrder.items.length > 2
                  ? ` +${activeOrder.items.length - 2}`
                  : ""}
              </Text>
              {activeOrder.eta && (
                <Text
                  className={s.orderEta}
                  style={{ color: palette.textSecondary }}
                >
                  {activeOrder.eta}
                </Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                className={s.orderStatus}
                style={{
                  color:
                    colors.status[
                      activeOrder.status as keyof typeof colors.status
                    ] ?? colors.accent.amber,
                }}
              >
                {activeOrder.status}
              </Text>
              <Text
                className={s.orderView}
                style={{ color: palette.textSecondary }}
              >
                View →
              </Text>
            </View>
          </Pressable>
        )}

        <View className={s.modeList}>
          {SHOPPING_MODES.map((mode) => (
            <ModeCard key={mode.key} mode={mode} />
          ))}
        </View>

        {showCatalogSkeleton ? (
          <View
            style={{
              marginTop: 12,
              marginHorizontal: 20,
              padding: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.card,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: palette.textSecondary,
                fontSize: 10,
                letterSpacing: 1,
                fontFamily: "NotoSerif_400Regular",
              }}
            >
              LOADING CATALOG IN BACKGROUND
            </Text>
            <View
              style={{
                height: 9,
                width: "86%",
                backgroundColor: palette.border,
              }}
            />
            <View
              style={{
                height: 9,
                width: "64%",
                backgroundColor: palette.border,
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
