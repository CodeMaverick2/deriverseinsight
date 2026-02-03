import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JournalEntry, Sentiment } from "@/types";
import { mockJournalEntries } from "@/lib/mock-data";

interface JournalState {
  // Data
  entries: JournalEntry[];

  // Actions
  addEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;

  // Get entry by trade ID
  getEntryByTradeId: (tradeId: string) => JournalEntry | undefined;

  // Get entries by date
  getEntriesByDate: (date: string) => JournalEntry[];

  // Get entries by tag
  getEntriesByTag: (tag: string) => JournalEntry[];

  // Get all unique tags
  getAllTags: () => string[];

  // Get entries by sentiment
  getEntriesBySentiment: (sentiment: Sentiment) => JournalEntry[];

  // Statistics
  getJournalStats: () => {
    totalEntries: number;
    avgRating: number;
    mostUsedTags: { tag: string; count: number }[];
    sentimentBreakdown: { sentiment: Sentiment; count: number }[];
  };
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: mockJournalEntries,

      addEntry: (entryData) => {
        const entry: JournalEntry = {
          ...entryData,
          id: generateId(),
        };
        set((state) => ({
          entries: [entry, ...state.entries],
        }));
      },

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      getEntryByTradeId: (tradeId) => {
        return get().entries.find((entry) => entry.tradeId === tradeId);
      },

      getEntriesByDate: (date) => {
        return get().entries.filter((entry) => entry.date === date);
      },

      getEntriesByTag: (tag) => {
        return get().entries.filter((entry) => entry.tags.includes(tag));
      },

      getAllTags: () => {
        const tags = new Set<string>();
        get().entries.forEach((entry) => {
          entry.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
      },

      getEntriesBySentiment: (sentiment) => {
        return get().entries.filter((entry) => entry.sentiment === sentiment);
      },

      getJournalStats: () => {
        const { entries } = get();

        // Average rating
        const entriesWithRating = entries.filter((e) => e.rating > 0);
        const avgRating =
          entriesWithRating.length > 0
            ? entriesWithRating.reduce((sum, e) => sum + e.rating, 0) / entriesWithRating.length
            : 0;

        // Tag frequency
        const tagCounts = new Map<string, number>();
        entries.forEach((entry) => {
          entry.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });
        const mostUsedTags = Array.from(tagCounts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Sentiment breakdown
        const sentimentCounts = new Map<Sentiment, number>();
        entries.forEach((entry) => {
          sentimentCounts.set(
            entry.sentiment,
            (sentimentCounts.get(entry.sentiment) || 0) + 1
          );
        });
        const sentimentBreakdown: { sentiment: Sentiment; count: number }[] = [
          { sentiment: "BULLISH", count: sentimentCounts.get("BULLISH") || 0 },
          { sentiment: "BEARISH", count: sentimentCounts.get("BEARISH") || 0 },
          { sentiment: "NEUTRAL", count: sentimentCounts.get("NEUTRAL") || 0 },
        ];

        return {
          totalEntries: entries.length,
          avgRating,
          mostUsedTags,
          sentimentBreakdown,
        };
      },
    }),
    {
      name: "deriverse-journal-store",
    }
  )
);
