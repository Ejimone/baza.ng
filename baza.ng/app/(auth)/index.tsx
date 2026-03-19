import { router } from "expo-router";
import { Envelope, GoogleLogo, Phone } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { authScreen as s } from "../../styles";
import { PHONE_AUTH_FEATURES_ENABLED } from "../../utils/constants";

export default function WelcomeScreen() {
  const [isSignInMode, setIsSignInMode] = useState(false);
  const { signInWithGoogle, isLoading, error, clearError } = useAuth();

  const handleGoogle = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // error state is set by the hook
    }
  };

  const handleEmail = () => {
    router.push(
      isSignInMode
        ? ("/(auth)/signin-email" as any)
        : ("/(auth)/signup-email" as any),
    );
  };

  return (
    <View className={s.welcomeContainer}>
      <Text
        className={s.welcomeLogo}
        style={{ fontFamily: "NotoSerif_400Regular" }}
      >
        Baza.ng
      </Text>

      <Text className={s.welcomeDesc}>
        The smarter way to stock your kitchen.{"\n"}
        <Text className={s.welcomeDescHint}>
          Market pricing. Delivered to your doorstep
        </Text>
      </Text>

      <Text className={s.welcomeSectionLabel}>
        {isSignInMode ? "SIGN IN" : "CREATE ACCOUNT"}
      </Text>

      <Pressable
        onPress={handleGoogle}
        disabled={isLoading}
        className={`${s.welcomeAuthBtn} ${s.welcomeAuthBtnGoogle}`}
      >
        <GoogleLogo size={20} color="#333" weight="bold" />
        <Text className="text-[#333] font-bold">
          {isLoading
            ? "Signing in..."
            : isSignInMode
              ? "Sign in with Google"
              : "Sign up with Google"}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleEmail}
        className={`${s.welcomeAuthBtn} ${s.welcomeAuthBtnEmail}`}
      >
        <Envelope size={20} color="#fff" weight="bold" />
        <Text className="text-white font-bold">
          {isSignInMode ? "Sign in with Email" : "Sign up with Email"}
        </Text>
      </Pressable>

      {PHONE_AUTH_FEATURES_ENABLED ? (
        <Pressable
          onPress={() =>
            router.push(
              isSignInMode
                ? ("/(auth)/signin" as any)
                : ("/(auth)/signup" as any),
            )
          }
          className={`${s.welcomeAuthBtn} ${s.welcomeAuthBtnPhone}`}
        >
          <Phone size={20} color="#fff" weight="bold" />
          <Text className="text-white font-bold">
            {isSignInMode ? "Sign in with Phone" : "Sign up with Phone"}
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => {
          setIsSignInMode((m) => !m);
          clearError();
        }}
        className="mt-4"
      >
        <Text className="text-baza-green text-3xs tracking-wide-md font-mono">
          {isSignInMode
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Text>
      </Pressable>

      {error ? (
        <Text className="mt-3 text-3xs text-baza-red tracking-wide-sm font-mono text-center">
          {error}
        </Text>
      ) : null}

      <Text className={s.welcomeTerms}>
        By continuing, you agree to Baza&apos;s{"\n"}Terms of Service & Privacy
        Policy.
      </Text>
    </View>
  );
}
