import { useState, useCallback, useEffect, useRef } from "react";
import { useWalletStore } from "../stores/walletStore";
import * as walletService from "../services/wallet";
import { formatPrice } from "../utils/format";
import { WALLET_POLL_INTERVAL_MS } from "../utils/constants";
import type { WalletTransaction, TopupInitResponse, Pagination } from "../types";

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

  const fetchTransactions = useCallback(
    async (page = 1, limit = 20) => {
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
    },
    [],
  );

  const initTopup = useCallback(
    async (amount: number): Promise<TopupInitResponse> => {
      setError(null);
      try {
        return await walletService.initTopup(amount, "bazang://wallet/topup-success");
      } catch (err: any) {
        const msg = err.response?.data?.error ?? "Failed to initiate top-up";
        setError(msg);
        throw err;
      }
    },
    [],
  );

  const verifyTopup = useCallback(
    async (reference: string) => {
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
    },
    [],
  );

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
    error,
    refreshBalance,
    fetchTransactions,
    initTopup,
    verifyTopup,
    startPolling,
    stopPolling,
  };
}
