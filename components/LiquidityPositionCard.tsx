import React, { useMemo, useState } from "react";
import { Share2, Check } from "lucide-react";

export interface LiquidityCardProps {
  tokenA: string;
  tokenB: string;
  feeTier: string | number;
  positionId: string;
  minTick: number;
  maxTick: number;
  currentTick?: number;
  cardImageUrl?: string;
  isSolana?: boolean;
}

function tickToX(tick: number, minTick: number, maxTick: number, width: number) {
  const span = maxTick - minTick || 1;
  // normalize tick between 0 and 1 relative to the range
  const normalized = (tick - minTick) / span;
  // clamp
  const clamped = Math.max(0, Math.min(1, normalized));
  return clamped * width;
}

export const LiquidityPositionCard: React.FC<LiquidityCardProps> = ({
  tokenA,
  tokenB,
  feeTier,
  positionId,
  minTick,
  maxTick,
  currentTick,
  cardImageUrl = "https://picsum.photos/200/200",
  isSolana
}) => {
  const width = 320;
  const height = 180;
  const [justShared, setJustShared] = useState(false);

  // Generate a smooth curve for the visualization
  const svgPath = useMemo(() => {
    // We want a visual representation of the range.
    // Let's create a curve that peaks in the middle of the range.
    
    // Coordinates within the SVG
    const rangeStart = 0;
    const rangeEnd = width;
    
    const x1 = rangeStart;
    const x2 = rangeEnd;
    const cx = (x1 + x2) / 2; // Control point X (center)
    
    // Y coordinates
    const bottomY = 140;
    const topY = 40;
    
    // A bell curve-ish shape using Quadratic Bezier
    // Start at bottom left, curve up to top center, down to bottom right
    return `M ${x1} ${bottomY} Q ${cx} ${topY} ${x2} ${bottomY}`;
  }, []);

  const currentX = currentTick !== undefined 
    ? tickToX(currentTick, minTick, maxTick, width) 
    : width / 2;

  // Calculate position status
  const inRange = currentTick !== undefined && currentTick >= minTick && currentTick <= maxTick;

  const handleShare = async () => {
    const shareData = {
      title: 'AGU Protocol Position',
      text: `Check out my ${tokenA}/${tokenB} liquidity position on AGU Protocol! 🚀\nFee: ${feeTier}\nRange: [${minTick}, ${maxTick}]`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setJustShared(true);
      setTimeout(() => setJustShared(false), 2000);
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 ${isSolana ? 'bg-gradient-to-br from-emerald-900 to-teal-700' : 'bg-gradient-to-br from-purple-900 to-fuchsia-700'} text-white p-5 group`}>
      
      {/* Header */}
      <div className="flex items-start justify-between z-10 relative">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">{tokenA}/{tokenB}</h3>
            {isSolana && <span className="text-[10px] bg-teal-400 text-teal-900 font-bold px-1.5 py-0.5 rounded">SOL</span>}
          </div>
          <div className="text-sm font-medium opacity-80 mt-1 flex items-center gap-2">
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
              Fee: {feeTier}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${inRange ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${inRange ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {inRange ? 'In Range' : 'Out of Range'}
            </span>
          </div>
        </div>
        <img 
          src={cardImageUrl} 
          alt="asset" 
          className="w-12 h-12 rounded-xl opacity-90 object-cover border-2 border-white/10 shadow-lg" 
        />
      </div>

      {/* Visualization */}
      <div className="mt-6 bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block relative z-10">
          <defs>
            <linearGradient id={isSolana ? "gSol" : "gEvm"} x1="0" x2="1">
              <stop offset="0" stopColor={isSolana ? "#34d399" : "#ff7ad3"} stopOpacity="0.9"/>
              <stop offset="1" stopColor={isSolana ? "#0d9488" : "#6a00ff"} stopOpacity="0.8"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background area curve */}
          <path d={`${svgPath} L ${width} ${height} L 0 ${height} Z`} fill={isSolana ? "url(#gSol)" : "url(#gEvm)"} opacity="0.15" />

          {/* Main Line */}
          <path d={svgPath} stroke={isSolana ? "url(#gSol)" : "url(#gEvm)"} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#glow)" />
          
          {/* Ghost line for visual weight */}
          <path d={svgPath} stroke="#ffffff22" strokeWidth={14} fill="none" strokeLinecap="round" className="blur-sm" />

          {/* Min/Max Dots */}
          <circle cx={5} cy={140} r={4} fill="#fff" fillOpacity="0.5" />
          <circle cx={width-5} cy={140} r={4} fill="#fff" fillOpacity="0.5" />

          {/* Current Price Indicator */}
          {typeof currentTick === "number" && (
            <g transform={`translate(${currentX}, 0)`}>
              <line x1="0" y1="20" x2="0" y2={height} stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cy={tickToX(currentTick, minTick, maxTick, height) > 70 ? 90 : 60} r={6} fill="white" stroke={isSolana ? "#0f766e" : "#6b21a8"} strokeWidth="3" />
              <rect x="-24" y="0" width="48" height="20" rx="4" fill="white" />
              <text x="0" y="14" textAnchor="middle" fontSize="10" fill="black" fontWeight="bold">Price</text>
            </g>
          )}
        </svg>
      </div>

      {/* Info Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        <div className="flex gap-2">
          <div className="flex-1 bg-black/20 rounded-lg px-3 py-2 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Min Tick</span>
            <div className="font-mono text-sm font-semibold">{minTick}</div>
          </div>
          <div className="flex-1 bg-black/20 rounded-lg px-3 py-2 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Max Tick</span>
            <div className="font-mono text-sm font-semibold">{maxTick}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-black/20 rounded-lg px-3 py-2 border border-white/5 flex justify-between items-center group-hover:bg-black/30 transition-colors">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Position ID</span>
            <div className="font-mono text-xs text-white/80">{positionId.slice(0, 12)}...</div>
          </div>
          <button
            onClick={handleShare}
            className="bg-black/20 hover:bg-white/10 border border-white/5 rounded-lg px-3 flex items-center justify-center transition-colors text-white/80 hover:text-white"
            title="Share Position"
          >
            {justShared ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPositionCard;