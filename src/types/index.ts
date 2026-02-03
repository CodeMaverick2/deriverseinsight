// Trade types
export type MarketType = "SPOT" | "PERP";
export type TradeSide = "LONG" | "SHORT" | "BUY" | "SELL";
export type OrderType = "IOC" | "LIMIT" | "MARKET";
export type TradeStatus = "OPEN" | "CLOSED";
export type FeeType = "MAKER" | "TAKER";
export type Sentiment = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface Trade {
  id: string;
  timestamp: number;
  market: MarketType;
  symbol: string;
  side: TradeSide;
  orderType: OrderType;
  size: number;
  entryPrice: number;
  exitPrice?: number;
  fee: number;
  feeType?: FeeType; // Maker vs Taker for fee analysis
  rebate?: number; // Maker rebate amount
  pnl?: number;
  status: TradeStatus;
  duration?: number; // in milliseconds
  leverage?: number;
}

export interface Position {
  id: string;
  symbol: string;
  market: MarketType;
  side: TradeSide;
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  leverage?: number;
  liquidationPrice?: number;
  margin?: number;
  timestamp: number;
}

// Journal types
export interface JournalEntry {
  id: string;
  tradeId?: string;
  date: string;
  notes: string;
  tags: string[];
  sentiment: Sentiment;
  rating: number; // 1-5
  screenshots?: string[];
  strategy?: string;
  mistakes?: string[];
  lessons?: string[];
}

// Analytics types
export interface AnalyticsSnapshot {
  period: string;
  totalPnl: number;
  winRate: number;
  trades: number;
  volume: number;
  fees: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
}

export interface DailyStats {
  date: string;
  pnl: number;
  trades: number;
  volume: number;
  fees: number;
  winRate: number;
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
  drawdown: number;
  drawdownPercent: number;
}

export interface SymbolStats {
  symbol: string;
  trades: number;
  volume: number;
  pnl: number;
  winRate: number;
  avgTradeDuration: number;
}

export interface TimeStats {
  hour?: number;
  dayOfWeek?: number;
  session?: "ASIA" | "EUROPE" | "US";
  trades: number;
  pnl: number;
  winRate: number;
}

export interface DirectionalStats {
  side: TradeSide;
  trades: number;
  volume: number;
  pnl: number;
  winRate: number;
  avgSize: number;
}

export interface OrderTypeStats {
  orderType: OrderType;
  trades: number;
  volume: number;
  pnl: number;
  winRate: number;
  avgFillRate?: number;
  avgSlippage?: number;
}

// Dashboard widget types
export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: "currency" | "percentage" | "number";
}

// Filter types
export interface TradeFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  symbols?: string[];
  sides?: TradeSide[];
  markets?: MarketType[];
  orderTypes?: OrderType[];
  status?: TradeStatus[];
  minPnl?: number;
  maxPnl?: number;
  searchQuery?: string;
}

// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PnLChartData {
  date: string;
  pnl: number;
  cumulative: number;
}

export interface VolumeChartData {
  date: string;
  volume: number;
  trades: number;
}

// Calendar heatmap types
export interface CalendarDay {
  date: string;
  pnl: number;
  trades: number;
  intensity: number; // 0-4 for color intensity
}

// App state types
export interface AppState {
  isConnected: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
}

// Export utilities
export interface ExportOptions {
  format: "csv" | "pdf" | "json";
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeFields?: string[];
}
