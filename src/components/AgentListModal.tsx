
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Brain, Shield, GraduationCap, MessageSquare, ExternalLink, Activity, Info, Edit2, Save, Trash2, RefreshCw, Loader2, Globe, Lightbulb, Check, CheckCircle2, Download, User } from 'lucide-react';
import { AgentStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AgentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentStatus[];
  onUpdateAgent: (id: string, updates: Partial<AgentStatus>) => void;
  onDeleteAgent: (id: string) => void;
  onHandleRecommendation: (agentId: string, recommendationId: string, action: 'accept' | 'reject') => void;
}

const AgentListModal: React.FC<AgentListModalProps> = ({ isOpen, onClose, agents, onUpdateAgent, onDeleteAgent, onHandleRecommendation }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AgentStatus>>({});
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [pendingHeadshots, setPendingHeadshots] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const startEditing = (agent: AgentStatus) => {
    setEditingId(agent.id);
    setEditValues(agent);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = (id: string) => {
    onUpdateAgent(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const regenerateHeadshot = async (agent: AgentStatus) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error('Neural key missing for image generation.');
      // Fallback to picsum if no key
      const randomSeed = Math.random().toString(36).substring(7);
      const newHeadshot = `https://picsum.photos/seed/${agent.firstName}-${randomSeed}-${Date.now()}/400/400`;
      onUpdateAgent(agent.id, { headshotUrl: newHeadshot });
      return;
    }

    setGeneratingIds(prev => new Set(prev).add(agent.id));
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `A high-quality, sophisticated, humanoid 3D avatar headshot of a ${agent.gender} AI agent named ${agent.firstName}. 
        Role: ${agent.role}. 
        Personality: ${agent.personality}. 
        Aesthetic: Futuristic, high-tech, sleek, glowing accents, professional yet approachable. 
        Style: Cinematic 3D render, soft studio lighting, shallow depth of field, 8k resolution. 
        The background should be a subtle, dark neural network or high-tech server room.`;

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Neural link timeout')), 15000)
        )
      ]) as any;

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setPendingHeadshots(prev => ({ ...prev, [agent.id]: imageUrl }));
        setImageErrors(prev => ({ ...prev, [agent.id]: false }));
      } else {
        throw new Error('No image data received from neural link.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isQuotaExceeded = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
      
      if (isQuotaExceeded) {
        console.warn('Neural Link Quota Exceeded (429). Switching to fallback synthesis.');
      } else {
        console.error('Neural Image Generation Failed:', error);
      }

      // Fallback to picsum on error
      const randomSeed = Math.random().toString(36).substring(7);
      const newHeadshot = `https://picsum.photos/seed/${agent.firstName}-${randomSeed}-${Date.now()}/400/400`;
      setPendingHeadshots(prev => ({ ...prev, [agent.id]: newHeadshot }));
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  };

  const saveHeadshot = (agentId: string) => {
    const pendingUrl = pendingHeadshots[agentId];
    if (!pendingUrl) return;
    
    onUpdateAgent(agentId, { headshotUrl: pendingUrl });
    setPendingHeadshots(prev => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-full md:max-w-6xl md:h-[85vh] hud-panel bg-black/90 border-x md:border border-white/10 md:rounded-[2.5rem] overflow-hidden flex flex-col"
          >
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />

            {/* Header */}
            <header className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 md:w-7 md:h-7 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-3xl font-black text-white tracking-[0.1em] md:tracking-[0.2em] uppercase glow-cyan">
                    The_Synapse_System_Team
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest mono">Neural_Network_Active</span>
                    </div>
                    <span className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-widest mono">|</span>
                    <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest mono">{agents.length} Specialized_Agents</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white/50 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </header>

            {/* Agent Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {agents.map((agent) => {
                  const isEditing = editingId === agent.id;
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className="relative group"
                    >
                      <div className="hud-panel p-6 bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 flex flex-col h-full">
                        
                        {/* Agent Header (Centered) */}
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="relative mb-4">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => regenerateHeadshot(agent)}
                              disabled={generatingIds.has(agent.id)}
                              className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-cyan-500/50 transition-all duration-500 relative group/img shadow-2xl bg-black/40"
                            >
                              {imageErrors[agent.id] ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                                  <User className="w-16 h-16 text-white/10 mb-2" />
                                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural_Link_Offline</span>
                                </div>
                              ) : (
                                <img 
                                  src={pendingHeadshots[agent.id] || agent.headshotUrl || `https://picsum.photos/seed/${agent.firstName}/400/400`} 
                                  alt={agent.firstName} 
                                  className={`w-full h-full object-cover transition-all duration-500 ${generatingIds.has(agent.id) ? 'blur-sm opacity-50' : ''}`}
                                  referrerPolicy="no-referrer"
                                  onError={() => setImageErrors(prev => ({ ...prev, [agent.id]: true }))}
                                  onLoad={() => setImageErrors(prev => ({ ...prev, [agent.id]: false }))}
                                />
                              )}
                              <div className={`absolute inset-0 bg-cyan-500/40 flex flex-col items-center justify-center transition-opacity backdrop-blur-sm ${generatingIds.has(agent.id) ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`}>
                                {generatingIds.has(agent.id) ? (
                                  <>
                                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Neural_Synthesis...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-8 h-8 text-white animate-spin-slow mb-2" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{pendingHeadshots[agent.id] ? 'New_Identity_Ready' : 'Regenerate_Identity'}</span>
                                  </>
                                )}
                              </div>
                            </motion.button>
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => regenerateHeadshot(agent)}
                                disabled={generatingIds.has(agent.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
                              >
                                <RefreshCw className={`w-3 h-3 ${generatingIds.has(agent.id) ? 'animate-spin' : ''}`} />
                                {pendingHeadshots[agent.id] ? 'Try_Again' : 'Regenerate'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => saveHeadshot(agent.id)}
                                disabled={!pendingHeadshots[agent.id]}
                                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                  pendingHeadshots[agent.id] 
                                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                    : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Save_to_Profile
                              </motion.button>
                            </div>
                            <div className={`absolute top-0 right-0 w-6 h-6 rounded-full border-4 border-black ${
                              agent.status === 'active' ? 'bg-emerald-500' : 
                              agent.status === 'idle' ? 'bg-amber-500' : 'bg-red-500'
                            } shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
                          </div>
                          
                          <div className="w-full">
                            {isEditing ? (
                              <div className="flex flex-col gap-2 mb-2">
                                <input 
                                  className="w-full bg-black/40 border border-white/10 px-3 py-2 text-sm text-white rounded-xl outline-none focus:border-cyan-500 text-center"
                                  value={editValues.firstName || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, firstName: e.target.value }))}
                                  placeholder="First Name"
                                />
                                <input 
                                  className="w-full bg-black/40 border border-white/10 px-3 py-2 text-sm text-white rounded-xl outline-none focus:border-cyan-500 text-center"
                                  value={editValues.lastName || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, lastName: e.target.value }))}
                                  placeholder="Last Name"
                                />
                              </div>
                            ) : (
                              <h4 className="text-2xl font-black text-white tracking-tight truncate mb-1">
                                {agent.firstName} {agent.lastName}
                              </h4>
                            )}
                            
                            {isEditing ? (
                              <input 
                                className="w-full bg-black/40 border border-white/10 px-3 py-2 text-[10px] text-cyan-400 uppercase mono rounded-xl outline-none focus:border-cyan-500 text-center"
                                value={editValues.role || ''}
                                onChange={(e) => setEditValues(prev => ({ ...prev, role: e.target.value }))}
                                placeholder="Role"
                              />
                            ) : (
                              <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em] mono truncate mb-2">
                                {agent.role}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-[10px] text-white/40 uppercase tracking-widest mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {agent.gender}
                              </span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {agent.language}
                              </span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {agent.age}Y
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-3 h-3 text-cyan-400" />
                              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Efficiency</span>
                            </div>
                            <p className="text-sm font-black text-white mono">{agent.efficiency}%</p>
                          </div>
                          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-3 h-3 text-fuchsia-400" />
                              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Intelligence</span>
                            </div>
                            <p className="text-sm font-black text-white mono">{agent.intelligence}</p>
                          </div>
                        </div>

                        {/* Responsibilities */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-3 h-3 text-emerald-400" />
                              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Responsibilities</span>
                            </div>
                            {isEditing ? (
                              <textarea 
                                className="w-full bg-black/40 border border-white/10 p-2 text-[10px] text-slate-400 rounded outline-none focus:border-cyan-500 h-20 resize-none"
                                value={editValues.responsibilities || ''}
                                onChange={(e) => setEditValues(prev => ({ ...prev, responsibilities: e.target.value }))}
                              />
                            ) : (
                              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                                "{agent.responsibilities}"
                              </p>
                            )}
                          </div>

                          <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                              {isEditing ? (
                                <input 
                                  className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] text-white rounded outline-none focus:border-cyan-500"
                                  value={editValues.educationalBackground || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, educationalBackground: e.target.value }))}
                                />
                              ) : (
                                <p className="text-[10px] text-white/70 font-medium tracking-wide">
                                  {agent.educationalBackground}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                              {isEditing ? (
                                <div className="flex-1 flex gap-2">
                                  <input 
                                    className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] text-white rounded outline-none focus:border-cyan-500"
                                    value={editValues.personality || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, personality: e.target.value }))}
                                    placeholder="Personality"
                                  />
                                  <input 
                                    className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] text-white rounded outline-none focus:border-cyan-500"
                                    value={editValues.tone || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, tone: e.target.value }))}
                                    placeholder="Tone"
                                  />
                                </div>
                              ) : (
                                <p className="text-[10px] text-white/70 font-medium tracking-wide">
                                  Persona: <span className="text-fuchsia-400">{agent.personality}</span> // Tone: <span className="text-cyan-400">{agent.tone}</span>
                                </p>
                              )}
                            </div>
                            {isEditing && (
                              <div className="flex items-center gap-3">
                                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                                <input 
                                  className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] text-white rounded outline-none focus:border-cyan-500"
                                  value={editValues.language || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, language: e.target.value }))}
                                  placeholder="Default Language"
                                />
                              </div>
                            )}
                          </div>

                          {/* Memory Link */}
                          <motion.a
                            href={agent.memoryLink}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl group/link mb-4"
                          >
                            <div className="flex items-center gap-2">
                              <Brain className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Neural_Memory_Vault</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover/link:translate-x-1 transition-transform" />
                          </motion.a>

                          {/* Recommendations Section */}
                          {agent.recommendations && agent.recommendations.length > 0 && (
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Strategic_Recommendations</h5>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                {agent.recommendations.map((rec) => (
                                  <div key={rec.id} className={`p-3 rounded-xl border border-white/5 bg-black/20 group relative ${
                                    rec.status === 'implemented' ? 'opacity-50 grayscale' : ''
                                  }`}>
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">
                                          {rec.type}
                                        </span>
                                        <h6 className="text-[10px] font-black text-white uppercase">{rec.title}</h6>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[7px] font-black text-slate-600 uppercase">Impact:</span>
                                        <span className="text-[7px] font-black text-emerald-500 uppercase">{rec.impact}</span>
                                      </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 leading-tight mb-2">{rec.description}</p>
                                    
                                    {rec.status === 'proposed' && (
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => (onHandleRecommendation as any)(agent.id, rec.id, 'accept')}
                                          className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-1"
                                        >
                                          <Check className="w-3 h-3" /> Accept
                                        </button>
                                        <button 
                                          onClick={() => (onHandleRecommendation as any)(agent.id, rec.id, 'reject')}
                                          className="flex-1 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                          <X className="w-3 h-3" /> Dismiss
                                        </button>
                                      </div>
                                    )}
                                    {rec.status === 'implemented' && (
                                      <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                                        <CheckCircle2 className="w-3 h-3" /> Implemented
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons (Bottom) */}
                          <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => handleSave(agent.id)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save
                                </button>
                                <button 
                                  onClick={cancelEditing}
                                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditing(agent)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button 
                                  onClick={() => onDeleteAgent(agent.id)}
                                  className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-black transition-all duration-300 group/del shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                  title="Purge Agent"
                                >
                                  <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-[8px] md:text-[10px] text-white/30 mono uppercase tracking-[0.1em] md:tracking-[0.2em]">
                <span>Team_Status: Synchronized</span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                <span>Security_Protocol: Zero_Trust</span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                <span>Last_Sync: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">AJA_Supervised_Team</span>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AgentListModal;
