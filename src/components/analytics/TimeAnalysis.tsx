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
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(240 10% 14%)"
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="font-medium">{data[xAxisKey]}</p>
                    <p className="font-mono text-sm">
                      PnL:{" "}
                      <span
                        className={data.pnl >= 0 ? "text-profit" : "text-loss"}
                      >
                        {data.pnl >= 0 ? "+" : ""}
                        {formatCurrency(data.pnl)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.trades} trades • {data.winRate.toFixed(0)}% win rate
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="pnl" name={name} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Time-Based Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly">
          <TabsList className="mb-4">
            <TabsTrigger value="hourly">By Hour</TabsTrigger>
            <TabsTrigger value="daily">By Day</TabsTrigger>
            <TabsTrigger value="session">By Session</TabsTrigger>
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
