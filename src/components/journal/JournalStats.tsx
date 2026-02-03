"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJournalStore } from "@/stores/journal-store";
import { Star, Tag, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function JournalStats() {
  const { getJournalStats } = useJournalStore();
  const stats = getJournalStats();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Journal Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Entries and Avg Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Avg Rating</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-2xl font-bold">
                {stats.avgRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Sentiment Distribution
          </p>
          <div className="space-y-2">
            {stats.sentimentBreakdown.map(({ sentiment, count }) => {
              const percentage =
                stats.totalEntries > 0
                  ? (count / stats.totalEntries) * 100
                  : 0;
              const Icon =
                sentiment === "BULLISH"
                  ? TrendingUp
                  : sentiment === "BEARISH"
                  ? TrendingDown
                  : Minus;
              const color =
                sentiment === "BULLISH"
                  ? "text-profit bg-profit"
                  : sentiment === "BEARISH"
                  ? "text-loss bg-loss"
                  : "text-muted-foreground bg-muted-foreground";

              return (
                <div key={sentiment} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          sentiment === "BULLISH"
                            ? "text-profit"
                            : sentiment === "BEARISH"
                            ? "text-loss"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span>{sentiment}</span>
                    </div>
                    <span className="font-mono">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tags */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Most Used Tags
          </p>
          <div className="flex flex-wrap gap-1">
            {stats.mostUsedTags.length > 0 ? (
              stats.mostUsedTags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}{" "}
                  <span className="ml-1 text-muted-foreground">({count})</span>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No tags yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
