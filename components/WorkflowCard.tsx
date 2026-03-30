
import React from 'react';
import { Lead } from '../types';
import { Cpu, Zap, Send, RefreshCcw, ShieldCheck, Search, Code, TrendingUp, Mail } from 'lucide-react';

interface WorkflowCardProps {
  lead: Lead;
  onAction: (lead: Lead) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ lead, onAction }) => {
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
    <div className={`hud-panel p-3 relative border-white/5 hover:border-cyan-500/40 transition-all ${isProcessing ? 'bg-cyan-500/[0.02]' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{lead.name}</h4>
          <span className="text-[6px] font-bold text-slate-500 uppercase mono block truncate">{lead.industry}</span>
        </div>
        <div className={`text-[8px] mono font-black ml-2 shrink-0 ${isProcessing ? 'text-amber-500 animate-pulse' : 'cyan-text opacity-40'}`}>
          {isProcessing ? `${lead.processingProgress}%` : `PQ:${lead.confidenceScore}`}
        </div>
      </div>

      {isProcessing ? (
        <div className="h-8 border border-amber-500/20 bg-amber-500/5 flex items-center justify-center gap-2">
          <RefreshCcw className="w-2.5 h-2.5 text-amber-500 animate-spin" />
          <span className="text-[7px] font-black text-amber-500 uppercase">Processing...</span>
        </div>
      ) : (
        <button
          onClick={() => onAction(lead)}
          className="w-full h-8 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500 hover:text-black text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          {getIcon()} {getActionLabel()}
        </button>
      )}

      <div className="mt-3 flex justify-between opacity-20 group-hover:opacity-60 transition-opacity text-[6px] mono uppercase">
        <div className="flex gap-2">
          <span>R:{lead.readinessScore}%</span>
          <span>RV:{lead.reviewCount}</span>
        </div>
        <span className="truncate max-w-[40px]">{lead.id.slice(-4)}</span>
      </div>
    </div>
  );
};

export default WorkflowCard;
