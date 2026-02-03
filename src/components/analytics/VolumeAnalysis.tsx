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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Trade } from "@/types";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface VolumeAnalysisProps {
  trades: Trade[];
  days?: number;
}

export function VolumeAnalysis({ trades, days = 30 }: VolumeAnalysisProps) {
  const data = useMemo(() => {
    const end = new Date();
    const start = subDays(end, days - 1);
    const dateRange = eachDayOfInterval({ start, end });

    // Initialize data structure for each day
    const dayMap = new Map<
      string,
      { date: string; volume: number; fees: number; trades: number }
    >();

    dateRange.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      dayMap.set(dateStr, {
        date: format(date, "MMM dd"),
        volume: 0,
        fees: 0,
        trades: 0,
      });
    });

    // Aggregate trade data
    trades.forEach((trade) => {
      const dateStr = format(new Date(trade.timestamp), "yyyy-MM-dd");
      if (dayMap.has(dateStr)) {
        const day = dayMap.get(dateStr)!;
        day.volume += trade.size * trade.entryPrice;
        day.fees += trade.fee;
        day.trades++;
      }
    });

    return Array.from(dayMap.values());
  }, [trades, days]);

  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const totalFees = data.reduce((sum, d) => sum + d.fees, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Volume & Fees (Last {days} Days)
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Volume: </span>
              <span className="font-mono font-medium">
                {formatCurrency(totalVolume)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Fees: </span>
              <span className="font-mono font-medium text-loss">
                {formatCurrency(totalFees)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 14%)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="volume"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                yAxisId="fees"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="font-medium mb-1">{data.date}</p>
                        <p className="font-mono text-sm">
                          Volume:{" "}
                          <span className="text-primary">
                            {formatCurrency(data.volume)}
                          </span>
                        </p>
                        <p className="font-mono text-sm">
                          Fees:{" "}
                          <span className="text-loss">
                            {formatCurrency(data.fees)}
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
              <Legend />
              <Bar
                yAxisId="volume"
                dataKey="volume"
                name="Volume"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="fees"
                dataKey="fees"
                name="Fees"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
