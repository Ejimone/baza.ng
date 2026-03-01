import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { getThemePalette } from "../../constants/appTheme";
import { useThemeStore } from "../../stores/themeStore";
import { authScreen as s } from "../../styles";

export default function WelcomeScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);

  return (
    <View className={s.welcomeContainer}>
      {/* <Text className={s.welcomeTagline}>MEMBERS ONLY · LAGOS</Text> */}
      <Text className={s.welcomeLogo}>Baza.ng</Text>
      {/* <Text className={s.welcomeDot}>.ng</Text> */}

      <Text className={s.welcomeDesc}>
        The smarter way to stock your kitchen.{"\n"}
        <Text className={s.welcomeDescHint}>
          Market pricing. Delivered to your doorstep
        </Text>
      </Text>

      <Pressable
        onPress={() => router.push("/(auth)/signup")}
        className={s.welcomeCreateBtn}
      >
        <Text className="text-black text-[11px] tracking-wide-2xl font-mono font-bold text-center">
          CREATE ACCOUNT
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/signin")}
        className={s.welcomeSignInBtn}
      >
        <Text
          className="text-xxs tracking-wide-xl font-mono text-center"
          style={{ color: palette.textSecondary }}
        >
          SIGN IN
        </Text>
      </Pressable>

      <Text className={s.welcomeTerms}>
        By continuing, you agree to Baza’s{"\n"}Terms of Service & Privacy
        Policy.
      </Text>
    </View>
  );
}
