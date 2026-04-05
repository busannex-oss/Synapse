
import React from 'react';

const Logo: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className = "w-8 h-8", style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2ff" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Background Glow Element */}
    <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" fillOpacity="0.05" />
    
    {/* Main Neural 'S' Path */}
    <path 
      d="M30 35C30 25 45 20 50 20C65 20 70 30 70 40C70 55 30 45 30 60C30 70 35 80 50 80C65 80 70 75 70 65" 
      stroke="url(#logoGradient)" 
      strokeWidth="4" 
      strokeLinecap="round"
      filter="url(#logoGlow)"
      className="opacity-90"
    />
    
    {/* Active Synapse Nodes */}
    <circle cx="30" cy="35" r="3" fill="#00f2ff">
      <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="70" cy="65" r="3" fill="#d946ef">
      <animate attributeName="r" values="3;4;3" dur="2s" begin="1s" repeatCount="indefinite" />
    </circle>
    
    {/* Central Connection Pulse */}
    <path 
      d="M42 50H58" 
      stroke="#00f2ff" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      className="animate-pulse"
    />
    
    {/* Outer Tech Ring */}
    <circle 
      cx="50" cy="50" r="42" 
      stroke="url(#logoGradient)" 
      strokeWidth="0.5" 
      strokeDasharray="2 6" 
      className="opacity-40"
    >
      <animateTransform 
        attributeName="transform" 
        type="rotate" 
        from="0 50 50" 
        to="360 50 50" 
        dur="20s" 
        repeatCount="indefinite" 
      />
    </circle>

    {/* Inner Tech Ring */}
    <circle 
      cx="50" cy="50" r="35" 
      stroke="#00f2ff" 
      strokeWidth="0.2" 
      strokeDasharray="1 4" 
      className="opacity-20"
    >
      <animateTransform 
        attributeName="transform" 
        type="rotate" 
        from="360 50 50" 
        to="0 50 50" 
        dur="15s" 
        repeatCount="indefinite" 
      />
    </circle>
  </svg>
);

export default Logo;
