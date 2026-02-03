"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPanel } from "@/components/history/FilterPanel";
import { TradeTable } from "@/components/history/TradeTable";
import { useTradesStore } from "@/stores/trades-store";
import { exportToCSV, exportToJSON, exportReport } from "@/lib/export";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText, FileJson, FileSpreadsheet, History } from "lucide-react";

export default function HistoryPage() {
  const { trades, filters, setFilters, resetFilters, getFilteredTrades } = useTradesStore();

  const filteredTrades = getFilteredTrades();

  // Get unique symbols for filter
  const symbols = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.symbol))).sort();
  }, [trades]);

  // Calculate summary stats for filtered trades
  const stats = useMemo(() => {
    const closedTrades = filteredTrades.filter(
      (t) => t.status === "CLOSED" && t.pnl !== undefined
    );
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalFees = filteredTrades.reduce((sum, t) => sum + t.fee, 0);
    const totalVolume = filteredTrades.reduce(
      (sum, t) => sum + t.size * t.entryPrice,
      0
    );
    const wins = closedTrades.filter((t) => (t.pnl || 0) > 0).length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    return { totalPnl, totalFees, totalVolume, winRate, count: filteredTrades.length };
  }, [filteredTrades]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trade History</h1>
          <p className="text-muted-foreground">
            View and export your complete trading history
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exportToCSV(filteredTrades)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToJSON(filteredTrades)}>
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportReport(filteredTrades)}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trades</p>
                <p className="text-xl font-bold font-mono">{stats.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground">Total PnL</p>
              <p
                className={`text-xl font-bold font-mono ${
                  stats.totalPnl >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {stats.totalPnl >= 0 ? "+" : ""}
                {formatCurrency(stats.totalPnl)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Volume</p>
              <p className="text-xl font-bold font-mono">
                {formatCurrency(stats.totalVolume)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Fees</p>
              <p className="text-xl font-bold font-mono text-loss">
                -{formatCurrency(stats.totalFees)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p
                className={`text-xl font-bold font-mono ${
                  stats.winRate >= 50 ? "text-profit" : "text-loss"
                }`}
              >
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            symbols={symbols}
          />
        </CardContent>
      </Card>

      {/* Trade Table */}
      <TradeTable trades={filteredTrades} pageSize={25} />
    </div>
  );
}
