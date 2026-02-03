"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, getTimeAgo } from "@/lib/utils";
import { Position } from "@/types";
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
  const totalUnrealizedPnl = positions.reduce(
    (sum, pos) => sum + pos.unrealizedPnl,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Open Positions</CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Unrealized PnL</p>
            <p
              className={cn(
                "font-mono font-bold",
                totalUnrealizedPnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {totalUnrealizedPnl >= 0 ? "+" : ""}
              {formatCurrency(totalUnrealizedPnl)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>No open positions</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Unrealized PnL</TableHead>
                <TableHead className="text-right">Liq. Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const pnlPercent =
                  (position.unrealizedPnl / (position.size * position.entryPrice)) *
                  100;
                const isNearLiquidation =
                  position.liquidationPrice &&
                  Math.abs(position.currentPrice - position.liquidationPrice) /
                    position.currentPrice <
                    0.1;

                return (
                  <TableRow key={position.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{position.symbol}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {position.market}
                        </Badge>
                        {position.leverage && (
                          <Badge variant="secondary" className="text-[10px]">
                            {position.leverage}x
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {position.side === "LONG" ? (
                          <ArrowUpRight className="h-4 w-4 text-profit" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-loss" />
                        )}
                        <Badge
                          variant={position.side === "LONG" ? "long" : "short"}
                        >
                          {position.side}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {position.size.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(position.entryPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(position.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p
                          className={cn(
                            "font-mono font-medium",
                            position.unrealizedPnl >= 0
                              ? "text-profit"
                              : "text-loss"
                          )}
                        >
                          {position.unrealizedPnl >= 0 ? "+" : ""}
                          {formatCurrency(position.unrealizedPnl)}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-mono",
                            pnlPercent >= 0 ? "text-profit/70" : "text-loss/70"
                          )}
                        >
                          {pnlPercent >= 0 ? "+" : ""}
                          {pnlPercent.toFixed(2)}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isNearLiquidation && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span
                          className={cn(
                            "font-mono",
                            isNearLiquidation && "text-yellow-500"
                          )}
                        >
                          {position.liquidationPrice
                            ? formatCurrency(position.liquidationPrice)
                            : "-"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
