import React, { useEffect, useState } from "react";
import LiquidityPositionCard from "./LiquidityPositionCard";
import { fetchEvmPositions, fetchSolPositions } from "../services/liquidityService";
import { LiquidityPosition } from "../types";
import { Loader2 } from "lucide-react";

interface DashboardProps {
  walletAddress: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!walletAddress) return;
      setLoading(true);
      try {
        const [evm, sol] = await Promise.all([
            fetchEvmPositions(walletAddress),
            fetchSolPositions(walletAddress)
        ]);
        if (mounted) {
            setPositions([...evm, ...sol]);
        }
      } catch (e) {
        console.error("Error loading dashboard", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Scanning blockchains for liquidity...</p>
      </div>
    );
  }

  if (positions.length === 0) {
     return (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <h3 className="text-xl font-medium text-white mb-2">No Active Positions</h3>
            <p className="text-gray-400 max-w-md mx-auto">
                We couldn't find any liquidity positions for this wallet on Ethereum or Solana. 
                Try entering a different wallet address or create a new position.
            </p>
        </div>
     )
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Positions <span className="text-fuchsia-500 text-lg align-top ml-1">{positions.length}</span></h2>
            <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">Ethereum</span>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">Solana</span>
            </div>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((p) => (
            <LiquidityPositionCard
                key={p.id}
                tokenA={p.tokenA}
                tokenB={p.tokenB}
                feeTier={p.feeTier}
                positionId={p.id}
                minTick={p.minTick}
                maxTick={p.maxTick}
                currentTick={p.currentTick}
                isSolana={p.isSolana}
                cardImageUrl={p.isSolana 
                    ? `https://picsum.photos/seed/${p.tokenA}/200` 
                    : `https://picsum.photos/seed/${p.tokenB}/200`
                }
            />
        ))}
        </div>
    </div>
  );
};
