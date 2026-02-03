import { Trade, EquityPoint, DailyStats, SymbolStats, CalendarDay } from "@/types";

// Calculate overall analytics from trades
export function calculateAnalytics(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      totalVolume: 0,
      totalFees: 0,
      totalTrades: 0,
      closedTrades: 0,
      openTrades: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      expectancy: 0,
      avgDuration: 0,
      longTrades: 0,
      shortTrades: 0,
      longPnl: 0,
      shortPnl: 0,
      longWinRate: 0,
      shortWinRate: 0,
      longShortRatio: 0,
    };
  }

  const closedTrades = trades.filter((t) => t.status === "CLOSED" && t.pnl !== undefined);
  const wins = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losses = closedTrades.filter((t) => (t.pnl || 0) < 0);

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalVolume = trades.reduce((sum, t) => sum + t.size * t.entryPrice, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl || 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl || 0)) : 0;

  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
  const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

  // Average trade duration
  const tradesWithDuration = closedTrades.filter((t) => t.duration);
  const avgDuration = tradesWithDuration.length > 0
    ? tradesWithDuration.reduce((sum, t) => sum + (t.duration || 0), 0) / tradesWithDuration.length
    : 0;

  // Long/Short breakdown
  const longTrades = closedTrades.filter((t) => t.side === "LONG");
  const shortTrades = closedTrades.filter((t) => t.side === "SHORT");
  const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const longWinRate = longTrades.length > 0
    ? (longTrades.filter((t) => (t.pnl || 0) > 0).length / longTrades.length) * 100
    : 0;
  const shortWinRate = shortTrades.length > 0
    ? (shortTrades.filter((t) => (t.pnl || 0) > 0).length / shortTrades.length) * 100
    : 0;

  return {
    totalPnl,
    totalVolume,
    totalFees,
    totalTrades: trades.length,
    closedTrades: closedTrades.length,
    openTrades: trades.filter((t) => t.status === "OPEN").length,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    expectancy,
    avgDuration,
    longTrades: longTrades.length,
    shortTrades: shortTrades.length,
    longPnl,
    shortPnl,
    longWinRate,
    shortWinRate,
    longShortRatio: shortTrades.length > 0 ? longTrades.length / shortTrades.length : longTrades.length,
  };
}

// Generate equity curve from trades
export function generateEquityCurve(trades: Trade[], initialEquity: number = 10000): EquityPoint[] {
  if (trades.length === 0) return [];

  const closedTrades = trades
    .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (closedTrades.length === 0) return [];

  let equity = initialEquity;
  let peak = equity;
  const curve: EquityPoint[] = [
    { timestamp: closedTrades[0].timestamp, equity, drawdown: 0, drawdownPercent: 0 },
  ];

  for (const trade of closedTrades) {
    equity += (trade.pnl || 0) - trade.fee;
    peak = Math.max(peak, equity);
    const drawdown = peak - equity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    curve.push({
      timestamp: trade.timestamp,
      equity,
      drawdown,
      drawdownPercent,
    });
  }

  return curve;
}

// Generate daily stats from trades
export function generateDailyStats(trades: Trade[]): DailyStats[] {
  if (trades.length === 0) return [];

  const dailyMap = new Map<string, { pnl: number; trades: number; volume: number; fees: number; wins: number }>();

  for (const trade of trades) {
    const date = new Date(trade.timestamp).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { pnl: 0, trades: 0, volume: 0, fees: 0, wins: 0 };

    existing.trades += 1;
    existing.volume += trade.size * trade.entryPrice;
    existing.fees += trade.fee;
    if (trade.pnl !== undefined) {
      existing.pnl += trade.pnl;
      if (trade.pnl > 0) existing.wins += 1;
    }

    dailyMap.set(date, existing);
  }

  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({
      date,
      pnl: stats.pnl,
      trades: stats.trades,
      volume: stats.volume,
      fees: stats.fees,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Generate symbol statistics
export function generateSymbolStats(trades: Trade[]): SymbolStats[] {
  if (trades.length === 0) return [];

  const symbolMap = new Map<string, Trade[]>();

  for (const trade of trades) {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, []);
    }
    symbolMap.get(trade.symbol)!.push(trade);
  }

  const stats: SymbolStats[] = [];

  for (const [symbol, symbolTrades] of symbolMap) {
    const closedTrades = symbolTrades.filter((t) => t.status === "CLOSED");
    const wins = closedTrades.filter((t) => (t.pnl || 0) > 0).length;
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalVolume = symbolTrades.reduce((sum, t) => sum + t.size * t.entryPrice, 0);
    const avgDuration = closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + (t.duration || 0), 0) / closedTrades.length
      : 0;

    stats.push({
      symbol,
      trades: symbolTrades.length,
      volume: totalVolume,
      pnl: totalPnl,
      winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0,
      avgTradeDuration: avgDuration,
    });
  }

  return stats.sort((a, b) => b.volume - a.volume);
}

// Generate calendar heatmap data
export function generateCalendarData(dailyStats: DailyStats[]): CalendarDay[] {
  return dailyStats.map((day) => {
    let intensity = 0;
    const absPnl = Math.abs(day.pnl);
    if (absPnl > 2000) intensity = 4;
    else if (absPnl > 1000) intensity = 3;
    else if (absPnl > 500) intensity = 2;
    else if (absPnl > 0) intensity = 1;

    return {
      date: day.date,
      pnl: day.pnl,
      trades: day.trades,
      intensity: day.pnl >= 0 ? intensity : -intensity,
    };
  });
}

// Generate PnL chart data
export function generatePnLChartData(dailyStats: DailyStats[]) {
  let cumulative = 0;
  return dailyStats.map((stat) => {
    cumulative += stat.pnl;
    return {
      date: stat.date,
      pnl: stat.pnl,
      cumulative,
    };
  });
}
