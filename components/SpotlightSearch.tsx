
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, Layers, Database, ArrowRight, Compass } from 'lucide-react';
import { Lead } from '../types';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  masterDb: Lead[];
  onSelect: (lead: Lead) => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose, masterDb, onSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query 
    ? masterDb.filter(l => l.name.toLowerCase().includes(query.toLowerCase()) || l.industry.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/10 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white/90 glass rounded-[2.5rem] apple-shadow border border-white/60 overflow-hidden animate-in slide-in-from-top-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-6 py-5 border-b border-gray-100">
          <Search className="w-6 h-6 text-blue-500 mr-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search SYNAPSE archive, industries, or nodes..."
            className="flex-1 bg-transparent border-none text-xl font-medium focus:ring-0 placeholder:text-gray-300"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md">ESC</span>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          {query && results.length === 0 && (
            <div className="py-12 text-center text-gray-400 font-medium">No results found for "{query}"</div>
          )}
          {!query && (
            <div className="py-4 px-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all">
                  <Compass className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold">Neural Intake</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold">Processing</span>
                </div>
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Search Results</p>
              {results.map(lead => (
                <div 
                  key={lead.id} 
                  onClick={() => { onSelect(lead); onClose(); }}
                  className="flex items-center justify-between p-4 rounded-3xl hover:bg-blue-600 hover:text-white group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <Building2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{lead.name}</div>
                      <div className="text-[10px] font-black opacity-60 uppercase tracking-widest">{lead.industry} • {lead.location}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>SYNAPSE Neural Intelligence</span>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
