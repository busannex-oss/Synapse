
import React, { useState } from 'react';
import { Lead } from '../types';
import { 
  Phone, Star, Trash2, Globe, Target, Plus, RefreshCcw, 
  ShieldCheck, FileText, MapPin, Mail, MessageSquare, 
  ScrollText, Megaphone, ChevronDown, ChevronUp, PhoneCall, BarChart
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onDelete: (id: string) => void;
  onAdd: (lead: Lead) => void;
  onViewStrategy?: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDelete, onAdd, onViewStrategy }) => {
  const [showAssets, setShowAssets] = useState(lead.queue === 'completed');
  const isProcessing = lead.isProcessing;

  const handleDoubleClick = () => {
    if (isProcessing) return;
    // If it's already in a neural queue, remove it. Otherwise, add it.
    if (lead.queue && lead.queue !== 'archive') {
      onDelete(lead.id);
    } else {
      onAdd(lead);
    }
  };

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className={`hud-panel p-3 relative group border-cyan-500/10 hover:border-cyan-500 transition-all duration-300 overflow-hidden ${isProcessing ? 'border-amber-500/30 shadow-[0_0_20px_rgba(255,154,0,0.1)]' : ''}`}
    >
      <div className="absolute top-1 right-1.5 flex gap-1.5 items-center">
         <div className="text-[6px] mono-data opacity-30">DS_{lead.id.slice(0, 2).toUpperCase()}</div>
         <div className="flex items-center gap-1 px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-sm">
            <span className="text-[5px] font-black text-cyan-400 uppercase tracking-widest">VERIFIED</span>
         </div>
         <div className={`w-1 h-1 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`}></div>
      </div>
      
      <div className="flex gap-4 mb-3 mt-1">
        {/* Scoring Circle / Progress Ring */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="18" fill="transparent" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="1.5" />
            <circle 
              cx="20" cy="20" r="18" fill="transparent" 
              stroke={isProcessing ? "#ff9a00" : "#00f2ff"} 
              strokeWidth="1.5" 
              strokeDasharray={113} 
              strokeDashoffset={113 - (113 * (isProcessing ? lead.processingProgress : lead.confidenceScore)) / 100} 
              className="transition-all duration-1000" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-[9px] font-black ${isProcessing ? 'text-amber-500' : 'text-cyan-400'}`}>
               {isProcessing ? lead.processingProgress : lead.confidenceScore}
             </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-black text-white tracking-widest group-hover:text-cyan-400 transition-colors truncate uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{lead.name}</h3>
          <div className="flex items-start gap-1.5 mt-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-[11px] font-black text-cyan-400 uppercase tracking-wider leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{lead.address}</p>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[6px] font-black bg-white/5 border border-white/10 px-1.5 py-0.5 text-slate-400 uppercase tracking-widest rounded-sm">{lead.industry}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-1.5 h-1.5 fill-amber-500 text-amber-500" />
              <span className="text-[7px] mono-data text-amber-500/80 font-black">{lead.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[10px] mono-data border-b border-white/5 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-cyan-500/50" />
            <span className="uppercase opacity-40 text-[7px] font-black tracking-widest">Direct_Line:</span>
          </div>
          <span className={`font-black tracking-[0.15em] ${isProcessing ? 'text-amber-500/60' : 'text-cyan-400'}`}>{lead.phone}</span>
        </div>
        <div className="flex justify-between items-center text-[7px] mono-data opacity-40 px-1">
          <span className="uppercase tracking-tighter">Geo_Coordinates:</span>
          <span className="font-bold tracking-widest">{lead.location || 'Unknown'}</span>
        </div>
      </div>

      <div className={`relative p-2.5 border mb-4 transition-all ${isProcessing ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-cyan-500/[0.03] border-cyan-500/10'}`}>
        <Target className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 ${isProcessing ? 'text-amber-500/20' : 'text-cyan-500/20'}`} />
        <p className="text-[8px] text-slate-400 font-bold tracking-wider leading-tight">
          {isProcessing ? "Recalibrating Neural Mapping..." : (typeof lead.businessNeed === 'object' ? JSON.stringify(lead.businessNeed) : `"${lead.businessNeed}"`)}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {lead.missingElements?.slice(0, 5).map((item, idx) => (
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
            <span className="truncate max-w-[60px] text-right">{lead.originalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase">Phone:</span>
            <span className="truncate max-w-[60px] text-right">{lead.originalPhone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase">Email:</span>
            <span className="truncate max-w-[60px] text-right">{lead.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase">Rating:</span>
            <span className="truncate max-w-[60px] text-right">{lead.rating} ({lead.reviewCount} reviews)</span>
          </div>
          <div className="flex justify-between col-span-2 mt-0.5 border-t border-white/5 pt-0.5">
            <span className="uppercase">Original_Loc:</span>
            <span className="truncate text-right">{lead.originalLocation}</span>
          </div>
        </div>
      </div>

      {/* Marketing Assets Section */}
      {lead.proposal && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <button 
            onClick={() => setShowAssets(!showAssets)}
            className="w-full flex items-center justify-between text-[7px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <FileText className="w-2.5 h-2.5" />
              Neural_Marketing_Assets
            </div>
            {showAssets ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
          
          {showAssets && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
              {lead.proposal.proposalDraft && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-2.5 h-2.5 text-blue-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Proposal_Draft</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.proposalDraft}
                  </p>
                </div>
              )}

              {lead.proposal.outreachEmail && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-2.5 h-2.5 text-cyan-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Outreach_Email</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.outreachEmail}
                  </p>
                </div>
              )}
              
              {lead.proposal.voiceScript && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Voice_Script</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.voiceScript}
                  </p>
                </div>
              )}

              {lead.proposal.postalLetter && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <ScrollText className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Postal_Letter</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.postalLetter}
                  </p>
                </div>
              )}

              {lead.proposal.pitchText && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="w-2.5 h-2.5 text-fuchsia-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Elevator_Pitch</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.pitchText}
                  </p>
                </div>
              )}

              {lead.proposal.followUpEmail && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-2.5 h-2.5 text-blue-400" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Follow_Up_Email</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.followUpEmail}
                  </p>
                </div>
              )}

              {lead.proposal.pitchDeckOutline && lead.proposal.pitchDeckOutline.length > 0 && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <BarChart className="w-2.5 h-2.5 text-indigo-500" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Pitch_Deck_Outline</span>
                    </div>
                  </div>
                  <ul className="text-[7px] text-slate-300 leading-relaxed list-disc list-inside space-y-1">
                    {lead.proposal.pitchDeckOutline.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lead.proposal.aiAudit && (
                <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg group/asset hover:bg-emerald-500/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[6px] font-black text-emerald-500 uppercase tracking-widest">Neural_AI_Audit</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[5px] font-black text-emerald-500/60 uppercase block mb-0.5">How It Helps:</span>
                      <p className="text-[7px] text-slate-300 leading-tight">{lead.proposal.aiAudit.howItHelps}</p>
                    </div>
                    <div>
                      <span className="text-[5px] font-black text-emerald-500/60 uppercase block mb-0.5">Why Now:</span>
                      <p className="text-[7px] text-slate-300 leading-tight">{lead.proposal.aiAudit.whyNow}</p>
                    </div>
                    <div>
                      <span className="text-[5px] font-black text-emerald-500/60 uppercase block mb-0.5">Strategic Uncoverings:</span>
                      <p className="text-[7px] text-slate-300 leading-tight">{lead.proposal.aiAudit.strategicUncoverings}</p>
                    </div>
                  </div>
                </div>
              )}

              {lead.proposal.aiReceptionistScript && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg group/asset hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="w-2.5 h-2.5 text-cyan-400" />
                      <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">AI_Receptionist_Script</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 leading-relaxed italic max-h-[100px] overflow-y-auto custom-scrollbar">
                    {lead.proposal.aiReceptionistScript}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="absolute top-0 bottom-0 right-0 w-10 flex flex-col justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform translate-x-0 md:translate-x-2 md:group-hover:translate-x-0 pr-1.5 md:pr-0">
        {lead.proposal && (
          <button 
            onClick={() => onViewStrategy?.(lead)}
            className="w-7 h-7 md:w-8 md:h-8 bg-emerald-500 text-white border border-emerald-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
            title="View Offer of Service"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        )}
        <button 
          onClick={() => !isProcessing && onAdd(lead)}
          disabled={isProcessing}
          className={`w-7 h-7 md:w-8 md:h-8 border shadow-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${isProcessing ? 'bg-amber-500/20 border-amber-500 text-amber-500 opacity-50 cursor-not-allowed' : 'bg-cyan-500 text-white border-cyan-500 shadow-cyan-500/20'}`}
        >
          {isProcessing ? <RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
