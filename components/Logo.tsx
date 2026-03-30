
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Glow Element */}
    <circle cx="50" cy="50" r="45" fill="currentColor" fillOpacity="0.03" />
    
    {/* Main Neural 'S' Path */}
    <path 
      d="M30 35C30 25 45 20 50 20C65 20 70 30 70 40C70 55 30 45 30 60C30 70 35 80 50 80C65 80 70 75 70 65" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round"
      className="opacity-80"
    />
    
    {/* Active Synapse Nodes */}
    <circle cx="30" cy="35" r="4" fill="currentColor" className="animate-pulse">
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="70" cy="65" r="4" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1s' }}>
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Central Connection Pulse */}
    <path 
      d="M42 50H58" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      className="animate-pulse"
    >
      <animate attributeName="stroke-width" values="1;3;1" dur="1.5s" repeatCount="indefinite" />
    </path>
    
    {/* Outer Tech Ring */}
    <circle 
      cx="50" cy="50" r="40" 
      stroke="currentColor" 
      strokeWidth="0.5" 
      strokeDasharray="4 8" 
      className="animate-spin-slow opacity-30" 
    />
  </svg>
);

export default Logo;
