"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { WinRateChart } from "@/components/analytics/WinRateChart";
import { VolumeAnalysis } from "@/components/analytics/VolumeAnalysis";
import { DirectionalBias } from "@/components/analytics/DirectionalBias";
import { TimeAnalysis } from "@/components/analytics/TimeAnalysis";
import { OrderTypeAnalysis } from "@/components/analytics/OrderTypeAnalysis";
import { FeeBreakdown } from "@/components/analytics/FeeBreakdown";
import { TradingScore } from "@/components/analytics/TradingScore";
import { PeriodSelector, getPeriodDateRange } from "@/components/shared/PeriodSelector";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAppStore } from "@/stores/app-store";
import { useTradesStore } from "@/stores/trades-store";

export default function AnalyticsPage() {
  const { connected } = useWallet();
  const { selectedPeriod, setSelectedPeriod } = useAppStore();
  const { trades, getAnalytics } = useTradesStore();
  const analytics = getAnalytics();

  const hasData = trades.length > 0;

  // Filter trades by selected period
  const filteredTrades = useMemo(() => {
    const { start, end } = getPeriodDateRange(selectedPeriod);
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.timestamp);
      return tradeDate >= start && tradeDate <= end;
    });
  }, [trades, selectedPeriod]);

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Deep dive into your trading performance
            </p>
          </div>
        </div>
        <EmptyState isConnected={connected} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your trading performance
          </p>
        </div>
        <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {/* Trading Score - Innovation Feature */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceMetrics analytics={analytics} />
        </div>
        <TradingScore analytics={analytics} />
      </div>

      {/* Win Rate and Volume */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WinRateChart trades={filteredTrades} />
        <VolumeAnalysis trades={filteredTrades} />
      </div>

      {/* Directional and Time Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DirectionalBias trades={filteredTrades} />
        <TimeAnalysis trades={filteredTrades} />
      </div>

      {/* Order Type and Fees */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrderTypeAnalysis trades={filteredTrades} />
        <FeeBreakdown trades={filteredTrades} />
      </div>
    </div>
  );
}
