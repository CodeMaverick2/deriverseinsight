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
      drawdownPercent: -Math.abs(item.drawdownPercent), // Make negative for visual
      formattedDate: format(new Date(item.timestamp), "MMM dd"),
    }));
  }, [data]);

  const maxDrawdown = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.drawdownPercent));
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Max Drawdown</p>
            <p className="font-mono text-lg font-bold text-loss">
              -{maxDrawdown.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
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
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                dx={-10}
                domain={["dataMin - 2", 0]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(data.timestamp), "MMM dd, yyyy")}
                        </p>
                        <p className="font-mono font-medium">
                          Drawdown:{" "}
                          <span className="text-loss">
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
                strokeWidth={2}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
