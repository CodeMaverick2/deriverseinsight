"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart2,
  DollarSign,
  Percent,
  Activity,
  Clock,
} from "lucide-react";

interface PerformanceMetricsProps {
  analytics: {
    totalPnl: number;
    winRate: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    expectancy: number;
    totalTrades: number;
    avgDuration: number;
  };
}

export function PerformanceMetrics({ analytics }: PerformanceMetricsProps) {
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const metrics = [
    {
      label: "Total PnL",
      value: formatCurrency(analytics.totalPnl),
      icon: DollarSign,
      color: analytics.totalPnl >= 0 ? "text-profit" : "text-loss",
      description: "Net profit/loss across all trades",
    },
    {
      label: "Win Rate",
      value: `${analytics.winRate.toFixed(1)}%`,
      icon: Target,
      color: analytics.winRate >= 50 ? "text-profit" : "text-loss",
      description: "Percentage of winning trades",
    },
    {
      label: "Profit Factor",
      value:
        analytics.profitFactor === Infinity
          ? "∞"
          : analytics.profitFactor.toFixed(2),
      icon: Percent,
      color: analytics.profitFactor >= 1 ? "text-profit" : "text-loss",
      description: "Gross profit / Gross loss",
    },
    {
      label: "Expectancy",
      value: formatCurrency(analytics.expectancy),
      icon: Activity,
      color: analytics.expectancy >= 0 ? "text-profit" : "text-loss",
      description: "Expected profit per trade",
    },
    {
      label: "Average Win",
      value: formatCurrency(analytics.avgWin),
      icon: TrendingUp,
      color: "text-profit",
      description: "Average profit on winning trades",
    },
    {
      label: "Average Loss",
      value: formatCurrency(analytics.avgLoss),
      icon: TrendingDown,
      color: "text-loss",
      description: "Average loss on losing trades",
    },
    {
      label: "Largest Win",
      value: formatCurrency(analytics.largestWin),
      icon: TrendingUp,
      color: "text-profit",
      description: "Best single trade",
    },
    {
      label: "Largest Loss",
      value: formatCurrency(analytics.largestLoss),
      icon: TrendingDown,
      color: "text-loss",
      description: "Worst single trade",
    },
    {
      label: "Total Trades",
      value: analytics.totalTrades.toString(),
      icon: BarChart2,
      color: "text-foreground",
      description: "Number of trades executed",
    },
    {
      label: "Avg Duration",
      value: formatDuration(analytics.avgDuration),
      icon: Clock,
      color: "text-foreground",
      description: "Average time in trade",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="p-3 rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn("h-4 w-4", metric.color.replace("text-", "text-"))}
                  />
                  <span className="text-xs text-muted-foreground">
                    {metric.label}
                  </span>
                </div>
                <p className={cn("text-xl font-mono font-bold", metric.color)}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
