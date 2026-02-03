"use client";

import { useState } from "react";
import { CalendarHeatmap } from "@/components/journal/CalendarHeatmap";
import { TradeEntryForm } from "@/components/journal/TradeEntryForm";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { JournalStats } from "@/components/journal/JournalStats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useJournalStore } from "@/stores/journal-store";
import { mockCalendarData } from "@/lib/mock-data";
import { Search, X } from "lucide-react";

export default function JournalPage() {
  const { entries, getAllTags, getEntriesByTag, getEntriesByDate } = useJournalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTags = getAllTags();

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesNotes = entry.notes.toLowerCase().includes(query);
      const matchesTags = entry.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      if (!matchesNotes && !matchesTags) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some((tag) =>
        entry.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Date filter
    if (selectedDate && entry.date !== selectedDate) {
      return false;
    }

    return true;
  });

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDayClick = (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedDate(null);
  };

  const hasFilters =
    searchQuery || selectedTags.length > 0 || selectedDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">
            Track your trades, emotions, and lessons learned
          </p>
        </div>
        <TradeEntryForm />
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Calendar and Stats */}
        <div className="space-y-6">
          <CalendarHeatmap
            data={mockCalendarData}
            onDayClick={handleDayClick}
          />
          <JournalStats />
        </div>

        {/* Right Column - Journal Entries */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search journal entries..."
                className="pl-9"
              />
            </div>

            {/* Tags filter */}
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 10).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Active filters:
                </span>
                {selectedDate && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {selectedDate}
                    <button onClick={() => setSelectedDate(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button onClick={() => handleTagClick(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Entries List */}
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-4 pr-4">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    {hasFilters
                      ? "No entries match your filters"
                      : "No journal entries yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hasFilters
                      ? "Try adjusting your search or filters"
                      : "Start by adding your first entry"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
