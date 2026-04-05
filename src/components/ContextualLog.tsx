
import React from 'react';
import { SystemLog } from '../types';
import { Terminal, Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface ContextualLogProps {
  logs: SystemLog[];
  module?: string;
  agentId?: string;
  limit?: number;
  title?: string;
}

const ContextualLog: React.FC<ContextualLogProps> = ({ logs, module, agentId, limit = 5, title }) => {
  const filteredLogs = logs
    .filter(log => {
      if (module && log.module === module) return true;
      if (agentId && log.agentId === agentId) return true;
      if (!module && !agentId) return true;
      return false;
    })
    .slice(-limit)
    .reverse();

  const getTypeStyles = (type: SystemLog['type']) => {
    switch (type) {
      case 'critical': return 'text-red-500';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-500';
      case 'success': return 'text-emerald-400';
      default: return 'text-cyan-400';
    }
  };

  const getTypeIcon = (type: SystemLog['type']) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="w-2 h-2" />;
      case 'error': return <ShieldAlert className="w-2 h-2" />;
      case 'warning': return <ShieldAlert className="w-2 h-2" />;
      case 'success': return <CheckCircle className="w-2 h-2" />;
      default: return <Info className="w-2 h-2" />;
    }
  };

  if (filteredLogs.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-3 h-3 text-cyan-500" />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{title || 'Contextual_Telemetry'}</span>
      </div>
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start group">
            <div className={`mt-1 shrink-0 ${getTypeStyles(log.type)}`}>
              {getTypeIcon(log.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[7px] font-black text-slate-600 mono">[{log.timestamp}]</span>
                <span className="text-[7px] font-black text-cyan-500/40 uppercase tracking-widest">{log.module}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextualLog;
