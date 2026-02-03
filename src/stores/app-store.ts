import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Theme (always dark for this app, but keeping for future)
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

  // Date range filter
  dateRange: {
    start: Date;
    end: Date;
  };
  setDateRange: (start: Date, end: Date) => void;

  // Selected period for analytics
  selectedPeriod: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
  setSelectedPeriod: (period: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL") => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Theme
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      // Date range - default to last 30 days
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      setDateRange: (start, end) => set({ dateRange: { start, end } }),

      // Selected period
      selectedPeriod: "1M",
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),

      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "deriverse-app-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        selectedPeriod: state.selectedPeriod,
      }),
    }
  )
);
