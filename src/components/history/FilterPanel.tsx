"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TradeFilters, MarketType, TradeSide, OrderType, TradeStatus } from "@/types";
import { Search, Filter, X, Calendar } from "lucide-react";
import { format } from "date-fns";

interface FilterPanelProps {
  filters: TradeFilters;
  onFiltersChange: (filters: Partial<TradeFilters>) => void;
  onReset: () => void;
  symbols: string[];
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  symbols,
}: FilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.dateRange,
    filters.symbols?.length,
    filters.sides?.length,
    filters.markets?.length,
    filters.orderTypes?.length,
    filters.status?.length,
    filters.minPnl !== undefined,
    filters.maxPnl !== undefined,
  ].filter(Boolean).length;

  const toggleArrayFilter = <T extends string>(
    key: keyof TradeFilters,
    value: T,
    current: T[] | undefined
  ) => {
    const arr = current || [];
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    onFiltersChange({ [key]: newArr.length > 0 ? newArr : undefined });
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.searchQuery || ""}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value || undefined })}
            placeholder="Search by symbol or ID..."
            className="pl-9"
          />
        </div>

        {/* Symbol Filter */}
        <Select
          value={filters.symbols?.[0] || "all"}
          onValueChange={(value) =>
            onFiltersChange({ symbols: value === "all" ? undefined : [value] })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Symbols" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symbols</SelectItem>
            {symbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Side Filter */}
        <div className="flex gap-1">
          {(["LONG", "SHORT"] as TradeSide[]).map((side) => (
            <Button
              key={side}
              variant={filters.sides?.includes(side) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("sides", side, filters.sides)}
              className={
                filters.sides?.includes(side)
                  ? side === "LONG"
                    ? "bg-profit hover:bg-profit/90"
                    : "bg-loss hover:bg-loss/90"
                  : ""
              }
            >
              {side}
            </Button>
          ))}
        </div>

        {/* Market Filter */}
        <div className="flex gap-1">
          {(["SPOT", "PERP"] as MarketType[]).map((market) => (
            <Button
              key={market}
              variant={filters.markets?.includes(market) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("markets", market, filters.markets)}
            >
              {market}
            </Button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="font-medium">Advanced Filters</div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      value={
                        filters.dateRange?.start
                          ? format(filters.dateRange.start, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        onFiltersChange({
                          dateRange: date
                            ? {
                                start: date,
                                end: filters.dateRange?.end || new Date(),
                              }
                            : undefined,
                        });
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={
                        filters.dateRange?.end
                          ? format(filters.dateRange.end, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        if (filters.dateRange?.start) {
                          onFiltersChange({
                            dateRange: {
                              start: filters.dateRange.start,
                              end: date || new Date(),
                            },
                          });
                        }
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <div className="flex flex-wrap gap-1">
                  {(["IOC", "LIMIT", "MARKET"] as OrderType[]).map((type) => (
                    <Badge
                      key={type}
                      variant={
                        filters.orderTypes?.includes(type) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        toggleArrayFilter("orderTypes", type, filters.orderTypes)
                      }
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-1">
                  {(["OPEN", "CLOSED"] as TradeStatus[]).map((status) => (
                    <Badge
                      key={status}
                      variant={
                        filters.status?.includes(status) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        toggleArrayFilter("status", status, filters.status)
                      }
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* PnL Range */}
              <div className="space-y-2">
                <Label>PnL Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      placeholder="Min PnL"
                      value={filters.minPnl ?? ""}
                      onChange={(e) =>
                        onFiltersChange({
                          minPnl: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      placeholder="Max PnL"
                      value={filters.maxPnl ?? ""}
                      onChange={(e) =>
                        onFiltersChange({
                          maxPnl: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onReset}
              >
                Reset All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(filters.dateRange.start, "MMM dd")} -{" "}
              {format(filters.dateRange.end, "MMM dd")}
              <button
                onClick={() => onFiltersChange({ dateRange: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.symbols?.map((symbol) => (
            <Badge key={symbol} variant="secondary" className="gap-1">
              {symbol}
              <button
                onClick={() =>
                  onFiltersChange({
                    symbols: filters.symbols?.filter((s) => s !== symbol),
                  })
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
