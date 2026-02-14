
import React, { useState } from 'react';
import { Settings, Info, Plus, ChevronDown, Check, Loader2, Wallet, Search, X, ArrowRight, AlertCircle } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { AguLogo } from './AguLogo';

const FEE_TIERS = [
  { value: '0.01', label: '0.01%', desc: 'Best for very stable pairs' },
  { value: '0.05', label: '0.05%', desc: 'Best for stable pairs' },
  { value: '0.3', label: '0.3%', desc: 'Best for most pairs' },
  { value: '1.0', label: '1.0%', desc: 'Best for exotic pairs' }
];

interface Token {
    symbol: string;
    name: string;
    icon?: React.ReactNode;
}

const MOCK_TOKENS: Token[] = [
    { symbol: 'ETH', name: 'Ether', icon: <img src="https://picsum.photos/seed/eth/24/24" className="w-full h-full rounded-full" alt="ETH"/> },
    { symbol: 'AGU', name: 'Agu Protocol', icon: <AguLogo className="w-full h-full" /> },
    { symbol: 'USDC', name: 'USD Coin', icon: <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">US</div> },
    { symbol: 'DAI', name: 'Dai Stablecoin', icon: <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-white">DA</div> },
    { symbol: 'WETH', name: 'Wrapped Ether', icon: <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white">WE</div> },
];

export const AddLiquidityWidget = () => {
  const { address, isConnected } = useAccount();
  
  const [feeTier, setFeeTier] = useState('0.3');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Token Selection
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState<'A' | 'B' | null>(null);
  const [tokenA, setTokenA] = useState<Token>(MOCK_TOKENS[0]); // ETH
  const [tokenB, setTokenB] = useState<Token>(MOCK_TOKENS[1]); // AGU

  const handleDeposit = () => {
    if (!isConnected || !amountA || !amountB || !minPrice || !maxPrice) return;
    setIsConfirming(true);
  };

  const confirmDeposit = () => {
    setIsConfirming(false);
    setIsPending(true);
    // Simulate transaction
    setTimeout(() => {
      setIsPending(false);
      setAmountA('');
      setAmountB('');
      setMinPrice('');
      setMaxPrice('');
    }, 2000);
  };

  const handleTokenSelect = (token: Token) => {
      if (tokenSelectorOpen === 'A') {
          if (token.symbol === tokenB.symbol) setTokenB(tokenA);
          setTokenA(token);
      } else {
          if (token.symbol === tokenA.symbol) setTokenA(tokenB);
          setTokenB(token);
      }
      setTokenSelectorOpen(null);
  }

  const isFormValid = isConnected && amountA && amountB && minPrice && maxPrice;

  return (
    <div className="w-full max-w-[480px]">
      <div className="bg-[#1e1235] p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-fuchsia-600 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-semibold">Add Liquidity</h3>
          <div className="flex gap-2">
             <span className="px-2 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 text-xs text-fuchsia-300 font-medium">
                V3 LP
             </span>
             <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <Settings size={20} />
             </button>
          </div>
        </div>

        {/* Pair Selection */}
        <div className="flex gap-2 mb-6 relative z-10">
            <button 
                onClick={() => setTokenSelectorOpen('A')}
                className="flex-1 flex items-center justify-between bg-[#0f0518] border border-white/10 hover:border-white/20 rounded-xl p-3 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                        {tokenA.icon}
                    </div>
                    <span className="font-semibold">{tokenA.symbol}</span>
                </div>
                <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center text-gray-500">
                <Plus size={20} />
            </div>
            <button 
                onClick={() => setTokenSelectorOpen('B')}
                className="flex-1 flex items-center justify-between bg-[#0f0518] border border-white/10 hover:border-white/20 rounded-xl p-3 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                        {tokenB.icon}
                    </div>
                    <span className="font-semibold">{tokenB.symbol}</span>
                </div>
                <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            </button>
        </div>

        {/* Fee Tier */}
        <div className="mb-6 relative z-10">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Fee Tier</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {FEE_TIERS.map((tier) => (
                    <button
                        key={tier.value}
                        onClick={() => setFeeTier(tier.value)}
                        className={`border rounded-xl p-2 text-center transition-all ${
                            feeTier === tier.value 
                            ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-[0_0_10px_rgba(192,38,211,0.2)]' 
                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="text-sm font-bold">{tier.label}</div>
                    </button>
                ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
                {FEE_TIERS.find(t => t.value === feeTier)?.desc}
            </div>
        </div>

        {/* Price Range */}
        <div className="mb-6 relative z-10">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Set Price Range</span>
            </div>
            <div className="flex gap-3">
                <div className="flex-1 bg-[#0f0518] rounded-xl p-3 border border-white/10 focus-within:border-fuchsia-500/50 transition-colors">
                    <div className="text-xs text-gray-500 text-center mb-1">Min Price</div>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-transparent text-center font-mono text-white outline-none"
                    />
                    <div className="text-xs text-gray-500 text-center mt-1">{tokenB.symbol} per {tokenA.symbol}</div>
                </div>
                <div className="flex-1 bg-[#0f0518] rounded-xl p-3 border border-white/10 focus-within:border-fuchsia-500/50 transition-colors">
                    <div className="text-xs text-gray-500 text-center mb-1">Max Price</div>
                    <input 
                        type="number" 
                        placeholder="∞" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-transparent text-center font-mono text-white outline-none"
                    />
                    <div className="text-xs text-gray-500 text-center mt-1">{tokenB.symbol} per {tokenA.symbol}</div>
                </div>
            </div>
        </div>

        {/* Deposit Amounts */}
        <div className="space-y-3 mb-6 relative z-10">
            <div className="bg-[#0f0518] rounded-xl p-3 border border-white/10 flex justify-between items-center group focus-within:border-fuchsia-500/30">
                <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full overflow-hidden">
                        {tokenA.icon}
                     </div>
                     <span className="text-sm font-medium text-gray-400">{tokenA.symbol}</span>
                </div>
                <input 
                    type="number" 
                    placeholder="0.0" 
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    className="bg-transparent text-right font-medium outline-none w-1/2 text-white" 
                />
            </div>
            <div className="bg-[#0f0518] rounded-xl p-3 border border-white/10 flex justify-between items-center group focus-within:border-fuchsia-500/30">
                <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full overflow-hidden">
                        {tokenB.icon}
                     </div>
                     <span className="text-sm font-medium text-gray-400">{tokenB.symbol}</span>
                </div>
                <input 
                    type="number" 
                    placeholder="0.0" 
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    className="bg-transparent text-right font-medium outline-none w-1/2 text-white" 
                />
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleDeposit}
            disabled={!isFormValid || isPending}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                !isConnected 
                ? "bg-white/10 text-gray-500" 
                : isPending
                    ? "bg-gray-600 cursor-wait"
                    : !isFormValid
                        ? "bg-white/5 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 shadow-fuchsia-500/20"
            }`}
        >
            {isPending && <Loader2 className="animate-spin" size={24} />}
            <span>
                {!isConnected 
                  ? "Connect Wallet"
                  : isPending
                    ? "Adding Liquidity..."
                    : !isFormValid
                        ? "Enter Amounts"
                        : "Add Liquidity"
                }
            </span>
        </button>

        {/* Token Selector Modal */}
        {tokenSelectorOpen && (
            <div 
                className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                onClick={() => setTokenSelectorOpen(null)}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1a0b2e] w-full max-w-sm h-[500px] flex flex-col rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
                >
                    <div className="p-5 border-b border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Select a token</h3>
                            <button onClick={() => setTokenSelectorOpen(null)} className="p-1 rounded-full hover:bg-white/10">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search name or paste address" 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-fuchsia-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {MOCK_TOKENS.map((token) => (
                            <button
                                key={token.symbol}
                                onClick={() => handleTokenSelect(token)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30">
                                        {token.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-white">{token.symbol}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-400">{token.name}</div>
                                    </div>
                                </div>
                                {(tokenA.symbol === token.symbol || tokenB.symbol === token.symbol) && (
                                    <Check size={16} className="text-fuchsia-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Modal */}
        {isConfirming && (
            <div 
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
                onClick={() => setIsConfirming(false)}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1a0b2e] w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in-95 duration-200"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Confirm Deposit</h3>
                        <button onClick={() => setIsConfirming(false)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        {/* Summary Card */}
                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">{tokenA.icon}</div>
                                    <span className="text-lg font-bold">{amountA} {tokenA.symbol}</span>
                                </div>
                                <Plus size={16} className="text-gray-600" />
                                <div className="flex items-center gap-3 text-right">
                                    <span className="text-lg font-bold">{amountB} {tokenB.symbol}</span>
                                    <div className="w-8 h-8 rounded-full overflow-hidden">{tokenB.icon}</div>
                                </div>
                            </div>
                            
                            <div className="h-px bg-white/5 my-3"></div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fee Tier</span>
                                    <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded">{feeTier}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Price Range</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{minPrice} - {maxPrice}</div>
                                        <div className="text-[10px] text-gray-600">{tokenB.symbol} per {tokenA.symbol}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-3 flex gap-3">
                            <AlertCircle className="text-fuchsia-400 shrink-0" size={18} />
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Adding liquidity will create a new V3 position. You will earn {feeTier}% of all trades on this pair proportional to your share of the pool.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsConfirming(false)}
                            className="flex-1 py-3 rounded-xl font-semibold text-gray-400 hover:bg-white/5 transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDeposit}
                            className="flex-2 flex-[2] py-3 rounded-xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 shadow-lg shadow-fuchsia-500/20 text-white"
                        >
                            Confirm Deposit
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
