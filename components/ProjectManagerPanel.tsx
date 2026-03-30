
import React from 'react';
import { Directive, AgentStatus, Signal } from '../types';
import { ShieldCheck, Zap, AlertCircle, CheckCircle2, Terminal, Cpu, Activity, ChevronRight, Gavel, Radio, MessageSquare, AlertTriangle, RefreshCcw } from 'lucide-react';

interface ProjectManagerPanelProps {
  directives: Directive[];
  agents: AgentStatus[];
  signals: Signal[];
  advice: string;
  isAnalyzing: boolean;
  onDismissDirective: (id: string) => void;
  onRunMaintenance: () => void;
  isMaintenanceMode: boolean;
  isNeuralActive: boolean;
}

const ProjectManagerPanel: React.FC<ProjectManagerPanelProps> = ({ 
  directives, 
  agents, 
  signals, 
  advice, 
  isAnalyzing, 
  onDismissDirective,
  onRunMaintenance,
  isMaintenanceMode,
  isNeuralActive
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Top Bar: System Authority */}
      <div className="hud-panel p-6 flex justify-between items-center border-cyan-500/20">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${isAnalyzing || isMaintenanceMode || isNeuralActive ? 'bg-amber-500/20 animate-pulse' : 'bg-cyan-500/10'}`}>
            <ShieldCheck className={`w-8 h-8 ${isAnalyzing || isMaintenanceMode || isNeuralActive ? 'text-amber-500' : 'text-cyan-500'}`} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
              PROJECT_MANAGER :: Authority_Core
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              Status: {isMaintenanceMode ? 'EXECUTING_MAINTENANCE' : isNeuralActive ? 'NEURAL_SCAN_IN_PROGRESS' : isAnalyzing ? 'Analyzing_Neural_Flow' : 'Monitoring_Active'} // Protocol: Manager_Guardian_Security
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onRunMaintenance}
            disabled={isMaintenanceMode}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase transition-all border ${
              isMaintenanceMode 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 cursor-not-allowed' 
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black'
            }`}
          >
            {isMaintenanceMode ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isMaintenanceMode ? 'Maintenance_In_Progress' : 'Trigger_Daily_Maintenance'}
          </button>
          <div className="h-10 w-px bg-white/10 mx-2"></div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">System_Efficiency</div>
            <div className="text-2xl font-black text-emerald-400 mono">98.4%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Active_Agents</div>
            <div className="text-2xl font-black text-cyan-400 mono">{agents.length}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Directives & Advice */}
        <div className="flex-[1.5] flex flex-col gap-6 overflow-hidden">
          {/* Strategic Advice */}
          <div className="hud-panel p-6 bg-cyan-500/[0.02] border-cyan-500/10">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Manager_Advice</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed italic font-medium">
              "{advice || "Awaiting system telemetry for tactical optimization..."}"
            </p>
          </div>

          {/* Active Directives */}
          <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-amber-500/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Gavel className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Active_Directives</h3>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded">
                Total: {directives.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {directives.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <CheckCircle2 className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase tracking-widest">All_Systems_Nominal :: No_Directives_Pending</p>
                </div>
              ) : (
                directives.map((d) => (
                  <div key={d.id} className={`p-4 border-l-4 bg-black/40 transition-all group relative ${
                    d.priority === 'critical' ? 'border-red-500' : 
                    d.priority === 'high' ? 'border-amber-500' : 
                    'border-cyan-500'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          d.priority === 'critical' ? 'bg-red-500 text-white' : 
                          d.priority === 'high' ? 'bg-amber-500 text-black' : 
                          'bg-cyan-500 text-black'
                        }`}>
                          {d.priority}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.agentId}</span>
                      </div>
                      <button 
                        onClick={() => onDismissDirective(d.id)}
                        className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-slate-500 hover:text-white transition-all uppercase"
                      >
                        [ Acknowledge ]
                      </button>
                    </div>
                    <h4 className="text-sm font-black text-white mb-1 uppercase tracking-tight">{d.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{d.instruction}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-current w-1/3 animate-pulse"></div>
                      </div>
                      <span className="text-[8px] font-black text-slate-600 uppercase">Executing...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle: Signal Monitor */}
        <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-fuchsia-500/10">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="w-4 h-4 text-fuchsia-500" />
            <h3 className="text-xs font-black text-fuchsia-500 uppercase tracking-widest">Signal_Monitor</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {signals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-[10px] uppercase tracking-widest">No_Incoming_Signals</p>
              </div>
            ) : (
              signals.map((s) => (
                <div key={s.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">{s.source}</span>
                    <span className="text-[7px] mono text-slate-600">{new Date(s.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">{s.payload}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${s.priority === 'high' ? 'bg-red-500' : s.priority === 'medium' ? 'bg-amber-500' : 'bg-cyan-500'}`}></div>
                    <span className="text-[7px] font-bold text-slate-500 uppercase">{s.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Agent Status Monitor */}
        <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-cyan-500/10">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Agent_Telemetry</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {agents.map((agent) => (
              <div key={agent.id} className="p-4 border border-white/5 bg-white/[0.02] rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">{agent.name}</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{agent.role}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    agent.status === 'warning' ? 'bg-amber-500' : 
                    agent.status === 'error' ? 'bg-red-500' : 'bg-slate-600'
                  }`}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-black">
                    <span className="text-slate-500">Efficiency</span>
                    <span className="text-cyan-400">{agent.efficiency}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-1000" 
                      style={{ width: `${agent.efficiency}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-600 uppercase font-black">Uptime</span>
                      <span className="text-[9px] text-slate-400 mono">{agent.uptime}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-600 uppercase font-black">Signals</span>
                      <span className="text-[9px] text-slate-400 mono">{agent.signalsSent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <Activity className="w-3 h-3 text-slate-600" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase truncate">{agent.lastAction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerPanel;
