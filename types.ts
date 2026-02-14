export interface Token {
  symbol: string;
  name?: string;
  decimals?: number;
}

export interface Pool {
  token0: Token;
  token1: Token;
  feeTier: string;
}

export interface LiquidityPosition {
  id: string;
  tokenA: string;
  tokenB: string;
  feeTier: string;
  minTick: number;
  maxTick: number;
  currentTick?: number;
  liquidity?: string;
  poolLiquidity?: string;
  isSolana?: boolean;
}

// Graph Response Types
export interface GraphPosition {
  id: string;
  liquidity: string;
  tickLower: { tickIdx: string };
  tickUpper: { tickIdx: string };
  pool: {
    token0: { symbol: string };
    token1: { symbol: string };
    feeTier: string;
    tick?: string;
    liquidity: string;
  };
}