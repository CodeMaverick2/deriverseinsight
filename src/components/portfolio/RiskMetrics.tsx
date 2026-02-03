"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { EquityPoint } from "@/types";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  Activity,
  Target,
} from "lucide-react";

interface RiskMetricsProps {
  equityCurve: EquityPoint[];
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
}

export function RiskMetrics({
  equityCurve,
  winRate,
  profitFactor,
  totalTrades,
  avgWin,
  avgLoss,
}: RiskMetricsProps) {
  // Calculate max drawdown
  const maxDrawdown =
    equityCurve.length > 0
      ? Math.max(...equityCurve.map((e) => e.drawdownPercent))
      : 0;

  // Current drawdown
  const currentDrawdown =
    equityCurve.length > 0
      ? equityCurve[equityCurve.length - 1].drawdownPercent
      : 0;

  // Calculate Sharpe-like ratio (simplified: avg return / std dev of returns)
  const returns = equityCurve
    .slice(1)
    .map((e, i) => (e.equity - equityCurve[i].equity) / equityCurve[i].equity);
  const avgReturn =
    returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev =
    returns.length > 0
      ? Math.sqrt(
          returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
            returns.length
        )
      : 0;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

  // Risk/Reward ratio
  const riskRewardRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : avgWin > 0 ? Infinity : 0;

  // Get risk level
  const getRiskLevel = () => {
    if (maxDrawdown > 30 || winRate < 40 || profitFactor < 1) {
      return { level: "High", color: "text-loss", badge: "destructive" as const };
    }
    if (maxDrawdown > 15 || winRate < 50 || profitFactor < 1.5) {
      return { level: "Medium", color: "text-yellow-500", badge: "outline" as const };
    }
    return { level: "Low", color: "text-profit", badge: "profit" as const };
  };

  const riskLevel = getRiskLevel();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Risk Metrics
          </CardTitle>
          <Badge variant={riskLevel.badge}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {riskLevel.level} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drawdown Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <TrendingDown className="h-3 w-3" />
            Drawdown
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Max Drawdown</p>
              <p className="font-mono text-lg font-bold text-loss">
                -{maxDrawdown.toFixed(2)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current Drawdown</p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  currentDrawdown > 0 ? "text-loss" : "text-muted-foreground"
                )}
              >
                -{currentDrawdown.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance Ratios */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Activity className="h-3 w-3" />
            Performance Ratios
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  sharpeRatio >= 1 ? "text-profit" : sharpeRatio >= 0 ? "text-yellow-500" : "text-loss"
                )}
              >
                {sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Profit Factor</p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  profitFactor >= 1.5 ? "text-profit" : profitFactor >= 1 ? "text-yellow-500" : "text-loss"
                )}
              >
                {profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Risk/Reward */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Target className="h-3 w-3" />
            Risk/Reward
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">R:R Ratio</p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  riskRewardRatio >= 2 ? "text-profit" : riskRewardRatio >= 1 ? "text-yellow-500" : "text-loss"
                )}
              >
                {riskRewardRatio === Infinity
                  ? "∞"
                  : `1:${riskRewardRatio.toFixed(2)}`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  winRate >= 55 ? "text-profit" : winRate >= 45 ? "text-yellow-500" : "text-loss"
                )}
              >
                {winRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Avg Win/Loss */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Win</p>
            <p className="font-mono font-semibold text-profit">
              +{formatCurrency(avgWin)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Loss</p>
            <p className="font-mono font-semibold text-loss">
              {formatCurrency(avgLoss)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
