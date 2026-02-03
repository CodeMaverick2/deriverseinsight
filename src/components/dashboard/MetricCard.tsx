"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  valueClassName,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                valueClassName
              )}
            >
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isPositive && <TrendingUp className="h-4 w-4 text-profit" />}
                {isNegative && <TrendingDown className="h-4 w-4 text-loss" />}
                {isNeutral && <Minus className="h-4 w-4 text-muted-foreground" />}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive && "text-profit",
                    isNegative && "text-loss",
                    isNeutral && "text-muted-foreground"
                  )}
                >
                  {isPositive && "+"}
                  {change.toFixed(2)}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
      {/* Subtle gradient overlay based on positive/negative */}
      {change !== undefined && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none opacity-5",
            isPositive && "bg-gradient-to-br from-profit to-transparent",
            isNegative && "bg-gradient-to-br from-loss to-transparent"
          )}
        />
      )}
    </Card>
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
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-medium",
          isPositive === true && "text-profit",
          isPositive === false && "text-loss"
        )}
      >
        {value}
      </span>
    </div>
  );
}
