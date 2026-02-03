"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, getTimeAgo } from "@/lib/utils";
import { Trade } from "@/types";
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { format } from "date-fns";

interface TradeTableProps {
  trades: Trade[];
  pageSize?: number;
}

export function TradeTable({ trades, pageSize = 20 }: TradeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Trade>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sort trades
  const sortedTrades = [...trades].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTrades.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortHeader = ({
    field,
    children,
    className,
  }: {
    field: keyof Trade;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={cn("cursor-pointer hover:text-foreground", className)}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-primary">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="timestamp">Date</SortHeader>
              <SortHeader field="symbol">Symbol</SortHeader>
              <TableHead>Side</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Order Type</TableHead>
              <SortHeader field="size" className="text-right">
                Size
              </SortHeader>
              <SortHeader field="entryPrice" className="text-right">
                Entry
              </SortHeader>
              <TableHead className="text-right">Exit</TableHead>
              <SortHeader field="fee" className="text-right">
                Fee
              </SortHeader>
              <SortHeader field="pnl" className="text-right">
                PnL
              </SortHeader>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length > 0 ? (
              paginatedTrades.map((trade) => (
                <TableRow key={trade.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    {format(new Date(trade.timestamp), "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.symbol}</span>
                      {trade.leverage && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          {trade.leverage}x
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {trade.side === "LONG" ? (
                        <ArrowUpRight className="h-4 w-4 text-profit" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-loss" />
                      )}
                      <Badge variant={trade.side === "LONG" ? "long" : "short"}>
                        {trade.side}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trade.market}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{trade.orderType}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {trade.size.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(trade.entryPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-loss">
                    -{formatCurrency(trade.fee)}
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.pnl !== undefined ? (
                      <span
                        className={cn(
                          "font-mono font-medium",
                          trade.pnl >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {trade.pnl >= 0 ? "+" : ""}
                        {formatCurrency(trade.pnl)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={trade.status === "OPEN" ? "outline" : "secondary"}
                    >
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  <p className="text-muted-foreground">No trades found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, trades.length)}{" "}
            of {trades.length} trades
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
