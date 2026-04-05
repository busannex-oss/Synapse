
import React from 'react';
import { Lead } from '../types';
import { Cpu, Zap, Send, RefreshCcw, ShieldCheck, Search, Code, TrendingUp, Mail, FileText, Trash2 } from 'lucide-react';

interface WorkflowCardProps {
  lead: Lead;
  onAction: (lead: Lead) => void;
  onViewStrategy?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ lead, onAction, onViewStrategy, onDelete }) => {
  const isProcessing = lead.isProcessing;

  const getActionLabel = () => {
    switch (lead.queue) {
      case 'verification': return 'Confirm';
      case 'qualification': return 'Assess';
      case 'intelligence': return 'Analyze';
      case 'synthesis': return 'Draft';
      case 'fulfillment': return 'Build';
      default: return 'Process';
    }
  };

  const getIcon = () => {
    switch (lead.queue) {
      case 'verification': return <ShieldCheck className="w-3 h-3" />;
      case 'qualification': return <TrendingUp className="w-3 h-3" />;
      case 'intelligence': return <Search className="w-3 h-3" />;
      case 'synthesis': return <Mail className="w-3 h-3" />;
      case 'fulfillment': return <Code className="w-3 h-3" />;
      default: return <Cpu className="w-3 h-3" />;
    }
  };

  return (
    <div className={`hud-panel p-4 relative group transition-all duration-500 overflow-hidden ${isProcessing ? 'bg-cyan-500/[0.05] border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,255,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.02]'}`}>
      {/* Tech Corner Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500/40'}`}></div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{lead.name}</h4>
          </div>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mono block truncate ml-3.5">{lead.industry}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <div className={`text-[9px] mono font-black px-2 py-1 rounded bg-black/40 border border-white/5 ${isProcessing ? 'text-amber-500 animate-pulse' : 'text-cyan-500/60'}`}>
            {isProcessing ? `${lead.processingProgress}%` : `PQ:${lead.confidenceScore}`}
          </div>
          {!isProcessing && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all duration-300 group/del"
            >
              <Trash2 className="w-3 h-3 group-hover/del:scale-110" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10">
        {lead.proposal && !isProcessing && (
          <button
            onClick={() => onViewStrategy?.(lead)}
            className="w-full h-8 mb-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500 hover:text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group/offer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <FileText className="w-3 h-3 text-emerald-500 group-hover/offer:text-black" />
            <span>View_Offer_of_Service</span>
          </button>
        )}
        {isProcessing ? (
          <div className="h-10 border border-amber-500/30 bg-amber-500/10 rounded-lg flex flex-col items-center justify-center gap-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-scan"></div>
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-3 h-3 text-amber-500 animate-spin" />
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Neural_Processing...</span>
            </div>
            <div className="w-full px-4">
               <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${lead.processingProgress}%` }}></div>
               </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAction(lead)}
            className="w-full h-10 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500 hover:text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-lg flex items-center justify-center gap-3 transition-all duration-300 group/btn shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            <div className="group-hover/btn:scale-110 transition-transform">{getIcon()}</div>
            <span>{getActionLabel()}</span>
            <Zap className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center opacity-30 group-hover:opacity-80 transition-all duration-500 text-[7px] mono uppercase border-t border-white/5 pt-3">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <span>R:{lead.readinessScore}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <span>RV:{lead.reviewCount}</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5 tracking-tighter">{lead.id.slice(-6)}</span>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute -inset-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
    </div>
  );
};

export default WorkflowCard;
