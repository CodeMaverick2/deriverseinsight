"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PnLChartProps {
  data: { date: string; pnl: number; cumulative: number }[];
  title?: string;
  showCumulative?: boolean;
}

export function PnLChart({
  data,
  title = "PnL Over Time",
  showCumulative = true,
}: PnLChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.date), "MMM dd"),
    }));
  }, [data]);

  const domain = useMemo(() => {
    if (showCumulative) {
      const values = chartData.map((d) => d.cumulative);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.1;
      return [min - padding, max + padding];
    }
    return ["auto", "auto"];
  }, [chartData, showCumulative]);

  const isPositive =
    chartData.length > 0 &&
    chartData[chartData.length - 1].cumulative > chartData[0].cumulative;

  const totalPnL = chartData.length > 0 ? chartData[chartData.length - 1].cumulative : 0;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-foreground/90">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="font-mono">{formatCurrency(totalPnL)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pnlGradientProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pnlGradientLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 12%)"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                domain={domain as [number, number]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value)}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          {data.date}
                        </p>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Daily: </span>
                            <span className={`font-semibold ${data.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {data.pnl >= 0 ? "+" : ""}{formatCurrency(data.pnl)}
                            </span>
                          </p>
                          {showCumulative && (
                            <p className="font-mono text-sm">
                              <span className="text-muted-foreground">Total: </span>
                              <span className={`font-semibold ${data.cumulative >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {data.cumulative >= 0 ? "+" : ""}{formatCurrency(data.cumulative)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={showCumulative ? "cumulative" : "pnl"}
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2.5}
                fill={isPositive ? "url(#pnlGradientProfit)" : "url(#pnlGradientLoss)"}
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
