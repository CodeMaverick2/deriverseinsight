"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap, Clock, Activity } from "lucide-react";

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
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-foreground/90">Quick Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Performance by Period */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Performance
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
              <p className="text-[10px] text-muted-foreground mb-1">Today</p>
              <p
                className={cn(
                  "font-mono text-sm font-bold tracking-tight",
                  todayPnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {todayPnl >= 0 ? "+" : ""}
                {formatCurrency(todayPnl)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
              <p className="text-[10px] text-muted-foreground mb-1">This Week</p>
              <p
                className={cn(
                  "font-mono text-sm font-bold tracking-tight",
                  weekPnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {weekPnl >= 0 ? "+" : ""}
                {formatCurrency(weekPnl)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
              <p className="text-[10px] text-muted-foreground mb-1">This Month</p>
              <p
                className={cn(
                  "font-mono text-sm font-bold tracking-tight",
                  monthPnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {monthPnl >= 0 ? "+" : ""}
                {formatCurrency(monthPnl)}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Best/Worst Trades */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Extremes
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5">
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Best Trade</p>
                <p className="font-mono text-sm font-bold text-emerald-400">
                  +{formatCurrency(bestTrade)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-red-500/5 border border-red-500/10 p-2.5">
              <div className="rounded-lg bg-red-500/10 p-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Worst Trade</p>
                <p className="font-mono text-sm font-bold text-red-400">
                  {formatCurrency(worstTrade)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 p-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Expectancy</p>
              <p
                className={cn(
                  "font-mono text-sm font-bold",
                  expectancy >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {expectancy >= 0 ? "+" : ""}
                {formatCurrency(expectancy)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 p-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg Duration</p>
              <p className="font-mono text-sm font-bold">
                {formatDuration(avgTradeDuration)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
