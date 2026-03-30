
import React, { useState, useMemo } from 'react';
import { Lead } from '../types';
import { Database, Trash2, CheckCircle, XCircle, TrendingUp, DollarSign, BarChart, FileSpreadsheet, ArrowUpDown, Target, ShieldCheck, Lock } from 'lucide-react';

interface DatabaseTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onExport: () => void;
}

const DatabaseTable: React.FC<DatabaseTableProps> = ({ leads, onDelete, onExport }) => {
  const [sortKey, setSortKey] = useState<keyof Lead>('revenuePerLead');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Only display leads that are either in Q7 or historical
  const vaultLeads = useMemo(() => leads.filter(l => l.queue === 'completed'), [leads]);

  const sortedLeads = useMemo(() => {
    return [...vaultLeads].sort((a, b) => {
      const valA = a[sortKey] || 0;
      const valB = b[sortKey] || 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [vaultLeads, sortKey, sortOrder]);

  const toggleSort = (key: keyof Lead) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  if (vaultLeads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center opacity-20 border border-white/5 bg-black/40 rounded-3xl">
        <Lock className="w-16 h-16 mb-4 text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Vault_Empty :: No_Persistent_Records</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
        <div className="flex gap-12">
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Vault_Net_Yield</span>
             <span className="text-2xl font-black text-emerald-400 mono tracking-tighter">${vaultLeads.reduce((a, b) => a + (b.revenuePerLead || 0), 0).toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Success_Probability</span>
             <span className="text-2xl font-black text-white mono tracking-tighter">{(vaultLeads.filter(l => l.fulfillmentOutcome === 'success').length / (vaultLeads.length || 1) * 100).toFixed(1)}%</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Archived_Entities</span>
             <span className="text-2xl font-black text-emerald-500 mono tracking-tighter">{vaultLeads.length}</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end mr-4">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono">Sync_Security</span>
             <span className="text-[10px] text-emerald-500 mono font-bold flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> VERIFIED
             </span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 bg-black/40 rounded-2xl">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-zinc-950 z-20">
            <tr className="border-b border-white/10 shadow-sm bg-black/60">
              <th onClick={() => toggleSort('name')} className="w-[30%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase cursor-pointer hover:text-white transition-colors group">
                <div className="flex items-center gap-2">Node_Descriptor <ArrowUpDown className="w-3 h-3 opacity-20 group-hover:opacity-100" /></div>
              </th>
              <th onClick={() => toggleSort('readinessScore')} className="w-[15%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase cursor-pointer hover:text-white transition-colors group">
                <div className="flex items-center gap-2">Potency <ArrowUpDown className="w-3 h-3 opacity-20 group-hover:opacity-100" /></div>
              </th>
              <th onClick={() => toggleSort('revenuePerLead')} className="w-[15%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase cursor-pointer hover:text-white transition-colors group">
                <div className="flex items-center gap-2">Vaulted_Yield <ArrowUpDown className="w-3 h-3 opacity-20 group-hover:opacity-100" /></div>
              </th>
              <th className="w-[20%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Integrity_Check</th>
              <th className="w-[20%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Verification_Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-emerald-500/[0.04] transition-all group border-l-2 border-transparent hover:border-emerald-500">
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-white uppercase truncate">{lead.name}</div>
                  <div className="text-[8px] mono text-slate-600 truncate uppercase">{lead.industry} • {lead.location}</div>
                </td>
                <td className="px-6 py-4">
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-emerald-500/40" style={{ width: `${lead.readinessScore}%` }} />
                   </div>
                   <span className="text-[8px] mono text-emerald-500/60 font-black">{lead.readinessScore}% READY</span>
                </td>
                <td className="px-6 py-4">
                   <div className={`text-xs mono font-black px-2 py-1 rounded inline-block ${lead.revenuePerLead ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-800'}`}>
                     ${(lead.revenuePerLead || 0).toLocaleString()}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-[7px] mono text-emerald-500/60 font-black uppercase">
                      <ShieldCheck className="w-2.5 h-2.5" /> Integrity_Verified
                    </div>
                    <div className="text-[6px] mono text-slate-700 uppercase truncate">
                      Orig: {lead.originalName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase ${lead.fulfillmentOutcome === 'success' ? 'text-emerald-400' : 'text-red-500'}`}>
                      {lead.fulfillmentOutcome === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {lead.fulfillmentOutcome === 'success' ? 'SYNC_VERIFIED' : 'SYNC_FAILED'}
                  </div>
                  <div className="text-[7px] mono text-slate-700 mt-1 uppercase">Logged: {lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : 'N/A'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatabaseTable;
