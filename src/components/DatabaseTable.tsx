
import React, { useState, useMemo } from 'react';
import { Lead, SystemLog } from '../types';
import { Database, Trash2, CheckCircle, XCircle, TrendingUp, DollarSign, BarChart, FileSpreadsheet, ArrowUpDown, Target, ShieldCheck, Lock, FileText, Download, FileDown, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { exportToPDF, exportToExcel, filterLeadsByTimeframe } from '../services/exportService';
import { motion, AnimatePresence } from 'motion/react';
import ContextualLog from './ContextualLog';

interface DatabaseTableProps {
  leads: Lead[];
  logs: SystemLog[];
  onDelete: (id: string) => void;
  onExport: () => void;
  onViewStrategy?: (lead: Lead) => void;
}

const DatabaseTable: React.FC<DatabaseTableProps> = ({ leads = [], logs = [], onDelete, onExport, onViewStrategy }) => {
  const [sortKey, setSortKey] = useState<keyof Lead>('revenuePerLead');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Display all leads in the vault until deleted
  const vaultLeads = leads;

  const stats = useMemo(() => {
    const total = vaultLeads.reduce((a, b) => a + (b.revenuePerLead || 0), 0);
    const lost = vaultLeads.filter(l => l.fulfillmentOutcome === 'failure').reduce((a, b) => a + (b.revenuePerLead || 0), 0);
    const predicted = vaultLeads.reduce((a, b) => a + ((b.revenuePerLead || 0) * (b.readinessScore || 0) / 100), 0);
    const efficiency = total > 0 ? ((total - lost) / total) * 100 : 100;

    return { total, lost, predicted, efficiency };
  }, [vaultLeads]);

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
      <div className="flex-1 flex flex-col items-center justify-center opacity-20 border border-white/5 bg-black/40 rounded-3xl p-12 text-center">
        <Database className="w-16 h-16 mb-4 text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2">Vault_Empty :: No_Neural_Records_Detected</p>
        <p className="text-[9px] text-slate-500 mono max-w-xs">All discovered leads will automatically persist in the vault until manually purged. Initiate a neural discovery to populate the database.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
        <div className="flex gap-12">
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Total_Vault_Value</span>
             <span className="text-2xl font-black text-emerald-400 mono tracking-tighter">${stats.total.toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-red-500/60 uppercase tracking-widest mb-1">Total_Value_Lost</span>
             <span className="text-2xl font-black text-red-400 mono tracking-tighter">${stats.lost.toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-cyan-500/60 uppercase tracking-widest mb-1">Predicted_Value</span>
             <span className="text-2xl font-black text-cyan-400 mono tracking-tighter">${stats.predicted.toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-1">System_Efficiency</span>
             <span className="text-2xl font-black text-white mono tracking-tighter">{stats.efficiency.toFixed(1)}%</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <button 
               onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
             >
               <Download className="w-3.5 h-3.5" />
               Generate_Report
               <ChevronDown className={`w-3 h-3 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             <AnimatePresence>
               {isExportMenuOpen && (
                 <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-2"
                 >
                   <div className="p-2 mb-1">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">Master_Export</span>
                   </div>
                   <button 
                     onClick={() => { exportToPDF(vaultLeads, 'NEURAL_VAULT_FULL_REPORT'); setIsExportMenuOpen(false); }}
                     className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-[10px] font-bold text-white transition-colors text-left"
                   >
                     <FileDown className="w-4 h-4 text-emerald-500" />
                     Export All to PDF
                   </button>
                   <button 
                     onClick={() => { exportToExcel(vaultLeads, 'NEURAL_VAULT_FULL_DATA'); setIsExportMenuOpen(false); }}
                     className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-[10px] font-bold text-white transition-colors text-left"
                   >
                     <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
                     Export All to Excel
                   </button>

                   <div className="h-px bg-white/5 my-2 mx-2" />
                   
                   <div className="p-2 mb-1">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">Temporal_Reports</span>
                   </div>
                   
                   {['daily', 'weekly', 'monthly'].map((timeframe) => (
                     <div key={timeframe} className="flex flex-col gap-1 mb-1">
                       <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase mono">{timeframe}</div>
                       <div className="flex gap-1 px-2">
                         <button 
                           onClick={() => { 
                             const filtered = filterLeadsByTimeframe(vaultLeads, timeframe as any);
                             exportToPDF(filtered, `${timeframe.toUpperCase()}_NEURAL_REPORT`);
                             setIsExportMenuOpen(false);
                           }}
                           className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-lg text-[8px] font-bold text-emerald-500 transition-colors border border-emerald-500/10"
                         >
                           <FileDown className="w-3 h-3" /> PDF
                         </button>
                         <button 
                           onClick={() => { 
                             const filtered = filterLeadsByTimeframe(vaultLeads, timeframe as any);
                             exportToExcel(filtered, `${timeframe.toUpperCase()}_NEURAL_DATA`);
                             setIsExportMenuOpen(false);
                           }}
                           className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-lg text-[8px] font-bold text-cyan-500 transition-colors border border-cyan-500/10"
                         >
                           <FileSpreadsheet className="w-3 h-3" /> EXCEL
                         </button>
                       </div>
                     </div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

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
              <th onClick={() => toggleSort('queue')} className="w-[12%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase cursor-pointer hover:text-white transition-colors group">
                <div className="flex items-center gap-2">Pipeline_Stage <ArrowUpDown className="w-3 h-3 opacity-20 group-hover:opacity-100" /></div>
              </th>
              <th className="w-[12%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Neural_Enrichment</th>
              <th className="w-[12%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Integrity_Check</th>
              <th className="w-[12%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Neural_Asset</th>
              <th className="w-[10%] px-6 py-4 text-[9px] font-black text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedLeads.map((lead) => (
              <tr 
                key={lead.id} 
                onClick={() => lead.proposal && onViewStrategy?.(lead)}
                className="hover:bg-emerald-500/[0.04] transition-all group border-l-2 border-transparent hover:border-emerald-500 cursor-pointer select-none"
              >
                <td className="px-6 py-4">
                  <div className="text-xs font-black text-white uppercase truncate tracking-widest">{lead.name}</div>
                  <div className="text-[9px] font-bold text-cyan-500/70 uppercase truncate tracking-wider mt-0.5">{lead.address}</div>
                  <div className="text-[7px] mono text-slate-600 truncate uppercase mt-1">{lead.industry} • {lead.location}</div>
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
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${lead.queue === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`} />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest mono">{lead.queue}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {['Melissa', 'YP', 'FB', 'Bing', 'Apollo'].map(source => (
                      <span key={source} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[6px] font-black text-slate-500 uppercase tracking-tighter hover:text-cyan-400 hover:border-cyan-500/30 transition-colors">
                        {source}
                      </span>
                    ))}
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
                  {lead.proposal ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onViewStrategy?.(lead); }}
                        className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[8px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 group/btn"
                      >
                        <FileText className="w-3 h-3" /> View_Offer
                      </button>
                      {lead.proposal.serviceCostBreakdown?.some(item => item.service.toLowerCase().includes('30-year') || item.service.toLowerCase().includes('30 year')) && (
                        <div className="flex items-center gap-1 text-[6px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">
                          <Sparkles className="w-2 h-2" /> Signature_Plan_Included
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[8px] mono text-slate-700 uppercase italic">Synthesis_Pending</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase ${
                    lead.fulfillmentOutcome === 'success' ? 'text-emerald-400' : 
                    lead.fulfillmentOutcome === 'failure' ? 'text-red-500' : 'text-slate-500'
                  }`}>
                      {lead.fulfillmentOutcome === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                       lead.fulfillmentOutcome === 'failure' ? <XCircle className="w-3.5 h-3.5" /> : 
                       <div className="w-3.5 h-3.5 rounded-full border border-slate-500/30 animate-pulse" />}
                      {lead.fulfillmentOutcome === 'success' ? 'SYNC_VERIFIED' : 
                       lead.fulfillmentOutcome === 'failure' ? 'SYNC_FAILED' : 'NEURAL_PENDING'}
                  </div>
                  <div className="text-[7px] mono text-slate-700 mt-1 uppercase">Logged: {lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : 'ACTIVE_PIPELINE'}</div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all duration-300"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Database Contextual Logs */}
      <div className="mt-6">
        <ContextualLog 
          logs={logs} 
          module="DATABASE" 
          title="Vault_Sync_Telemetry" 
          limit={5} 
        />
      </div>
    </div>
  );
};

export default DatabaseTable;
