import { router } from "expo-router";
import { useCallback, useState } from "react";
import type {
  OtpRequestPayload,
  OtpVerifyPayload,
} from "../services/auth";
import * as authService from "../services/auth";
import * as firebaseEmailAuth from "../services/firebaseEmailAuth";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    login,
    logout: storeLogout,
    updateUser,
  } = useAuthStore();
  const clearCartLocal = useCartStore((s) => s.clearLocal);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useCallback(async (payload: OtpRequestPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.requestOtp(payload);
      return result;
    } catch (err: any) {
      const msg = getAuthErrorMessage(
        err,
        "Failed to send OTP. Please try again.",
      );
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (payload: OtpVerifyPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const { accessToken, user: userData } =
          await authService.verifyOtp(payload);
        login(userData, accessToken);
        void useCartStore.getState().fetchCart();
        router.replace("/(app)");
        return userData;
      } catch (err: any) {
        const msg = getAuthErrorMessage(err, "Invalid OTP. Please try again.");
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      _referralCode?: string,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await firebaseEmailAuth.signUpWithEmail(email, password);
        const idToken = await firebaseEmailAuth.getIdToken(user);
        const { accessToken, user: userData } =
          await authService.verifyFirebaseToken({
            idToken,
            name: name ?? user.displayName ?? undefined,
          });
        login(userData, accessToken);
        void useCartStore.getState().fetchCart();
        router.replace("/(app)");
        return userData;
      } catch (err: any) {
        const msg = getAuthErrorMessage(
          err,
          "Sign up failed. Please try again.",
        );
        setError(mapFirebaseAuthError(err) ?? msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await firebaseEmailAuth.signInWithEmail(email, password);
        const idToken = await firebaseEmailAuth.getIdToken(user);
        const { accessToken, user: userData } =
          await authService.verifyFirebaseToken({
            idToken,
          });
        login(userData, accessToken);
        void useCartStore.getState().fetchCart();
        router.replace("/(app)");
        return userData;
      } catch (err: any) {
        const msg = getAuthErrorMessage(
          err,
          "Sign in failed. Please try again.",
        );
        setError(mapFirebaseAuthError(err) ?? msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await firebaseEmailAuth.signInWithGoogle();
      const idToken = await firebaseEmailAuth.getIdToken(user);
      const { accessToken, user: userData } =
        await authService.verifyFirebaseToken({
          idToken,
          name: user.displayName ?? undefined,
        });
      login(userData, accessToken);
      void useCartStore.getState().fetchCart();
      router.replace("/(app)");
      return userData;
    } catch (err: any) {
      if (mapGoogleSignInError(err) === null && err?.code === "SIGN_IN_CANCELLED") {
        // User cancelled, don't show error
      } else {
        const msg = getAuthErrorMessage(
          err,
          "Google sign-in failed. Please try again.",
        );
        setError(mapFirebaseAuthError(err) ?? mapGoogleSignInError(err) ?? msg);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout API call may fail if token expired — proceed anyway
    }
    clearCartLocal();
    storeLogout();
    router.replace("/(auth)");
  }, [storeLogout, clearCartLocal]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    requestOtp,
    verifyOtp,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logout: handleLogout,
    updateUser,
    clearError: () => setError(null),
  };
}

function getAuthErrorMessage(err: any, fallback: string): string {
  const mapped = mapAuthErrorCode(err?.response?.data?.code);
  if (mapped) {
    return mapped;
  }

  const backendMessage = err?.response?.data?.error;
  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage;
  }

  const rawMessage = err?.message;
  if (typeof rawMessage === "string" && rawMessage.trim()) {
    return rawMessage.trim();
  }

  return fallback;
}

function mapAuthErrorCode(code: unknown): string | null {
  if (typeof code !== "string") {
    return null;
  }

  switch (code) {
    case "PHONE_REQUIRED":
      return "Please enter a valid phone number.";
    case "PHONE_OTP_REQUIRED":
      return "Phone number and OTP are required.";
    case "INVALID_OTP":
      return "Invalid or expired OTP. Request a new code and try again.";
    case "PHONE_ALREADY_REGISTERED":
      return "An account with this phone number already exists. Please sign in.";
    case "ACCOUNT_NOT_FOUND":
      return "No account was found for this phone number. Please sign up first.";
    case "RATE_LIMIT_EXCEEDED":
      return "Too many OTP requests. Please wait a few minutes and try again.";
    case "OTP_SEND_FAILED":
      return "OTP could not be sent right now. Please try again shortly.";
    case "ID_TOKEN_REQUIRED":
      return "Authentication token is required. Please try again.";
    case "FIREBASE_TOKEN_INVALID":
      return "Invalid authentication. Please sign in again.";
    case "FIREBASE_TOKEN_EXPIRED":
      return "Session expired. Please sign in again.";
    case "FIREBASE_TOKEN_REVOKED":
      return "Session was revoked. Please sign in again.";
    case "EMAIL_REQUIRED":
      return "Email is required for this sign-in method.";
    case "ACCOUNT_LINK_CONFLICT":
    case "EMAIL_MISMATCH":
      return "This account is already linked to another email.";
    case "FIREBASE_CONFIG_ERROR":
      return "Authentication service error. Please try again later.";
    default:
      return null;
  }
}

function mapGoogleSignInError(err: any): string | null {
  const code = err?.code;
  const message = err?.message ?? "";

  // Expo Go or native module not found — Google Sign-In needs dev build
  if (
    typeof message === "string" &&
    (message.includes("GOOGLE_SIGNIN_EXPO_GO") ||
      message.includes("RNGoogleSignin") ||
      message.includes("TurboModuleRegistry"))
  ) {
    return "Google Sign-In requires a development build. Use Email or Phone sign-in, or run: npx expo run:android";
  }

  if (typeof code !== "string") {
    return null;
  }
  switch (code) {
    case "SIGN_IN_CANCELLED":
      return null; // User cancelled, don't show error
    case "IN_PROGRESS":
      return "Sign-in already in progress.";
    case "PLAY_SERVICES_NOT_AVAILABLE":
      return "Google Play Services is not available.";
    default:
      return null;
  }
}

function mapFirebaseAuthError(err: any): string | null {
  const code = err?.code ?? err?.response?.data?.code;
  if (typeof code !== "string") {
    return null;
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return null;
  }
}
