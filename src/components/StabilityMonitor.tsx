
import React from 'react';
import { Zap as Pulse, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

interface StabilityMonitorProps {
  rate: number;
}

const StabilityMonitor: React.FC<StabilityMonitorProps> = ({ rate }) => {
  const isCritical = rate < 97;

  return (
    <div className="flex items-center gap-4 group">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* HUD Data Ring */}
        <div className={`absolute inset-0 rounded-full animate-pulse ${isCritical ? 'bg-red-500/10' : 'bg-cyan-500/5'}`}></div>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle 
            cx="24" cy="24" r="20" fill="transparent" 
            stroke={isCritical ? "#ef4444" : "#00f2ff"} 
            strokeWidth="2" 
            strokeDasharray={126} 
            strokeDashoffset={126 - (126 * (rate - 90)) / 10} 
            className="transition-all duration-1000 ease-in-out" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isCritical ? <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> : <Activity className="w-3.5 h-3.5 cyan-text animate-pulse" />}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black tabular-nums tracking-widest ${isCritical ? 'text-red-500' : 'text-white'}`}>{rate.toFixed(2)}%</span>
          {isCritical ? <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
        </div>
        <span className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-600">{isCritical ? 'LINK_UNSTABLE' : 'SYNC_INTEGRITY'}</span>
      </div>
    </div>
  );
};

export default StabilityMonitor;
