
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Users } from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentBatteryProps {
  agents: AgentStatus[];
  onClick: () => void;
}

const AgentBattery: React.FC<AgentBatteryProps> = ({ agents, onClick }) => {
  const averageEfficiency = useMemo(() => {
    if (agents.length === 0) return 0;
    const total = agents.reduce((acc, agent) => acc + agent.efficiency, 0);
    return Math.round(total / agents.length);
  }, [agents]);

  const getBatteryIcon = () => {
    if (averageEfficiency > 80) return <BatteryFull className="w-4 h-4 text-emerald-400" />;
    if (averageEfficiency > 50) return <BatteryMedium className="w-4 h-4 text-amber-400" />;
    return <BatteryLow className="w-4 h-4 text-red-400" />;
  };

  const getStatusColor = () => {
    if (averageEfficiency > 80) return 'text-emerald-400 shadow-[0_0_10px_#10b981]';
    if (averageEfficiency > 50) return 'text-amber-400 shadow-[0_0_10px_#f59e0b]';
    return 'text-red-400 shadow-[0_0_10px_#ef4444]';
  };

  const getBatteryBg = () => {
    if (averageEfficiency > 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (averageEfficiency > 50) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 ${getBatteryBg()}`}
    >
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-white/70" />
        <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Agents</span>
      </div>
      
      <div className="flex items-center gap-2 pl-2 border-l border-white/10">
        <div className="relative flex items-center">
          {getBatteryIcon()}
          <motion.div 
            animate={{ opacity: averageEfficiency < 100 ? [0.4, 1, 0.4] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`absolute inset-0 blur-sm ${getStatusColor()}`}
          />
        </div>
        <span className={`text-[11px] font-black mono tracking-tighter ${getStatusColor()}`}>
          {averageEfficiency}%
        </span>
      </div>

      {averageEfficiency < 100 && (
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
        </div>
      )}
    </motion.button>
  );
};

export default AgentBattery;
