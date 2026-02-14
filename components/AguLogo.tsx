import React from 'react';

export const AguLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#FFF2CC" />
        <stop offset="20%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#B8860B" />
        <stop offset="80%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FDB931" />
      </linearGradient>
      <linearGradient id="text-gradient" x1="0" y1="0" x2="0" y2="100">
         <stop offset="0%" stopColor="#FFFFFF" />
         <stop offset="100%" stopColor="#FFE5B4" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Outer Glow/Rim */}
    <circle cx="50" cy="50" r="48" fill="url(#gold-gradient)" stroke="#B8860B" strokeWidth="2" />
    
    {/* Inner Ridge */}
    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#B8860B" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
    
    {/* Coin Face Detail - Tech Lines */}
    <path d="M50 15 V 85 M15 50 H 85" stroke="#B8860B" strokeWidth="0.5" opacity="0.4" />
    <circle cx="50" cy="50" r="32" fill="url(#gold-gradient)" opacity="0.9" stroke="#B8860B" strokeWidth="0.5"/>
    
    {/* Text */}
    <text x="50" y="62" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="32" fill="#4B3621" opacity="0.3" transform="translate(1, 1)">
      AGU
    </text>
    <text x="50" y="62" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="32" fill="url(#text-gradient)" stroke="#4B3621" strokeWidth="0.5" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}>
      AGU
    </text>
  </svg>
);
