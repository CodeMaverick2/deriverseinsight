"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Shield, Target, Zap, Brain } from "lucide-react";

interface TradingScoreProps {
  analytics: {
    winRate: number;
    profitFactor: number;
    expectancy: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    longShortRatio: number;
    avgDuration: number;
  };
}

interface ScoreMetric {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function TradingScore({ analytics }: TradingScoreProps) {
  const metrics = useMemo((): ScoreMetric[] => {
    // Win Rate Score (0-25 points)
    // >60% = 25pts, 50-60% = 20pts, 40-50% = 15pts, <40% = 10pts
    let winRateScore = 0;
    if (analytics.winRate >= 60) winRateScore = 25;
    else if (analytics.winRate >= 50) winRateScore = 20;
    else if (analytics.winRate >= 40) winRateScore = 15;
    else if (analytics.winRate > 0) winRateScore = 10;

    // Profit Factor Score (0-25 points)
    // >2.0 = 25pts, 1.5-2.0 = 20pts, 1.0-1.5 = 15pts, <1.0 = 5pts
    let pfScore = 0;
    if (analytics.profitFactor >= 2.0) pfScore = 25;
    else if (analytics.profitFactor >= 1.5) pfScore = 20;
    else if (analytics.profitFactor >= 1.0) pfScore = 15;
    else if (analytics.profitFactor > 0) pfScore = 5;

    // Risk Management Score (0-20 points)
    // Based on avg win/loss ratio and expectancy
    const riskRatio = analytics.avgLoss > 0 ? analytics.avgWin / analytics.avgLoss : 0;
    let riskScore = 0;
    if (riskRatio >= 2.0) riskScore = 20;
    else if (riskRatio >= 1.5) riskScore = 15;
    else if (riskRatio >= 1.0) riskScore = 10;
    else if (riskRatio > 0) riskScore = 5;

    // Consistency Score (0-15 points)
    // Based on trade count and directional balance
    let consistencyScore = 0;
    if (analytics.totalTrades >= 50) consistencyScore += 10;
    else if (analytics.totalTrades >= 20) consistencyScore += 7;
    else if (analytics.totalTrades >= 10) consistencyScore += 5;

    // Balanced long/short ratio bonus (0.5-2.0 is ideal)
    if (analytics.longShortRatio >= 0.5 && analytics.longShortRatio <= 2.0) {
      consistencyScore += 5;
    } else if (analytics.longShortRatio > 0) {
      consistencyScore += 2;
    }

    // Discipline Score (0-15 points)
    // Based on expectancy being positive and reasonable trade duration
    let disciplineScore = 0;
    if (analytics.expectancy > 0) {
      disciplineScore += 10;
      // Bonus for strong expectancy
      if (analytics.expectancy > 50) disciplineScore += 5;
    }

    return [
      {
        name: "Win Rate",
        score: winRateScore,
        maxScore: 25,
        description: `${analytics.winRate.toFixed(1)}% winning trades`,
        icon: <Target className="h-4 w-4" />,
        color: "text-blue-400",
      },
      {
        name: "Profit Factor",
        score: pfScore,
        maxScore: 25,
        description: `${analytics.profitFactor === Infinity ? "∞" : analytics.profitFactor.toFixed(2)}x gain/loss ratio`,
        icon: <TrendingUp className="h-4 w-4" />,
        color: "text-emerald-400",
      },
      {
        name: "Risk Management",
        score: riskScore,
        maxScore: 20,
        description: `${riskRatio.toFixed(2)}:1 reward/risk`,
        icon: <Shield className="h-4 w-4" />,
        color: "text-amber-400",
      },
      {
        name: "Consistency",
        score: consistencyScore,
        maxScore: 15,
        description: `${analytics.totalTrades} trades executed`,
        icon: <Zap className="h-4 w-4" />,
        color: "text-purple-400",
      },
      {
        name: "Discipline",
        score: disciplineScore,
        maxScore: 15,
        description: `$${analytics.expectancy.toFixed(2)} expectancy`,
        icon: <Brain className="h-4 w-4" />,
        color: "text-pink-400",
      },
    ];
  }, [analytics]);

  const totalScore = metrics.reduce((sum, m) => sum + m.score, 0);
  const maxTotalScore = metrics.reduce((sum, m) => sum + m.maxScore, 0);
  const scorePercentage = (totalScore / maxTotalScore) * 100;

  const getGrade = (score: number): { grade: string; color: string; label: string } => {
    if (score >= 90) return { grade: "A+", color: "text-emerald-400", label: "Elite Trader" };
    if (score >= 80) return { grade: "A", color: "text-emerald-400", label: "Excellent" };
    if (score >= 70) return { grade: "B+", color: "text-blue-400", label: "Very Good" };
    if (score >= 60) return { grade: "B", color: "text-blue-400", label: "Good" };
    if (score >= 50) return { grade: "C+", color: "text-amber-400", label: "Average" };
    if (score >= 40) return { grade: "C", color: "text-amber-400", label: "Below Average" };
    if (score >= 30) return { grade: "D", color: "text-orange-400", label: "Needs Work" };
    return { grade: "F", color: "text-red-400", label: "Critical" };
  };

  const gradeInfo = getGrade(scorePercentage);

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <CardTitle className="text-base font-medium text-foreground/90">
              Trading Score
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={cn("text-3xl font-bold font-mono", gradeInfo.color)}>
                {gradeInfo.grade}
              </span>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">{gradeInfo.label}</p>
                <p className="text-sm font-mono font-semibold">
                  {totalScore}/{maxTotalScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress
            value={scorePercentage}
            className="h-3 bg-muted/50"
          />
          <p className="text-xs text-muted-foreground text-center">
            Overall Performance: {scorePercentage.toFixed(0)}%
          </p>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={metric.color}>{metric.icon}</span>
                  <span className="font-medium">{metric.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">
                  {metric.score}/{metric.maxScore}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={(metric.score / metric.maxScore) * 100}
                  className="h-1.5 flex-1 bg-muted/30"
                />
                <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                  {metric.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tips based on lowest scores */}
        <div className="pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Tip: </span>
            {scorePercentage < 50
              ? "Focus on risk management and maintaining a positive win rate."
              : scorePercentage < 70
              ? "Improve your profit factor by letting winners run longer."
              : scorePercentage < 85
              ? "Great progress! Work on consistency for elite performance."
              : "Excellent trading! Maintain discipline and avoid overtrading."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
