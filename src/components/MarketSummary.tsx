
import React from 'react';
import { Lead, MarketData, SystemLog } from '../types';
import { BarChart3, Target, Zap, Globe, ShieldAlert, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import ContextualLog from './ContextualLog';

interface MarketSummaryProps {
  leads: Lead[];
  marketData?: MarketData[];
  logs?: SystemLog[];
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ leads, marketData, logs = [] }) => {
  if (leads.length === 0 && (!marketData || marketData.length === 0)) return (
    <div className="hud-panel p-6 flex flex-col items-center justify-center h-32 opacity-20">
      <Target className="w-6 h-6 mb-2" />
      <span className="text-[8px] font-black uppercase tracking-widest">AJA_SYSTEM_STANDBY</span>
    </div>
  );

  const metrics = [
    { label: 'Neural_Potency', val: leads.length > 0 ? (leads.reduce((a, b) => a + b.rating, 0) / leads.length).toFixed(1) : '0.0', icon: Target, color: 'cyan' },
    { label: 'AJA_SYSTEM_CONFIDENCE', val: leads.length > 0 ? `${(leads.reduce((a, b) => a + b.confidenceScore, 0) / leads.length).toFixed(0)}%` : '0%', icon: Zap, color: 'cyan' },
    { label: 'Active_Nodes', val: leads.length, icon: Globe, color: 'cyan' },
    { label: 'Anomalies', val: leads.filter(l => l.confidenceScore > 90).length, icon: ShieldAlert, color: 'amber' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="hud-panel p-5 flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${m.color === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'}`}></div>
            
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">{m.label}</span>
                <div className="h-0.5 w-4 bg-cyan-500/30 rounded-full"></div>
              </div>
              <m.icon className={`w-4 h-4 transition-transform duration-500 group-hover:scale-110 ${m.color === 'amber' ? 'text-amber-500' : 'text-cyan-500'}`} />
            </div>
            
            <div className="flex items-baseline gap-3 relative z-10">
               <h4 className={`text-2xl font-black tracking-tighter tabular-nums ${m.color === 'amber' ? 'text-amber-500' : 'text-white'} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>{m.val}</h4>
               <div className="h-1 flex-1 bg-white/5 relative rounded-full overflow-hidden">
                  <div className={`absolute inset-0 ${m.color === 'amber' ? 'bg-amber-500/40' : 'bg-cyan-500/40'} animate-pulse`} style={{ width: '60%' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan"></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {marketData && marketData.length > 0 && (
        <div className="hud-panel p-6 space-y-4 relative overflow-hidden">
          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/20 animate-scan pointer-events-none"></div>
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="relative">
                <TrendingUp className="w-4 h-4" />
                <div className="absolute -inset-1 bg-cyan-500/20 rounded-full blur-sm animate-pulse"></div>
              </div>
              Real_Time_Intelligence_Feed
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] text-slate-500 mono uppercase tracking-widest">Source: {marketData[0].source}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {marketData.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.02] transition-all duration-300 group/item">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full ${data.change >= 0 ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white mono tracking-wider">{data.symbol}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-2.5 h-2.5 text-slate-600" />
                      <span className="text-[8px] text-slate-600 mono uppercase">{new Date(data.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <div className="text-xs font-black text-white mono tracking-tight">${data.price.toLocaleString()}</div>
                  <div className={`text-[9px] font-black mono flex items-center justify-end gap-1.5 ${data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                      {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural_Analysis_By: AJA_SYSTEM</span>
         </div>
         <div className="flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-cyan-500/20 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1s' }}></div>
              </div>
            ))}
         </div>
      </div>

      <ContextualLog logs={logs} module="MARKET_INTELLIGENCE" title="Market_Telemetry" />
    </div>
  );
};

export default MarketSummary;
