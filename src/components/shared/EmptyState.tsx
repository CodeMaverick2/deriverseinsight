"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wallet, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  isConnected: boolean;
  className?: string;
}

export function EmptyState({ isConnected, className }: EmptyStateProps) {
  if (!isConnected) {
    return (
      <Card className={cn(
        "relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardContent className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="rounded-2xl bg-primary/10 p-4 mb-6">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Connect your Solana wallet to view your trading history, portfolio, and analytics from Deriverse.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Connected but no trades
  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <CardContent className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="rounded-2xl bg-muted/50 p-4 mb-6">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Trading History Found
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Your connected wallet doesn't have any trades on Deriverse yet. Start trading to see your analytics here.
        </p>
        <Link href="https://www.deriverse.io" target="_blank">
          <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
            Start Trading on Deriverse
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Smaller inline empty state for individual components
export function EmptyStateInline({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <BarChart3 className="h-8 w-8 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
