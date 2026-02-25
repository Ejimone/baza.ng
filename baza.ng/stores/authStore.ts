import { create } from "zustand";
import type { User } from "../types";
import { deleteRefreshToken } from "../utils/storage";
import { setAuthAccessors } from "../services/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true }),

  logout: () => {
    deleteRefreshToken();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
}));

// Wire up the API client so it can read the token and handle refresh failures
setAuthAccessors(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().logout(),
);
