
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Mail, MessageSquare, Mic, Layout, TrendingUp, DollarSign, Target, ShieldCheck, Mailbox, PhoneCall, Eye, RefreshCcw, CheckCircle2, Brain, AlertTriangle, Globe, Clock } from 'lucide-react';
import { BusinessStrategy, Lead, SystemLog, AIRoute } from '../types';
import { regenerateLeadAsset, generateStrategy } from '../services/geminiService';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdateLead?: (lead: Lead) => void;
  onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
  onRouteSwitch?: (route: AIRoute) => void;
}

const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, lead, onUpdateLead, onLog, onShowToast, onRouteSwitch }) => {
  const [reviewingAsset, setReviewingAsset] = useState<{
    type: 'outreachEmail' | 'pitchText' | 'voiceScript' | 'postalLetter' | 'aiReceptionistScript' | 'proposalDraft';
    content: string;
    label: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  if (!lead) return null;
  const strategy = lead.proposal;

  const handleGenerateStrategy = async () => {
    if (!onLog || !onUpdateLead) return;
    
    setIsGeneratingStrategy(true);
    onLog({ type: 'info', module: 'STRATEGY_SYNTHESIS', message: `Initiating full neural synthesis for ${lead.name}...` });
    
    try {
      const newStrategy = await generateStrategy(
        lead,
        onLog,
        onRouteSwitch
      );
      
      const updatedLead = {
        ...lead,
        proposal: newStrategy,
        queue: 'synthesis' as const
      };
      onUpdateLead(updatedLead);
      onShowToast?.('Neural Strategy Synthesized Successfully', 'success');
    } catch (error: any) {
      onLog({ type: 'error', module: 'STRATEGY_SYNTHESIS', message: `Synthesis failed: ${error.message}` });
      onShowToast?.('Synthesis Failed', 'error');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!reviewingAsset || !onLog || !onUpdateLead) return;
    
    setIsRegenerating(true);
    try {
      const newContent = await regenerateLeadAsset(
        lead,
        reviewingAsset.type,
        onLog,
        () => {} // No route switch needed here
      );
      
      setReviewingAsset(prev => prev ? { ...prev, content: newContent } : null);
      
      // Update lead in master DB
      const updatedLead = {
        ...lead,
        proposal: {
          ...lead.proposal!,
          [reviewingAsset.type]: newContent
        }
      };
      onUpdateLead(updatedLead);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAccept = () => {
    setReviewingAsset(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full h-full md:max-w-5xl md:max-h-[90vh] bg-zinc-950 border-x md:border border-cyan-500/30 md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,242,255,0.15)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-b from-cyan-500/5 to-transparent gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-cyan-500 text-black text-[8px] md:text-[10px] font-black uppercase rounded-lg shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                      Neural_Offer_V1.5
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mono">ID: {lead.id.slice(0, 8)}</span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-widest mt-1 md:mt-2 flex items-center gap-3 md:gap-4">
                    <FileText className="w-5 h-5 md:w-7 md:h-7 text-cyan-500" />
                    <span className="truncate">{lead.name}</span>
                  </h2>
                  <p className="text-[11px] md:text-[13px] font-black text-cyan-400 uppercase tracking-widest pl-8 md:pl-11 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    {lead.address}
                  </p>
                  <div className="flex items-center gap-3 mt-1 pl-8 md:pl-11">
                    <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                      Synthesized Neural Strategy
                    </p>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                      {lead.industry} ({lead.location})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-end">
                  {strategy && (
                    <button 
                      onClick={handleGenerateStrategy}
                      disabled={isGeneratingStrategy}
                      className="p-2 md:p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl md:rounded-2xl transition-all group flex items-center gap-2 md:gap-3 disabled:opacity-50"
                      title="Regenerate Full Strategy"
                    >
                      <RefreshCcw className={`w-4 h-4 md:w-5 md:h-5 text-cyan-500 ${isGeneratingStrategy ? 'animate-spin' : ''}`} />
                      <span className="text-[8px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest hidden sm:block">Regenerate</span>
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl transition-all group"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 md:space-y-12">
                {(!strategy || !strategy.analysis || !strategy.valueProposition) ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <Brain className={`w-10 h-10 text-cyan-500 ${isGeneratingStrategy ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest">Neural_Strategy_Pending</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mono">AJA has not yet synthesized a strategy for this node.</p>
                    </div>
                    <button
                      onClick={handleGenerateStrategy}
                      disabled={isGeneratingStrategy}
                      className="px-12 py-4 bg-cyan-500 text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] flex items-center gap-3 disabled:opacity-50"
                    >
                      {isGeneratingStrategy ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      {isGeneratingStrategy ? 'Synthesizing_Neural_Pathways...' : 'Initiate_Synthesis'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Free Comprehensive AI Audit */}
                    {strategy.aiAudit && (
                      <section className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Free_Comprehensive_AI_Audit</h3>
                          </div>
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                            COMPLIMENTARY_ASSET
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-3xl space-y-3 group hover:bg-emerald-500/[0.05] transition-all">
                            <div className="flex items-center gap-2 text-emerald-500">
                              <Brain className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">How_It_Helps</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {strategy.aiAudit.howItHelps}
                            </p>
                          </div>

                          <div className="p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-3xl space-y-3 group hover:bg-amber-500/[0.05] transition-all">
                            <div className="flex items-center gap-2 text-amber-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Why_Now</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {strategy.aiAudit.whyNow}
                            </p>
                          </div>

                          <div className="p-6 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-3xl space-y-3 group hover:bg-cyan-500/[0.05] transition-all">
                            <div className="flex items-center gap-2 text-cyan-500">
                              <Target className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Strategic_Uncoverings</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {strategy.aiAudit.strategicUncoverings}
                            </p>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Executive Summary */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="w-5 h-5 text-cyan-500" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Executive_Analysis</h3>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Globe className="w-24 h-24 text-cyan-500 -rotate-12" />
                          </div>
                          <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Globe className="w-2.5 h-2.5" />
                                Neural_Foundation: Website_Centric
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-300 font-medium">
                              {strategy.analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue_Vectors</h3>
                        </div>
                        <div className="space-y-3">
                          {strategy.revenueOpportunities?.map((opp, idx) => (
                            <div key={idx} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                {idx + 1}
                              </div>
                              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{opp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Value Proposition */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-fuchsia-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Value_Proposition</h3>
                      </div>
                      <div className="p-8 bg-fuchsia-500/[0.03] border border-fuchsia-500/10 rounded-[2rem] relative overflow-hidden">
                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
                         <p className="text-lg font-black text-white tracking-tight leading-relaxed italic">
                           "{strategy.valueProposition}"
                         </p>
                      </div>
                    </section>

                    {/* Service Cost Breakdown */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Service_Cost_Architecture</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategy.serviceCostBreakdown?.map((item, idx) => {
                          const isSignature = item.service.toLowerCase().includes('30-year') || item.service.toLowerCase().includes('30 year');
                          return (
                            <div key={idx} className={`p-6 bg-white/[0.02] border rounded-3xl group transition-all ${isSignature ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(0,242,255,0.1)]' : 'border-white/10 hover:border-emerald-500/30'}`}>
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSignature ? 'text-cyan-400' : 'text-emerald-500'}`}>
                                    {item.service}
                                  </span>
                                  {isSignature && (
                                    <span className="text-[7px] font-black text-cyan-500/60 uppercase tracking-[0.2em]">Signature_Asset</span>
                                  )}
                                </div>
                                <span className="text-lg font-black text-white mono">${item.cost.toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase leading-relaxed font-medium">{item.description}</p>
                            </div>
                          );
                        })}
                        {/* Total Row */}
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex flex-col justify-center">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total_Project_Value</span>
                          <span className="text-2xl font-black text-white mono">
                            ${strategy.serviceCostBreakdown?.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Assets Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Proposal Draft */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-cyan-500" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Proposal_Draft_V1</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'proposalDraft', content: strategy.proposalDraft, label: 'Proposal_Draft_V1' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.proposalDraft}
                        </div>
                      </div>

                      {/* Outreach Email */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-amber-500" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Outreach_Vector_A</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'outreachEmail', content: strategy.outreachEmail, label: 'Outreach_Vector_A' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.outreachEmail}
                        </div>
                      </div>

                      {/* Pitch Text */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Pitch_Vector_B</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'pitchText', content: strategy.pitchText, label: 'Pitch_Vector_B' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.pitchText}
                        </div>
                      </div>

                      {/* Voice Script */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mic className="w-4 h-4 text-fuchsia-500" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Voice_Synthesis_Script</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'voiceScript', content: strategy.voiceScript, label: 'Voice_Synthesis_Script' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-fuchsia-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.voiceScript}
                        </div>
                      </div>

                      {/* Postal Letter */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mailbox className="w-4 h-4 text-amber-600" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Physical_Postal_Letter</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'postalLetter', content: strategy.postalLetter, label: 'Physical_Postal_Letter' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.postalLetter}
                        </div>
                      </div>

                      {/* AI Receptionist Demo */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PhoneCall className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AI_Receptionist_Demo_Script</h4>
                          </div>
                          <button 
                            onClick={() => setReviewingAsset({ type: 'aiReceptionistScript', content: strategy.aiReceptionistScript, label: 'AI_Receptionist_Demo_Script' })}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                          </button>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 mono leading-relaxed whitespace-pre-wrap">
                          {strategy.aiReceptionistScript}
                        </div>
                      </div>
                    </section>

                    {/* Deck Outline */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Layout className="w-5 h-5 text-cyan-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural_Deck_Architecture</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {strategy.pitchDeckOutline?.map((slide, idx) => (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-cyan-500/30 transition-all">
                            <div className="text-[9px] font-black text-cyan-500 mb-2">SLIDE_{idx + 1}</div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{slide}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/10 bg-black/60 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected_Yield</span>
                    <span className="text-xl font-black text-emerald-400 mono">${(lead.revenuePerLead || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Conversion_Probability</span>
                    <span className="text-xl font-black text-cyan-400 mono">{lead.readinessScore}%</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => onShowToast?.('Exporting Neural Strategy to PDF...', 'info')}
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Export_PDF
                  </button>
                  <button 
                    onClick={() => onShowToast?.('Initiating Multi-Channel Outreach Sequence...', 'success')}
                    className="px-8 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                  >
                    Execute_Outreach
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewingAsset && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRegenerating && setReviewingAsset(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">{reviewingAsset.label}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Neural_Asset_Review_Protocol</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isRegenerating && setReviewingAsset(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    {isRegenerating && (
                      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <div className="flex flex-col items-center gap-4">
                          <RefreshCcw className="w-8 h-8 text-cyan-500 animate-spin" />
                          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Regenerating_Neural_Asset...</span>
                        </div>
                      </div>
                    )}
                    <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[2.5rem] text-sm text-slate-300 mono leading-relaxed whitespace-pre-wrap min-h-[400px]">
                      {reviewingAsset.content || (
                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                          <AlertTriangle className="w-12 h-12 mb-4" />
                          <p className="text-xs uppercase tracking-widest font-black">No_Content_Detected</p>
                          <p className="text-[10px] mt-2">Neural asset synthesis may have failed or is pending.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center">
                <button 
                  onClick={() => !isRegenerating && setReviewingAsset(null)}
                  className="px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel_Review
                </button>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    Regenerate_Asset
                  </button>
                  <button 
                    onClick={handleAccept}
                    disabled={isRegenerating}
                    className="px-10 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept_&_Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StrategyModal;
