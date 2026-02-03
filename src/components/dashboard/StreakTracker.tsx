"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Flame, Snowflake, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Trade } from "@/types";

interface StreakTrackerProps {
  trades: Trade[];
}

interface StreakInfo {
  current: {
    type: "win" | "loss" | "none";
    count: number;
    pnl: number;
  };
  longest: {
    win: { count: number; pnl: number };
    loss: { count: number; pnl: number };
  };
  recent: ("win" | "loss")[];
}

export function StreakTracker({ trades }: StreakTrackerProps) {
  const streakInfo = useMemo((): StreakInfo => {
    const closedTrades = trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== undefined)
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

    if (closedTrades.length === 0) {
      return {
        current: { type: "none", count: 0, pnl: 0 },
        longest: { win: { count: 0, pnl: 0 }, loss: { count: 0, pnl: 0 } },
        recent: [],
      };
    }

    // Get recent 10 trades for display
    const recent = closedTrades.slice(0, 10).map((t) =>
      (t.pnl || 0) > 0 ? "win" as const : "loss" as const
    );

    // Calculate current streak
    let currentType = (closedTrades[0].pnl || 0) > 0 ? "win" : "loss";
    let currentCount = 0;
    let currentPnl = 0;

    for (const trade of closedTrades) {
      const isWin = (trade.pnl || 0) > 0;
      if ((isWin && currentType === "win") || (!isWin && currentType === "loss")) {
        currentCount++;
        currentPnl += trade.pnl || 0;
      } else {
        break;
      }
    }

    // Calculate longest streaks (iterate in chronological order)
    const chronological = [...closedTrades].reverse();
    let longestWin = { count: 0, pnl: 0 };
    let longestLoss = { count: 0, pnl: 0 };
    let tempStreak = { type: "", count: 0, pnl: 0 };

    for (const trade of chronological) {
      const isWin = (trade.pnl || 0) > 0;
      const type = isWin ? "win" : "loss";

      if (type === tempStreak.type) {
        tempStreak.count++;
        tempStreak.pnl += trade.pnl || 0;
      } else {
        // Save previous streak if longest
        if (tempStreak.type === "win" && tempStreak.count > longestWin.count) {
          longestWin = { count: tempStreak.count, pnl: tempStreak.pnl };
        } else if (tempStreak.type === "loss" && tempStreak.count > longestLoss.count) {
          longestLoss = { count: tempStreak.count, pnl: tempStreak.pnl };
        }
        // Start new streak
        tempStreak = { type, count: 1, pnl: trade.pnl || 0 };
      }
    }

    // Check final streak
    if (tempStreak.type === "win" && tempStreak.count > longestWin.count) {
      longestWin = { count: tempStreak.count, pnl: tempStreak.pnl };
    } else if (tempStreak.type === "loss" && tempStreak.count > longestLoss.count) {
      longestLoss = { count: tempStreak.count, pnl: tempStreak.pnl };
    }

    return {
      current: {
        type: currentType as "win" | "loss",
        count: currentCount,
        pnl: currentPnl,
      },
      longest: { win: longestWin, loss: longestLoss },
      recent,
    };
  }, [trades]);

  const isHotStreak = streakInfo.current.type === "win" && streakInfo.current.count >= 3;
  const isColdStreak = streakInfo.current.type === "loss" && streakInfo.current.count >= 3;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-lg p-1.5",
            isHotStreak ? "bg-amber-500/20" : isColdStreak ? "bg-blue-500/20" : "bg-primary/10"
          )}>
            {isHotStreak ? (
              <Flame className="h-4 w-4 text-amber-400" />
            ) : isColdStreak ? (
              <Snowflake className="h-4 w-4 text-blue-400" />
            ) : (
              <Activity className="h-4 w-4 text-primary" />
            )}
          </div>
          <CardTitle className="text-base font-medium text-foreground/90">
            Streak Tracker
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Current Streak */}
        <div className={cn(
          "p-4 rounded-xl border",
          streakInfo.current.type === "win"
            ? "bg-emerald-500/10 border-emerald-500/30"
            : streakInfo.current.type === "loss"
            ? "bg-red-500/10 border-red-500/30"
            : "bg-muted/30 border-border/30"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {streakInfo.current.type === "win" ? (
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              ) : streakInfo.current.type === "loss" ? (
                <TrendingDown className="h-6 w-6 text-red-400" />
              ) : (
                <Activity className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold font-mono">
                  {streakInfo.current.count > 0 ? (
                    <span className={streakInfo.current.type === "win" ? "text-emerald-400" : "text-red-400"}>
                      {streakInfo.current.count} {streakInfo.current.type === "win" ? "Wins" : "Losses"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No trades</span>
                  )}
                </p>
              </div>
            </div>
            {streakInfo.current.count > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Streak PnL</p>
                <p className={cn(
                  "font-mono font-bold text-lg",
                  streakInfo.current.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {streakInfo.current.pnl >= 0 ? "+" : ""}
                  {formatCurrency(streakInfo.current.pnl)}
                </p>
              </div>
            )}
          </div>
          {isHotStreak && (
            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
              <Flame className="h-3 w-3" /> Hot streak! Keep the momentum going!
            </p>
          )}
          {isColdStreak && (
            <p className="mt-2 text-xs text-blue-400 flex items-center gap-1">
              <Snowflake className="h-3 w-3" /> Consider reviewing your strategy
            </p>
          )}
        </div>

        {/* Recent Trades Visualization */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Recent Trades</p>
          <div className="flex gap-1">
            {streakInfo.recent.length > 0 ? (
              streakInfo.recent.map((result, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 flex-1 rounded transition-all",
                    result === "win"
                      ? "bg-emerald-500/60 hover:bg-emerald-500/80"
                      : "bg-red-500/60 hover:bg-red-500/80",
                    i === 0 && "ring-2 ring-white/30"
                  )}
                  title={`Trade ${i + 1}: ${result === "win" ? "Win" : "Loss"}`}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent trades</p>
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Most Recent</span>
            <span>Oldest</span>
          </div>
        </div>

        {/* Longest Streaks */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-xs text-muted-foreground mb-1">Best Win Streak</p>
            <p className="font-mono font-bold text-emerald-400">
              {streakInfo.longest.win.count} wins
            </p>
            <p className="text-xs text-emerald-400/70">
              +{formatCurrency(streakInfo.longest.win.pnl)}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-xs text-muted-foreground mb-1">Worst Loss Streak</p>
            <p className="font-mono font-bold text-red-400">
              {streakInfo.longest.loss.count} losses
            </p>
            <p className="text-xs text-red-400/70">
              {formatCurrency(streakInfo.longest.loss.pnl)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
