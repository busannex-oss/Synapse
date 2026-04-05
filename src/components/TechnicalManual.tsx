
import React from 'react';
import { FileText, ExternalLink, ShieldCheck, Brain } from 'lucide-react';

const TechnicalManual: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-8 p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-[0.2em] uppercase glow-cyan">
              Identity & Reference Console
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em]">Production_Ready</span>
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mono">Official_Approval: April_01_2026</p>
          </div>
        </header>

        <div className="relative hud-panel p-12 bg-black/60 border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          <div className="space-y-12 relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">System_Overview</h3>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mono">Standard: Baseline_V1.0</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl font-medium tracking-wide">
                  SYNAPSE is a high-resilience neural discovery engine designed for enterprise-scale lead generation 
                  and digital transformation. This system has received official production approval and represents 
                  the baseline standard that must only be exceeded as it learns and refines.
                </p>
                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural_Link</p>
                    <p className="text-lg font-black text-white tracking-tighter">Gemini_3.1_Live</p>
                    <p className="text-[8px] text-slate-500 mono uppercase">Real_Time_Voice_Active</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Core_Engine</p>
                    <p className="text-lg font-black text-white tracking-tighter">Synapse_Core_V14</p>
                    <p className="text-[8px] text-slate-500 mono uppercase">Stable_Build_Active</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest">Interface_Protocol</p>
                    <p className="text-lg font-black text-white tracking-tighter">Synapse_2.0_PWA</p>
                    <p className="text-[8px] text-slate-500 mono uppercase">Offline_Capable_UI</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic px-1">
                  * Note: The system operates as a hybrid architecture, utilizing the stability of Core V14 
                  integrated with the advanced capabilities of Synapse 2.0 and the robust protection of Neural Shield V2.4.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">Pipeline_Protocol</h3>
                <div className="space-y-4">
                  {[
                    '[Q1] NEURAL INTAKE DISCOVERY',
                    '[Q2] VERIFICATION HANDSHAKE',
                    '[Q3] POTENCY QUALIFICATION',
                    '[Q4] GAP INTELLIGENCE',
                    '[Q5] STRATEGIC SYNTHESIS',
                    '[Q6] ASSET FULFILLMENT',
                    '[Q7] SECURE ARCHIVE VAULT'
                  ].map((step) => (
                    <div key={step} className="text-[11px] font-black text-slate-500 tracking-widest mono uppercase">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">Neural_Routes</h3>
                <div className="space-y-4">
                  {[
                    'L0: GEMINI 3.1 LIVE (REAL-TIME)',
                    'L1: GEMINI 3 PRO (THINKING)',
                    'L2: GEMINI 3 FLASH (FAST)',
                    'L3: EXTERNAL BRIDGE (CLAUDE/GROK)',
                    'L4: GPT-5 SIMULATION PROXY'
                  ].map((route) => (
                    <div key={route} className="text-[11px] font-black text-slate-500 tracking-widest mono uppercase">
                      {route}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">AJA_Neural_Specification</h3>
                <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="text-xs font-black text-white tracking-widest uppercase">AJA_SYSTEM_V1.5</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      AJA is the definitive Eyes, Ears, Brain, and Voice of SYNAPSE. 
                      She operates on a 16kHz input / 24kHz output neural link with 
                      optimized 2048-sample buffer sensitivity for real-time agility.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="px-2 py-1 bg-black/40 rounded border border-white/5 text-[8px] text-cyan-400 mono uppercase">Voice: Kore</div>
                      <div className="px-2 py-1 bg-black/40 rounded border border-white/5 text-[8px] text-cyan-400 mono uppercase">Form: Humanoid_3D</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">Neural_Solutions_&_Offerings</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-fuchsia-500" />
                      <p className="text-xs font-black text-white tracking-widest uppercase">Customizable_AI_Agents</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      High-performance neural entities tailored for specific business logic. 
                      Available for deployment across all digital touchpoints.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-1">
                        <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Purchase_Model</p>
                        <p className="text-[10px] font-black text-white mono">ONE-TIME_ACQUISITION</p>
                      </div>
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-1">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Lease_Model</p>
                        <p className="text-[10px] font-black text-white mono">MONTHLY_NEURAL_SUBSCRIPTION</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Service_Capabilities:</p>
                    <ul className="space-y-1">
                      {['Neural Receptionists', 'Lead Qualification Bots', 'Automated Outreach Agents', 'Strategic Synthesis Nodes'].map(s => (
                        <li key={s} className="text-[10px] text-slate-500 mono uppercase flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-cyan-500" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-amber-500 tracking-[0.3em] uppercase">Neural_Versioning_Stack</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Component</span>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Version</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[11px] font-black text-white mono">SYNAPSE_CORE</span>
                        <span className="text-[11px] font-black text-cyan-400 mono">V14.0.2</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[11px] font-black text-white mono">SYNAPSE_INTERFACE</span>
                        <span className="text-[11px] font-black text-fuchsia-400 mono">2.0.8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-white mono">NEURAL_SHIELD</span>
                        <span className="text-[11px] font-black text-amber-400 mono">V2.4.1</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    The integration of Synapse 2.0 with the V14 Core provides a high-performance 
                    environment secured by the Neural Shield V2.4 encryption layer.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-emerald-500 tracking-[0.3em] uppercase">System_Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Neural_Shield_Active</p>
                      <p className="text-[8px] text-emerald-500 mono uppercase">Protocol_V2.4_Enforced</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data_Encryption</p>
                    <p className="text-[11px] font-black text-white mono">AES-256-GCM | NEURAL_SALT_V4</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PWA_Compliance</p>
                    <p className="text-[11px] font-black text-white mono">OFFLINE_CACHE | SERVICE_WORKER_V1 | STANDALONE_UI</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Access_Control</p>
                    <p className="text-[11px] font-black text-white mono">BIOMETRIC_SYNC | MULTI_FACTOR_AUTH</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">Hybrid_Architecture_FAQ</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Q: Can it be both Core V14 and Synapse 2.0?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Yes. The system is designed as a multi-layered stack. <span className="text-cyan-400 font-bold">Synapse_Core_V14</span> provides the high-resilience 
                      backend stability, while <span className="text-fuchsia-400 font-bold">Synapse_2.0</span> serves as the advanced neural interface layer. 
                      They operate in tandem to provide both reliability and cutting-edge performance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Q: Is SYNAPSE a Progressive Web App (PWA)?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Yes. <span className="text-emerald-400 font-bold">SYNAPSE</span> is fully PWA-compliant. It features offline caching, background synchronization, 
                      and can be installed as a standalone application on any device, providing a native-like experience with high-resilience neural access.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Q: Where does Neural Shield V2.4 fit in?</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-amber-500 font-bold">Neural_Shield_V2.4</span> is the overarching security umbrella that encrypts all 
                      data streams between the Core and the Interface, ensuring that your neural assets remain 
                      protected at all times.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">System_Metadata</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Last_Core_Sync</p>
                    <p className="text-[11px] font-black text-white mono">{new Date().toISOString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Build_Signature</p>
                    <p className="text-[11px] font-black text-white mono">SYN-2.0-V14-NS2.4-STABLE</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-fuchsia-500 tracking-[0.3em] uppercase">Visual_Architecture_Specs</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base_Background</p>
                    <p className="text-[11px] font-black text-white mono">#111318 (DEEP_TECH_GRAY)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accent_Primary</p>
                    <p className="text-[11px] font-black text-cyan-400 mono">#00F2FF (NEURAL_CYAN)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accent_Secondary</p>
                    <p className="text-[11px] font-black text-fuchsia-500 mono">#D946EF (SYNTH_MAGENTA)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">UI_Elements</p>
                    <p className="text-[11px] font-black text-slate-300 mono">SCANLINES_40% | GRID_40PX | HUD_CORNERS_1.5PX</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Effects_Engine</p>
                    <p className="text-[11px] font-black text-slate-300 mono">GLASSMORPHISM | 30PX_BLUR | NEURAL_GLOW_V2</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-amber-500 tracking-[0.3em] uppercase">Brand_Identity_Guidelines</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AJA_Protocol (FIGUREHEAD)</p>
                    <p className="text-[11px] font-black text-white mono leading-tight">
                      NEURAL_INTERFACE | PUBLIC_FACING | GUIDANCE_AUTHORITY
                    </p>
                    <p className="text-[9px] text-slate-400 italic">"The voice and face of the neural stream."</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PM_Authority (EXECUTIVE)</p>
                    <p className="text-[11px] font-black text-white mono leading-tight">
                      PROJECT_MANAGER | CORE_LOGIC | COMMAND_CENTER_AUTHORITY
                    </p>
                    <p className="text-[9px] text-slate-400 italic">"The silent architect of system logic."</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Typography_System</p>
                    <p className="text-[11px] font-black text-white mono">INTER (SANS) | JETBRAINS_MONO (DATA)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brand_Philosophy</p>
                    <p className="text-[11px] font-black text-white mono">HIGH_RESILIENCE | NEURAL_INTELLIGENCE | PRECISION</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-8">
          <ExternalLink className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-black text-white tracking-[0.2em] uppercase">Brand_Resource_Network</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalManual;
