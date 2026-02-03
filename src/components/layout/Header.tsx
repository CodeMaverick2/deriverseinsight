"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, ChevronDown, ExternalLink, Copy, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shortenAddress } from "@/lib/utils";

export function Header() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const getExplorerUrl = (address: string) => {
    return `https://explorer.solana.com/address/${address}`;
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border/50 bg-card/30 backdrop-blur-xl px-6">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Left side - Network Status */}
      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
            Mainnet
          </span>
        </div>
      </div>

      {/* Right side - Wallet connection */}
      <div className="relative flex items-center gap-3">
        {/* Wallet Connection */}
        {connected && walletAddress ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-mono font-medium">{shortenAddress(walletAddress)}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Connected Wallet
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopy} className="gap-2">
                <span className="font-mono text-xs flex-1">
                  {shortenAddress(walletAddress, 8)}
                </span>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={getExplorerUrl(walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={handleConnect}
            className="gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02]"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
