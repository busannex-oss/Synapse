
import React from 'react';
import { Lead, BusinessStrategy } from '../types';
import { Target, Sparkles, Terminal, Activity, TrendingUp } from 'lucide-react';

interface AnalysisPanelProps {
  lead: Lead | null;
  strategy: BusinessStrategy | null;
  loading: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ lead, strategy, loading }) => {
  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-8">
      <div className="w-20 h-20 relative">
         <div className="absolute inset-0 border border-amber-500/10 rounded-full animate-ping"></div>
         <div className="w-full h-full border-t border-amber-500 rounded-full"></div>
      </div>
      <p className="mono text-[10px] uppercase tracking-[0.5em] gold-text">Synthesizing Strategic Sand Table...</p>
    </div>
  );

  if (!strategy) return null;

  return (
    <div className="p-16 flex flex-col gap-16 animate-in fade-in duration-700">
      <header className="flex items-center gap-10">
        <div className="w-20 h-20 sand-panel flex items-center justify-center relative bg-amber-500/5">
          <Target className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="mono text-[8px] uppercase tracking-widest text-amber-500/60 font-black">Linkage: Strat_Protocol_L12</span>
             <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">{lead?.name} <span className="text-slate-500 font-light">Report</span></h2>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="sand-panel p-10 space-y-6">
           <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
             <Terminal className="w-4 h-4 text-amber-500" /> Analysis Core
           </h3>
           <div className="mono text-xs leading-relaxed text-slate-400 space-y-4">
              {strategy.analysis?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
           </div>
        </div>

        <div className="flex flex-col gap-10">
           <div className="sand-panel p-10 bg-amber-500/[0.03] border-amber-500/40">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6 flex items-center gap-3">
                <Sparkles className="w-4 h-4" /> Value Vector
              </h3>
              <p className="text-xl font-black text-white tracking-tight leading-snug">"{strategy.valueProposition}"</p>
           </div>
           
           <div className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
               <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Yield Nodes</h3>
               <div className="space-y-2">
                 {strategy.revenueOpportunities?.map((op, i) => (
                   <div key={i} className="px-3 py-2 border border-white/5 bg-black/40 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">
                     {op}
                   </div>
                 ))}
               </div>
             </div>
             <div className="space-y-4">
               <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Tactical Steps</h3>
               <div className="space-y-4">
                 {strategy.pitchDeckOutline?.map((item, i) => (
                   <div key={i} className="flex gap-3 items-start group">
                     <span className="mono text-[9px] text-amber-500/40 font-black mt-0.5">[{i+1}]</span>
                     <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-200 transition-colors">{item}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisPanel;
