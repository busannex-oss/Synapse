
import React from 'react';
import { Lead } from '../types';
import { Phone, Star, Trash2, Globe, Target, Plus, RefreshCcw, ShieldCheck } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onDelete: (id: string) => void;
  onAdd: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDelete, onAdd }) => {
  const isProcessing = lead.isProcessing;

  return (
    <div className={`hud-panel p-4 relative group border-cyan-500/10 hover:border-cyan-500 transition-all duration-300 overflow-hidden ${isProcessing ? 'border-amber-500/30 shadow-[0_0_20px_rgba(255,154,0,0.1)]' : ''}`}>
      <div className="absolute top-1.5 right-1.5 flex gap-1.5 items-center">
         <div className="text-[6px] mono-data opacity-30">DS_{lead.id.slice(0, 2).toUpperCase()}</div>
         <div className="flex items-center gap-1 px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-sm">
            <span className="text-[5px] font-black cyan-text uppercase tracking-widest">VERIFIED</span>
         </div>
         <div className={`w-1 h-1 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`}></div>
      </div>
      
      <div className="flex gap-4 mb-4">
        {/* Scoring Circle / Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="24" cy="24" r="21" fill="transparent" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="1.5" />
            <circle 
              cx="24" cy="24" r="21" fill="transparent" 
              stroke={isProcessing ? "#ff9a00" : "#00f2ff"} 
              strokeWidth="1.5" 
              strokeDasharray={132} 
              strokeDashoffset={132 - (132 * (isProcessing ? lead.processingProgress : lead.confidenceScore)) / 100} 
              className="transition-all duration-1000" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-[10px] font-black ${isProcessing ? 'text-amber-500' : 'cyan-text'}`}>
               {isProcessing ? lead.processingProgress : lead.confidenceScore}
             </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-black text-white tracking-widest group-hover:cyan-text transition-colors truncate uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{lead.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{lead.industry}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-1.5 h-1.5 fill-amber-500 text-amber-500" />
              <span className="text-[7px] mono-data text-amber-500/80 font-black">{lead.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[8px] mono-data border-b border-white/5 pb-0.5">
          <span className="uppercase opacity-40">Link:</span>
          <span className={`font-bold tracking-widest ${isProcessing ? 'text-amber-500/60' : 'text-slate-300'}`}>{lead.phone}</span>
        </div>
        <div className="flex justify-between items-center text-[8px] mono-data border-b border-white/5 pb-0.5">
          <span className="uppercase opacity-40">Geo:</span>
          <span className={`font-bold tracking-widest ${isProcessing ? 'text-amber-500/60' : 'text-slate-300'}`}>{lead.location.split(',')[0]}</span>
        </div>
      </div>

      <div className={`relative p-2.5 border mb-4 transition-all ${isProcessing ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-cyan-500/[0.03] border-cyan-500/10'}`}>
        <Target className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 ${isProcessing ? 'text-amber-500/20' : 'text-cyan-500/20'}`} />
        <p className="text-[8px] text-slate-400 font-bold tracking-wider leading-tight">
          {isProcessing ? "Recalibrating Neural Mapping..." : `"${lead.businessNeed}"`}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {lead.missingElements.slice(0, 3).map((item, idx) => (
          <span key={idx} className="text-[6px] font-black uppercase tracking-widest text-slate-500 border border-white/10 px-1.5 py-0.5">
            {item}
          </span>
        ))}
      </div>

      {/* Data Integrity Section */}
      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
          <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.15em]">Integrity_Verified</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[6px] mono-data opacity-60">
          <div className="flex justify-between">
            <span className="uppercase">Name:</span>
            <span className="truncate max-w-[50px] text-right">{lead.originalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase">Loc:</span>
            <span className="truncate max-w-[50px] text-right">{lead.originalLocation}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 bottom-0 right-0 w-10 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={() => !isProcessing && onAdd(lead)}
          disabled={isProcessing}
          className={`w-8 h-8 border shadow-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${isProcessing ? 'bg-amber-500/20 border-amber-500 text-amber-500 opacity-50 cursor-not-allowed' : 'bg-cyan-500 text-black border-cyan-500 shadow-cyan-500/20'}`}
        >
          {isProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
