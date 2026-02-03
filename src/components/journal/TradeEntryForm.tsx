"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { JournalEntry, Sentiment } from "@/types";
import { useJournalStore } from "@/stores/journal-store";
import { Plus, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  notes: z.string().min(1, "Notes are required"),
  sentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  rating: z.number().min(1).max(5),
  strategy: z.string().optional(),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface TradeEntryFormProps {
  tradeId?: string;
  defaultDate?: string;
  onSuccess?: () => void;
}

export function TradeEntryForm({
  tradeId,
  defaultDate,
  onSuccess,
}: TradeEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { addEntry } = useJournalStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: defaultDate || new Date().toISOString().split("T")[0],
      notes: "",
      sentiment: "NEUTRAL",
      rating: 3,
      strategy: "",
    },
  });

  const rating = watch("rating");
  const sentiment = watch("sentiment");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = (data: JournalEntryFormData) => {
    addEntry({
      tradeId,
      date: data.date,
      notes: data.notes,
      tags,
      sentiment: data.sentiment as Sentiment,
      rating: data.rating,
      strategy: data.strategy,
    });

    reset();
    setTags([]);
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Journal Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Record your thoughts, analysis, and lessons from today&apos;s trading.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              className="font-mono"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Sentiment */}
          <div className="space-y-2">
            <Label>Market Sentiment</Label>
            <div className="flex gap-2">
              {(["BULLISH", "NEUTRAL", "BEARISH"] as Sentiment[]).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={sentiment === s ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    sentiment === s &&
                      s === "BULLISH" &&
                      "bg-profit hover:bg-profit/90",
                    sentiment === s &&
                      s === "BEARISH" &&
                      "bg-loss hover:bg-loss/90"
                  )}
                  onClick={() => setValue("sentiment", s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Self Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy Used</Label>
            <Select onValueChange={(v) => setValue("strategy", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Momentum">Momentum</SelectItem>
                <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                <SelectItem value="Breakout">Breakout</SelectItem>
                <SelectItem value="Support/Resistance">Support/Resistance</SelectItem>
                <SelectItem value="VWAP">VWAP</SelectItem>
                <SelectItem value="Scalping">Scalping</SelectItem>
                <SelectItem value="Swing Trading">Swing Trading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type and press Enter to add tags"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="What went well? What could be improved? Key observations..."
              rows={4}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
