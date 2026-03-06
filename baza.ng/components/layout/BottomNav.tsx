import { usePathname, useRouter } from "expo-router";
import {
  House,
  MagnifyingGlass,
  ShoppingCart,
  UserCircle,
} from "phosphor-react-native";
import { memo, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { perfMark } from "../../utils/perfLogger";

const AnimatedView = Animated.createAnimatedComponent(View);

type NavItem = {
  key: "home" | "browse" | "cart" | "account";
  label: string;
  icon: "home" | "browse" | "cart" | "account";
  route: string;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    label: "HOME",
    icon: "home",
    route: "/",
    isActive: (pathname) => pathname === "/" || pathname === "/(app)",
  },
  {
    key: "browse",
    label: "BROWSE",
    icon: "browse",
    route: "/modes/shoplist",
    isActive: (pathname) =>
      pathname.includes("/modes/shoplist") ||
      pathname.includes("/modes/wholesale") ||
      pathname.includes("/modes/stockup") ||
      pathname.includes("/modes/cookmeal") ||
      pathname.includes("/modes/readyeat") ||
      pathname.includes("/modes/snacks"),
  },
  {
    key: "cart",
    label: "CART",
    icon: "cart",
    route: "/cart",
    isActive: (pathname) => pathname.includes("/cart"),
  },
  {
    key: "account",
    label: "ACCOUNT",
    icon: "account",
    route: "/profile",
    isActive: (pathname) => pathname.includes("/profile"),
  },
];

function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.qty, 0),
  );
  const palette = getThemePalette(mode);
  const translateY = useRef(new Animated.Value(0)).current;
  const lastTapAtRef = useRef(0);

  const renderIcon = useCallback(
    (icon: NavItem["icon"], active: boolean) => {
      const color = active ? palette.textPrimary : palette.textSecondary;
      const weight = active ? "fill" : "regular";

      if (icon === "home") {
        return <House size={24} color={color} weight={weight} />;
      }
      if (icon === "browse") {
        return <MagnifyingGlass size={24} color={color} weight={weight} />;
      }
      if (icon === "cart") {
        return <ShoppingCart size={24} color={color} weight={weight} />;
      }
      return <UserCircle size={24} color={color} weight={weight} />;
    },
    [palette.textPrimary, palette.textSecondary],
  );

  const handlePress = useCallback(
    (route: string, active: boolean) => {
      if (active) return;

      const now = Date.now();
      if (now - lastTapAtRef.current < 180) return;
      lastTapAtRef.current = now;

      perfMark("nav:tap");

      // Avoid stack buildup from repeated tab pushes; replace keeps tab nav snappy.
      requestAnimationFrame(() => {
        router.replace(route as any);
      });
    },
    [router],
  );

  useEffect(() => {
    const prefetch = (router as any).prefetch;
    if (typeof prefetch !== "function") return;

    prefetch("/modes/shoplist");
    prefetch("/cart");
    prefetch("/profile");
  }, [router]);

  useEffect(() => {
    const animateTo = (toValue: number, duration = 220) => {
      Animated.timing(translateY, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates?.height ?? 0;
      const duration =
        typeof event.duration === "number" ? event.duration : 220;
      animateTo(-(keyboardHeight + 8), duration);
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      const duration =
        typeof event.duration === "number" ? event.duration : 220;
      animateTo(0, duration);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  return (
    <AnimatedView
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1,
        borderTopColor: palette.border,
        backgroundColor: palette.background,
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 10,
        transform: [{ translateY }],
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Pressable
              key={item.key}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                paddingVertical: 4,
              }}
              onPress={() => {
                handlePress(item.route, active);
              }}
            >
              <View style={{ opacity: active ? 1 : 0.72 }}>
                {item.key === "cart" ? (
                  <View style={{ position: "relative" }}>
                    {renderIcon(item.icon, active)}
                    {count > 0 ? (
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -10,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          paddingHorizontal: 3,
                          backgroundColor: "#4caf7d",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: palette.background,
                        }}
                      >
                        <Text
                          style={{
                            color: "#000",
                            fontSize: 8,
                            fontFamily: "NotoSerif_400Regular",
                            lineHeight: 10,
                          }}
                        >
                          {count > 99 ? "99+" : String(count)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  renderIcon(item.icon, active)
                )}
              </View>
              <Text
                style={{
                  color: active ? palette.textPrimary : palette.textSecondary,
                  fontSize: 8,
                  letterSpacing: 1.6,
                  fontFamily: "NotoSerif_400Regular",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AnimatedView>
  );
}

export default memo(BottomNav);
