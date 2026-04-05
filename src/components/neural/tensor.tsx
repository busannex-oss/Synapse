
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AjaAvatar from '../AjaAvatar';
import { Activity, Cpu, Shield, Zap, Terminal } from 'lucide-react';

interface NeuralScreensaverProps {
  isIdle: boolean;
  onWake: () => void;
  systemName: string;
}

const NeuralScreensaver: React.FC<NeuralScreensaverProps> = ({ isIdle, onWake, systemName }) => {
  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[9999] bg-zinc-950 flex items-center justify-center overflow-hidden cursor-none"
          onClick={onWake}
          onMouseMove={onWake}
          onKeyDown={onWake}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(0, 242, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.1) 1px, transparent 1px)',
                 backgroundSize: '100px 100px'
               }}></div>

          {/* Central Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
            className="relative z-10"
          >
            <AjaAvatar 
              isListening={false} 
              isSpeaking={false} 
              isCritical={false} 
              isSearching={true}
              isProcessing={true}
              onClick={onWake}
            />
          </motion.div>

          {/* HUD Overlays */}
          <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">{systemName}_OS</h2>
                    <p className="text-[10px] text-cyan-500/60 font-black uppercase tracking-widest mono">Neural_Handshake_Active</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full" style={{ opacity: 0.4 }}></div>
                      <div className="h-0.5 bg-cyan-500/20 rounded-full" style={{ width: `${40 + Math.random() * 60}px` }}></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">System_Uptime</div>
                <div className="text-4xl font-black text-white tracking-tighter mono">00:00:00:00</div>
                <div className="flex justify-end gap-2">
                  <Shield className="w-4 h-4 text-emerald-500/40" />
                  <Zap className="w-4 h-4 text-amber-500/40" />
                  <Activity className="w-4 h-4 text-fuchsia-500/40" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="max-w-md space-y-4">
                <div className="flex items-center gap-2 text-cyan-500/40">
                  <Terminal className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Neural_Stream_Telemetry</span>
                </div>
                <div className="space-y-1 opacity-40">
                  <p className="text-[8px] mono text-slate-500 uppercase">&gt;&gt; INITIATING_DEEP_PACKET_INSPECTION...</p>
                  <p className="text-[8px] mono text-slate-500 uppercase">&gt;&gt; NEURAL_PATHWAYS_CONFIRMED_STABLE</p>
                  <p className="text-[8px] mono text-slate-500 uppercase">&gt;&gt; SYNCING_WITH_AUTHORITY_CORE_SYSTEM</p>
                  <p className="text-[8px] mono text-slate-500 uppercase">&gt;&gt; AJA_SYSTEM_EVOLUTION_CYCLE_COMPLETE</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Interaction_Required_To_Wake</div>
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-500/20 rounded-full"
                animate={{ 
                  y: [0, -1000],
                  opacity: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 200]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                style={{ 
                  left: `${Math.random() * 100}%`,
                  bottom: '-10px'
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralScreensaver;
