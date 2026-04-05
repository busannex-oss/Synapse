
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AgentStatus, SystemLog } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_AGENTS } from '../constants';

export const useAIAgents = (startTime: number, logs: SystemLog[], addLog: (log: any) => void) => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const prevAgentsRef = useRef<AgentStatus[]>([]);

  // Initial load
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const dbAgents = await storageService.loadAll('agents');
        if (dbAgents.length > 0) {
          setAgents(dbAgents);
        } else {
          const saved = localStorage.getItem('synapse_agents_v16');
          if (saved) {
            const parsed = JSON.parse(saved);
            setAgents(parsed);
            await storageService.save('agents', parsed);
          } else {
            setAgents(DEFAULT_AGENTS);
            await storageService.save('agents', DEFAULT_AGENTS);
          }
        }
      } catch (e) {
        console.error("Failed to load agents", e);
      }
    };

    loadAgents();
  }, []);

  // Auto-fill missing responsibilities (Optimized: only runs when agents are added or loaded)
  const agentsWithResponsibilities = useMemo(() => {
    let changed = false;
    const updatedAgents = agents.map(agent => {
      if (!agent.responsibilities || agent.responsibilities.trim() === '') {
        changed = true;
        let placeholder = '';
        const role = agent.role.toLowerCase();
        const spec = (agent.specialization || '').toLowerCase();

        if (role.includes('scout') || role.includes('discovery')) {
          placeholder = 'Multi-vector scan using Google Search & Maps grounding to identify high-potential nodes.';
        } else if (role.includes('analysis') || role.includes('strategy')) {
          placeholder = `Strategic synthesis of ${spec || 'data'} to generate actionable business vectors.`;
        } else if (role.includes('execution') || role.includes('fulfillment')) {
          placeholder = `Automated execution of ${spec || 'fulfillment'} protocols for identified opportunities.`;
        } else if (role.includes('integrity') || role.includes('verification')) {
          placeholder = `Deep-level audit of ${spec || 'data'} integrity to ensure system-wide accuracy.`;
        } else if (role.includes('oversight') || role.includes('manager')) {
          placeholder = `System-wide oversight and strategic coordination of ${spec || 'neural'} operations.`;
        } else if (role.includes('compliance') || role.includes('policy')) {
          placeholder = `Ensuring total adherence to ${spec || 'platform'} policies and regulatory frameworks.`;
        } else if (role.includes('hr') || role.includes('resources')) {
          placeholder = `Management of ${spec || 'human capital'} and internal culture within the neural network.`;
        } else if (role.includes('reception') || role.includes('front desk')) {
          placeholder = `Handling initial ${spec || 'inquiries'} and coordinating scheduling for the network.`;
        } else {
          placeholder = `Operational management of ${agent.role} with a focus on ${agent.specialization || 'system excellence'}.`;
        }
        return { ...agent, responsibilities: placeholder };
      }
      return agent;
    });

    return { updatedAgents, changed };
  }, [agents]);

  useEffect(() => {
    if (agentsWithResponsibilities.changed) {
      setAgents(agentsWithResponsibilities.updatedAgents);
    }
  }, [agentsWithResponsibilities]);

  // Structured logging for agent updates (Optimized: use a more efficient comparison)
  useEffect(() => {
    const updates: any[] = [];
    agents.forEach(agent => {
      const prevAgent = prevAgentsRef.current.find(a => a.id === agent.id);
      if (prevAgent) {
        if (prevAgent.status !== agent.status || prevAgent.lastAction !== agent.lastAction) {
          updates.push({
            type: 'info',
            module: 'AGENT_MONITOR',
            message: `[AGENT_UPDATE] ${agent.name} status: ${agent.status.toUpperCase()} | Last Action: ${agent.lastAction}`,
            agentId: agent.id,
            role: agent.role,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    if (updates.length > 0) {
      updates.forEach(u => addLog(u));
    }
    prevAgentsRef.current = agents;
  }, [agents, addLog]);

  const updateAgentStatuses = useCallback(() => {
    setAgents(prev => prev.map(agent => {
      const recentAgentLogs = logs.filter(l => l.module.includes(agent.name)).slice(-5);
      const hasErrors = recentAgentLogs.some(l => l.type === 'error' || l.type === 'critical');
      const isActive = recentAgentLogs.length > 0 && Date.now() - new Date(recentAgentLogs[recentAgentLogs.length - 1].timestamp).getTime() < 60000;
      
      const elapsed = Date.now() - startTime;
      const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

      return {
        ...agent,
        status: hasErrors ? 'error' : isActive ? 'active' : 'idle',
        efficiency: hasErrors ? Math.max(50, agent.efficiency - 5) : Math.min(100, agent.efficiency + 1),
        lastAction: recentAgentLogs.length > 0 ? recentAgentLogs[recentAgentLogs.length - 1].message : agent.lastAction,
        uptime: `${h}:${m}:${s}`
      };
    }));
  }, [logs, startTime]);

  const recalibrateAgents = useCallback(() => {
    const agentsToRecalibrate = agents.filter(a => a.efficiency < 95);
    
    if (agentsToRecalibrate.length === 0) {
      addLog({ type: 'info', module: 'NEURAL_OPTIMIZER', message: 'All agents operating above 95% efficiency. No recalibration required.' });
      return;
    }

    addLog({ 
      type: 'warning', 
      module: 'NEURAL_OPTIMIZER', 
      message: `Identifying ${agentsToRecalibrate.length} agents below 95% efficiency: ${agentsToRecalibrate.map(a => a.name).join(', ')}` 
    });

    setAgents(prev => prev.map(a => {
      if (a.efficiency < 95) {
        return {
          ...a,
          efficiency: 100,
          status: 'active',
          lastAction: 'Neural recalibration complete'
        };
      }
      return a;
    }));

    addLog({ 
      type: 'success', 
      module: 'NEURAL_OPTIMIZER', 
      message: `Targeted neural recalibration successful. Optimized ${agentsToRecalibrate.length} agents to 100% throughput.` 
    });
  }, [agents]);

  const updateAgent = useCallback((id: string, updates: Partial<AgentStatus>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  // Persist agents to storage
  useEffect(() => {
    const saveAgents = async () => {
      try {
        await storageService.save('agents', agents);
      } catch (e) {
        console.error("Agent Persistence Failure:", e);
      }
    };
    
    if (agents.length > 0) {
      saveAgents();
    }
  }, [agents]);

  return {
    agents,
    setAgents,
    updateAgent,
    deleteAgent,
    updateAgentStatuses,
    recalibrateAgents
  };
};
