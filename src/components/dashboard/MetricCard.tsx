"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  variant?: "default" | "profit" | "loss" | "highlight";
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  valueClassName,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        "card-hover border-gradient",
        variant === "profit" && "border-emerald-500/20 hover:border-emerald-500/30",
        variant === "loss" && "border-red-500/20 hover:border-red-500/30",
        variant === "highlight" && "border-primary/30 glow-sm",
        className
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          variant === "profit" && "bg-gradient-to-br from-emerald-500/5 to-transparent",
          variant === "loss" && "bg-gradient-to-br from-red-500/5 to-transparent",
          variant === "default" && "bg-gradient-to-br from-primary/5 to-transparent",
          variant === "highlight" && "bg-gradient-to-br from-primary/10 to-transparent"
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            {title}
          </p>
          <p
            className={cn(
              "text-3xl font-bold tracking-tight stat-number",
              valueClassName
            )}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  isPositive && "bg-emerald-500/10 text-emerald-400",
                  isNegative && "bg-red-500/10 text-red-400",
                  isNeutral && "bg-muted text-muted-foreground"
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {isNeutral && <Minus className="h-3 w-3" />}
                <span>
                  {isPositive && "+"}
                  {change.toFixed(2)}%
                </span>
              </div>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "rounded-xl p-3 transition-all duration-300",
              "bg-gradient-to-br from-primary/10 to-primary/5 text-primary",
              "group-hover:from-primary/20 group-hover:to-primary/10",
              "group-hover:scale-110"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Accent line at bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100",
          "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        )}
      />
    </div>
  );
}

// Quick stat variant for smaller displays
export function QuickStat({
  label,
  value,
  isPositive,
}: {
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-semibold tracking-tight",
          isPositive === true && "text-emerald-400",
          isPositive === false && "text-red-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}
