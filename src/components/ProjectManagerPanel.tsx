
import React, { useState } from 'react';
import { Directive, AgentStatus, Signal, AgentRecommendation, PMReport, SystemLog, ImprovementReport } from '../types';
import { 
  ShieldCheck, Zap, AlertCircle, CheckCircle2, Terminal, Cpu, Activity, 
  ChevronRight, Gavel, Radio, MessageSquare, AlertTriangle, RefreshCcw,
  User, Languages, Brain, Lightbulb, Check, X, Edit2, Save, FileText, FileCheck, FileSearch, Printer, TrendingUp, Sparkles
} from 'lucide-react';
import HudCorners from './HudCorners';
import { exportPMReportToPDF } from '../services/exportService';
import ContextualLog from './ContextualLog';

interface ProjectManagerPanelProps {
  directives: Directive[];
  agents: AgentStatus[];
  signals: Signal[];
  pmReports: PMReport[];
  improvementReports?: ImprovementReport[];
  logs: SystemLog[];
  advice: string;
  isAnalyzing: boolean;
  onDismissDirective: (id: string) => void;
  onRunMaintenance: () => void;
  onRunNeuralScan: () => void;
  onRecalibrateAgent?: () => void;
  onUpdateAgent: (agentId: string, updates: Partial<AgentStatus>) => void;
  onHandleRecommendation: (agentId: string, recommendationId: string, action: 'accept' | 'reject') => void;
  onReleaseFindings?: () => void;
  isMaintenanceMode: boolean;
  isNeuralActive: boolean;
}

