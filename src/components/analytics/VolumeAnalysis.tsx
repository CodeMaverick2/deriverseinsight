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
import { BarChart3 } from "lucide-react";

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
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">
              Volume & Fees (Last {days} Days)
            </CardTitle>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-xs font-medium">
                {formatCurrency(totalVolume)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="font-mono text-xs font-medium text-red-400">
                {formatCurrency(totalFees)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 12%)"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="volume"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                yAxisId="fees"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                        <p className="font-semibold text-foreground mb-2">{data.date}</p>
                        <div className="space-y-1">
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Volume: </span>
                            <span className="font-semibold text-primary">
                              {formatCurrency(data.volume)}
                            </span>
                          </p>
                          <p className="font-mono text-sm">
                            <span className="text-muted-foreground">Fees: </span>
                            <span className="font-semibold text-red-400">
                              {formatCurrency(data.fees)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.trades} trades
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "12px" }}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <Bar
                yAxisId="volume"
                dataKey="volume"
                name="Volume"
                fill="url(#volumeGradient)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="fees"
                dataKey="fees"
                name="Fees"
                fill="url(#feesGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
