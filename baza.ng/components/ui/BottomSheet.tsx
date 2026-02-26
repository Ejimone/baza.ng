import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  View,
  type ViewProps,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface BottomSheetProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heroColor?: string;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  heroColor,
  ...rest
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (visible) {
      isVisible.current = true;
      isMounted.current = true;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 24,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible.current) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isVisible.current = false;
        isMounted.current = false;
      });
    }
  }, [visible]);

  if (!visible && !isMounted.current) return null;

  return (
    <View
      className="absolute inset-0 z-[500] flex-col justify-end"
      pointerEvents={visible ? "auto" : "none"}
      {...rest}
    >
      <Animated.View
        style={[
          { flex: 1, backgroundColor: "rgba(0,0,0,0.88)" },
          { opacity: fadeAnim },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 0,
            paddingBottom: 44,
            backgroundColor: heroColor ?? "#080f09",
          },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}
