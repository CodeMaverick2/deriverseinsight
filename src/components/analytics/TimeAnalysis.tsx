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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";
import { Trade } from "@/types";
import { getHours, getDay, format } from "date-fns";

interface TimeAnalysisProps {
  trades: Trade[];
}

export function TimeAnalysis({ trades }: TimeAnalysisProps) {
  // By Hour of Day
  const hourlyData = useMemo(() => {
    const hourMap = new Map<
      number,
      { pnl: number; trades: number; wins: number }
    >();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, { pnl: 0, trades: 0, wins: 0 });
    }

    trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
      .forEach((trade) => {
        const hour = getHours(new Date(trade.timestamp));
        const stats = hourMap.get(hour)!;
        stats.pnl += trade.pnl!;
        stats.trades++;
        if (trade.pnl! > 0) stats.wins++;
      });

    return Array.from(hourMap.entries()).map(([hour, stats]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      hourNum: hour,
      pnl: stats.pnl,
      trades: stats.trades,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
    }));
  }, [trades]);

  // By Day of Week
  const dailyData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayMap = new Map<number, { pnl: number; trades: number; wins: number }>();

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      dayMap.set(i, { pnl: 0, trades: 0, wins: 0 });
    }

    trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
      .forEach((trade) => {
        const day = getDay(new Date(trade.timestamp));
        const stats = dayMap.get(day)!;
        stats.pnl += trade.pnl!;
        stats.trades++;
        if (trade.pnl! > 0) stats.wins++;
      });

    return Array.from(dayMap.entries()).map(([day, stats]) => ({
      day: dayNames[day],
      dayNum: day,
      pnl: stats.pnl,
      trades: stats.trades,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
    }));
  }, [trades]);

  // By Session (Asia, Europe, US)
  const sessionData = useMemo(() => {
    const sessions = {
      "Asia (00-08)": { pnl: 0, trades: 0, wins: 0 },
      "Europe (08-16)": { pnl: 0, trades: 0, wins: 0 },
      "US (16-24)": { pnl: 0, trades: 0, wins: 0 },
    };

    trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
      .forEach((trade) => {
        const hour = getHours(new Date(trade.timestamp));
        let session: keyof typeof sessions;
        if (hour >= 0 && hour < 8) session = "Asia (00-08)";
        else if (hour >= 8 && hour < 16) session = "Europe (08-16)";
        else session = "US (16-24)";

        sessions[session].pnl += trade.pnl!;
        sessions[session].trades++;
        if (trade.pnl! > 0) sessions[session].wins++;
      });

    return Object.entries(sessions).map(([session, stats]) => ({
      session,
      pnl: stats.pnl,
      trades: stats.trades,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
    }));
  }, [trades]);

  const renderChart = (
    data: any[],
    dataKey: string,
    xAxisKey: string,
    name: string
  ) => (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="timeWinGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="timeLossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(240 10% 12%)"
            vertical={false}
            opacity={0.5}
          />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl shadow-black/20">
                    <p className="font-semibold text-foreground mb-2">{data[xAxisKey]}</p>
                    <div className="space-y-1">
                      <p className="font-mono text-sm">
                        <span className="text-muted-foreground">PnL: </span>
                        <span className={`font-semibold ${data.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {data.pnl >= 0 ? "+" : ""}
                          {formatCurrency(data.pnl)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.trades} trades • {data.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="pnl" name={name} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? "url(#timeWinGradient)" : "url(#timeLossGradient)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <CardTitle className="text-base font-medium text-foreground/90">
            Time-Based Analysis
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <Tabs defaultValue="hourly">
          <TabsList className="mb-4 bg-muted/30 border border-border/30">
            <TabsTrigger value="hourly" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">By Hour</TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">By Day</TabsTrigger>
            <TabsTrigger value="session" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">By Session</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly">
            {renderChart(hourlyData, "pnl", "hour", "PnL by Hour")}
          </TabsContent>

          <TabsContent value="daily">
            {renderChart(dailyData, "pnl", "day", "PnL by Day")}
          </TabsContent>

          <TabsContent value="session">
            {renderChart(sessionData, "pnl", "session", "PnL by Session")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
