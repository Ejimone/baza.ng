import { create } from "zustand";
import * as walletService from "../services/wallet";

interface WalletState {
  balance: number;
  accountNumber: string | null;
  bankName: string | null;
  accountName: string | null;
  isLoading: boolean;

  setBalance: (balance: number) => void;
  setWalletInfo: (info: {
    balance: number;
    accountNumber: string;
    bankName: string;
    accountName: string;
  }) => void;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  accountNumber: null,
  bankName: null,
  accountName: null,
  isLoading: false,

  setBalance: (balance) => set({ balance }),

  setWalletInfo: ({ balance, accountNumber, bankName, accountName }) =>
    set({ balance, accountNumber, bankName, accountName }),

  refreshBalance: async () => {
    set({ isLoading: true });
    try {
      const data = await walletService.getBalance();
      set({
        balance: data.balance,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
