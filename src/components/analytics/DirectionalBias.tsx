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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Directional Analysis
          </CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">L/S Ratio: </span>
            <span className="font-mono font-medium">{ratio}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                        <div className="rounded-lg border bg-card p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="font-mono text-sm">
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
            <div className="p-3 bg-profit/10 rounded-lg border border-profit/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-5 w-5 text-profit" />
                <span className="font-medium text-profit">Long</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Trades</p>
                  <p className="font-mono font-medium">{stats.long.count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="font-mono font-medium">
                    {stats.long.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">PnL</p>
                  <p
                    className={cn(
                      "font-mono font-medium",
                      stats.long.pnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {stats.long.pnl >= 0 ? "+" : ""}
                    {formatCurrency(stats.long.pnl)}
                  </p>
                </div>
              </div>
            </div>

            {/* Short Stats */}
            <div className="p-3 bg-loss/10 rounded-lg border border-loss/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="h-5 w-5 text-loss" />
                <span className="font-medium text-loss">Short</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Trades</p>
                  <p className="font-mono font-medium">{stats.short.count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="font-mono font-medium">
                    {stats.short.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">PnL</p>
                  <p
                    className={cn(
                      "font-mono font-medium",
                      stats.short.pnl >= 0 ? "text-profit" : "text-loss"
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
