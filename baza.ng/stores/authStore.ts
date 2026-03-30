import { create } from "zustand";
import { setAuthAccessors } from "../services/api";
import type { User } from "../types";
import { deleteRefreshToken } from "../utils/storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  needsReferralOnboarding: boolean;

  login: (
    user: User,
    token: string,
    options?: { needsReferralOnboarding?: boolean },
  ) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  completeReferralOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  needsReferralOnboarding: false,

  login: (user, token, options) =>
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      needsReferralOnboarding: Boolean(options?.needsReferralOnboarding),
    }),

  logout: () => {
    deleteRefreshToken();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      needsReferralOnboarding: false,
    });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  completeReferralOnboarding: () => set({ needsReferralOnboarding: false }),
}));

// Wire up the API client so it can read the token and handle refresh failures
setAuthAccessors(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().logout(),
);
