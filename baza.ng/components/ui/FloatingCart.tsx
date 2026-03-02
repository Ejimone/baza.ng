import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
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
import { useCart } from "../../hooks/useCart";
import { useThemeStore } from "../../stores/themeStore";
import { floatingCart as s } from "../../styles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FloatingCart() {
  const router = useRouter();
  const { count, formattedTotal, isEmpty } = useCart();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const translateY = useRef(new Animated.Value(0)).current;

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
      animateTo(-(keyboardHeight + 12), duration);
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

  if (isEmpty) return null;

  return (
    <AnimatedPressable
      className={s.button}
      style={{
        backgroundColor: palette.card,
        borderColor: palette.border,
        borderWidth: 1,
        transform: [{ translateY }],
      }}
      onPress={() => router.push("/(app)/cart")}
    >
      <View className={s.iconWrap}>
        <View className={s.cartIcon}>
          <Text style={{ fontSize: 27 }}>🛒</Text>
          <View className={s.badge} style={{ borderColor: palette.card }}>
            <Text className={s.badgeText}>{count}</Text>
          </View>
        </View>
        <View>
          <Text className={s.label} style={{ color: palette.textPrimary }}>
            CART
          </Text>
          <Text className={s.sub} style={{ color: palette.textSecondary }}>
            {count} item{count !== 1 ? "s" : ""} · {formattedTotal}
          </Text>
        </View>
      </View>
      <Text className={s.chevron} style={{ color: palette.textPrimary }}>
        ›
      </Text>
    </AnimatedPressable>
  );
}
