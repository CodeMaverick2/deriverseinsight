import { Trade } from "@/types";
import { format } from "date-fns";

export function exportToCSV(trades: Trade[], filename: string = "trades") {
  const headers = [
    "ID",
    "Date",
    "Symbol",
    "Market",
    "Side",
    "Order Type",
    "Size",
    "Entry Price",
    "Exit Price",
    "Fee",
    "Fee Type",
    "Rebate",
    "PnL",
    "Status",
    "Leverage",
    "Duration (ms)",
  ];

  const rows = trades.map((trade) => [
    trade.id,
    format(new Date(trade.timestamp), "yyyy-MM-dd HH:mm:ss"),
    trade.symbol,
    trade.market,
    trade.side,
    trade.orderType,
    trade.size.toFixed(6),
    trade.entryPrice.toFixed(6),
    trade.exitPrice?.toFixed(6) || "",
    trade.fee.toFixed(6),
    trade.feeType || "UNKNOWN",
    trade.rebate?.toFixed(6) || "0",
    trade.pnl?.toFixed(6) || "",
    trade.status,
    trade.leverage || "",
    trade.duration || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`, "text/csv");
}

export function exportToJSON(trades: Trade[], filename: string = "trades") {
  const jsonContent = JSON.stringify(
    trades.map((trade) => ({
      ...trade,
      date: format(new Date(trade.timestamp), "yyyy-MM-dd HH:mm:ss"),
    })),
    null,
    2
  );

  downloadFile(
    jsonContent,
    `${filename}-${format(new Date(), "yyyy-MM-dd")}.json`,
    "application/json"
  );
}

export function generateTradeReport(trades: Trade[]): string {
  const closedTrades = trades.filter((t) => t.status === "CLOSED" && t.pnl !== undefined);
  const wins = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losses = closedTrades.filter((t) => (t.pnl || 0) < 0);

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);
  const totalVolume = trades.reduce((sum, t) => sum + t.size * t.entryPrice, 0);

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  const report = `
================================================================================
                        TRADING PERFORMANCE REPORT
                    Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
================================================================================

SUMMARY
-------
Total Trades:        ${trades.length}
Closed Trades:       ${closedTrades.length}
Open Trades:         ${trades.filter((t) => t.status === "OPEN").length}

PERFORMANCE
-----------
Total PnL:           $${totalPnl.toFixed(2)}
Win Rate:            ${winRate.toFixed(2)}%
Profit Factor:       ${profitFactor.toFixed(2)}

Winning Trades:      ${wins.length}
Losing Trades:       ${losses.length}

Average Win:         $${avgWin.toFixed(2)}
Average Loss:        $${avgLoss.toFixed(2)}

Largest Win:         $${Math.max(...wins.map((t) => t.pnl || 0), 0).toFixed(2)}
Largest Loss:        $${Math.min(...losses.map((t) => t.pnl || 0), 0).toFixed(2)}

VOLUME & FEES
-------------
Total Volume:        $${totalVolume.toFixed(2)}
Total Fees:          $${totalFees.toFixed(2)}
Fee Ratio:           ${((totalFees / totalVolume) * 100).toFixed(4)}%

Maker Fees:          $${trades.filter((t) => t.feeType === "MAKER").reduce((sum, t) => sum + t.fee, 0).toFixed(2)}
Taker Fees:          $${trades.filter((t) => t.feeType === "TAKER").reduce((sum, t) => sum + t.fee, 0).toFixed(2)}
Total Rebates:       $${trades.reduce((sum, t) => sum + (t.rebate || 0), 0).toFixed(2)}

BY MARKET TYPE
--------------
Spot Trades:         ${trades.filter((t) => t.market === "SPOT").length}
Perp Trades:         ${trades.filter((t) => t.market === "PERP").length}

BY DIRECTION
------------
Long Trades:         ${trades.filter((t) => t.side === "LONG").length}
Short Trades:        ${trades.filter((t) => t.side === "SHORT").length}

BY ORDER TYPE
-------------
IOC:                 ${trades.filter((t) => t.orderType === "IOC").length}
Limit:               ${trades.filter((t) => t.orderType === "LIMIT").length}
Market:              ${trades.filter((t) => t.orderType === "MARKET").length}

================================================================================
                           END OF REPORT
================================================================================
`;

  return report;
}

export function exportReport(trades: Trade[], filename: string = "report") {
  const report = generateTradeReport(trades);
  downloadFile(report, `${filename}-${format(new Date(), "yyyy-MM-dd")}.txt`, "text/plain");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
