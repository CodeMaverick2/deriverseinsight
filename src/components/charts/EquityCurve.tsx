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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { EquityPoint } from "@/types";
import { Activity } from "lucide-react";

interface EquityCurveProps {
  data: EquityPoint[];
  title?: string;
  initialEquity?: number;
}

export function EquityCurve({
  data,
  title = "Equity Curve",
  initialEquity = 10000,
}: EquityCurveProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.timestamp), "MMM dd"),
    }));
  }, [data]);

  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : initialEquity;
  const isPositive = currentEquity >= initialEquity;
  const percentChange = ((currentEquity - initialEquity) / initialEquity) * 100;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">{title}</CardTitle>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold tracking-tight">
              {formatCurrency(currentEquity)}
            </p>
            <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}>
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="50%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
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
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value)}
                dx={-10}
                domain={["dataMin - 500", "dataMax + 500"]}
              />
              <ReferenceLine
                y={initialEquity}
                stroke="hsl(262 83% 58%)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const changeFromInitial =
                      ((data.equity - initialEquity) / initialEquity) * 100;
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          {format(new Date(data.timestamp), "MMM dd, yyyy")}
                        </p>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Equity: </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(data.equity)}
                            </span>
                          </p>
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Return: </span>
                            <span className={`font-semibold ${changeFromInitial >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {changeFromInitial >= 0 ? "+" : ""}
                              {changeFromInitial.toFixed(2)}%
                            </span>
                          </p>
                          {data.drawdownPercent > 0 && (
                            <p className="font-mono text-sm">
                              <span className="text-muted-foreground">Drawdown: </span>
                              <span className="font-semibold text-red-400">
                                -{data.drawdownPercent.toFixed(2)}%
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
                dataKey="equity"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2.5}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
