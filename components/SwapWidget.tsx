import React, { useState, useRef, useEffect } from "react";
import { ArrowDownUp, Settings, Wallet, Info, ChevronDown, Check, Loader2, X, AlertTriangle, Search } from "lucide-react";
import { useAccount, useBalance, useSendTransaction, type BaseError } from 'wagmi';
import { parseEther } from 'viem';
import { AguLogo } from "./AguLogo";

type NetworkId = "ethereum" | "base" | "polygon" | "solana";

interface NetworkConfig {
  id: NetworkId;
  name: string;
  symbol: string;
  colorClass: string;
  gradientClass: string;
  shadowClass: string;
  iconUrl: string;
  chainId?: number;
}

interface Token {
    symbol: string;
    name: string;
    icon?: React.ReactNode;
    balance?: string;
}

const NETWORKS: NetworkConfig[] = [
    { 
        id: "ethereum", 
        name: "Ethereum", 
        symbol: "ETH",
        colorClass: "bg-indigo-600",
        gradientClass: "from-indigo-600 to-blue-600",
        shadowClass: "shadow-indigo-500/25",
        iconUrl: "https://picsum.photos/seed/eth/24/24",
        chainId: 1
    },
    { 
        id: "base", 
        name: "Base", 
        symbol: "ETH",
        colorClass: "bg-blue-600", 
        gradientClass: "from-blue-600 to-cyan-500",
        shadowClass: "shadow-blue-500/25",
        iconUrl: "https://picsum.photos/seed/base/24/24",
        chainId: 8453
    },
    { 
        id: "polygon", 
        name: "Polygon", 
        symbol: "MATIC",
        colorClass: "bg-purple-600", 
        gradientClass: "from-purple-600 to-fuchsia-600",
        shadowClass: "shadow-purple-500/25",
        iconUrl: "https://picsum.photos/seed/poly/24/24",
        chainId: 137
    }
];

