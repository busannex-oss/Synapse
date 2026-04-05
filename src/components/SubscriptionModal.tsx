
import React, { useState } from 'react';
import { X, CheckCircle2, Crown, Sparkles, Zap, ShieldCheck, CreditCard, Loader2, Cpu, Activity } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleNeuralPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSubscribe();
    }, 2500);
  };

  const perks = [
    { icon: Zap, title: 'Neural_Auto-Pilot', desc: 'Background pipeline processing and automated verification protocols.' },
    { icon: Sparkles, title: 'SYNAPSE_Intelligence', desc: 'Deep strategic reasoning and pitch vector generation via Gemini Pro.' },
    { icon: ShieldCheck, title: 'Grounding_Signals', desc: 'Full access to Google Search & Maps grounding signals.' },
    { icon: Crown, title: 'Priority_Link', desc: 'Concierge level assistance for cross-market expansion.' }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div 
        className="w-full max-w-xl bg-slate-900/90 glass sm:rounded-[3.5rem] rounded-t-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border border-cyan-500/20 flex flex-col animate-in slide-in-from-bottom-12 duration-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 intel-glow rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(112,0,255,0.4)] mb-8 border border-white/20">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest neon-text">SYNAPSE_ELITE</h2>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mt-2 mono">Unlock Autonomous_Growth</p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-12">
            {perks.map((perk, i) => (
              <div key={i} className="flex gap-6 items-center p-4 bg-slate-950/40 rounded-3xl border border-white/5 group hover:border-cyan-500/20 transition-all">
                <div className="p-3.5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shrink-0 group-hover:scale-110 transition-transform">
                  <perk.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">{perk.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mono uppercase">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/80 p-8 rounded-[2.5rem] border border-cyan-500/10 flex items-center justify-between mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Activity className="w-16 h-16 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2 mono">Neural_Access_Key</p>
              <h3 className="text-3xl font-black text-white mono tabular-nums tracking-tighter">$9.99<span className="text-sm font-bold text-slate-500">/WK</span></h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-xl uppercase tracking-widest mono">SECURE_SYNC</span>
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleNeuralPay}
              disabled={isProcessing}
              className="w-full bg-white h-20 rounded-[2rem] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 relative overflow-hidden group shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-slate-900" />
              ) : (
                <>
                   <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <CreditCard className="w-6 h-6 text-slate-900 relative z-10" />
                   <span className="text-slate-900 text-xl font-black uppercase tracking-widest relative z-10">Sync_Via_Neural_Pay</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-500 font-bold px-8 text-center leading-relaxed uppercase tracking-widest mono opacity-60">
              SYNAPSE Protocol will renew automatically unless terminated in System Settings. Transmissions processed via Neural Link Gateways.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
