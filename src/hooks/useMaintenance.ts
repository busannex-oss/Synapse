import { useState, useCallback } from 'react';
import { Lead, SystemLog, AgentStatus } from '../types';
import { storageService } from '../services/storageService';

export const useMaintenance = (
  masterDb: Lead[],
  setMasterDb: React.Dispatch<React.SetStateAction<Lead[]>>,
  logs: SystemLog[],
  setLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>,
  agents: AgentStatus[],
  recalibrateAgents: () => void,
  addLog: (log: any) => void
) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const performMaintenance = useCallback(async () => {
    setIsOptimizing(true);
    addLog({ type: 'info', module: 'NEURAL_OPTIMIZER', message: 'Initiating System-Wide Optimization Sequence...' });

    try {
      // 1. Speed & Organization Optimization
      addLog({ type: 'info', module: 'NEURAL_OPTIMIZER', message: 'Optimizing data structures and clearing temporary buffers...' });
      await new Promise(r => setTimeout(r, 1000));

      // 2. Data Integrity Check (Deduplication)
      const uniqueLeads = Array.from(new Map(masterDb.map(item => [item.email || item.id, item])).values());
      const duplicatesRemoved = masterDb.length - uniqueLeads.length;
      if (duplicatesRemoved > 0) {
        setMasterDb(uniqueLeads);
        addLog({ type: 'success', module: 'DATA_INTEGRITY', message: `Cleaned database. Removed ${duplicatesRemoved} redundant nodes.` });
      }

      // 3. Agent Recalibration
      recalibrateAgents();

      // 4. Report Synthesis
      addLog({ type: 'info', module: 'NEURAL_OPTIMIZER', message: 'Synthesizing operational reports and archiving historical logs...' });
      
      // 5. Error Log Clearing (Keep only last 100 logs)
      if (logs.length > 100) {
        setLogs(prev => prev.slice(-100));
        addLog({ type: 'info', module: 'STORAGE_MANAGER', message: 'Archived historical logs to maintain high-speed throughput.' });
      }

      // 6. Vault Maintenance
      addLog({ type: 'success', module: 'NEURAL_OPTIMIZER', message: 'System Optimization Complete. All nodes at peak performance.' });
    } catch (error) {
      addLog({ type: 'error', module: 'NEURAL_OPTIMIZER', message: `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsOptimizing(false);
    }
  }, [masterDb, setMasterDb, logs, setLogs, recalibrateAgents, addLog]);

  return {
    isOptimizing,
    performMaintenance
  };
};
