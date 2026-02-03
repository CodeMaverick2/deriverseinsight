"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { Trade, OrderType } from "@/types";
import { Zap, Clock, Target } from "lucide-react";

interface OrderTypeAnalysisProps {
  trades: Trade[];
}

export function OrderTypeAnalysis({ trades }: OrderTypeAnalysisProps) {
  const stats = useMemo(() => {
    const orderTypes: OrderType[] = ["IOC", "LIMIT", "MARKET"];
    const typeMap = new Map<
      OrderType,
      { trades: number; wins: number; pnl: number; volume: number }
    >();

    orderTypes.forEach((type) => {
      typeMap.set(type, { trades: 0, wins: 0, pnl: 0, volume: 0 });
    });

    trades.forEach((trade) => {
      const stats = typeMap.get(trade.orderType);
      if (stats) {
        stats.trades++;
        stats.volume += trade.size * trade.entryPrice;
        if (trade.status === "CLOSED" && trade.pnl !== undefined) {
          stats.pnl += trade.pnl;
          if (trade.pnl > 0) stats.wins++;
        }
      }
    });

    return orderTypes.map((type) => {
      const data = typeMap.get(type)!;
      const closedTrades = trades.filter(
        (t) => t.orderType === type && t.status === "CLOSED"
      ).length;

      return {
        type,
        ...data,
        winRate: closedTrades > 0 ? (data.wins / closedTrades) * 100 : 0,
      };
    });
  }, [trades]);

  const totalTrades = stats.reduce((sum, s) => sum + s.trades, 0);

  const getIcon = (type: OrderType) => {
    switch (type) {
      case "IOC":
        return <Zap className="h-5 w-5" />;
      case "LIMIT":
        return <Target className="h-5 w-5" />;
      case "MARKET":
        return <Clock className="h-5 w-5" />;
    }
  };

  const getDescription = (type: OrderType) => {
    switch (type) {
      case "IOC":
        return "Immediate or Cancel";
      case "LIMIT":
        return "Limit Orders";
      case "MARKET":
        return "Market Orders";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Order Type Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => {
            const percentage =
              totalTrades > 0 ? (stat.trades / totalTrades) * 100 : 0;

            return (
              <div
                key={stat.type}
                className="p-4 rounded-lg bg-muted/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getIcon(stat.type)}
                    </div>
                    <div>
                      <p className="font-medium">{stat.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDescription(stat.type)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={stat.pnl >= 0 ? "profit" : "loss"}
                    className="font-mono"
                  >
                    {stat.pnl >= 0 ? "+" : ""}
                    {formatCurrency(stat.pnl)}
                  </Badge>
                </div>

                {/* Usage bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>
                      {stat.trades} trades ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p
                      className={cn(
                        "font-mono font-medium",
                        stat.winRate >= 50 ? "text-profit" : "text-loss"
                      )}
                    >
                      {stat.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-mono font-medium">
                      {formatCurrency(stat.volume)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg PnL</p>
                    <p
                      className={cn(
                        "font-mono font-medium",
                        stat.pnl / Math.max(stat.trades, 1) >= 0
                          ? "text-profit"
                          : "text-loss"
                      )}
                    >
                      {formatCurrency(stat.pnl / Math.max(stat.trades, 1))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
