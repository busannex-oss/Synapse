import { useState, useCallback } from 'react';
import { SystemLog, Lead, Signal, Report } from '../types';
import { analyzeSystemState } from '../services/geminiService';
import { storageService } from '../services/storageService';

export const useSystemAudit = (
  logs: SystemLog[],
  masterDb: Lead[],
  systemStatus: 'on' | 'paused' | 'off',
  signals: Signal[],
  addLog: (log: any) => void
) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditReport, setLastAuditReport] = useState<Report | null>(null);

  const performAudit = useCallback(async () => {
    setIsAuditing(true);
    addLog({ type: 'info', module: 'SYSTEM_AUDIT', message: 'Initiating extensive system audit...' });
    
    try {
      const result = await analyzeSystemState(logs, masterDb, systemStatus, signals, addLog);
      
      const newReport: Report = {
        id: `audit-${Date.now()}`,
        title: 'System Audit & Optimization Report',
        content: result.advice || 'No specific advice generated.',
        type: 'audit',
        timestamp: new Date().toISOString(),
        author: 'SYSTEM_AUDIT_ENGINE',
        status: 'final',
        directives: result.directives || []
      };

      setLastAuditReport(newReport);
      await storageService.save('reports', [newReport]);
      
      addLog({ type: 'success', module: 'SYSTEM_AUDIT', message: 'System audit complete. Report generated and logged.' });
      return newReport;
    } catch (error) {
      addLog({ type: 'error', module: 'SYSTEM_AUDIT', message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
      return null;
    } finally {
      setIsAuditing(false);
    }
  }, [logs, masterDb, systemStatus, signals, addLog]);

  return {
    isAuditing,
    lastAuditReport,
    performAudit
  };
};
