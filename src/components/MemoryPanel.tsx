
import React, { useState, useEffect } from 'react';
import { Brain, Search, Plus, Trash2, Clock, ShieldCheck, Database, Cpu, Zap, Activity } from 'lucide-react';
import { AgentStatus, MemoryEntry } from '../types';
import { getAgentMemories, saveMemory, clearMemories } from '../services/memoryService';
import { motion, AnimatePresence } from 'motion/react';

interface MemoryPanelProps {
  agents: AgentStatus[];
  onLog: (log: any) => void;
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ agents, onLog }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [metadata, setMetadata] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(MemoryEntry & { score: number })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  useEffect(() => {
    const loadMemories = async () => {
      if (selectedAgentId) {
        const agentMemories = await getAgentMemories(selectedAgentId);
        setMemories(agentMemories);
        setSearchResults([]);
        setSearchQuery('');
      }
    };
    loadMemories();
  }, [selectedAgentId]);

  const handleAddMemory = async () => {
    if (!newMemory.trim() || !selectedAgentId) return;
    setIsAdding(true);
    try {
      let parsedMetadata = undefined;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch (e) {
          onLog({ type: 'error', module: 'MEMORY_LOG', message: 'Neural metadata syntax error. Ensure valid JSON format.' });
          setIsAdding(false);
          return;
        }
      }
      await saveMemory(selectedAgentId, newMemory, parsedMetadata);
      const agentMemories = await getAgentMemories(selectedAgentId);
      setMemories(agentMemories);
      setNewMemory('');
      setMetadata('');
      onLog({ type: 'success', module: 'MEMORY_LOG', message: `Neural memory committed for ${selectedAgent?.name}. Vector embedding generated.` });
    } catch (error: any) {
      onLog({ type: 'error', module: 'MEMORY_LOG', message: `Memory commit failure: ${error.message}` });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedAgentId) return;
    setIsSearching(true);
    try {
      const results = await getAgentMemories(selectedAgentId, searchQuery);
      setSearchResults(results as (MemoryEntry & { score: number })[]);
      onLog({ type: 'info', module: 'MEMORY_LOG', message: `Neural retrieval complete for query: "${searchQuery}". ${results.length} matches found.` });
    } catch (error: any) {
      onLog({ type: 'error', module: 'MEMORY_LOG', message: `Neural retrieval failure: ${error.message}` });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = async () => {
    await clearMemories(selectedAgentId);
    setMemories([]);
    setSearchResults([]);
    setShowPurgeConfirm(false);
    onLog({ type: 'warning', module: 'MEMORY_LOG', message: `Neural memory purged for ${selectedAgent?.name}.` });
  };

  return (
    <div className="flex-1 flex gap-4 h-full overflow-hidden">
      {/* Agent Sidebar */}
      <div className="w-64 hud-panel p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Agent_Nodes</h3>
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className={`flex flex-col p-3 rounded-xl border transition-all text-left ${
              selectedAgentId === agent.id 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold truncate">{agent.name}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(0,242,255,0.5)]' : 'bg-slate-600'}`}></div>
            </div>
            <span className="text-[8px] opacity-60 truncate">{agent.role}</span>
          </button>
        ))}
      </div>

      {/* Memory Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header & Search */}
        <div className="hud-panel p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Brain className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">{selectedAgent?.name} :: NEURAL_MEMORY</h2>
                <p className="text-[9px] text-slate-500 mono uppercase">Vector Database Interface SYSTEM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPurgeConfirm(true)}
                className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                title="Purge Memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showPurgeConfirm && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Confirm Neural Purge for {selectedAgent?.name}?</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPurgeConfirm(false)}
                      className="px-4 py-1.5 bg-white/5 text-slate-400 text-[8px] font-black uppercase rounded-lg hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleClear}
                      className="px-4 py-1.5 bg-red-500 text-white text-[8px] font-black uppercase rounded-lg hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      Confirm Purge
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Query neural patterns (Vector Search)..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 bg-cyan-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isSearching ? <Activity className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              Semantic Search
            </button>
          </div>
        </div>

        {/* Memory List / Search Results */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main List */}
          <div className="flex-1 hud-panel p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {searchResults.length > 0 ? 'Search_Results' : 'Persistent_Logs'}
              </h3>
              {searchResults.length > 0 && (
                <button onClick={() => setSearchResults([])} className="text-[8px] font-bold text-cyan-500 uppercase hover:underline">Clear Results</button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {(searchResults.length > 0 ? searchResults : memories).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                  <Database className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No neural data found</p>
                </div>
              ) : (
                (searchResults.length > 0 ? searchResults : memories).map((memory, idx) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-2xl border ${
                      'score' in memory 
                        ? 'bg-cyan-500/5 border-cyan-500/20' 
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-[8px] text-slate-500 mono">{new Date(memory.timestamp).toLocaleString()}</span>
                      </div>
                      {'score' in memory && (
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${(memory as any).score * 100}%` }}></div>
                          </div>
                          <span className="text-[8px] font-bold text-cyan-500 mono">{(memory as any).score.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{memory.content}</p>
                    {memory.metadata && (
                      <div className="mt-3 p-2 bg-black/40 rounded-lg border border-white/5">
                        <pre className="text-[9px] text-cyan-400/60 font-mono overflow-x-auto">
                          {JSON.stringify(memory.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-white/5 rounded text-[7px] font-bold text-slate-500 uppercase mono">ID: {memory.id}</div>
                      <div className="px-2 py-0.5 bg-white/5 rounded text-[7px] font-bold text-slate-500 uppercase mono">DIM: {memory.embedding.length}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Add Memory Panel */}
          <div className="w-80 hud-panel p-6 flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Commit_Neural_Node</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">Memory Content</label>
              <textarea
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="Enter data to commit to neural memory..."
                className="h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all resize-none custom-scrollbar"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">Metadata (JSON - Optional)</label>
              <textarea
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='{"source": "manual", "priority": "high"}'
                className="h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-cyan-400/70 font-mono focus:outline-none focus:border-cyan-500/50 transition-all resize-none custom-scrollbar"
              />
            </div>

            <button
              onClick={handleAddMemory}
              disabled={isAdding || !newMemory.trim()}
              className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase rounded-2xl hover:bg-cyan-500 hover:text-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isAdding ? <Activity className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              Commit to Memory
            </button>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold text-cyan-500 uppercase">Integrity_Guard</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-relaxed uppercase">
                All committed data is processed via Gemini-Embedding-2-Preview. Vector representations are persistent and searchable across system reboots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryPanel;
