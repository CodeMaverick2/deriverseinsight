"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatCurrency, getTimeAgo } from "@/lib/utils";
import { Trade } from "@/types";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface RecentTradesProps {
  trades: Trade[];
  limit?: number;
}

export function RecentTrades({ trades, limit = 10 }: RecentTradesProps) {
  const recentTrades = trades.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Trades
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Last {recentTrades.length} trades
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-full p-1.5",
                      trade.side === "LONG" ? "bg-profit/10" : "bg-loss/10"
                    )}
                  >
                    {trade.side === "LONG" ? (
                      <ArrowUpRight className="h-4 w-4 text-profit" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-loss" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.symbol}</span>
                      <Badge
                        variant={trade.side === "LONG" ? "long" : "short"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {trade.side}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {trade.market}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{getTimeAgo(trade.timestamp)}</span>
                      <span>•</span>
                      <span>{trade.orderType}</span>
                      {trade.leverage && (
                        <>
                          <span>•</span>
                          <span>{trade.leverage}x</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {trade.pnl !== undefined ? (
                    <p
                      className={cn(
                        "font-mono font-semibold",
                        trade.pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl)}
                    </p>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      OPEN
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
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
