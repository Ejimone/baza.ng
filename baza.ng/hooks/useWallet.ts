import { useCallback, useRef, useState } from "react";
import * as walletService from "../services/wallet";
import { useWalletStore } from "../stores/walletStore";
import type {
    Pagination,
    PaystackConfig,
    TopupInitResponse,
    WalletAccountResponse,
    WalletTransaction,
} from "../types";
import { WALLET_POLL_INTERVAL_MS } from "../utils/constants";
import { formatPrice } from "../utils/format";

export function useWallet() {
  const {
    balance,
    accountNumber,
    bankName,
    accountName,
    isLoading: isRefreshing,
    refreshBalance,
    setWalletInfo,
  } = useWalletStore();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txPagination, setTxPagination] = useState<Pagination | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedBalance = formatPrice(balance);

  const fetchTransactions = useCallback(async (page = 1, limit = 20) => {
    setIsLoadingTx(true);
    setError(null);
    try {
      const data = await walletService.getTransactions(page, limit);
      setTransactions(data.transactions);
      if (data.pagination) setTxPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load transactions");
    } finally {
      setIsLoadingTx(false);
    }
  }, []);

  const initTopup = useCallback(
    async (amount: number): Promise<TopupInitResponse> => {
      setError(null);
      try {
        return await walletService.initTopup(
          amount,
          "bazang://wallet/topup-success",
        );
      } catch (err: any) {
        const msg = err.response?.data?.error ?? "Failed to initiate top-up";
        setError(msg);
        throw err;
      }
    },
    [],
  );

  const verifyTopup = useCallback(async (reference: string) => {
    setError(null);
    try {
      const result = await walletService.verifyTopup(reference);
      useWalletStore.getState().setBalance(result.walletBalance);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "Verification failed";
      setError(msg);
      throw err;
    }
  }, []);

  const [account, setAccount] = useState<WalletAccountResponse | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  const fetchAccount = useCallback(async () => {
    setIsLoadingAccount(true);
    setError(null);
    try {
      const data = await walletService.getAccount();
      setAccount(data);
      if (data.accountNumber) {
        setWalletInfo({
          balance: data.walletBalance,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          accountName: data.accountName,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load account details");
    } finally {
      setIsLoadingAccount(false);
    }
  }, [setWalletInfo]);

  // Polling: call startPolling() when wallet screen mounts, stopPolling() on unmount
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      refreshBalance();
    }, WALLET_POLL_INTERVAL_MS);
  }, [refreshBalance]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchPaystackConfig = useCallback(async (): Promise<PaystackConfig> => {
    try {
      return await walletService.getPaystackConfig();
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "Failed to get payment config";
      setError(msg);
      throw err;
    }
  }, []);

  return {
    balance,
    formattedBalance,
    accountNumber,
    bankName,
    accountName,
    isRefreshing,
    transactions,
    txPagination,
    isLoadingTx,
    account,
    isLoadingAccount,
    error,
    refreshBalance,
    fetchTransactions,
    fetchAccount,
    initTopup,
    verifyTopup,
    fetchPaystackConfig,
    startPolling,
    stopPolling,
  };
}
