"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/types";
import { Target } from "lucide-react";

interface WinRateChartProps {
  trades: Trade[];
  title?: string;
}

export function WinRateChart({ trades, title = "Win Rate by Symbol" }: WinRateChartProps) {
  const data = useMemo(() => {
    const symbolMap = new Map<string, { wins: number; total: number }>();

    trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
      .forEach((trade) => {
        if (!symbolMap.has(trade.symbol)) {
          symbolMap.set(trade.symbol, { wins: 0, total: 0 });
        }
        const stats = symbolMap.get(trade.symbol)!;
        stats.total++;
        if (trade.pnl! > 0) stats.wins++;
      });

    return Array.from(symbolMap.entries())
      .map(([symbol, stats]) => ({
        symbol,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        trades: stats.total,
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [trades]);

  const avgWinRate = data.length > 0
    ? data.reduce((sum, d) => sum + d.winRate, 0) / data.length
    : 0;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">{title}</CardTitle>
          </div>
          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            avgWinRate >= 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            <span className="font-mono">Avg: {avgWinRate.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <defs>
                <linearGradient id="winGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 12%)"
                horizontal={true}
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                width={70}
              />
              <ReferenceLine
                x={50}
                stroke="hsl(262 83% 58%)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                        <p className="font-semibold text-foreground mb-2">{data.symbol}</p>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Win Rate: </span>
                            <span className={`font-semibold ${data.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                              {data.winRate.toFixed(1)}%
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.trades} total trades
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="winRate" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.winRate >= 50 ? "url(#winGradient)" : "url(#lossGradient)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
