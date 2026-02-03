"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface QuickStatsProps {
  todayPnl: number;
  weekPnl: number;
  monthPnl: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeDuration: number;
  expectancy: number;
}

export function QuickStats({
  todayPnl,
  weekPnl,
  monthPnl,
  bestTrade,
  worstTrade,
  avgTradeDuration,
  expectancy,
}: QuickStatsProps) {
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance by Period */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Performance
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p
                className={cn(
                  "font-mono font-semibold",
                  todayPnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {todayPnl >= 0 ? "+" : ""}
                {formatCurrency(todayPnl)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p
                className={cn(
                  "font-mono font-semibold",
                  weekPnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {weekPnl >= 0 ? "+" : ""}
                {formatCurrency(weekPnl)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p
                className={cn(
                  "font-mono font-semibold",
                  monthPnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {monthPnl >= 0 ? "+" : ""}
                {formatCurrency(monthPnl)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Best/Worst Trades */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Extremes
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-profit/10 p-1.5">
                <TrendingUp className="h-3 w-3 text-profit" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Trade</p>
                <p className="font-mono font-semibold text-profit">
                  +{formatCurrency(bestTrade)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-loss/10 p-1.5">
                <TrendingDown className="h-3 w-3 text-loss" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Worst Trade</p>
                <p className="font-mono font-semibold text-loss">
                  {formatCurrency(worstTrade)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Target className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expectancy</p>
              <p
                className={cn(
                  "font-mono font-semibold",
                  expectancy >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {expectancy >= 0 ? "+" : ""}
                {formatCurrency(expectancy)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Duration</p>
            <p className="font-mono font-semibold">
              {formatDuration(avgTradeDuration)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
