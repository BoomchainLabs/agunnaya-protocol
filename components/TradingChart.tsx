import React, { useEffect, useRef } from "react";

interface TradingChartProps {
    pair?: string;
    dextoolsAddress?: string;
    chain?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
    pair = "ETHUSDT", 
    dextoolsAddress, 
    chain = "base" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize TradingView if NOT using Dextools
    if (!dextoolsAddress && containerRef.current && containerRef.current.childElementCount === 0) {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            // @ts-ignore
            if (window.TradingView) {
                // @ts-ignore
                new window.TradingView.widget({
                    "width": "100%",
                    "height": 600,
                    "symbol": "BINANCE:" + pair,
                    "interval": "60",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": "tradingview_chart"
                });
            }
        };
        document.body.appendChild(script);
        
        // Cleanup script on unmount
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }
  }, [pair, dextoolsAddress]);

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f0518]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1a0b2e]">
            <div className="flex items-center gap-3">
                <img 
                    src={dextoolsAddress ? "https://github.com/dextools.png" : "https://picsum.photos/30/30"} 
                    className="w-8 h-8 rounded-full" 
                    alt="pair" 
                />
                <div>
                    <h3 className="font-bold text-lg">{pair}</h3>
                    <span className="text-xs text-green-400 font-mono">Live Data</span>
                </div>
            </div>
            <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">1H</span>
                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">4H</span>
                <span className="px-2 py-1 bg-white/20 rounded text-xs text-white">1D</span>
            </div>
        </div>
        
        {dextoolsAddress ? (
            <iframe 
                id="dextools-widget" 
                title="DEXTools Trading Chart" 
                width="100%" 
                height="600" 
                src={`https://www.dextools.io/widget-chart/en/${chain}/pe-light/${dextoolsAddress}?theme=dark&chartType=1&chartResolution=30&drawingToolbars=false`}
                className="w-full h-[600px] border-0"
            />
        ) : (
            <div id="tradingview_chart" ref={containerRef} className="w-full h-[600px] bg-[#131722]" />
        )}
    </div>
  );
};