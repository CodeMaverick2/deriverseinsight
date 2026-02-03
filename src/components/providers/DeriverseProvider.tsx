"use client";

import { useDerivverse } from "@/hooks/useDerivverse";

/**
 * Provider component that handles Deriverse data fetching
 * Must be used inside WalletProvider
 */
export function DeriverseProvider({ children }: { children: React.ReactNode }) {
  // This hook handles all the data fetching automatically
  const { error } = useDerivverse();

  // We could show an error banner here if needed
  // For now, just render children
  return <>{children}</>;
}
