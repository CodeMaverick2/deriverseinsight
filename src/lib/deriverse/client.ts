import { Engine, PROGRAM_ID, GetClientDataResponse, LogType, SpotFillOrderReportModel, PerpFillOrderReportModel } from "@deriverse/kit";
import { createSolanaRpc, address, Address } from "@solana/kit";
import { Connection, PublicKey } from "@solana/web3.js";
import { Trade, Position, FeeType } from "@/types";

// Mainnet RPC endpoint
const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

// Create RPC connection
const rpc = createSolanaRpc(MAINNET_RPC);

// Deriverse Engine instance
let engine: Engine | null = null;

/**
 * Initialize the Deriverse Engine
 */
export async function initializeEngine(): Promise<Engine> {
  if (engine) return engine;

  engine = new Engine(rpc as any, {
    programId: PROGRAM_ID,
    commitment: "confirmed",
    uiNumbers: true,
  });

  await engine.initialize();
  return engine;
}

/**
 * Get the initialized engine instance
 */
export function getEngine(): Engine | null {
  return engine;
}

/**
 * Set the signer (connected wallet) on the engine
 */
export async function setEngineSigner(walletAddress: string): Promise<void> {
  const eng = await initializeEngine();
  await eng.setSigner(address(walletAddress));
}

/**
 * Fetch client data from Deriverse
 */
export async function fetchClientData(walletAddress: string): Promise<GetClientDataResponse | null> {
  try {
    const eng = await initializeEngine();
    await eng.setSigner(address(walletAddress));
    const clientData = await eng.getClientData();
    return clientData;
  } catch (error) {
    console.error("Error fetching client data:", error);
    return null;
  }
}

/**
 * Get positions from client data
 */
export async function fetchPositions(walletAddress: string): Promise<Position[]> {
  try {
    const eng = await initializeEngine();
    await eng.setSigner(address(walletAddress));
    const clientData = await eng.getClientData();

    const positions: Position[] = [];

    // Process perp positions
    for (const [instrId, perpData] of clientData.perp) {
      try {
        const orderInfo = await eng.getClientPerpOrdersInfo({
          instrId,
          clientId: perpData.clientId,
        });

        // Only add if there's an actual position
        if (orderInfo.perps !== 0) {
          const instrument = eng.instruments.get(instrId);
          const symbol = instrument ? `${instrument.header.assetTokenId}-PERP` : `INSTR-${instrId}`;

          positions.push({
            id: `perp-${instrId}-${perpData.clientId}`,
            symbol,
            market: "PERP",
            side: orderInfo.perps > 0 ? "LONG" : "SHORT",
            size: Math.abs(orderInfo.perps),
            entryPrice: orderInfo.cost !== 0 ? Math.abs(orderInfo.cost / orderInfo.perps) : 0,
            currentPrice: 0, // Would need price feed
            unrealizedPnl: orderInfo.result,
            leverage: 1, // Default, would need to track
            margin: orderInfo.funds,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.error(`Error fetching perp orders for instrument ${instrId}:`, e);
      }
    }

    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return [];
  }
}

/**
 * Fetch trade history from transaction logs
 */
export async function fetchTradeHistory(walletAddress: string): Promise<Trade[]> {
  try {
    const connection = new Connection(MAINNET_RPC, "confirmed");
    const pubkey = new PublicKey(walletAddress);
    const eng = await initializeEngine();

    // Fetch recent transactions
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 100,
    });

    const trades: Trade[] = [];

    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta?.logMessages) continue;

        // Check if this is a Deriverse transaction
        const isDeriveseTx = tx.transaction.message.staticAccountKeys.some(
          (key) => key.toBase58() === PROGRAM_ID
        );

        if (!isDeriveseTx) continue;

        // Parse logs
        const logs = eng.logsDecode(tx.meta.logMessages);

        for (const log of logs) {
          // Check if this is a fill order log by checking the tag
          const isSpotFill = (log as SpotFillOrderReportModel).tag === LogType.spotFillOrder;
          const isPerpFill = (log as PerpFillOrderReportModel).tag === LogType.perpFillOrder;

          if (isSpotFill || isPerpFill) {
            const data = log as SpotFillOrderReportModel | PerpFillOrderReportModel;
            // Note: instrId would need to come from context, for now use 0
            const instrument = eng.instruments.get(0);
            const symbol = instrument
              ? isPerpFill
                ? `${instrument.header.assetTokenId}-PERP`
                : `${instrument.header.assetTokenId}/USDC`
              : "UNKNOWN";

            const size = isPerpFill
              ? (data as PerpFillOrderReportModel).perps
              : (data as SpotFillOrderReportModel).qty;

            // Determine fee type based on rebates
            // If rebates > 0, it's a maker order (limit), otherwise taker (IOC/market)
            const rebateAmount = data.rebates || 0;
            const isMaker = rebateAmount > 0;
            const feeType: FeeType = isMaker ? "MAKER" : "TAKER";

            // Calculate actual fee paid (taker pays fee, maker gets rebate)
            // Deriverse: ~5 bps taker fee, ~0.625 bps maker rebate
            const tradeValue = (size || 0) * (data.price || 0);
            const fee = isMaker ? 0 : tradeValue * 0.0005; // 5 bps taker fee estimate
            const rebate = isMaker ? rebateAmount : 0;

            trades.push({
              id: `${sig.signature}-${data.tag}-${data.orderId}`,
              timestamp: (tx.blockTime || 0) * 1000,
              market: isPerpFill ? "PERP" : "SPOT",
              symbol,
              side: isPerpFill
                ? (data.side === 0 ? "LONG" : "SHORT")
                : (data.side === 0 ? "BUY" : "SELL"),
              orderType: isMaker ? "LIMIT" : "IOC",
              size: Math.abs(size || 0),
              entryPrice: data.price || 0,
              fee,
              feeType,
              rebate,
              // PnL is calculated from position result data when available
              // For individual fills, we track entry price and calculate later
              pnl: undefined,
              status: "CLOSED",
            });
          }
        }
      } catch (e) {
        // Skip failed transaction parsing
        continue;
      }
    }

    return trades.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching trade history:", error);
    return [];
  }
}

/**
 * Get instrument info
 */
export function getInstruments() {
  if (!engine) return [];
  return Array.from(engine.instruments.values());
}

/**
 * Get token info
 */
export function getTokens() {
  if (!engine) return [];
  return Array.from(engine.tokens.values());
}
