"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Trade } from "@/types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DirectionalBiasProps {
  trades: Trade[];
}

export function DirectionalBias({ trades }: DirectionalBiasProps) {
  const stats = useMemo(() => {
    const closedTrades = trades.filter(
      (t) => t.status === "CLOSED" && t.pnl !== undefined
    );

    const longTrades = closedTrades.filter((t) => t.side === "LONG");
    const shortTrades = closedTrades.filter((t) => t.side === "SHORT");

    const longWins = longTrades.filter((t) => t.pnl! > 0);
    const shortWins = shortTrades.filter((t) => t.pnl! > 0);

    const longPnl = longTrades.reduce((sum, t) => sum + t.pnl!, 0);
    const shortPnl = shortTrades.reduce((sum, t) => sum + t.pnl!, 0);

    const longVolume = longTrades.reduce(
      (sum, t) => sum + t.size * t.entryPrice,
      0
    );
    const shortVolume = shortTrades.reduce(
      (sum, t) => sum + t.size * t.entryPrice,
      0
    );

    return {
      long: {
        count: longTrades.length,
        wins: longWins.length,
        winRate:
          longTrades.length > 0 ? (longWins.length / longTrades.length) * 100 : 0,
        pnl: longPnl,
        volume: longVolume,
      },
      short: {
        count: shortTrades.length,
        wins: shortWins.length,
        winRate:
          shortTrades.length > 0
            ? (shortWins.length / shortTrades.length) * 100
            : 0,
        pnl: shortPnl,
        volume: shortVolume,
      },
      total: closedTrades.length,
    };
  }, [trades]);

  const pieData = [
    { name: "Long", value: stats.long.count, color: "#22c55e" },
    { name: "Short", value: stats.short.count, color: "#ef4444" },
  ];

  const ratio =
    stats.short.count > 0
      ? (stats.long.count / stats.short.count).toFixed(2)
      : stats.long.count > 0
      ? "∞"
      : "0";

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">
              Directional Analysis
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
            <span className="text-xs text-muted-foreground">L/S Ratio:</span>
            <span className="font-mono text-xs font-bold text-foreground">{ratio}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="hsl(240 10% 6%)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = (data.value / stats.total) * 100;
                      return (
                        <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                          <p className="font-semibold text-foreground mb-1">{data.name}</p>
                          <p className="font-mono text-sm text-muted-foreground">
                            {data.value} trades ({percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Long Stats */}
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 transition-all hover:bg-emerald-500/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-emerald-500/10 p-1.5">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-semibold text-emerald-400">Long</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trades</p>
                  <p className="font-mono font-bold text-foreground">{stats.long.count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
                  <p className="font-mono font-bold text-foreground">
                    {stats.long.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PnL</p>
                  <p
                    className={cn(
                      "font-mono font-bold text-lg",
                      stats.long.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {stats.long.pnl >= 0 ? "+" : ""}
                    {formatCurrency(stats.long.pnl)}
                  </p>
                </div>
              </div>
            </div>

            {/* Short Stats */}
            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 transition-all hover:bg-red-500/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-red-500/10 p-1.5">
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                </div>
                <span className="font-semibold text-red-400">Short</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trades</p>
                  <p className="font-mono font-bold text-foreground">{stats.short.count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
                  <p className="font-mono font-bold text-foreground">
                    {stats.short.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PnL</p>
                  <p
                    className={cn(
                      "font-mono font-bold text-lg",
                      stats.short.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {stats.short.pnl >= 0 ? "+" : ""}
                    {formatCurrency(stats.short.pnl)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
