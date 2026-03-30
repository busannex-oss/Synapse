
import React from 'react';
import { Lead } from '../types';
import { BarChart3, Target, Zap, Globe, ShieldAlert } from 'lucide-react';

interface MarketSummaryProps {
  leads: Lead[];
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ leads }) => {
  if (leads.length === 0) return (
    <div className="hud-panel p-6 flex flex-col items-center justify-center h-32 opacity-20">
      <Target className="w-6 h-6 mb-2" />
      <span className="text-[8px] font-black uppercase tracking-widest">AJA_V2_STANDBY</span>
    </div>
  );

  const metrics = [
    { label: 'Neural_Potency', val: (leads.reduce((a, b) => a + b.rating, 0) / leads.length).toFixed(1), icon: Target, color: 'cyan' },
    { label: 'AJA_V2_CONFIDENCE', val: `${(leads.reduce((a, b) => a + b.confidenceScore, 0) / leads.length).toFixed(0)}%`, icon: Zap, color: 'cyan' },
    { label: 'Active_Nodes', val: leads.length, icon: Globe, color: 'cyan' },
    { label: 'Anomalies', val: leads.filter(l => l.confidenceScore > 90).length, icon: ShieldAlert, color: 'amber' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="hud-panel p-4 flex flex-col justify-between group hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">{m.label}</span>
            <m.icon className={`w-3 h-3 ${m.color === 'amber' ? 'text-amber-500' : 'text-cyan-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
             <h4 className={`text-xl font-black tracking-widest tabular-nums ${m.color === 'amber' ? 'text-amber-500' : 'text-white'}`}>{m.val}</h4>
             <div className="h-1 flex-1 bg-white/5 relative overflow-hidden">
                <div className={`absolute inset-0 bg-cyan-500/20 animate-pulse`} style={{ width: '60%' }}></div>
             </div>
          </div>
        </div>
      ))}
      <div className="col-span-2 mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
         <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest">Neural_Analysis_By: AJA_V2.0</span>
         <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-cyan-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default MarketSummary;
