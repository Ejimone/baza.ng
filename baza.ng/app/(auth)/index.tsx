import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { authScreen as s } from "../../styles";

export default function WelcomeScreen() {
  return (
    <View className={s.welcomeContainer}>
      <Text className={s.welcomeTagline}>MEMBERS ONLY · LAGOS</Text>
      <Text className={s.welcomeLogo}>baza</Text>
      <Text className={s.welcomeDot}>.ng</Text>

      <Text className={s.welcomeDesc}>
        The smarter way to stock your kitchen.{"\n"}
        <Text className={s.welcomeDescHint}>
          Members-only pricing. Delivered.
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
        <Text className="text-[#3a5c3a] text-xxs tracking-wide-xl font-mono text-center">
          SIGN IN
        </Text>
      </Pressable>

      <Text className={s.welcomeTerms}>
        By continuing, you agree to Baza's{"\n"}Terms of Service & Privacy
        Policy.
      </Text>
    </View>
  );
}
