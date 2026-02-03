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
import { format } from "date-fns";
import { EquityPoint } from "@/types";
import { TrendingDown } from "lucide-react";

interface DrawdownChartProps {
  data: EquityPoint[];
  title?: string;
}

export function DrawdownChart({
  data,
  title = "Drawdown",
}: DrawdownChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      drawdownPercent: -Math.abs(item.drawdownPercent),
      formattedDate: format(new Date(item.timestamp), "MMM dd"),
    }));
  }, [data]);

  const maxDrawdown = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.drawdownPercent));
  }, [data]);

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-red-500/10 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">{title}</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Max Drawdown</p>
            <div className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5">
              <span className="font-mono text-sm font-bold text-red-400">
                -{maxDrawdown.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
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
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                dx={-10}
                domain={["dataMin - 2", 0]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          {format(new Date(data.timestamp), "MMM dd, yyyy")}
                        </p>
                        <p className="font-mono text-sm">
                          <span className="text-muted-foreground">Drawdown: </span>
                          <span className="font-semibold text-red-400">
                            {data.drawdownPercent.toFixed(2)}%
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdownPercent"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
