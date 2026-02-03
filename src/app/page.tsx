"use client";

import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  BarChart2,
  Activity,
  Percent,
  Coins,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PnLChart } from "@/components/charts/PnLChart";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PeriodSelector, getPeriodDateRange } from "@/components/shared/PeriodSelector";
import { useAppStore } from "@/stores/app-store";
import { useTradesStore } from "@/stores/trades-store";
import { mockDailyStats, mockEquityCurve } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";

export default function DashboardPage() {
  const { selectedPeriod, setSelectedPeriod } = useAppStore();
  const { trades, getAnalytics } = useTradesStore();
  const analytics = getAnalytics();

  // Compute PnL chart data
  const pnlChartData = useMemo(() => {
    const { start, end } = getPeriodDateRange(selectedPeriod);
    let cumulative = 0;

    return mockDailyStats
      .filter((stat) => {
        const date = new Date(stat.date);
        return date >= start && date <= end;
      })
      .map((stat) => {
        cumulative += stat.pnl;
        return {
          date: stat.date,
          pnl: stat.pnl,
          cumulative,
        };
      });
  }, [selectedPeriod]);

  // Filter equity curve data by period
  const equityCurveData = useMemo(() => {
    const { start, end } = getPeriodDateRange(selectedPeriod);
    return mockEquityCurve.filter(
      (point) => point.timestamp >= start.getTime() && point.timestamp <= end.getTime()
    );
  }, [selectedPeriod]);

  // Calculate period stats for quick stats
  const periodStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayPnl = mockDailyStats
      .filter((s) => new Date(s.date).toDateString() === today.toDateString())
      .reduce((sum, s) => sum + s.pnl, 0);

    const weekPnl = mockDailyStats
      .filter((s) => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + s.pnl, 0);

    const monthPnl = mockDailyStats
      .filter((s) => new Date(s.date) >= monthAgo)
      .reduce((sum, s) => sum + s.pnl, 0);

    return { todayPnl, weekPnl, monthPnl };
  }, []);

  // Calculate percent change (simplified)
  const pnlChange = pnlChartData.length > 1
    ? ((pnlChartData[pnlChartData.length - 1].cumulative -
        pnlChartData[Math.max(0, pnlChartData.length - 8)].cumulative) /
        Math.abs(pnlChartData[Math.max(0, pnlChartData.length - 8)].cumulative || 1)) *
      100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your trading performance at a glance
          </p>
        </div>
        <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total PnL"
          value={formatCurrency(analytics.totalPnl)}
          change={pnlChange}
          changeLabel="vs prev period"
          icon={<DollarSign className="h-5 w-5" />}
          valueClassName={analytics.totalPnl >= 0 ? "text-profit" : "text-loss"}
        />
        <MetricCard
          title="Win Rate"
          value={`${analytics.winRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          valueClassName={analytics.winRate >= 50 ? "text-profit" : "text-loss"}
        />
        <MetricCard
          title="Total Trades"
          value={formatNumber(analytics.totalTrades, 0)}
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Volume"
          value={formatCurrency(analytics.totalVolume)}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Fees"
          value={formatCurrency(analytics.totalFees)}
          icon={<Coins className="h-5 w-5" />}
          valueClassName="text-loss"
        />
        <MetricCard
          title="Profit Factor"
          value={
            analytics.profitFactor === Infinity
              ? "∞"
              : analytics.profitFactor.toFixed(2)
          }
          icon={<Percent className="h-5 w-5" />}
          valueClassName={analytics.profitFactor >= 1 ? "text-profit" : "text-loss"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PnLChart data={pnlChartData} title="Cumulative PnL" />
        <EquityCurve data={equityCurveData} />
      </div>

      {/* Drawdown and Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DrawdownChart data={equityCurveData} />
        </div>
        <QuickStats
          todayPnl={periodStats.todayPnl}
          weekPnl={periodStats.weekPnl}
          monthPnl={periodStats.monthPnl}
          bestTrade={analytics.largestWin}
          worstTrade={analytics.largestLoss}
          avgTradeDuration={analytics.avgDuration}
          expectancy={analytics.expectancy}
        />
      </div>

      {/* Recent Trades */}
      <RecentTrades trades={trades} limit={10} />
    </div>
  );
}