const MOCK_TOKENS: Token[] = [
    { symbol: 'ETH', name: 'Ether', icon: <img src="https://picsum.photos/seed/eth/24/24" className="w-full h-full rounded-full" alt="ETH"/> },
    { symbol: 'AGU', name: 'Agu Protocol', icon: <AguLogo className="w-full h-full" /> },
    { symbol: 'USDC', name: 'USD Coin', icon: <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">US</div> },
    { symbol: 'DAI', name: 'Dai Stablecoin', icon: <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold">DA</div> },
    { symbol: 'WETH', name: 'Wrapped Ether', icon: <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold">WE</div> },
];

export const SwapWidget = () => {
  const { address, isConnected, chain } = useAccount();
  const [activeNetwork, setActiveNetwork] = useState<NetworkConfig>(NETWORKS[1]); // Default to Base

  // Fetch real native balance for the selected network
  const { data: balanceData } = useBalance({ 
    address, 
    chainId: activeNetwork.chainId 
  });
  
  const { sendTransaction, isPending: isTxPending, error: txError } = useSendTransaction();

  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Token Selector State
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState<'from' | 'to' | null>(null);
  const [fromToken, setFromToken] = useState<Token>(MOCK_TOKENS[0]); // ETH default
  const [toToken, setToToken] = useState<Token>(MOCK_TOKENS[1]);   // AGU default

  const [slippage, setSlippage] = useState("0.5");
  
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  
  const userBalance = balanceData ? parseFloat(balanceData.formatted) : 0.00;
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-select network based on wallet if connected
    if (chain) {
        const found = NETWORKS.find(n => n.chainId === chain.id);
        if (found) setActiveNetwork(found);
    }
  }, [chain]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNetworkOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwap = async () => {
    if (!fromAmount || inputError || !isConnected) return;
    
    // Real Transaction Logic
    try {
        sendTransaction({ 
            to: '0x0000000000000000000000000000000000000000', // Burn address for demo / replace with Router
            value: parseEther(fromAmount) 
        });
    } catch (e) {
        console.error("Swap failed", e);
    }
  };

  const handleNetworkSelect = (network: NetworkConfig) => {
    setActiveNetwork(network);
    setIsNetworkOpen(false);
    setFromAmount("");
    setToAmount("");
    setInputError(null);
    // Update From token symbol if it was the native token
    if (fromToken.symbol === 'ETH' || fromToken.symbol === 'MATIC') {
        setFromToken({...fromToken, symbol: network.symbol, icon: <img src={network.iconUrl} className="w-full h-full rounded-full" alt="native" />});
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    
    if (!value) {
        setInputError(null);
        setToAmount("");
        return;
    }

    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
        if (value === "0" || value === "0.") {
             setInputError(null); 
        } else {
             setInputError("Enter positive amount");
        }
        setToAmount("");
        return;
    }

    if (numValue > userBalance) {
        setInputError("Insufficient balance");
    } else {
        setInputError(null);
    }

    // Dummy calculation until we hook up a Quoter contract
    // 1 ETH ~ 50000 AGU
    const rate = fromToken.symbol === 'AGU' ? 0.00002 : 50000;
    setToAmount((numValue * rate).toFixed(4));
  };

  const handleMax = () => {
    if (balanceData) {
        // Leave a little gas (0.001)
        const val = parseFloat(balanceData.formatted);
        const max = Math.max(0, val - 0.001); 
        handleFromAmountChange(max.toFixed(4));
    }
  };

  const handleTokenSelect = (token: Token) => {
      if (tokenSelectorOpen === 'from') {
          if (token.symbol === toToken.symbol) {
              setToToken(fromToken); // Swap
          }
          setFromToken(token);
      } else if (tokenSelectorOpen === 'to') {
          if (token.symbol === fromToken.symbol) {
              setFromToken(toToken); // Swap
          }
          setToToken(token);
      }
      setTokenSelectorOpen(null);
      setFromAmount("");
      setToAmount("");
  };

  const switchTokens = () => {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
      setFromAmount("");
      setToAmount("");
  };

  const isButtonDisabled = !isConnected || !fromAmount || parseFloat(fromAmount) <= 0 || !!inputError || isTxPending;

  const getButtonText = () => {
      if (!isConnected) return "Connect Wallet to Swap";
      if (isTxPending) return "Swapping...";
      if (inputError) return inputError;
      if (!fromAmount || parseFloat(fromAmount) <= 0) return "Enter an amount";
      return `Swap ${fromToken.symbol} to ${toToken.symbol}`;
  };

  const slippageValue = parseFloat(slippage);
  const isHighSlippage = !isNaN(slippageValue) && slippageValue > 1.0;
  const isLowSlippage = !isNaN(slippageValue) && slippageValue > 0 && slippageValue < 0.1;

  return (
    <div className="w-full max-w-[480px]">
        {/* Network Switcher Header */}
        <div className="flex justify-end mb-4 relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/10 backdrop-blur-md ${isNetworkOpen ? 'bg-white/10 text-white' : 'bg-black/20 text-gray-300 hover:text-white hover:bg-white/5'}`}
            >
                <div className={`w-2 h-2 rounded-full ${activeNetwork.colorClass} shadow-[0_0_8px_currentColor]`}></div>
                <span>{activeNetwork.name} Network</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isNetworkOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNetworkOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-2xl p-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Network</div>
                    {NETWORKS.map((net) => (
                        <button
                            key={net.id}
                            onClick={() => handleNetworkSelect(net)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeNetwork.id === net.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${net.colorClass}`}></div>
                                {net.name}
                            </div>
                            {activeNetwork.id === net.id && <Check size={14} className="text-fuchsia-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>

      <div className="bg-[#1e1235] p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${activeNetwork.gradientClass} pointer-events-none transition-all duration-500`}></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-semibold">Swap</h3>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Input 1 (From) */}
        <div className={`bg-[#0f0518] rounded-2xl p-4 border mb-2 group transition-colors ${inputError ? 'border-red-500/50' : 'border-white/5 focus-within:border-purple-500/50'}`}>
            <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">You pay</span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs flex items-center gap-1 ${inputError === 'Insufficient balance' ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                        <Wallet size={12} /> Balance: {isConnected ? `${userBalance.toFixed(4)}` : "---"}
                    </span>
                    <button 
                        onClick={handleMax}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-fuchsia-300 px-1.5 py-0.5 rounded transition-colors uppercase font-bold tracking-wide"
                    >
                        Max
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <input 
                    type="number" 
                    placeholder="0" 
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className={`bg-transparent text-3xl font-medium w-full outline-none placeholder-gray-600 ${inputError ? 'text-red-300' : 'text-white'}`}
                />
                <button 
                    onClick={() => setTokenSelectorOpen('from')}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors min-w-fit"
                >
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                        {fromToken.icon}
                    </div>
                    <span className="font-semibold">{fromToken.symbol}</span>
                    <span className="text-gray-400">▼</span>
                </button>
            </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
            <button 
                onClick={switchTokens}
                className="bg-[#2d1b4e] border-4 border-[#1e1235] p-2 rounded-xl text-fuchsia-400 hover:text-white hover:scale-110 transition-all shadow-lg active:rotate-180 duration-300"
            >
                <ArrowDownUp size={20} />
            </button>
        </div>

        {/* Input 2 (To) */}
        <div className="bg-[#0f0518] rounded-2xl p-4 border border-white/5 mt-2 group focus-within:border-purple-500/50 transition-colors">
            <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">You receive</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Info size={12} /> Best price
                </span>
            </div>
            <div className="flex items-center gap-4">
                <input 
                    type="number" 
                    placeholder="0" 
                    value={toAmount}
                    readOnly
                    className="bg-transparent text-3xl font-medium w-full outline-none placeholder-gray-600"
                />
                <button 
                    onClick={() => setTokenSelectorOpen('to')}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors min-w-fit"
                >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-black/20">
                      {toToken.icon}
                    </div>
                    <span className="font-semibold">{toToken.symbol}</span>
                    <span className="text-gray-400">▼</span>
                </button>
            </div>
        </div>

        {txError && (
             <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                {(txError as BaseError).shortMessage || txError.message}
             </div>
        )}

        {/* Action Button */}
        <button 
            onClick={handleSwap}
            disabled={isButtonDisabled}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${activeNetwork.shadowClass} ${
                isButtonDisabled
                ? "bg-white/10 text-gray-500 cursor-not-allowed" 
                : isTxPending
                    ? "bg-gray-600 cursor-wait"
                    : `bg-gradient-to-r ${activeNetwork.gradientClass} hover:opacity-90 shadow-lg hover:scale-[1.02] active:scale-[0.98]`
            }`}
        >
            {isTxPending && <Loader2 className="animate-spin" size={24} />}
            <span>{getButtonText()}</span>
        </button>

        {/* Settings Modal */}
        {isSettingsOpen && (
            <div 
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                onClick={() => setIsSettingsOpen(false)}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1a0b2e] w-full max-w-sm p-5 rounded-2xl border border-white/10 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-white">Transaction Settings</h3>
                        <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-300 font-medium">Slippage Tolerance</span>
                            <Info size={14} className="text-gray-500" />
                        </div>
                        <div className="flex gap-2">
                            {['0.1', '0.5', '1.0'].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setSlippage(val)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        slippage === val 
                                            ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' 
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {val}%
                                </button>
                            ))}
                            <div className="relative flex-1 group">
                                <input
                                    type="number"
                                    value={slippage}
                                    onChange={(e) => setSlippage(e.target.value)}
                                    className={`w-full bg-black/20 border-2 rounded-xl px-4 py-2 text-sm text-right outline-none transition-colors ${
                                        !['0.1', '0.5', '1.0'].includes(slippage) 
                                            ? 'border-fuchsia-500/50 text-fuchsia-400' 
                                            : 'border-white/5 text-white focus:border-white/20'
                                    }`}
                                    placeholder="Custom"
                                />
                                <span className="absolute right-9 top-2.5 text-sm text-gray-500">%</span>
                            </div>
                        </div>

                        {/* Warnings */}
                        {isHighSlippage && (
                            <div className="mt-3 text-xs text-yellow-500 flex items-start gap-2 bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                <span>High slippage risk: Your transaction may be frontrun or fail.</span>
                            </div>
                        )}
                        {isLowSlippage && (
                            <div className="mt-3 text-xs text-yellow-500 flex items-start gap-2 bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                <span>Low slippage: Transaction may fail if price moves.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Token Select Modal */}
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
                                        <div className="font-semibold">{token.symbol}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-400">{token.name}</div>
                                    </div>
                                </div>
                                {(fromToken.symbol === token.symbol || toToken.symbol === token.symbol) && (
                                    <Check size={16} className="text-fuchsia-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
