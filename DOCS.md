# Deriverse Protocol Documentation

> **Reference document for building the Trading Analytics Dashboard**

---

## Table of Contents

1. [Protocol Overview](#protocol-overview)
2. [Architecture](#architecture)
3. [Market Types](#market-types)
   - [Spot Trading](#spot-trading)
   - [Perpetual Futures](#perpetual-futures)
   - [Options (v2)](#options-v2)
4. [Fee Structure](#fee-structure)
5. [Governance & DRVS Token](#governance--drvs-token)
6. [Launchpad](#launchpad)
7. [Referral Program](#referral-program)
8. [Technical Reference](#technical-reference)
9. [SDK Information](#sdk-information)

---

## Protocol Overview

**Deriverse** is the first fully on-chain derivatives trading protocol on Solana that unifies Spot, Perpetual Futures, and Options into a single, composable execution layer.

### Core Philosophy
- **Tagline**: "Trade Anything. Trust Nothing."
- Built with native Rust leveraging Solana's parallel architecture
- Fully decentralized - no off-chain components or hybrid solutions
- Zero administrative role post-deployment

### Key Features
- Fully on-chain trading across all market types
- Gas-optimized design with native Solana interfaces
- Unified account architecture across all instruments
- Non-blocking parallel processing for concurrent access
- Token-2022 integration for future-proofing

### Current Status
- **Version 1** operates on **Solana Devnet**
- Mainnet features (DRVS token, referrals, launchpad) in development

### Resources
- **TypeScript SDK**: `@deriverse/kit` (npm)
- **Discord**: https://discord.gg/gSGV5wr8
- **Twitter/X**: @deriverse_io

---

## Architecture

### Design Principles

#### Performance Optimization
- Native Solana interfaces (no framework overhead like Anchor)
- Hand-optimized layouts for reduced compute unit consumption
- Versioned transactions & address lookup tables for reduced payload sizes

#### Decentralization Model
- Operates autonomously post-deployment
- Administrative account used only during bootstrap
- No upgrade capability, fund-freezing, or external modification pathways

#### Concurrency Architecture
- Non-blocking parallel processing
- Simultaneous access to multiple instruments
- Complex cross-market strategies and batch order placement

### Account Structure

#### Unified Client Accounts
- Single account across all instruments (Spot, Perpetuals, Options)
- Reduces rent costs and simplifies wallet management
- No separate token accounts required per market

#### Dynamic Expansion
- Uses Solana's `realloc` capability
- Accounts start small with minimal rent-exempt space
- Expand on-demand - users pay only for required storage

### Data Architecture

#### Optimized Data Emission
- Smart contracts output data in frontend-native formats
- Direct schema correspondence, no transformation layers
- Real-time market state updates

#### Comprehensive On-Chain Ledgers
- Margin movements
- Funding payments
- Trade executions
- Settlement events
- Price records
- Volume aggregation
- Candlestick data (OHLCV)

#### Event Logging
- Structured on-chain event emission
- Real-time client consumption without external indexing
- Direct SDK integration for TypeScript and Rust

---

## Market Types

### Spot Trading

#### Trading Model
**Hybrid AMM-Orderbook Model** that merges automated market maker liquidity with traditional orderbook matching.

#### Execution Flow
1. Access AMM liquidity up to the first orderbook quote
2. Match existing limit orders
3. Continue through AMM liquidity to trader's price limit

#### Order Types

**Immediate-or-Cancel (IOC)**
- Execute immediately against available liquidity
- Automatic cancellation of unfilled quantities
- Direct wallet trading without account deposits
- No persistent orderbook presence

**Limit Orders**
- Require depositing funds to Deriverse account
- Remain active until filled or manually cancelled
- Eligible for maker rebates

#### Direct Wallet Trading
1. Real-time balance verification
2. IOC order submission to hybrid engine
3. Execution against combined AMM and orderbook liquidity
4. Direct token settlement
5. Immediate return of unfilled portions

#### Pricing
Uses constant product formula:
```
k = token_a_reserves × token_b_reserves
```

#### Liquidity Architecture

**AMM Component:**
- Continuous pricing based on pool reserves
- Constant available liquidity
- Predictable slippage impact
- Arbitrage-driven market alignment

**Orderbook Component:**
- Precise price levels from limit orders
- Professional market maker participation
- Reduced bid-ask spreads
- Concentrated liquidity at key price points

---

### Perpetual Futures

#### Core Mechanics
- Leveraged trading without expiration dates
- USDC collateral deposits
- Up to **10x leverage**
- Isolated margin per position

#### Leverage System

**Example:**
- $1,000 deposit with 5x leverage = $5,000 exposure
- Required funding ratio: 20% (1/5x)
- 10% price increase → $500 profit (50% ROI on collateral)

#### Funding Rate Mechanics

**Purpose:** Maintain price alignment between perpetuals and spot markets

**Funding Rate Index (FRI) Calculation:**
```
FRI = FRI + ((current_time - last_update) / 86400) × (P_perp - P_asset)
```
Where:
- `P_perp` = Perpetual price
- `P_asset` = Spot oracle price

**Funding Payment Calculation:**
```
Funding Payment = -Q_perp × (FRI - LFR)
```
Where:
- `Q_perp` = Position quantity
- `LFR` = Last Funding Rate

**Update Triggers:**
- Any active operation on perpetual instruments
- Active trader updated first
- Then 25 queued clients or those exceeding 300 seconds since last update

#### Margin Management

**Account Evaluation Formula:**
```
evaluation = (perps + in_orders_perps) × price + funds + in_orders_funds
```

**New Order Requirement:**
```
evaluation × leverage ≥ -min(perps × price, funds)
```

**Key Metrics:**
- `perps`: Current position size
- `in_orders_perps`: Futures locked in sell orders
- `funds`: Available USDC balance
- `in_orders_funds`: USDC locked in buy orders

#### Liquidation Framework

**Critical Price Thresholds:**

For **Long Positions** (total_perps > 0):
```
critical_price = -total_funds / total_perps
```

For **Short Positions** (total_funds > 0):
```
critical_price = -total_funds / total_perps
```

**Liquidation Triggers:**
- Long positions: 33/32 of critical price
- Short positions: 31/32 of critical price

**Liquidation Penalty:** 1% additional commission
- Penalties flow to protocol insurance fund

#### Risk Management
- Isolated margin prevents cross-collateralization
- Insurance fund covers liquidation shortfalls
- If fund depleted: losses shared proportionally among traders with opposite positions

---

### Options (v2)

*Coming in Version 2*

#### Planned Features
- Fixed maturity futures with dynamic trading ranges
- Multiple expiry dates
- Volatility-based pricing
- Institutional-grade strategies

---

## Fee Structure

### Base Fees
- All fees are **governance-controlled** parameters
- Adjustable by DRVS token holders
- Example base rate: **5 basis points (0.05%)**

### Maker Rebates

**Formula:**
```
rebates_rate = rebates_ratio × base_fee_rate
```

**Parameters:**
- `rebates_ratio`: 0.125 (hardcoded at launch)
- Example: 5 bps base fee → 0.625 bps maker rebate

**Characteristics:**
- Applied immediately to filled orders
- Scales with trading volume

### Fee Discount Program

**Prepayment System:**
- Maximum prepayment: $50,000 USDC
- Lock-up period: 3 months

**Discount Calculation:**
- Partial prepayment: `50% × (prepayment ÷ max_prepayment)`
- Full prepayment ($50k+): Maximum **50% discount** on taker fees

### Revenue Distribution

1. **Maker rebates** paid first to liquidity providers
2. **Remaining fees** distributed pro-rata to DRVS stakers in USDC
3. **Liquidation penalties** allocated to insurance fund

### Fee Summary Table

| Fee Type | Rate | Notes |
|----------|------|-------|
| Taker Fee | ~5 bps (0.05%) | Governance adjustable |
| Maker Rebate | ~0.625 bps | 12.5% of taker fee |
| Max Discount | 50% | Requires $50k prepayment |
| Liquidation Penalty | 1% | Goes to insurance fund |

---

## Governance & DRVS Token

### Token Overview
- **Utility Token**: DRVS
- **Network**: Solana (currently Devnet only)
- **Purpose**: Protocol governance and revenue sharing

### Token Utility

1. **Governance Rights**: Vote on protocol parameter modifications
2. **Revenue Participation**: Receive platform fee distributions in USDC
3. **Eligibility**: Only DRVS held in Deriverse accounts counts toward voting power

**Note:** Tokens locked in open orders are excluded from voting power

### Voting System

**Sequential Governance:**
- Topics processed one at a time
- Focused deliberation on each issue

**Voting Options (per topic):**
1. **Increase**: Parameter moves toward maximum
2. **Decrease**: Parameter moves toward minimum
3. **Unchanged**: Status quo maintained

**Voting Weight:**
- Equals DRVS balance when topic initiates
- One vote per account regardless of holdings size

### Governable Parameters

| Parameter | Description |
|-----------|-------------|
| Base Fee Rates | Across spot, perpetual, and future trading venues |
| Pool Ratio Targets | Liquidity management |
| Margin Call Penalties | Risk management |
| Prepayment Thresholds | Fee optimization |

All parameters operate within predefined min/max bounds with fixed increment sizes.

### Revenue Sharing

- DRVS stakers earn **pro-rata share of platform revenues**
- Distributed automatically in USDC
- No minimum staking duration
- No manual claim process required

**Revenue Sources:**
- Trading fees
- Liquidation penalties
- Future product lines

---

## Launchpad

### Overview
Permissionless instrument listing system for creating new trading markets.

### Listing Requirements

| Parameter | Description |
|-----------|-------------|
| Asset Token | The primary token for trading |
| Base Currency | Currently USDC only |
| Initial Price | Starting price reference point |

### Listing Process

1. **Choose Asset** → Select desired asset token
2. **Set Initial Price** → Determine appropriate listing price
3. **Submit Transaction** → Submit listing with parameters
4. **Start Trading** → Spot market immediately available

### Costs
- **No Listing Fee**: Only standard network costs
- Standard Solana transaction fees
- Minimal rent for market account creation

### Automatic Market Progression

Instruments advance through stages based on performance metrics:

| Stage | Market Type | Trigger |
|-------|-------------|---------|
| Stage 1 | Spot Market | Immediate on listing |
| Stage 2 | Perpetual Futures | Volume/liquidity thresholds met |
| Stage 3 | Traditional Derivatives | Coming in v2 |

### Limitations
- **Mainnet Only**: Unavailable on Devnet
- **Governance Pending**: DRVS governance features unavailable

---

## Referral Program

### Structure
- **Single-Tier**: Direct referrals only
- **Currency**: USDC rewards
- **Settlement**: Instant on-chain
- **Minimums**: Zero - earn from first trade

### How It Works

1. Generate referral link
2. Share with potential users
3. Referee trades
4. Earn rewards automatically

### Referrer Benefits

**Formula:**
```
Referrer Reward = Net Trading Fees × Rewards Ratio
```
Where:
```
Net Fees = Total Fees - Protocol Rebates
```

**Features:**
- No earning caps
- Unlimited referral numbers
- Compounding income potential

### Referee Benefits
- **Up to 10% discount** on taker fees
- Applied immediately
- No volume minimums

**Example:**
- $10,000 trade at 5 bps standard fee = $5.00
- With 10% discount = $4.50

### Analytics Dashboard
Track:
- Total referrals
- Active referees
- Cumulative rewards
- Recent distributions
- User acquisition costs
- Retention rates
- Program ROI

---

## Technical Reference

### SDK Overview

**Package:** `@deriverse/kit`
**Platform:** npm
**Built on:** `@solana/kit`

### Core Modules

#### Spot Trading Module
- Order placement and cancellation
- Liquidity position management
- Order book querying
- Market data retrieval
- Deposit/withdrawal functionality

#### Perpetual Futures Module
- Leveraged trading functionality
- Position management and adjustments
- Order operations (place/cancel)
- Leverage modification on existing positions

#### Account Operations
- Trading account creation and administration
- Token movement (deposits/withdrawals)
- Associated token account handling
- Balance and position queries

#### Market Information
- Order book access
- Market depth data
- Price step information
- Historical trade data retrieval

### Market Maker Tools

**Specialized Instructions:**
- Atomic bid-ask replacement within single transactions
- Reduced compute costs
- Tighter spreads through simultaneous quote updates

---

## SDK Information

### Installation
```bash
npm install @deriverse/kit
```

### Dependencies
- `@solana/kit` (Solana JavaScript SDK)
- Solana wallet adapter

### Connection
```typescript
// Connect to Devnet (currently supported)
const connection = createSolanaRpc('https://api.devnet.solana.com');
```

### Key Operations

#### Account Management
```typescript
// Create trading account
// Deposit funds
// Withdraw funds
// Query balances
```

#### Spot Trading
```typescript
// Place IOC order (direct wallet)
// Place limit order (requires deposit)
// Cancel order
// Query order book
```

#### Perpetual Trading
```typescript
// Open position (long/short)
// Adjust leverage
// Close position
// Query funding rate
```

---

## Data Structures for Analytics Dashboard

### Trade Record
```typescript
interface Trade {
  id: string;
  timestamp: number;
  market: 'SPOT' | 'PERP' | 'OPTIONS';
  symbol: string;
  side: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  orderType: 'IOC' | 'LIMIT' | 'MARKET';
  size: number;
  price: number;
  fee: number;
  pnl?: number;
  duration?: number; // For closed positions
}
```

### Position
```typescript
interface Position {
  id: string;
  market: 'SPOT' | 'PERP';
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage?: number;
  margin?: number;
  unrealizedPnl: number;
  fundingAccrued?: number;
  openTimestamp: number;
}
```

### Portfolio Summary
```typescript
interface Portfolio {
  totalValue: number;
  totalPnl: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalFees: number;
  positions: Position[];
  tradeHistory: Trade[];
}
```

### Analytics Metrics
```typescript
interface Analytics {
  // Performance
  totalPnl: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;

  // Volume
  totalVolume: number;
  totalTrades: number;
  averageTradeSize: number;

  // Fees
  totalFees: number;
  makerFees: number;
  takerFees: number;

  // Directional
  longShortRatio: number;
  longCount: number;
  shortCount: number;

  // Time-based
  averageTradeDuration: number;
  bestTradingHour: number;
  bestTradingDay: string;
}
```

---

## Bounty Requirements Mapping

### Required Features

| Feature | Data Source | Priority |
|---------|-------------|----------|
| Total PnL tracking | Trade history, positions | HIGH |
| Visual performance indicators | Calculated metrics | HIGH |
| Trading volume analysis | Trade history | HIGH |
| Fee analysis | Trade records | HIGH |
| Win rate statistics | Trade history | HIGH |
| Trade count metrics | Trade history | HIGH |
| Average trade duration | Position timestamps | MEDIUM |
| Long/Short ratio | Trade history | MEDIUM |
| Largest gain/loss | Trade history | HIGH |
| Average win/loss | Trade history | HIGH |
| Symbol filtering | All data | HIGH |
| Date range selection | All data | HIGH |
| Historical PnL charts | Aggregated data | HIGH |
| Drawdown visualization | PnL history | MEDIUM |
| Time-based metrics | Trade timestamps | MEDIUM |
| Trade history table | Trade records | HIGH |
| Annotation capabilities | Journal entries | MEDIUM |
| Fee breakdown | Fee records | HIGH |
| Cumulative fee tracking | Fee history | MEDIUM |
| Order type analysis | Trade records | MEDIUM |

---

## External Links

- **Documentation**: https://deriverse.gitbook.io/deriverse-v1
- **Discord**: https://discord.gg/gSGV5wr8
- **Twitter/X**: https://x.com/@deriverse_io
- **NPM Package**: https://npmjs.com/@deriverse/kit
