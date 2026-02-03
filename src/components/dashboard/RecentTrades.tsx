"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatCurrency, getTimeAgo } from "@/lib/utils";
import { Trade } from "@/types";
import { ArrowUpRight, ArrowDownRight, Clock, Activity } from "lucide-react";

interface RecentTradesProps {
  trades: Trade[];
  limit?: number;
}

export function RecentTrades({ trades, limit = 10 }: RecentTradesProps) {
  const recentTrades = trades.slice(0, limit);

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">
              Recent Trades
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Last {recentTrades.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-2">
            {recentTrades.map((trade, index) => (
              <div
                key={trade.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                  "bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2 transition-transform group-hover:scale-105",
                      trade.side === "LONG"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {trade.side === "LONG" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/90">{trade.symbol}</span>
                      <Badge
                        variant={trade.side === "LONG" ? "long" : "short"}
                        className="text-[10px] px-1.5 py-0 font-semibold"
                      >
                        {trade.side}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">
                        {trade.market}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <span>{getTimeAgo(trade.timestamp)}</span>
                      <span className="text-border">•</span>
                      <span>{trade.orderType}</span>
                      {trade.leverage && (
                        <>
                          <span className="text-border">•</span>
                          <span className="text-primary font-medium">{trade.leverage}x</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {trade.pnl !== undefined ? (
                    <p
                      className={cn(
                        "font-mono font-bold text-sm",
                        trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl)}
                    </p>
                  ) : (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      OPEN
                    </Badge>
                  )}
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {trade.size.toFixed(4)} @ {formatCurrency(trade.entryPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
