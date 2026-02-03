# Deriverse Insight

A professional trading analytics dashboard for Deriverse traders on Solana. Track your performance, analyze trades, and maintain a trading journal.

## Features

### Dashboard
- **Key Metrics**: Total PnL, Win Rate, Trade Count, Volume, Fees, Profit Factor
- **Equity Curve**: Track your account growth over time
- **Drawdown Analysis**: Visualize max drawdown and current drawdown
- **Recent Trades**: Quick view of your latest trades

### Portfolio
- **Open Positions**: Monitor unrealized PnL, leverage, and liquidation prices
- **Asset Allocation**: Pie chart visualization of position distribution
- **Risk Metrics**: Sharpe ratio, max drawdown, profit factor analysis

### Trading Journal
- **Calendar Heatmap**: Visual overview of daily P&L
- **Journal Entries**: Record thoughts, emotions, and lessons
- **Tag System**: Organize entries with custom tags
- **Sentiment Tracking**: Track your market outlook over time

### Analytics
- **Win Rate Analysis**: Performance breakdown by symbol
- **Volume & Fee Tracking**: Historical volume and cumulative fees
- **Directional Analysis**: Long vs Short performance comparison
- **Time-Based Analysis**: Performance by hour, day of week, and trading session
- **Order Type Performance**: IOC vs Limit vs Market order analysis

### Trade History
- **Filterable Table**: Search and filter by date, symbol, side, market type
- **Sorting**: Sort by any column
- **Export**: CSV, JSON, and text report export

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State Management**: Zustand
- **Blockchain**: Solana (@solana/web3.js, wallet-adapter)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/deriverseinsight.git
cd deriverseinsight

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Available variables:
- `NEXT_PUBLIC_SOLANA_NETWORK`: Network to connect to (devnet, mainnet-beta, testnet)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: Custom RPC endpoint (optional)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── portfolio/         # Portfolio analysis
│   ├── journal/           # Trading journal
│   ├── analytics/         # Detailed analytics
│   ├── history/           # Trade history
│   ├── settings/          # App settings
│   └── help/              # Help documentation
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Recharts visualizations
│   ├── dashboard/         # Dashboard widgets
│   ├── journal/           # Journal components
│   ├── portfolio/         # Portfolio components
│   ├── analytics/         # Analytics charts
│   ├── history/           # History table & filters
│   └── layout/            # Sidebar, Header
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── mock-data.ts       # Mock data generator
│   ├── export.ts          # Export utilities
│   └── solana/            # Solana config
├── stores/                # Zustand stores
│   ├── app-store.ts       # App state
│   ├── trades-store.ts    # Trade data
│   ├── journal-store.ts   # Journal entries
│   └── wallet-store.ts    # Wallet connection
└── types/                 # TypeScript types
```

## Design Philosophy

- **Dark Terminal Style**: Professional, Bloomberg/TradingView-inspired aesthetics
- **Data-Dense**: Maximum information without overwhelming
- **Monospace Data**: JetBrains Mono for all numerical data
- **Color Coding**: Green (#22c55e) for profit, Red (#ef4444) for loss

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Current Status

This dashboard currently uses mock data for demonstration purposes. The wallet connection UI is implemented and ready for integration with the Deriverse SDK when available.

## License

ISC
