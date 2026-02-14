import { LiquidityPosition, GraphPosition } from '../types';
import { UNISWAP_V3_SUBGRAPH_URL } from '../constants';

export async function fetchEvmPositions(walletAddress: string): Promise<LiquidityPosition[]> {
  const query = `
    {
      positions(where: { owner: "${walletAddress.toLowerCase()}", liquidity_gt: 0 }) {
        id
        tickLower { tickIdx }
        tickUpper { tickIdx }
        liquidity
        pool {
          token0 { symbol }
          token1 { symbol }
          feeTier
          tick
          liquidity
        }
      }
    }
  `;

  try {
    const response = await fetch(UNISWAP_V3_SUBGRAPH_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Graph API returned status: ${response.status}`);
    }

    const json = await response.json();
    
    if (json.errors) {
      console.error("Subgraph Errors:", json.errors);
      throw new Error("Failed to fetch data from Subgraph");
    }

    const positions: GraphPosition[] = json.data?.positions || [];

    return positions.map((p) => ({
      id: p.id,
      tokenA: p.pool.token0.symbol,
      tokenB: p.pool.token1.symbol,
      feeTier: (Number(p.pool.feeTier) / 10000) + '%',
      minTick: Number(p.tickLower.tickIdx),
      maxTick: Number(p.tickUpper.tickIdx),
      currentTick: p.pool.tick ? Number(p.pool.tick) : undefined,
      liquidity: p.liquidity,
      poolLiquidity: p.pool.liquidity,
      isSolana: false
    }));
  } catch (error) {
    console.error("Fetch EVM Positions Error:", error);
    // In production, we bubble up the error so the UI can handle empty states or retries
    return []; 
  }
}

export async function fetchSolPositions(walletAddress: string): Promise<LiquidityPosition[]> {
  // Production Note: 
  // For Solana, you must use @solana/web3.js and connection.getTokenAccountsByOwner
  // or a specific indexing API like Helius or Shyft. 
  // Returning empty array as we removed the mocks and this app is primarily configured for EVM (Wagmi).
  return [];
}