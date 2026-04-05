
import React, { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAUpdater: React.FC = () => {
  const [needRefresh, setNeedRefresh] = React.useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = React.useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
        setUpdateServiceWorker(() => updateSW);
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }, []);

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-4"
        >
          <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,242,255,0.2)] backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <RefreshCcw className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">System Update Available</h4>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mono">New neural pathways detected. Refresh to sync.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateServiceWorker?.(true)}
                className="px-4 py-2 bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-all"
              >
                Sync Now
              </button>
              <button
                onClick={close}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdater;
