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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pnlGradientProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pnlGradientLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 14%)"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={domain as [number, number]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.date}
                        </p>
                        <p className="font-mono font-medium">
                          Daily:{" "}
                          <span
                            className={
                              data.pnl >= 0 ? "text-profit" : "text-loss"
                            }
                          >
                            {formatCurrency(data.pnl)}
                          </span>
                        </p>
                        {showCumulative && (
                          <p className="font-mono font-medium">
                            Cumulative:{" "}
                            <span
                              className={
                                data.cumulative >= 0 ? "text-profit" : "text-loss"
                              }
                            >
                              {formatCurrency(data.cumulative)}
                            </span>
                          </p>
                        )}
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
                strokeWidth={2}
                fill={isPositive ? "url(#pnlGradientProfit)" : "url(#pnlGradientLoss)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
