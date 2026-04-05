
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, TrendingUp, Zap, Globe, FileText, Cpu, Sparkles } from 'lucide-react';
import HudCorners from './HudCorners';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Strategic' | 'AI' | 'Infrastructure';
  isSignature?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: '30Y-PLAN',
    name: 'Signature Comprehensive 30-Year Strategic Business Plan',
    description: 'Our flagship long-term growth roadmap. A multi-decade strategic blueprint for market dominance, digital transformation, and generational wealth creation.',
    price: '$25,000+',
    category: 'Strategic',
    isSignature: true
  },
  {
    id: 'AI-AGENT-PURCHASE',
    name: 'Custom AI Agent (Full Purchase)',
    description: 'A high-performance, fully customizable AI Agent tailored for your specific business needs. Own the neural asset outright.',
    price: '$5,000 - $15,000',
    category: 'AI'
  },
  {
    id: 'AI-AGENT-LEASE',
    name: 'AI Agent Managed Lease',
    description: 'Lease a high-performance AI Agent with ongoing maintenance, neural updates, and 24/7 monitoring.',
    price: '$499/mo',
    category: 'AI'
  },
  {
    id: 'WEB-FOUNDATION',
    name: 'Neural Website Foundation',
    description: 'The core platform for your digital strategy. Optimized for AI deployment, lead capture, and high-conversion performance.',
    price: '$3,500+',
    category: 'Infrastructure'
  },
  {
    id: 'AI-RECEPTIONIST',
    name: '24/7 AI Receptionist Service',
    description: 'Never miss a call again. An intelligent voice agent that handles inquiries, books appointments, and qualifies leads around the clock.',
    price: '$299/mo',
    category: 'AI'
  }
];

const ProductCatalog: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3">
          <Cpu className="w-4 h-4" /> Neural_Product_Catalog
        </h3>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono">AJA_OFFICIAL_OFFERINGS</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PRODUCTS.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.01 }}
            className={`hud-panel p-5 relative overflow-hidden group transition-all duration-500 ${
              product.isSignature 
                ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_30px_rgba(0,242,255,0.1)]' 
                : 'hover:border-white/20'
            }`}
          >
            {product.isSignature && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-black text-[7px] font-black uppercase tracking-widest rounded-bl-xl shadow-[0_0_15px_rgba(0,242,255,0.4)] z-10">
                SIGNATURE_ASSET
              </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    product.category === 'Strategic' ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500' :
                    product.category === 'AI' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                    {product.category}
                  </span>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${product.isSignature ? 'text-white' : 'text-slate-200'}`}>
                    {product.name}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl font-medium uppercase">
                  {product.description}
                </p>
              </div>
              
              <div className="flex flex-col items-end justify-center min-w-[120px]">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected_Value</span>
                <span className={`text-lg font-black mono ${product.isSignature ? 'text-cyan-400' : 'text-white'}`}>
                  {product.price}
                </span>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              {product.category === 'Strategic' ? <TrendingUp className="w-24 h-24" /> :
               product.category === 'AI' ? <Zap className="w-24 h-24" /> :
               <Globe className="w-24 h-24" />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">All neural assets are backed by the SYNAPSE Guarantee.</span>
        </div>
        <button className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[8px] font-black text-cyan-500 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
          Download_Full_Catalog
        </button>
      </div>
    </div>
  );
};

export default ProductCatalog;
