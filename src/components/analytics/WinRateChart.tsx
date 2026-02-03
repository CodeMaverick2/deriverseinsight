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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 14%)"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                width={70}
              />
              <ReferenceLine
                x={50}
                stroke="hsl(215 20% 45%)"
                strokeDasharray="3 3"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="font-medium">{data.symbol}</p>
                        <p className="font-mono text-sm">
                          Win Rate:{" "}
                          <span
                            className={
                              data.winRate >= 50 ? "text-profit" : "text-loss"
                            }
                          >
                            {data.winRate.toFixed(1)}%
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.trades} trades
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.winRate >= 50 ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.8}
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
