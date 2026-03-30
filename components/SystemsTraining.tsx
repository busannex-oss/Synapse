
import React, { useState } from 'react';
import { Video, Play, Loader2, ShieldCheck, Cpu, Sparkles, Film, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { VideoGeneration, VideoRoute } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemsTrainingProps {
  videos: VideoGeneration[];
  onGenerateVideo: (prompt: string, type: VideoGeneration['type']) => void;
  onDeleteVideo: (id: string) => void;
  onSaveVideo: (id: string) => void;
  onRegenerateVideo: (id: string) => void;
  activeVideoRoute: VideoRoute;
  isGenerating: boolean;
}

const SystemsTraining: React.FC<SystemsTrainingProps> = ({ 
  videos, 
  onGenerateVideo, 
  onDeleteVideo, 
  onSaveVideo,
  onRegenerateVideo,
  activeVideoRoute, 
  isGenerating 
}) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<VideoGeneration['type']>('tutorial');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateVideo(prompt, type);
    setPrompt('');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <header className="flex justify-between items-center bg-white/5 p-8 border border-white/10 rounded-[2rem]">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Film className="w-8 h-8 text-fuchsia-500" /> Systems_Training_Dept
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mono mt-1 tracking-widest">
            Managed by: Library_Assistant_AI_Agent :: Neural_Asset_Curation_Stack
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-fuchsia-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className="text-[10px] font-black text-fuchsia-500 uppercase mono">Stack_Status: {isGenerating ? 'Synthesizing' : 'Idle'}</span>
          </div>
          <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-3">
             <span className="text-[10px] font-black text-cyan-500 uppercase mono">Active_Node: {activeVideoRoute}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* VIDEO GENERATION CONSOLE */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <section className="hud-panel p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-500 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Synthesis_Controller
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Video_Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['tutorial', 'demonstration', 'briefing'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                        type === t 
                          ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500' 
                          : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Neural_Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the instructional sequence..."
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-fuchsia-500 transition-all resize-none mono"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all ${
                  isGenerating || !prompt.trim()
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.3)]'
                }`}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Synthesizing_Neural_Frames...' : 'Initiate_Synthesis'}
              </button>
            </form>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
               <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Fallback_Chain_Priority
               </h4>
               <div className="space-y-2">
                  {[
                    { name: 'VEO_3_1', status: activeVideoRoute === 'VEO_3_1' ? 'active' : 'standby' },
                    { name: 'SORA', status: activeVideoRoute === 'SORA' ? 'active' : 'standby' },
                    { name: 'RUNWAY_GEN_3', status: activeVideoRoute === 'RUNWAY_GEN_3' ? 'active' : 'standby' },
                    { name: 'PIKA_2_0', status: activeVideoRoute === 'PIKA_2_0' ? 'active' : 'standby' }
                  ].map(node => (
                    <div key={node.name} className="flex items-center justify-between px-2 py-1 bg-black/40 rounded border border-white/5">
                      <span className="text-[8px] font-bold mono text-slate-400">{node.name}</span>
                      <span className={`text-[7px] font-black uppercase ${node.status === 'active' ? 'text-fuchsia-500 animate-pulse' : 'text-slate-700'}`}>{node.status}</span>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        </div>

        {/* VIDEO ASSET LIBRARY */}
        <div className="col-span-8 hud-panel p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Video className="w-4 h-4" /> Neural_Asset_Library
              </h3>
              <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[7px] font-black text-cyan-500 uppercase tracking-widest">
                Storage_Optimized
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-500 uppercase mono">{videos.length} Assets_Stored</span>
              {videos.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm('Purge all neural assets from library?')) {
                      videos.forEach(v => onDeleteVideo(v.id));
                    }
                  }}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Purge_All
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white/5 border rounded-2xl overflow-hidden group transition-all ${
                    video.status === 'awaiting_review' 
                      ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                      : 'border-white/10 hover:border-fuchsia-500/30'
                  }`}
                >
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                    {(video.status === 'completed' || video.status === 'awaiting_review') && video.url ? (
                      <video 
                        src={video.url} 
                        className={`w-full h-full object-cover transition-opacity ${video.status === 'awaiting_review' ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                        controls
                        autoPlay={video.status === 'awaiting_review'}
                      />
                    ) : video.status === 'generating' ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
                        <span className="text-[8px] font-black text-fuchsia-500 uppercase tracking-widest animate-pulse">Neural_Rendering...</span>
                      </div>
                    ) : video.status === 'failed' ? (
                      <div className="flex flex-col items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Synthesis_Failed</span>
                      </div>
                    ) : (
                      <Play className="w-12 h-12 text-white/20" />
                    )}
                    
                    <div className="absolute top-4 left-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[7px] font-black text-white uppercase tracking-widest">
                      {video.type}
                    </div>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[7px] font-black text-fuchsia-500 uppercase tracking-widest mono">
                      {video.route}
                    </div>

                    {video.status === 'awaiting_review' && (
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent flex flex-col gap-3">
                        <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Quality_Check_Required</div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onSaveVideo(video.id)}
                            className="flex-1 py-1.5 bg-emerald-500 text-black text-[8px] font-black uppercase rounded hover:bg-emerald-400 transition-all"
                          >
                            Save_To_Library
                          </button>
                          <button 
                            onClick={() => onRegenerateVideo(video.id)}
                            className="flex-1 py-1.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded hover:bg-amber-400 transition-all"
                          >
                            Regenerate
                          </button>
                          <button 
                            onClick={() => onDeleteVideo(video.id)}
                            className="flex-1 py-1.5 bg-red-500 text-white text-[8px] font-black uppercase rounded hover:bg-red-400 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`${video.status === 'completed' ? 'p-4' : 'p-3'} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-white uppercase truncate pr-4">{video.videoName || video.prompt}</p>
                        <p className="text-[6px] text-slate-600 font-bold mono uppercase">{video.systemId}</p>
                      </div>
                      {video.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[8px] text-slate-400 uppercase mono truncate">{video.prompt}</p>
                      <div className="flex items-center justify-between text-[7px] font-bold mono text-slate-500 uppercase">
                        <div className="flex flex-col">
                          <span>{new Date(video.timestamp).toLocaleDateString()} {new Date(video.timestamp).toLocaleTimeString()}</span>
                          <span className="text-cyan-500">USER: {video.userGenerating || 'SYSTEM'}</span>
                        </div>
                        {video.status === 'completed' && (
                          <button 
                            onClick={() => onDeleteVideo(video.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-all"
                            title="Purge Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {videos.length === 0 && !isGenerating && (
              <div className="col-span-2 py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <Film className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-[10px] text-slate-600 uppercase mono tracking-widest">No neural assets synthesized yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemsTraining;
