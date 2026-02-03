import { clusterApiUrl, Connection } from "@solana/web3.js";

export type NetworkType = "devnet" | "mainnet-beta" | "testnet";

export const NETWORK_CONFIG: Record<
  NetworkType,
  { name: string; endpoint: string }
> = {
  devnet: {
    name: "Devnet",
    endpoint: clusterApiUrl("devnet"),
  },
  "mainnet-beta": {
    name: "Mainnet",
    endpoint: clusterApiUrl("mainnet-beta"),
  },
  testnet: {
    name: "Testnet",
    endpoint: clusterApiUrl("testnet"),
  },
};

export function getConnection(network: NetworkType): Connection {
  return new Connection(NETWORK_CONFIG[network].endpoint, "confirmed");
}

export function getExplorerUrl(
  address: string,
  network: NetworkType = "devnet"
): string {
  const baseUrl = "https://explorer.solana.com";
  const clusterParam = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  return `${baseUrl}/address/${address}${clusterParam}`;
}

export function getTxExplorerUrl(
  signature: string,
  network: NetworkType = "devnet"
): string {
  const baseUrl = "https://explorer.solana.com";
  const clusterParam = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  return `${baseUrl}/tx/${signature}${clusterParam}`;
}
