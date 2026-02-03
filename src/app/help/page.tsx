"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  LayoutDashboard,
  PieChart,
  BookOpen,
  BarChart3,
  History,
  ExternalLink,
  Wallet,
} from "lucide-react";

export default function HelpPage() {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      description:
        "View your overall trading performance at a glance. See key metrics like Total PnL, Win Rate, Volume, and Fees. Track your equity curve and drawdown over time.",
    },
    {
      icon: PieChart,
      title: "Portfolio",
      description:
        "Monitor your open positions, analyze asset allocation, and track risk metrics. View your position sizes, unrealized PnL, and liquidation prices.",
    },
    {
      icon: BookOpen,
      title: "Journal",
      description:
        "Keep a trading journal to track your thoughts, emotions, and lessons learned. Use the calendar heatmap to visualize your trading activity and PnL by day.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description:
        "Deep dive into your trading performance with detailed analytics. Analyze win rates by symbol, volume trends, directional bias, time-based patterns, and order type performance.",
    },
    {
      icon: History,
      title: "History",
      description:
        "View and filter your complete trade history. Export your data as CSV, JSON, or generate a comprehensive report.",
    },
  ];

  const shortcuts = [
    { key: "1", action: "Go to Dashboard" },
    { key: "2", action: "Go to Portfolio" },
    { key: "3", action: "Go to Journal" },
    { key: "4", action: "Go to Analytics" },
    { key: "5", action: "Go to History" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground">
          Learn how to use Deriverse Insight effectively
        </p>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle>Getting Started</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Connect Your Wallet</h4>
            <p className="text-sm text-muted-foreground">
              Click the &quot;Connect Wallet&quot; button in the top-right corner to connect
              your Solana wallet. We support Phantom, Solflare, Torus, and Ledger.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Select Network</h4>
            <p className="text-sm text-muted-foreground">
              Choose between Devnet, Testnet, or Mainnet depending on your needs.
              For testing, we recommend starting with Devnet.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Explore Your Data</h4>
            <p className="text-sm text-muted-foreground">
              Once connected, your trading data will be fetched from the blockchain.
              Currently, the dashboard displays mock data for demonstration purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Features</CardTitle>
          </div>
          <CardDescription>
            Overview of all available features in the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {index < features.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Key Metrics Explained */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Explained</CardTitle>
          <CardDescription>
            Understanding the metrics displayed in your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <h4 className="font-medium">Win Rate</h4>
              <p className="text-sm text-muted-foreground">
                Percentage of trades that resulted in profit
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Profit Factor</h4>
              <p className="text-sm text-muted-foreground">
                Gross profit divided by gross loss. Above 1.0 is profitable.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Expectancy</h4>
              <p className="text-sm text-muted-foreground">
                Expected profit per trade based on historical performance
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Sharpe Ratio</h4>
              <p className="text-sm text-muted-foreground">
                Risk-adjusted return. Higher values indicate better
                risk-adjusted performance.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Max Drawdown</h4>
              <p className="text-sm text-muted-foreground">
                Largest peak-to-trough decline in account equity
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Long/Short Ratio</h4>
              <p className="text-sm text-muted-foreground">
                Ratio of long trades to short trades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="https://deriverse.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Deriverse Website</span>
            </a>
            <a
              href="https://docs.deriverse.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Deriverse Documentation</span>
            </a>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Solana Website</span>
            </a>
            <a
              href="https://explorer.solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Solana Explorer</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Deriverse Insight v1.0.0</p>
        <p>Built for the Deriverse Trading Analytics Bounty</p>
      </div>
    </div>
  );
}
