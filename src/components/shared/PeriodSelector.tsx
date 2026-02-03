"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
}

const periods: Period[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export function PeriodSelector({
  value,
  onChange,
  className,
}: PeriodSelectorProps) {
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-xl bg-muted/30 border border-border/50 p-1 backdrop-blur-sm",
      className
    )}>
      {periods.map((period) => (
        <Button
          key={period}
          variant={value === period ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-7 px-3 text-xs font-semibold rounded-lg transition-all duration-200",
            value === period
              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => onChange(period)}
        >
          {period}
        </Button>
      ))}
    </div>
  );
}

export function getPeriodDateRange(period: Period): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "1D":
      start.setDate(start.getDate() - 1);
      break;
    case "1W":
      start.setDate(start.getDate() - 7);
      break;
    case "1M":
      start.setMonth(start.getMonth() - 1);
      break;
    case "3M":
      start.setMonth(start.getMonth() - 3);
      break;
    case "1Y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "ALL":
      start.setFullYear(2020); // Far enough in the past
      break;
  }

  return { start, end };
}
