"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import { CalendarDay } from "@/types";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";

interface CalendarHeatmapProps {
  data: CalendarDay[];
  onDayClick?: (date: string) => void;
}

export function CalendarHeatmap({ data, onDayClick }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dataMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    data.forEach((day) => map.set(day.date, day));
    return map;
  }, [data]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get the day of week the month starts on (0 = Sunday)
  const startDayOfWeek = getDay(monthDays[0]);

  // Calculate month stats
  const monthStats = useMemo(() => {
    const monthData = monthDays
      .map((day) => dataMap.get(format(day, "yyyy-MM-dd")))
      .filter(Boolean) as CalendarDay[];

    const totalPnl = monthData.reduce((sum, d) => sum + d.pnl, 0);
    const totalTrades = monthData.reduce((sum, d) => sum + d.trades, 0);
    const profitDays = monthData.filter((d) => d.pnl > 0).length;
    const lossDays = monthData.filter((d) => d.pnl < 0).length;

    return { totalPnl, totalTrades, profitDays, lossDays };
  }, [monthDays, dataMap]);

  const getIntensityColor = (day: CalendarDay | undefined) => {
    if (!day || day.trades === 0) return "bg-muted/30";

    const intensity = day.intensity;
    if (day.pnl > 0) {
      // Green shades for profit
      if (intensity >= 4) return "bg-profit";
      if (intensity >= 3) return "bg-profit/80";
      if (intensity >= 2) return "bg-profit/60";
      if (intensity >= 1) return "bg-profit/40";
      return "bg-profit/20";
    } else if (day.pnl < 0) {
      // Red shades for loss
      const absIntensity = Math.abs(intensity);
      if (absIntensity >= 4) return "bg-loss";
      if (absIntensity >= 3) return "bg-loss/80";
      if (absIntensity >= 2) return "bg-loss/60";
      if (absIntensity >= 1) return "bg-loss/40";
      return "bg-loss/20";
    }
    return "bg-muted/50";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Trading Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Month PnL</p>
            <p
              className={cn(
                "font-mono font-semibold",
                monthStats.totalPnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {monthStats.totalPnl >= 0 ? "+" : ""}
              {formatCurrency(monthStats.totalPnl)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Trades</p>
            <p className="font-mono font-semibold">{monthStats.totalTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Profit Days</p>
            <p className="font-mono font-semibold text-profit">
              {monthStats.profitDays}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Loss Days</p>
            <p className="font-mono font-semibold text-loss">
              {monthStats.lossDays}
            </p>
          </div>
        </div>

        {/* Calendar Grid */}
        <TooltipProvider delayDuration={0}>
          <div className="space-y-1">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-muted-foreground font-medium py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Month days */}
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayData = dataMap.get(dateStr);
                const dayOfMonth = day.getDate();
                const today = isToday(day);

                return (
                  <Tooltip key={dateStr}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onDayClick?.(dateStr)}
                        className={cn(
                          "aspect-square rounded-md flex flex-col items-center justify-center transition-all hover:ring-2 hover:ring-primary/50",
                          getIntensityColor(dayData),
                          today && "ring-2 ring-primary",
                          "cursor-pointer"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-medium",
                            dayData?.trades
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {dayOfMonth}
                        </span>
                        {dayData?.trades ? (
                          <span className="text-[10px] text-muted-foreground">
                            {dayData.trades}
                          </span>
                        ) : null}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {format(day, "EEEE, MMM dd")}
                        </p>
                        {dayData ? (
                          <>
                            <p className="font-mono text-sm">
                              PnL:{" "}
                              <span
                                className={
                                  dayData.pnl >= 0 ? "text-profit" : "text-loss"
                                }
                              >
                                {dayData.pnl >= 0 ? "+" : ""}
                                {formatCurrency(dayData.pnl)}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {dayData.trades} trades
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No trading activity
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Loss</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 rounded bg-loss" />
            <div className="w-4 h-4 rounded bg-loss/60" />
            <div className="w-4 h-4 rounded bg-muted/30" />
            <div className="w-4 h-4 rounded bg-profit/60" />
            <div className="w-4 h-4 rounded bg-profit" />
          </div>
          <span>Profit</span>
        </div>
      </CardContent>
    </Card>
  );
}
