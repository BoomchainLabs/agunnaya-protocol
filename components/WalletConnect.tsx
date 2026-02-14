import React, { useState } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export const WalletConnect: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address });
    
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected) {
        return (
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-purple-900/20 font-medium"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                    <span>Connect Wallet</span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#1a0b2e] border border-white/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Select Provider</div>
                        {connectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => {
                                    connect({ connector });
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-white flex items-center gap-3 transition-colors"
                            >
                                <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
                                {connector.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 px-4 py-2 rounded-full transition-all"
            >
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                <span className="text-sm font-medium text-purple-100">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </span>
                <ChevronDown size={14} className={`text-purple-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1a0b2e] border border-white/10 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-300">Connected</h3>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                            {chain?.name || "Unknown Chain"}
                        </span>
                    </div>

                    <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4">
                        <div className="text-xs text-gray-500 mb-1">Balance</div>
                        <div className="text-xl font-bold font-mono">
                            {balance ? parseFloat(balance.formatted).toFixed(4) : "0.00"} 
                            <span className="text-sm text-gray-500 ml-1">{balance?.symbol}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                         <button 
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Copy size={14} />
                                <span>Copy Address</span>
                            </div>
                            {copied && <Check size={14} className="text-green-400" />}
                        </button>
                        
                        <a 
                            href={`https://etherscan.io/address/${address}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <ExternalLink size={14} />
                            <span>View on Explorer</span>
                        </a>

                        <div className="h-px bg-white/10 my-2"></div>

                        <button 
                            onClick={() => {
                                disconnect();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Disconnect</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};