const ProjectManagerPanel: React.FC<ProjectManagerPanelProps> = ({ 
  directives = [], 
  agents = [], 
  signals = [], 
  pmReports = [],
  improvementReports = [],
  logs = [],
  advice, 
  isAnalyzing, 
  onDismissDirective,
  onRunMaintenance,
  onRunNeuralScan,
  onRecalibrateAgent,
  onUpdateAgent,
  onHandleRecommendation,
  onReleaseFindings,
  isMaintenanceMode,
  isNeuralActive
}) => {
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AgentStatus>>({});
  const [selectedReport, setSelectedReport] = useState<PMReport | null>(null);

  const startEditing = (agent: AgentStatus) => {
    setEditingAgentId(agent.id);
    setEditForm({
      firstName: agent.firstName,
      lastName: agent.lastName,
      age: agent.age,
      personality: agent.personality,
      language: agent.language,
      responsibilities: agent.responsibilities,
      role: agent.role,
      identity: agent.identity,
      securityLayer: agent.securityLayer,
      capabilities: agent.capabilities,
      governanceLayer: agent.governanceLayer,
      memoryLog: agent.memoryLog,
      improvement: agent.improvement,
      intelligence: agent.intelligence
    });
  };

  const saveEdit = () => {
    if (editingAgentId) {
      onUpdateAgent(editingAgentId, editForm);
      setEditingAgentId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Top Bar: System Authority */}
      <div className="hud-panel p-6 flex justify-between items-center border-cyan-500/20 relative">
        <HudCorners />
        <div className="flex items-center gap-4 relative z-10">
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
            onClick={onRunNeuralScan}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase transition-all border ${
              isAnalyzing 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-500 cursor-not-allowed' 
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black'
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${isAnalyzing ? '' : ''}`} />
            {isAnalyzing ? 'Scanning_Neural_Nodes' : 'Force_Neural_Scan'}
          </button>
          <button 
            onClick={onRunMaintenance}
            disabled={isMaintenanceMode}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase transition-all border ${
              isMaintenanceMode 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 cursor-not-allowed' 
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-black'
            }`}
          >
            {isMaintenanceMode ? <RefreshCcw className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {isMaintenanceMode ? 'Maintenance_In_Progress' : 'Trigger_Daily_Maintenance'}
          </button>
          <button 
            onClick={onReleaseFindings}
            className="px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase transition-all border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black"
          >
            <FileText className="w-4 h-4" />
            Release_Agent_Findings
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
        <div className="flex-[1.2] flex flex-col gap-6 overflow-hidden">
          {/* Strategic Advice */}
          <div className="hud-panel p-6 bg-cyan-500/[0.02] border-cyan-500/10 relative">
            <HudCorners />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <Terminal className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Manager_Advice</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed italic font-medium">
              "{advice || "Awaiting system telemetry for tactical optimization..."}"
            </p>
          </div>

          {/* Active Directives */}
          <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-amber-500/10 relative">
            <HudCorners />
            <div className="flex justify-between items-center mb-6 relative z-10">
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

        {/* Middle: Signal Monitor & PM Reports */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-fuchsia-500/10 relative">
            <HudCorners />
            <div className="flex items-center gap-3 mb-6 relative z-10">
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

          {/* PM Reports */}
          <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-emerald-500/10 relative">
            <HudCorners />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <FileText className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">PM_Reports</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {pmReports.filter(r => r.generatedBy === 'Project Manager' && (r.status === 'reviewed' || r.status === 'approved')).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <FileSearch className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase tracking-widest">No_Reports_Available</p>
                </div>
              ) : (
                pmReports.filter(r => r.generatedBy === 'Project Manager' && (r.status === 'reviewed' || r.status === 'approved')).map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedReport(r)}
                    className="p-3 bg-white/[0.02] border border-white/5 rounded-lg group cursor-pointer hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{r.id}</span>
                      <span className="text-[7px] mono text-slate-600">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-[10px] font-black text-white mb-1">{r.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[8px] text-slate-500 uppercase">{r.generatedBy}</span>
                      <div className="flex items-center gap-1">
                        {r.status === 'approved' ? (
                          <FileCheck className="w-3 h-3 text-emerald-500" />
                        ) : r.status === 'reviewed' ? (
                          <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        )}
                        <span className={`text-[7px] font-bold uppercase ${
                          r.status === 'approved' ? 'text-emerald-500' : 
                          r.status === 'reviewed' ? 'text-cyan-500' : 
                          'text-amber-500'
                        }`}>{r.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AJA Neural Improvement Reports */}
          <div className="flex-1 hud-panel p-6 flex flex-col overflow-hidden border-cyan-500/10 relative">
            <HudCorners />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">AJA_Neural_Growth_Reports</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {improvementReports.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Sparkles className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase tracking-widest">No_Growth_Data_Available</p>
                </div>
              ) : (
                improvementReports.map((report) => (
                  <div key={report.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Neural_Upgrade</span>
                      <span className="text-[7px] mono text-slate-600">{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-white font-bold">Performance Gain</span>
                      <span className="text-[10px] text-emerald-400 font-black">+{report.performanceGain}%</span>
                    </div>
                    <div className="space-y-1">
                      {report.newCapabilities?.map((cap, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-cyan-500 mt-1.5 shrink-0"></div>
                          <p className="text-[9px] text-slate-400 leading-tight">{cap}</p>
                        </div>
                      ))}
                      {report.optimizationNotes && (
                        <div className="mt-2 p-2 bg-white/[0.03] rounded border border-white/5">
                          <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Optimization Notes</p>
                          <p className="text-[9px] text-slate-300 leading-tight italic">"{report.optimizationNotes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Agent Status Monitor & Humanization */}
        <div className="flex-[1.8] hud-panel p-6 flex flex-col overflow-hidden border-cyan-500/10 relative">
          <HudCorners />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Agent_Neural_Network</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
            {agents.map((agent) => (
              <div key={agent.id} className="p-5 border border-white/5 bg-white/[0.02] rounded-2xl space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      agent.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                      agent.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                      'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' :
                          agent.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
                          agent.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' :
                          'bg-slate-500'
                        }`} />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">
                          {agent.firstName} {agent.lastName}
                        </h4>
                        <span className="text-[8px] font-black text-slate-500 mono bg-white/5 px-1.5 py-0.5 rounded">
                          ID: {agent.id}
                        </span>
                      </div>
                      <div className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5">
                        {agent.role} // {agent.age} Cycles
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Efficiency</div>
                      <div className={`text-xs font-black mono ${agent.efficiency < 95 ? 'text-amber-400' : 'text-emerald-400'}`}>{agent.efficiency}%</div>
                    </div>
                    {agent.efficiency < 95 && (
                      <button
                        onClick={() => onRecalibrateAgent?.()}
                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black text-[9px] font-black uppercase rounded-lg transition-colors flex items-center gap-1"
                        title="Recalibrate Agent"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Recalibrate
                      </button>
                    )}
                    <button 
                      onClick={() => editingAgentId === agent.id ? saveEdit() : startEditing(agent)}
                      className={`p-2 rounded-lg transition-all ${
                        editingAgentId === agent.id 
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {editingAgentId === agent.id ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Humanized Details / Edit Form */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                  {editingAgentId === agent.id ? (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">First Name</label>
                        <input 
                          type="text" 
                          value={editForm.firstName || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Last Name</label>
                        <input 
                          type="text" 
                          value={editForm.lastName || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Role</label>
                        <input 
                          type="text" 
                          value={editForm.role || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Age (Cycles)</label>
                        <input 
                          type="number" 
                          value={editForm.age || 0} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Intelligence (%)</label>
                        <input 
                          type="number" 
                          value={editForm.intelligence || 0} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, intelligence: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Language</label>
                        <input 
                          type="text" 
                          value={editForm.language || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Identity Profile</label>
                        <textarea 
                          value={editForm.identity || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, identity: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none h-16 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Security Layer</label>
                        <input 
                          type="text" 
                          value={editForm.securityLayer || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, securityLayer: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Governance Layer</label>
                        <input 
                          type="text" 
                          value={editForm.governanceLayer || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, governanceLayer: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Capabilities (Comma Separated)</label>
                        <input 
                          type="text" 
                          value={editForm.capabilities?.join(', ') || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, capabilities: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Memory Log (Comma Separated)</label>
                        <textarea 
                          value={editForm.memoryLog?.join(', ') || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, memoryLog: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none h-16 resize-none"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Improvement Protocol</label>
                        <input 
                          type="text" 
                          value={editForm.improvement || ''} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, improvement: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Brain className="w-3.5 h-3.5 text-cyan-500" />
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase">Intelligence_Index</div>
                          <div className="text-[10px] text-slate-300 mono">{agent.intelligence}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase">Security_Layer</div>
                          <div className="text-[10px] text-slate-300 truncate max-w-[100px]">{agent.securityLayer}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Gavel className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase">Governance</div>
                          <div className="text-[10px] text-slate-300 truncate max-w-[100px]">{agent.governanceLayer}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity className="w-3.5 h-3.5 text-fuchsia-500" />
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase">Status</div>
                          <div className="text-[10px] text-fuchsia-400 uppercase font-black">{agent.status}</div>
                        </div>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-white/5 space-y-3">
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Capabilities</div>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities?.map((cap, i) => (
                              <span key={i} className="text-[7px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 uppercase">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Improvement_Protocol</div>
                          <div className="text-[10px] text-slate-400 italic">{agent.improvement}</div>
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Memory_Log_Recent</div>
                          <div className="space-y-0.5">
                            {agent.memoryLog?.slice(-3).map((log, i) => (
                              <div key={i} className="text-[9px] text-slate-500 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Recommendations */}
                {agent.recommendations && agent.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Strategic_Recommendations</h5>
                    </div>
                    <div className="space-y-2">
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
                          
                          {rec.status === 'pending' && (
                            <div className="flex items-center gap-2 transition-opacity">
                              <button 
                                onClick={() => onHandleRecommendation(agent.id, rec.id, 'accept')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Accept
                              </button>
                              <button 
                                onClick={() => onHandleRecommendation(agent.id, rec.id, 'reject')}
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

                {/* Telemetry Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-600 uppercase font-black">Uptime</span>
                      <span className="text-[9px] text-slate-400 mono">{agent.uptime}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-600 uppercase font-black">Signals</span>
                      <span className="text-[9px] text-slate-400 mono">{agent.signalsSent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-slate-600" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase truncate max-w-[150px]">
                      {typeof agent.lastAction === 'object' ? JSON.stringify(agent.lastAction) : agent.lastAction}
                    </span>
                  </div>
                </div>

                {/* Contextual Agent Logs */}
                <ContextualLog 
                  logs={logs} 
                  agentId={agent.id} 
                  title={`${agent.firstName}_Telemetry_Stream`} 
                  limit={3} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{selectedReport.title}</h3>
                  <div className="text-[10px] text-emerald-400 mono mt-1">ID: {selectedReport.id}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Generated By</div>
                  <div className="text-xs text-white">{selectedReport.generatedBy}</div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</div>
                  <div className="text-xs text-white mono">{new Date(selectedReport.date).toLocaleString()}</div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 col-span-2 flex justify-between items-center">
                  <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
                    <div className={`text-xs font-bold uppercase ${
                      selectedReport.status === 'approved' ? 'text-emerald-500' : 
                      selectedReport.status === 'reviewed' ? 'text-cyan-500' : 
                      'text-amber-500'
                    }`}>
                      {selectedReport.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReport.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {selectedReport.status === 'reviewed' && <Activity className="w-6 h-6 text-cyan-500" />}
                    {selectedReport.status === 'pending' && <AlertCircle className="w-6 h-6 text-amber-500" />}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20 pb-2">Report Content</h4>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.content}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
              <button 
                onClick={() => exportPMReportToPDF(selectedReport)}
                className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print to PDF
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagerPanel;
