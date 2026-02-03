"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Position, Trade } from "@/types";

interface AllocationChartProps {
  positions: Position[];
  trades: Trade[];
  type?: "positions" | "volume";
}

const COLORS = [
  "#6366f1", // Primary indigo
  "#22c55e", // Green
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

export function AllocationChart({
  positions,
  trades,
  type = "positions",
}: AllocationChartProps) {
  const data = useMemo(() => {
    if (type === "positions") {
      // Group positions by symbol
      const symbolMap = new Map<string, number>();
      positions.forEach((pos) => {
        const value = pos.size * pos.currentPrice;
        symbolMap.set(pos.symbol, (symbolMap.get(pos.symbol) || 0) + value);
      });

      return Array.from(symbolMap.entries())
        .map(([symbol, value]) => ({
          name: symbol,
          value,
        }))
        .sort((a, b) => b.value - a.value);
    } else {
      // Group by trading volume
      const symbolMap = new Map<string, number>();
      trades.forEach((trade) => {
        const volume = trade.size * trade.entryPrice;
        symbolMap.set(trade.symbol, (symbolMap.get(trade.symbol) || 0) + volume);
      });

      return Array.from(symbolMap.entries())
        .map(([symbol, value]) => ({
          name: symbol,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }
  }, [positions, trades, type]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = (item.value / total) * 100;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="font-mono text-sm">
            Value: {formatCurrency(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}% of {type === "positions" ? "portfolio" : "volume"}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {type === "positions" ? "Position Allocation" : "Volume by Symbol"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(240 10% 6%)"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
