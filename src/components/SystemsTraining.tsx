
import React, { useState } from 'react';
import { Video, Play, Loader2, ShieldCheck, Cpu, Sparkles, Film, AlertTriangle, CheckCircle2, Trash2, Activity, Camera, Monitor, Square } from 'lucide-react';
import { VideoGeneration, VideoRoute, SystemLog } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import HudCorners from './HudCorners';
import ContextualLog from './ContextualLog';

interface SystemsTrainingProps {
  videos: VideoGeneration[];
  onGenerateVideo: (prompt: string, type: VideoGeneration['type'], options?: { 
    bgPrompt?: string; 
    overlayPrompt?: string; 
    overlayOpacity?: number; 
    overlayBlendMode?: VideoGeneration['overlayBlendMode']; 
    companyName?: string;
    codec?: VideoGeneration['codec'];
    resolution?: VideoGeneration['resolution'];
  }) => void;
  onAddVideo: (video: VideoGeneration) => void;
  onDeleteVideo: (id: string) => void;
  isGenerating: boolean;
  defaultOverlayOpacity: number;
  defaultOverlayBlendMode: VideoGeneration['overlayBlendMode'];
  logs: SystemLog[];
}

const SystemsTraining: React.FC<SystemsTrainingProps> = ({ 
  videos, 
  onGenerateVideo, 
  onAddVideo,
  onDeleteVideo, 
  isGenerating,
  defaultOverlayOpacity,
  defaultOverlayBlendMode,
  logs
}) => {
  const [prompt, setPrompt] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [bgPrompt, setBgPrompt] = useState('');
  const [overlayPrompt, setOverlayPrompt] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(defaultOverlayOpacity);
  const [overlayBlendMode, setOverlayBlendMode] = useState<VideoGeneration['overlayBlendMode']>(defaultOverlayBlendMode);
  const [type, setType] = useState<VideoGeneration['type']>('tutorial');
  const [codec, setCodec] = useState<VideoGeneration['codec']>('H.264');
  const [resolution, setResolution] = useState<VideoGeneration['resolution']>('720p');
  const [searchQuery, setSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSource, setRecordingSource] = useState<'camera' | 'screen' | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const videoPreviewRef = React.useRef<HTMLVideoElement | null>(null);

  const startRecording = async (source: 'camera' | 'screen') => {
    try {
      const stream = source === 'camera' 
        ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const videoId = Math.random().toString(36).substr(2, 9);
        
        const newVideo: VideoGeneration = {
          id: videoId,
          timestamp: new Date().toISOString(),
          prompt: `Live Capture: ${source.toUpperCase()}`,
          status: 'completed',
          url,
          route: 'LIVE_CAPTURE',
          type: 'demonstration',
          videoName: `CAPTURE_${source.toUpperCase()}_${Date.now()}`,
          userGenerating: 'busannex@gmail.com',
          codec: 'H.264',
          resolution: '720p'
        };

        onAddVideo(newVideo);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingSource(null);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSource(source);
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const filteredVideos = videos.filter(v => 
    (v.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.videoName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.bgPrompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.overlayPrompt?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (v.companyName?.toLowerCase().includes(companySearchQuery.toLowerCase()) || !companySearchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateVideo(prompt, type, { 
      bgPrompt, 
      overlayPrompt, 
      overlayOpacity, 
      overlayBlendMode, 
      companyName,
      codec,
      resolution
    });
    setPrompt('');
    setCompanyName('');
    setBgPrompt('');
    setOverlayPrompt('');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <header className="flex justify-between items-center bg-white/5 p-8 border border-white/10 rounded-[2rem]">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Film className="w-8 h-8 text-fuchsia-500" /> Systems_Training_Dept
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mono mt-1 tracking-widest">
            Managed by: Systems_Training_AI_Agent :: Neural_Video_Synthesis_Stack
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-fuchsia-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className="text-[10px] font-black text-fuchsia-500 uppercase mono">Stack_Status: {isGenerating ? 'Synthesizing' : 'Idle'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* VIDEO GENERATION CONSOLE */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <section className="hud-panel p-6 space-y-6 relative">
            <HudCorners />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-500 flex items-center gap-2 relative z-10">
              <Cpu className="w-4 h-4" /> Synthesis_Controller
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Live_Capture_Module
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => isRecording ? stopRecording() : startRecording('camera')}
                    className={`py-3 rounded-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase transition-all border ${
                      recordingSource === 'camera'
                        ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/20'
                    }`}
                  >
                    {isRecording && recordingSource === 'camera' ? <Square className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {isRecording && recordingSource === 'camera' ? 'Stop_Capture' : 'Camera_Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => isRecording ? stopRecording() : startRecording('screen')}
                    className={`py-3 rounded-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase transition-all border ${
                      recordingSource === 'screen'
                        ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/20'
                    }`}
                  >
                    {isRecording && recordingSource === 'screen' ? <Square className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                    {isRecording && recordingSource === 'screen' ? 'Stop_Capture' : 'Screen_Link'}
                  </button>
                </div>
                {isRecording && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-red-500/30 relative">
                    <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-red-500/80 rounded text-[7px] font-black text-white uppercase animate-pulse">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" /> REC
                    </div>
                  </div>
                )}
              </div>

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
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-fuchsia-500 transition-all resize-none mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Company_Name (Optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 transition-all mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Background_Asset (Optional)</label>
                <input
                  type="text"
                  value={bgPrompt}
                  onChange={(e) => setBgPrompt(e.target.value)}
                  placeholder="e.g. Cyberpunk city, data center..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 transition-all mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Overlay_Asset (Optional)</label>
                <input
                  type="text"
                  value={overlayPrompt}
                  onChange={(e) => setOverlayPrompt(e.target.value)}
                  placeholder="e.g. Digital HUD, scanning grid..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 transition-all mono"
                />
              </div>

              {overlayPrompt && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Opacity: {Math.round(overlayOpacity * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Blend_Mode</label>
                    <select
                      value={overlayBlendMode}
                      onChange={(e) => setOverlayBlendMode(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-fuchsia-500 transition-all mono"
                    >
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                      <option value="lighten">Lighten</option>
                      <option value="darken">Darken</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Video_Codec</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['H.264', 'VP9'] as const).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCodec(c)}
                        className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${
                          codec === c 
                            ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500' 
                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Resolution</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['720p', '1080p'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResolution(r)}
                        className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${
                          resolution === r 
                            ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-500' 
                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
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
                {isGenerating ? <Loader2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Synthesizing_Neural_Frames...' : 'Initiate_Synthesis'}
              </button>
            </form>

            {isGenerating && (
              <div className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3 animate-pulse" /> Neural_Telemetry
                  </h4>
                  <span className="text-[7px] font-bold text-fuchsia-400 mono animate-pulse">LIVE_STREAM</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {logs
                    .filter(l => l.module === 'VIDEO_SYNTHESIS' || l.module === 'AJA_SDK' || l.module === 'FFMPEG_ENGINE')
                    .slice(-5)
                    .reverse()
                    .map((log, i) => (
                      <div key={i} className={`text-[8px] mono flex gap-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
               <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Fallback_Chain_Priority
               </h4>
               <div className="space-y-2">
                  {[
                    { name: 'AJA_SYSTEM_NEURAL_PROCESSING', status: 'standby' },
                    { name: 'WEBCODECS_NEURAL', status: 'standby' },
                    { name: 'FFMPEG_GEMINI', status: 'standby' },
                    { name: 'VEO_3_1', status: 'standby' },
                    { name: 'SORA', status: 'standby' },
                    { name: 'RUNWAY_GEN_3', status: 'standby' },
                    { name: 'PIKA_2_0', status: 'standby' }
                  ].map(node => (
                    <div key={node.name} className="flex items-center justify-between px-2 py-1 bg-black/40 rounded border border-white/5">
                      <span className="text-[8px] font-bold mono text-slate-400">{node.name}</span>
                      <span className={`text-[7px] font-black uppercase ${node.status === 'active' ? 'text-fuchsia-500 animate-pulse' : 'text-slate-700'}`}>{node.status}</span>
                    </div>
                  ))}
               </div>
            </div>

            <ContextualLog 
              logs={logs} 
              module="VIDEO_SYNTHESIS" 
              title="Synthesis_Telemetry_Stream" 
              limit={5} 
            />
          </section>
        </div>

        {/* VIDEO ASSET LIBRARY */}
        <div className="col-span-8 hud-panel p-8 overflow-y-auto custom-scrollbar relative">
          <HudCorners />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Video className="w-4 h-4" /> Neural_Asset_Library
              </h3>
              <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[7px] font-black text-cyan-500 uppercase tracking-widest">
                Storage_Optimized
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500 transition-all mono w-40"
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter by company..." 
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500 transition-all mono w-40"
                />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase mono">{filteredVideos.length} Assets_Found</span>
              {videos.length > 0 && (
                <button 
                  onClick={() => setShowPurgeConfirm(true)}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Purge_All
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showPurgeConfirm && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6 relative z-10"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Purge all neural assets from library?</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPurgeConfirm(false)}
                      className="px-4 py-1.5 bg-white/5 text-slate-400 text-[8px] font-black uppercase rounded-lg hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        videos.forEach(v => onDeleteVideo(v.id));
                        setShowPurgeConfirm(false);
                      }}
                      className="px-4 py-1.5 bg-red-500 text-white text-[8px] font-black uppercase rounded-lg hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      Confirm Purge
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-fuchsia-500/30 transition-all"
                >
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                    {video.status === 'completed' && video.url ? (
                      <video 
                        src={video.url} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        controls
                      />
                    ) : video.status === 'generating' ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-fuchsia-500" />
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
                      {video.route || 'GEMINI_3_PRO'}
                    </div>
                  </div>
                  
                  <div className={`${video.status === 'completed' ? 'p-4' : 'p-3'} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-white uppercase truncate pr-4">{video.videoName || video.prompt}</p>
                        {video.companyName && <span className="text-[8px] text-fuchsia-500 font-black uppercase mono tracking-tighter">{video.companyName}</span>}
                      </div>
                      {video.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[8px] text-slate-400 uppercase mono truncate">{video.prompt}</p>
                      {(video.bgPrompt || video.overlayPrompt) && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {video.bgPrompt && <span className="text-[6px] px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 rounded uppercase mono">BG: {video.bgPrompt}</span>}
                          {video.overlayPrompt && (
                            <div className="flex items-center gap-1">
                              <span className="text-[6px] px-1.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-500 rounded uppercase mono">OV: {video.overlayPrompt}</span>
                              {video.overlayOpacity !== undefined && <span className="text-[6px] text-slate-500 mono">({Math.round(video.overlayOpacity * 100)}% {video.overlayBlendMode})</span>}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[7px] font-bold mono text-slate-500 uppercase">
                        <div className="flex flex-col">
                          <span>{new Date(video.timestamp).toLocaleDateString()} {new Date(video.timestamp).toLocaleTimeString()}</span>
                          <div className="flex gap-2">
                            <span className="text-cyan-500">USER: {video.userGenerating || 'SYSTEM'}</span>
                            {video.codec && <span className="text-fuchsia-500">CODEC: {video.codec}</span>}
                            {video.resolution && <span className="text-amber-500">RES: {video.resolution}</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => onDeleteVideo(video.id)}
                          className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-all"
                          title="Purge Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
