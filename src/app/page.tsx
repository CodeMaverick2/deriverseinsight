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
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PnLChart } from "@/components/charts/PnLChart";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PeriodSelector, getPeriodDateRange } from "@/components/shared/PeriodSelector";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAppStore } from "@/stores/app-store";
import { useTradesStore } from "@/stores/trades-store";
import { generateEquityCurve, generateDailyStats, generatePnLChartData } from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { connected } = useWallet();
  const { selectedPeriod, setSelectedPeriod } = useAppStore();
  const { trades, getAnalytics } = useTradesStore();
  const analytics = getAnalytics();

  // Check if we have data to display
  const hasData = trades.length > 0;

  // Generate data from real trades
  const dailyStats = useMemo(() => {
    if (trades.length === 0) return [];
    return generateDailyStats(trades);
  }, [trades]);

  const equityCurve = useMemo(() => {
    if (trades.length === 0) return [];
    return generateEquityCurve(trades);
  }, [trades]);

  // Compute PnL chart data
  const pnlChartData = useMemo(() => {
    if (dailyStats.length === 0) return [];

    const { start, end } = getPeriodDateRange(selectedPeriod);
    const filtered = dailyStats.filter((stat) => {
      const date = new Date(stat.date);
      return date >= start && date <= end;
    });

    return generatePnLChartData(filtered);
  }, [selectedPeriod, dailyStats]);

  // Filter equity curve data by period
  const equityCurveData = useMemo(() => {
    if (equityCurve.length === 0) return [];

    const { start, end } = getPeriodDateRange(selectedPeriod);
    return equityCurve.filter(
      (point) => point.timestamp >= start.getTime() && point.timestamp <= end.getTime()
    );
  }, [selectedPeriod, equityCurve]);

  // Calculate period stats for quick stats
  const periodStats = useMemo(() => {
    if (dailyStats.length === 0) {
      return { todayPnl: 0, weekPnl: 0, monthPnl: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayPnl = dailyStats
      .filter((s) => new Date(s.date).toDateString() === today.toDateString())
      .reduce((sum, s) => sum + s.pnl, 0);

    const weekPnl = dailyStats
      .filter((s) => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + s.pnl, 0);

    const monthPnl = dailyStats
      .filter((s) => new Date(s.date) >= monthAgo)
      .reduce((sum, s) => sum + s.pnl, 0);

    return { todayPnl, weekPnl, monthPnl };
  }, [dailyStats]);

  // Calculate percent change
  const pnlChange = pnlChartData.length > 1
    ? ((pnlChartData[pnlChartData.length - 1].cumulative -
        pnlChartData[Math.max(0, pnlChartData.length - 8)].cumulative) /
        Math.abs(pnlChartData[Math.max(0, pnlChartData.length - 8)].cumulative || 1)) *
      100
    : 0;

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-lg overflow-hidden">
                <Image
                  src="/deriverse_logo.jpeg"
                  alt="Deriverse"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Your trading performance at a glance
                </p>
              </div>
            </div>
          </div>
        </div>

        <EmptyState isConnected={connected} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden">
              <Image
                src="/deriverse_logo.jpeg"
                alt="Deriverse"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Your trading performance at a glance
              </p>
            </div>
          </div>
        </div>
        <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
        <MetricCard
          title="Total PnL"
          value={formatCurrency(analytics.totalPnl)}
          change={pnlChange}
          changeLabel="vs prev period"
          icon={<DollarSign className="h-5 w-5" />}
          variant={analytics.totalPnl >= 0 ? "profit" : "loss"}
          valueClassName={analytics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <MetricCard
          title="Win Rate"
          value={`${analytics.winRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant={analytics.winRate >= 50 ? "profit" : "loss"}
          valueClassName={analytics.winRate >= 50 ? "text-emerald-400" : "text-red-400"}
        />
        <MetricCard
          title="Total Trades"
          value={formatNumber(analytics.totalTrades, 0)}
          icon={<BarChart2 className="h-5 w-5" />}
          variant="highlight"
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
          variant="loss"
          valueClassName="text-red-400"
        />
        <MetricCard
          title="Profit Factor"
          value={
            analytics.profitFactor === Infinity
              ? "∞"
              : analytics.profitFactor.toFixed(2)
          }
          icon={<Percent className="h-5 w-5" />}
          variant={analytics.profitFactor >= 1 ? "profit" : "loss"}
          valueClassName={analytics.profitFactor >= 1 ? "text-emerald-400" : "text-red-400"}
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
