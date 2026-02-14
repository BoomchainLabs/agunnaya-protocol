import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Dashboard } from './components/Dashboard';
import { SwapWidget } from './components/SwapWidget';
import { TradingChart } from './components/TradingChart';
import { WalletConnect } from './components/WalletConnect';
import { AguLogo } from './components/AguLogo';
import { AddLiquidityWidget } from './components/AddLiquidityWidget';

enum Tab {
  DASHBOARD = 'DASHBOARD',
  SWAP = 'SWAP',
  TRADE = 'TRADE',
  POOL = 'POOL'
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // Real Web3 State
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-fuchsia-500 selection:text-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0518]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(Tab.DASHBOARD)}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <AguLogo className="relative w-10 h-10" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                AGU Protocol
              </span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavButton 
                  active={activeTab === Tab.DASHBOARD} 
                  onClick={() => setActiveTab(Tab.DASHBOARD)}
                  label="Liquidity"
                />
                <NavButton 
                  active={activeTab === Tab.POOL} 
                  onClick={() => setActiveTab(Tab.POOL)}
                  label="Pool"
                />
                <NavButton 
                  active={activeTab === Tab.SWAP} 
                  onClick={() => setActiveTab(Tab.SWAP)}
                  label="Swap"
                />
                <NavButton 
                  active={activeTab === Tab.TRADE} 
                  onClick={() => setActiveTab(Tab.TRADE)}
                  label="Trade"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
               <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 w-full">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
             <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center max-w-lg w-full mx-4 shadow-2xl">
                <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 rounded-full"></div>
                    <AguLogo className="w-20 h-20 relative z-10" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Connect your EVM wallet to view your liquidity positions, swap tokens, and manage your portfolio on the AGU Protocol.
                </p>
                <div className="flex justify-center transform hover:scale-105 transition-transform duration-200">
                   <WalletConnect />
                </div>
             </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === Tab.DASHBOARD && (
              <Dashboard walletAddress={address || ""} />
            )}
            {activeTab === Tab.POOL && (
              <div className="flex justify-center pt-4 md:pt-10">
                <AddLiquidityWidget />
              </div>
            )}
            {activeTab === Tab.SWAP && (
              <div className="flex justify-center pt-4 md:pt-10">
                <SwapWidget />
              </div>
            )}
            {activeTab === Tab.TRADE && (
              <TradingChart 
                pair="AGU/WETH" 
                chain="base" 
                dextoolsAddress="0xbd08f83afd361483f1325dd89cae2aaaa9387080" 
              />
            )}
          </div>
        )}
      </main>
      
      {/* Mobile Nav Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a0b2e]/95 backdrop-blur-xl border-t border-white/10 p-2 pb-safe flex justify-around z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         <MobileNavIcon active={activeTab === Tab.DASHBOARD} onClick={() => setActiveTab(Tab.DASHBOARD)} label="Liq" icon="💧" />
         <MobileNavIcon active={activeTab === Tab.POOL} onClick={() => setActiveTab(Tab.POOL)} label="Pool" icon="➕" />
         <MobileNavIcon active={activeTab === Tab.SWAP} onClick={() => setActiveTab(Tab.SWAP)} label="Swap" icon="⇄" />
         <MobileNavIcon active={activeTab === Tab.TRADE} onClick={() => setActiveTab(Tab.TRADE)} label="Trade" icon="📈" />
      </div>
    </div>
  );
}

const NavButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const MobileNavIcon = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${
        active ? 'text-fuchsia-400 bg-white/5' : 'text-gray-500'
    }`}
  >
    <span className={`text-2xl transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);