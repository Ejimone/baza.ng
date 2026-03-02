import { router } from "expo-router";
import { useCallback, useState } from "react";
import type { OtpVerifyPayload } from "../services/auth";
import * as authService from "../services/auth";
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

  const requestOtp = useCallback(async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.requestOtp(phone);
      return result;
    } catch (err: any) {
      const msg =
        err.response?.data?.error ?? "Failed to send OTP. Please try again.";
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
        const msg =
          err.response?.data?.error ?? "Invalid OTP. Please try again.";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

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
    logout: handleLogout,
    updateUser,
    clearError: () => setError(null),
  };
}
