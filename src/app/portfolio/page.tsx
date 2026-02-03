"use client";

import { useMemo } from "react";
import { PositionsTable } from "@/components/portfolio/PositionsTable";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { RiskMetrics } from "@/components/portfolio/RiskMetrics";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useTradesStore } from "@/stores/trades-store";
import { mockEquityCurve } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Wallet, TrendingUp, AlertTriangle, Activity } from "lucide-react";

export default function PortfolioPage() {
  const { positions, trades, getAnalytics } = useTradesStore();
  const analytics = getAnalytics();

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    return positions.reduce(
      (sum, pos) => sum + pos.size * pos.currentPrice,
      0
    );
  }, [positions]);

  // Calculate total unrealized PnL
  const totalUnrealizedPnl = useMemo(() => {
    return positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  }, [positions]);

  // Calculate total margin used
  const totalMargin = useMemo(() => {
    return positions.reduce((sum, pos) => sum + (pos.margin || 0), 0);
  }, [positions]);

  // Calculate average leverage
  const avgLeverage = useMemo(() => {
    if (positions.length === 0) return 0;
    const leveragedPositions = positions.filter((p) => p.leverage);
    if (leveragedPositions.length === 0) return 0;
    return (
      leveragedPositions.reduce((sum, p) => sum + (p.leverage || 0), 0) /
      leveragedPositions.length
    );
  }, [positions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Manage your positions and analyze portfolio risk
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          title="Unrealized PnL"
          value={formatCurrency(totalUnrealizedPnl)}
          icon={<TrendingUp className="h-5 w-5" />}
          valueClassName={totalUnrealizedPnl >= 0 ? "text-profit" : "text-loss"}
          change={
            totalPortfolioValue > 0
              ? (totalUnrealizedPnl / totalPortfolioValue) * 100
              : 0
          }
        />
        <MetricCard
          title="Margin Used"
          value={formatCurrency(totalMargin)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg Leverage"
          value={`${avgLeverage.toFixed(1)}x`}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Positions Table */}
      <PositionsTable positions={positions} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AllocationChart
          positions={positions}
          trades={trades}
          type="positions"
        />
        <AllocationChart
          positions={positions}
          trades={trades}
          type="volume"
        />
      </div>

      {/* Equity and Risk */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EquityCurve data={mockEquityCurve} />
        <RiskMetrics
          equityCurve={mockEquityCurve}
          winRate={analytics.winRate}
          profitFactor={analytics.profitFactor}
          totalTrades={analytics.totalTrades}
          avgWin={analytics.avgWin}
          avgLoss={analytics.avgLoss}
        />
      </div>
    </div>
  );
}
