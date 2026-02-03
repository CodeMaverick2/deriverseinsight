"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Trade } from "@/types";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Coins, TrendingDown } from "lucide-react";

interface FeeBreakdownProps {
  trades: Trade[];
  days?: number;
}

export function FeeBreakdown({ trades, days = 30 }: FeeBreakdownProps) {
  const data = useMemo(() => {
    const end = new Date();
    const start = subDays(end, days - 1);
    const dateRange = eachDayOfInterval({ start, end });

    let cumulative = 0;
    const dayMap = new Map<
      string,
      { date: string; fees: number; cumulative: number }
    >();

    // First pass: initialize and calculate daily fees
    dateRange.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      dayMap.set(dateStr, {
        date: format(date, "MMM dd"),
        fees: 0,
        cumulative: 0,
      });
    });

    // Calculate daily fees
    trades.forEach((trade) => {
      const dateStr = format(new Date(trade.timestamp), "yyyy-MM-dd");
      if (dayMap.has(dateStr)) {
        const day = dayMap.get(dateStr)!;
        day.fees += trade.fee;
      }
    });

    // Calculate cumulative
    return Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, day]) => {
        cumulative += day.fees;
        return {
          ...day,
          cumulative,
        };
      });
  }, [trades, days]);

  const totalFees = data.length > 0 ? data[data.length - 1].cumulative : 0;
  const avgDailyFees = totalFees / days;

  // Calculate fee by market type
  const feeByMarket = useMemo(() => {
    const spotFees = trades
      .filter((t) => t.market === "SPOT")
      .reduce((sum, t) => sum + t.fee, 0);
    const perpFees = trades
      .filter((t) => t.market === "PERP")
      .reduce((sum, t) => sum + t.fee, 0);
    return { spot: spotFees, perp: perpFees };
  }, [trades]);

  // Calculate maker/taker breakdown
  const feeByType = useMemo(() => {
    const makerFees = trades
      .filter((t) => t.feeType === "MAKER")
      .reduce((sum, t) => sum + t.fee, 0);
    const takerFees = trades
      .filter((t) => t.feeType === "TAKER")
      .reduce((sum, t) => sum + t.fee, 0);
    const rebates = trades.reduce((sum, t) => sum + (t.rebate || 0), 0);
    const unknownFees = trades
      .filter((t) => !t.feeType)
      .reduce((sum, t) => sum + t.fee, 0);
    return { maker: makerFees, taker: takerFees, rebates, unknown: unknownFees };
  }, [trades]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-loss" />
            Fee Analysis
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Fees Paid</p>
            <p className="font-mono font-bold text-loss">
              {formatCurrency(totalFees)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Taker Fees</p>
            <p className="font-mono font-semibold text-loss">
              {formatCurrency(feeByType.taker || feeByType.unknown)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Maker Fees</p>
            <p className="font-mono font-semibold text-amber-400">
              {formatCurrency(feeByType.maker)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Rebates Earned</p>
            <p className="font-mono font-semibold text-emerald-400">
              +{formatCurrency(feeByType.rebates)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Net Fees</p>
            <p className="font-mono font-semibold text-loss">
              {formatCurrency(totalFees - feeByType.rebates)}
            </p>
          </div>
        </div>

        {/* Market breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Spot Market</p>
            <p className="font-mono font-semibold">
              {formatCurrency(feeByMarket.spot)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Perp Market</p>
            <p className="font-mono font-semibold">
              {formatCurrency(feeByMarket.perp)}
            </p>
          </div>
        </div>

        {/* Cumulative Fee Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
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
                          Daily: <span className="text-loss">{formatCurrency(data.fees)}</span>
                        </p>
                        <p className="font-mono text-sm">
                          Total: <span className="text-loss">{formatCurrency(data.cumulative)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#feeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
