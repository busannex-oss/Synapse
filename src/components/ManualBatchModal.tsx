
import React, { useState } from 'react';
import { X, Upload, Clipboard, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Lead } from '../types';

interface ManualBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLeads: (leads: Lead[]) => void;
}

const ManualBatchModal: React.FC<ManualBatchModalProps> = ({ isOpen, onClose, onAddLeads }) => {
  const [rawText, setRawText] = useState('');
  const [parsedLeads, setParsedLeads] = useState<Partial<Lead>[]>([]);

  if (!isOpen) return null;

  const handleParse = () => {
    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    const newLeads: Partial<Lead>[] = lines.map((line, index) => {
      // Basic CSV/TSV/Pipe split
      const parts = line.split(/[,\t|]/).map(p => p.trim());
      return {
        id: `manual-${Date.now()}-${index}`,
        name: parts[0] || '',
        phone: parts[1] || '',
        email: parts[2] || '',
        industry: parts[3] || 'Unknown',
        businessNeed: parts[4] || 'General Digital Transformation',
        rating: 0,
        reviewCount: 0,
        address: 'Manually Entered',
        location: 'Manual Batch',
        searchDate: new Date().toISOString().split('T')[0],
        status: 'no_digital',
        missingElements: ['Website', 'Social Media'],
        description: 'Manually imported lead for pipeline processing.',
        enrichmentSources: ['Manual Entry'],
        queue: 'verification'
      };
    });
    setParsedLeads(newLeads);
  };

  const handleRemoveLead = (id: string) => {
    setParsedLeads(parsedLeads.filter(l => l.id !== id));
  };

  const handleSubmit = () => {
    const validLeads = parsedLeads.filter(l => l.name && l.phone) as Lead[];
    onAddLeads(validLeads);
    setRawText('');
    setParsedLeads([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full h-full md:max-w-4xl md:h-auto md:rounded-3xl shadow-2xl overflow-hidden border-x md:border border-slate-200 flex flex-col md:max-h-[90vh]">
        <div className="p-4 md:p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-cyan-600" />
              Manual Batch Import
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Bulk Paste Engine</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Paste Leads Data</label>
              <span className="text-[10px] text-slate-400 font-bold">FORMAT: Name, Phone, Email, Industry, Need</span>
            </div>
            <textarea
              className="flex-1 min-h-[300px] p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-cyan-300 transition-all font-mono text-xs leading-relaxed resize-none"
              placeholder="Starbucks, 555-0199, info@coffee.com, Food, Mobile App&#10;Local Bakery, 555-0233, bakery@mail.com, Food, SEO Setup"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button
              onClick={handleParse}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> PARSE INPUT
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Parsed Preview ({parsedLeads.length})</label>
            </div>
            <div className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {parsedLeads.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center p-8">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase">No data parsed yet</p>
                  </div>
                ) : (
                  parsedLeads.map((lead) => (
                    <div key={lead.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 truncate">{lead.name || 'Untitled Business'}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{lead.phone || 'No Phone'} • {lead.industry}</div>
                      </div>
                      <button onClick={() => lead.id && handleRemoveLead(lead.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              disabled={parsedLeads.length === 0}
              onClick={handleSubmit}
              className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black text-sm hover:bg-cyan-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-100"
            >
              <CheckCircle2 className="w-4 h-4" /> IMPORT TO DISCOVERED
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualBatchModal;
