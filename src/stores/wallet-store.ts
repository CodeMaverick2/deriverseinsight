import { create } from "zustand";

interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;

  // Network
  network: "devnet" | "mainnet-beta" | "testnet";
  setNetwork: (network: "devnet" | "mainnet-beta" | "testnet") => void;

  // Actions
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setWalletAddress: (address: string | null) => void;

  // Disconnect
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  walletAddress: null,
  network: "mainnet-beta",

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setNetwork: (network) => set({ network }),

  // Disconnect
  disconnect: () =>
    set({
      isConnected: false,
      isConnecting: false,
      walletAddress: null,
    }),
}));
