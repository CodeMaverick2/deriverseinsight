"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { EquityPoint } from "@/types";

interface EquityCurveProps {
  data: EquityPoint[];
  title?: string;
  initialEquity?: number;
}

export function EquityCurve({
  data,
  title = "Equity Curve",
  initialEquity = 10000,
}: EquityCurveProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.timestamp), "MMM dd"),
    }));
  }, [data]);

  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : initialEquity;
  const isPositive = currentEquity >= initialEquity;
  const percentChange = ((currentEquity - initialEquity) / initialEquity) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="text-right">
            <p className="font-mono text-lg font-bold">
              {formatCurrency(currentEquity)}
            </p>
            <p
              className={`text-sm font-medium ${
                isPositive ? "text-profit" : "text-loss"
              }`}
            >
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240 10% 14%)"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
                dx={-10}
                domain={["dataMin - 500", "dataMax + 500"]}
              />
              <ReferenceLine
                y={initialEquity}
                stroke="hsl(215 20% 65%)"
                strokeDasharray="3 3"
                label={{
                  value: "Initial",
                  fill: "hsl(215 20% 65%)",
                  fontSize: 10,
                  position: "right",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const changeFromInitial =
                      ((data.equity - initialEquity) / initialEquity) * 100;
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(data.timestamp), "MMM dd, yyyy")}
                        </p>
                        <p className="font-mono font-medium">
                          Equity:{" "}
                          <span className="text-foreground">
                            {formatCurrency(data.equity)}
                          </span>
                        </p>
                        <p className="font-mono text-sm">
                          Change:{" "}
                          <span
                            className={
                              changeFromInitial >= 0 ? "text-profit" : "text-loss"
                            }
                          >
                            {changeFromInitial >= 0 ? "+" : ""}
                            {changeFromInitial.toFixed(2)}%
                          </span>
                        </p>
                        {data.drawdownPercent > 0 && (
                          <p className="font-mono text-sm">
                            Drawdown:{" "}
                            <span className="text-loss">
                              -{data.drawdownPercent.toFixed(2)}%
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
