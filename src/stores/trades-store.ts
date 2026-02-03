import { create } from "zustand";
import { Trade, Position, TradeFilters, MarketType, TradeSide, OrderType, TradeStatus } from "@/types";
import { mockTrades, mockPositions, calculateAnalytics } from "@/lib/mock-data";

interface TradesState {
  // Data
  trades: Trade[];
  positions: Position[];

  // Filters
  filters: TradeFilters;
  setFilters: (filters: Partial<TradeFilters>) => void;
  resetFilters: () => void;

  // Filtered data
  getFilteredTrades: () => Trade[];

  // Analytics (computed from trades)
  getAnalytics: () => ReturnType<typeof calculateAnalytics>;

  // Actions
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;

  // Data loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Initialize with mock data
  initializeMockData: () => void;
}

const defaultFilters: TradeFilters = {
  dateRange: undefined,
  symbols: undefined,
  sides: undefined,
  markets: undefined,
  orderTypes: undefined,
  status: undefined,
  minPnl: undefined,
  maxPnl: undefined,
  searchQuery: undefined,
};

export const useTradesStore = create<TradesState>((set, get) => ({
  // Initial data
  trades: mockTrades,
  positions: mockPositions,

  // Filters
  filters: defaultFilters,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  // Get filtered trades
  getFilteredTrades: () => {
    const { trades, filters } = get();

    return trades.filter((trade) => {
      // Date range filter
      if (filters.dateRange) {
        const tradeDate = new Date(trade.timestamp);
        if (tradeDate < filters.dateRange.start || tradeDate > filters.dateRange.end) {
          return false;
        }
      }

      // Symbol filter
      if (filters.symbols && filters.symbols.length > 0) {
        if (!filters.symbols.includes(trade.symbol)) {
          return false;
        }
      }

      // Side filter
      if (filters.sides && filters.sides.length > 0) {
        if (!filters.sides.includes(trade.side)) {
          return false;
        }
      }

      // Market filter
      if (filters.markets && filters.markets.length > 0) {
        if (!filters.markets.includes(trade.market)) {
          return false;
        }
      }

      // Order type filter
      if (filters.orderTypes && filters.orderTypes.length > 0) {
        if (!filters.orderTypes.includes(trade.orderType)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(trade.status)) {
          return false;
        }
      }

      // PnL range filter
      if (filters.minPnl !== undefined && trade.pnl !== undefined) {
        if (trade.pnl < filters.minPnl) {
          return false;
        }
      }

      if (filters.maxPnl !== undefined && trade.pnl !== undefined) {
        if (trade.pnl > filters.maxPnl) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSymbol = trade.symbol.toLowerCase().includes(query);
        const matchesId = trade.id.toLowerCase().includes(query);
        if (!matchesSymbol && !matchesId) {
          return false;
        }
      }

      return true;
    });
  },

  // Get analytics
  getAnalytics: () => {
    const { trades } = get();
    return calculateAnalytics(trades);
  },

  // Actions
  addTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades],
    })),

  updateTrade: (id, updates) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === id ? { ...trade, ...updates } : trade
      ),
    })),

  deleteTrade: (id) =>
    set((state) => ({
      trades: state.trades.filter((trade) => trade.id !== id),
    })),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Initialize mock data
  initializeMockData: () =>
    set({
      trades: mockTrades,
      positions: mockPositions,
    }),
}));
