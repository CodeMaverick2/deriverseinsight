"use client";

import { useState } from "react";
import { Wallet, ChevronDown, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/wallet-store";
import { shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Header() {
  const { isConnected, walletAddress, network, setNetwork, disconnect } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    // Simulate wallet connection for demo
    useWalletStore.setState({
      isConnected: true,
      walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left side - Page title or breadcrumb would go here */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="font-mono text-xs">
          {network.toUpperCase()}
        </Badge>
      </div>

      {/* Right side - Wallet connection */}
      <div className="flex items-center gap-4">
        {/* Network Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  network === "mainnet-beta" ? "bg-profit" : "bg-yellow-500"
                )}
              />
              {network === "mainnet-beta" ? "Mainnet" : network === "devnet" ? "Devnet" : "Testnet"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Network</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setNetwork("mainnet-beta")}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-profit" />
                Mainnet
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNetwork("devnet")}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                Devnet
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNetwork("testnet")}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Testnet
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Connection */}
        {isConnected && walletAddress ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="font-mono">{shortenAddress(walletAddress)}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Wallet</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopy}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs">{shortenAddress(walletAddress, 6)}</span>
                  {copied ? (
                    <Check className="h-4 w-4 text-profit" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://explorer.solana.com/address/${walletAddress}?cluster=${network}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={disconnect}
                className="text-destructive focus:text-destructive"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleConnect} className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
