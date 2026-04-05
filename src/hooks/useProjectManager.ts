
import React, { useState, useEffect, useCallback } from 'react';
import { Directive, Signal, SystemLog, Lead } from '../types';
import { analyzeSystemState } from '../services/geminiService';

export const useProjectManager = (
  systemStatus: 'on' | 'paused' | 'off',
  logs: SystemLog[],
  masterDb: Lead[],
  signals: Signal[],
  setSignals: React.Dispatch<React.SetStateAction<Signal[]>>,
  addLog: (log: any) => void,
  performMaintenance: () => void,
  updateAgentStatuses: () => void
) => {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [managerAdvice, setManagerAdvice] = useState<string>('');
  const [isManagerAnalyzing, setIsManagerAnalyzing] = useState(false);

  const runManager = useCallback(async () => {
    if (systemStatus !== 'on') return;
    setIsManagerAnalyzing(true);
    try {
      const result = await analyzeSystemState(logs, masterDb, systemStatus, signals, addLog);
      
      if (result.directives && result.directives.length > 0) {
        const newDirectives = result.directives.map(d => ({
          ...d,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          status: 'pending' as const
        }));
        setDirectives(prev => [...newDirectives, ...prev].slice(0, 10));

        // Check for maintenance directive
        if (newDirectives.some(d => d.instruction.toUpperCase().includes('MAINTENANCE') || d.title.toUpperCase().includes('MAINTENANCE'))) {
          performMaintenance();
        }
      }
      
      if (result.advice) {
        setManagerAdvice(result.advice);
      }

      if (result.signalsToProcess && result.signalsToProcess.length > 0) {
        setSignals(prev => prev.filter(s => !result.signalsToProcess.includes(s.id)));
      }

      updateAgentStatuses();

    } catch (error) {
      console.error("Manager loop failed:", error);
    } finally {
      setIsManagerAnalyzing(false);
    }
  }, [systemStatus, logs, masterDb, signals, addLog, performMaintenance, updateAgentStatuses, setSignals]);

  useEffect(() => {
    const interval = setInterval(runManager, 45000); // Run every 45 seconds
    const timeout = setTimeout(runManager, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [runManager]);

  return {
    directives,
    setDirectives,
    managerAdvice,
    isManagerAnalyzing,
    runManager
  };
};
