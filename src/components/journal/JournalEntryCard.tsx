"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JournalEntry } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Star, MessageSquare, Target, AlertCircle, Lightbulb } from "lucide-react";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit?: () => void;
}

export function JournalEntryCard({ entry, onEdit }: JournalEntryCardProps) {
  const sentimentColors = {
    BULLISH: "text-profit bg-profit/10 border-profit/30",
    BEARISH: "text-loss bg-loss/10 border-loss/30",
    NEUTRAL: "text-muted-foreground bg-muted border-border",
  };

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onEdit}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs", sentimentColors[entry.sentiment])}
              >
                {entry.sentiment}
              </Badge>
              {entry.strategy && (
                <Badge variant="secondary" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {entry.strategy}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= entry.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Notes */}
        <div className="flex gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground line-clamp-3">
            {entry.notes}
          </p>
        </div>

        {/* Mistakes */}
        {entry.mistakes && entry.mistakes.length > 0 && (
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-loss shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {entry.mistakes.map((mistake, i) => (
                <Badge key={i} variant="outline" className="text-xs text-loss border-loss/30">
                  {mistake}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lessons */}
        {entry.lessons && entry.lessons.length > 0 && (
          <div className="flex gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {entry.lessons.map((lesson, i) => (
                <Badge key={i} variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                  {lesson}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
