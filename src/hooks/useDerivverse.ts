"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTradesStore } from "@/stores/trades-store";
import {
  initializeEngine,
  fetchClientData,
  fetchPositions,
  fetchTradeHistory,
} from "@/lib/deriverse/client";

export function useDerivverse() {
  const { publicKey, connected } = useWallet();
  const { setTrades, setPositions, setIsLoading } = useTradesStore();
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize engine on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeEngine();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Deriverse engine:", err);
        setError("Failed to connect to Deriverse");
      }
    };
    init();
  }, []);

  // Fetch data when wallet connects
  const fetchData = useCallback(async () => {
    if (!publicKey || !connected || !isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();

      // Fetch positions and trades in parallel
      const [positions, trades] = await Promise.all([
        fetchPositions(walletAddress),
        fetchTradeHistory(walletAddress),
      ]);

      setPositions(positions);
      setTrades(trades);
    } catch (err) {
      console.error("Error fetching Deriverse data:", err);
      setError("Failed to fetch trading data");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, isInitialized, setTrades, setPositions, setIsLoading]);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (connected && isInitialized) {
      fetchData();
    }
  }, [connected, isInitialized, fetchData]);

  // Clear data when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setTrades([]);
      setPositions([]);
    }
  }, [connected, setTrades, setPositions]);

  return {
    isInitialized,
    error,
    refetch: fetchData,
  };
}
