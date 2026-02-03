import {
  Trade,
  Position,
  JournalEntry,
  DailyStats,
  EquityPoint,
  SymbolStats,
  CalendarDay,
  MarketType,
  TradeSide,
  OrderType,
  Sentiment,
} from "@/types";

// Constants for mock data generation
const SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "SOL/USDC", "BTC/USDC", "ETH/USDC"];
const PERP_SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP"];
const SPOT_SYMBOLS = ["SOL/USDC", "BTC/USDC", "ETH/USDC"];

// Seed for reproducible randomness
let seed = 12345;
function seededRandom(): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomInRange(min: number, max: number): number {
  return min + seededRandom() * (max - min);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Generate realistic trade data
export function generateTrades(count: number = 200, startDate?: Date): Trade[] {
  seed = 12345; // Reset seed for consistency
  const trades: Trade[] = [];
  const now = Date.now();
  const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
  const start = startDate?.getTime() || threeMonthsAgo;

  for (let i = 0; i < count; i++) {
    const timestamp = start + seededRandom() * (now - start);
    const symbol = randomItem(SYMBOLS);
    const market: MarketType = PERP_SYMBOLS.includes(symbol) ? "PERP" : "SPOT";
    const side: TradeSide = seededRandom() > 0.48 ? "LONG" : "SHORT";
    const orderType: OrderType = seededRandom() > 0.6 ? "LIMIT" : seededRandom() > 0.5 ? "IOC" : "MARKET";

    // Price based on symbol
    let basePrice: number;
    if (symbol.includes("BTC")) basePrice = randomInRange(40000, 70000);
    else if (symbol.includes("ETH")) basePrice = randomInRange(2000, 4000);
    else basePrice = randomInRange(80, 200);

    const entryPrice = basePrice * (1 + randomInRange(-0.02, 0.02));
    const isClosed = seededRandom() > 0.15;

    // Slightly biased towards profitable trades (55% win rate target)
    const isWin = seededRandom() > 0.45;
    const priceChange = randomInRange(0.001, 0.05) * (isWin ? 1 : -1);
    const exitPrice = isClosed ? entryPrice * (1 + (side === "LONG" ? priceChange : -priceChange)) : undefined;

    const size = randomInRange(0.1, 10) * (symbol.includes("BTC") ? 0.1 : symbol.includes("ETH") ? 1 : 10);
    const leverage = market === "PERP" ? Math.floor(randomInRange(1, 20)) : undefined;

    let pnl: number | undefined;
    if (exitPrice) {
      const priceDiff = exitPrice - entryPrice;
      pnl = side === "LONG" ? priceDiff * size : -priceDiff * size;
      if (leverage) pnl *= leverage;
    }

    const fee = size * entryPrice * 0.0006; // 0.06% fee
    const duration = isClosed ? randomInRange(60000, 86400000) : undefined; // 1 min to 1 day

    trades.push({
      id: generateId(),
      timestamp,
      market,
      symbol,
      side,
      orderType,
      size,
      entryPrice,
      exitPrice,
      fee,
      pnl,
      status: isClosed ? "CLOSED" : "OPEN",
      duration,
      leverage,
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate open positions
export function generatePositions(): Position[] {
  seed = 54321;
  const positions: Position[] = [];
  const symbols = ["SOL-PERP", "BTC-PERP", "ETH-PERP"];

  for (const symbol of symbols) {
    if (seededRandom() > 0.5) {
      let basePrice: number;
      if (symbol.includes("BTC")) basePrice = randomInRange(45000, 65000);
      else if (symbol.includes("ETH")) basePrice = randomInRange(2500, 3500);
      else basePrice = randomInRange(100, 180);

      const entryPrice = basePrice * (1 + randomInRange(-0.02, 0.02));
      const currentPrice = entryPrice * (1 + randomInRange(-0.05, 0.08));
      const side: TradeSide = seededRandom() > 0.5 ? "LONG" : "SHORT";
      const size = randomInRange(1, 20) * (symbol.includes("BTC") ? 0.1 : symbol.includes("ETH") ? 1 : 10);
      const leverage = Math.floor(randomInRange(2, 10));

      const priceDiff = currentPrice - entryPrice;
      const unrealizedPnl = (side === "LONG" ? priceDiff : -priceDiff) * size * leverage;

      positions.push({
        id: generateId(),
        symbol,
        market: "PERP",
        side,
        size,
        entryPrice,
        currentPrice,
        unrealizedPnl,
        leverage,
        liquidationPrice: side === "LONG"
          ? entryPrice * (1 - 1 / leverage * 0.9)
          : entryPrice * (1 + 1 / leverage * 0.9),
        margin: size * entryPrice / leverage,
        timestamp: Date.now() - randomInRange(3600000, 86400000 * 3),
      });
    }
  }

  return positions;
}

// Generate daily stats
export function generateDailyStats(days: number = 90): DailyStats[] {
  seed = 11111;
  const stats: DailyStats[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const trades = Math.floor(randomInRange(0, 25));
    const winRate = trades > 0 ? randomInRange(0.35, 0.75) : 0;
    const avgTradeSize = randomInRange(500, 5000);
    const volume = trades * avgTradeSize;

    // PnL calculation with some variance
    const basePnl = trades > 0 ? randomInRange(-2000, 3000) : 0;
    const pnl = basePnl * (1 + (winRate - 0.5));
    const fees = volume * 0.0006;

    stats.push({
      date: dateStr,
      pnl,
      trades,
      volume,
      fees,
      winRate: winRate * 100,
    });
  }

  return stats;
}

// Generate equity curve
export function generateEquityCurve(trades: Trade[]): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
    .sort((a, b) => a.timestamp - b.timestamp);

  let equity = 10000; // Starting equity
  let peak = equity;
  const curve: EquityPoint[] = [
    { timestamp: closedTrades[0]?.timestamp || Date.now(), equity, drawdown: 0, drawdownPercent: 0 },
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

// Generate symbol statistics
export function generateSymbolStats(trades: Trade[]): SymbolStats[] {
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

// Generate journal entries
export function generateJournalEntries(trades: Trade[]): JournalEntry[] {
  seed = 22222;
  const entries: JournalEntry[] = [];
  const tags = ["scalp", "swing", "breakout", "reversal", "trend", "range", "news"];
  const strategies = ["Momentum", "Mean Reversion", "Breakout", "Support/Resistance", "VWAP"];
  const mistakes = [
    "Entered too early",
    "Sized too large",
    "Ignored stop loss",
    "FOMO entry",
    "Revenge trading",
  ];
  const lessons = [
    "Wait for confirmation",
    "Stick to the plan",
    "Risk management is key",
    "Patience pays",
    "Cut losses quickly",
  ];

  const closedTrades = trades.filter((t) => t.status === "CLOSED").slice(0, 50);

  for (const trade of closedTrades) {
    if (seededRandom() > 0.6) {
      const sentiment: Sentiment = (trade.pnl || 0) > 0
        ? "BULLISH"
        : (trade.pnl || 0) < 0
          ? "BEARISH"
          : "NEUTRAL";

      const selectedTags: string[] = [];
      for (let i = 0; i < Math.floor(randomInRange(1, 4)); i++) {
        const tag = randomItem(tags);
        if (!selectedTags.includes(tag)) selectedTags.push(tag);
      }

      entries.push({
        id: generateId(),
        tradeId: trade.id,
        date: new Date(trade.timestamp).toISOString().split("T")[0],
        notes: `Trade on ${trade.symbol}. ${(trade.pnl || 0) > 0 ? "Good execution." : "Need to review entry timing."}`,
        tags: selectedTags,
        sentiment,
        rating: Math.floor(randomInRange(1, 6)),
        strategy: randomItem(strategies),
        mistakes: (trade.pnl || 0) < 0 ? [randomItem(mistakes)] : undefined,
        lessons: seededRandom() > 0.5 ? [randomItem(lessons)] : undefined,
      });
    }
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

// Calculate overall analytics
export function calculateAnalytics(trades: Trade[]) {
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

// Pre-generate data for consistent usage
export const mockTrades = generateTrades(200);
export const mockPositions = generatePositions();
export const mockDailyStats = generateDailyStats(90);
export const mockEquityCurve = generateEquityCurve(mockTrades);
export const mockSymbolStats = generateSymbolStats(mockTrades);
export const mockJournalEntries = generateJournalEntries(mockTrades);
export const mockCalendarData = generateCalendarData(mockDailyStats);
export const mockAnalytics = calculateAnalytics(mockTrades);
