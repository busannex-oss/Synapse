
import React from 'react';
import { SystemLog } from '../types';
import { Terminal, Clock, ShieldAlert, CheckCircle, Info, Trash2, Cpu } from 'lucide-react';

interface SystemAuditProps {
  logs: SystemLog[];
  onClear: () => void;
}

const SystemAudit: React.FC<SystemAuditProps> = ({ logs, onClear }) => {
  const getTypeStyles = (type: SystemLog['type']) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'error': return 'text-red-400 bg-red-400/5 border-red-400/10';
      case 'warning': return 'text-amber-500 bg-amber-500/5 border-amber-500/10';
      case 'success': return 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10';
      default: return 'text-cyan-400 bg-cyan-400/5 border-cyan-400/10';
    }
  };

  const getTypeIcon = (type: SystemLog['type']) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="w-3 h-3" />;
      case 'error': return <ShieldAlert className="w-3 h-3" />;
      case 'warning': return <ShieldAlert className="w-3 h-3" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex-1 hud-panel p-8 overflow-hidden flex flex-col relative border-cyan-500/10">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-4">
             <Terminal className="w-6 h-6 text-cyan-500" /> System_Audit :: Persistence_Console
           </h2>
           <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono">Logging_Active :: {new Date().toLocaleString()}</span>
              </div>
           </div>
        </div>
        <button 
          onClick={onClear}
          className="h-10 px-6 border border-red-500/20 text-red-500 text-[10px] font-black uppercase flex items-center gap-3 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" /> Purge_Audit_Logs
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 rounded-2xl border border-white/5 p-4 font-mono">
        <div className="space-y-1">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
              <Cpu className="w-12 h-12 mb-4" />
              <p className="text-[10px] uppercase tracking-widest">No_System_Telemetry_Recorded</p>
            </div>
          ) : (
            [...logs].reverse().map((log) => (
              <div key={log.id} className={`p-3 border-l-2 flex gap-4 transition-all hover:bg-white/[0.02] ${getTypeStyles(log.type)}`}>
                <span className="text-[9px] font-black opacity-40 shrink-0 mt-1">[{log.timestamp}]</span>
                <div className="shrink-0 mt-1">{getTypeIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest">{log.module}</span>
                    {log.route && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 border border-current rounded uppercase opacity-60">{log.route}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed font-medium">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAudit;
