import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  BarChart3, Layers, Activity, Terminal, Database, 
  GripVertical, Eye, EyeOff, Star, ArrowUp, ArrowDown
} from 'lucide-react';

export interface DashboardModule {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  visible: boolean;
}

interface DashboardProps {
  layout: DashboardModule[];
  onLayoutChange: (newLayout: DashboardModule[]) => void;
  renderModule: (id: string) => React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ layout, onLayoutChange, renderModule }) => {
  const activeModules = layout.filter(m => m.visible);
  const availableModules = layout.filter(m => !m.visible);

  const handleReorder = (newActiveOrder: DashboardModule[]) => {
    // Maintain the full layout state by combining reordered active modules with hidden ones
    const newLayout = [...newActiveOrder, ...availableModules];
    onLayoutChange(newLayout);
  };

  const toggleVisibility = (id: string) => {
    const newLayout = layout.map(m => 
      m.id === id ? { ...m, visible: !m.visible } : m
    );
    onLayoutChange(newLayout);
  };

  const cyclePriority = (id: string) => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const newLayout = layout.map(m => {
      if (m.id === id) {
        const currentIndex = priorities.indexOf(m.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...m, priority: priorities[nextIndex] };
      }
      return m;
    });
    onLayoutChange(newLayout);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Neural_Dashboard_Architect</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mono">Double-click modules to add/remove from active duty</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Active Modules Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 opacity-50">
            <Activity className="w-3 h-3 text-cyan-500" />
            <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Active_Neural_Modules</span>
          </div>
          
          {activeModules.length > 0 ? (
            <Reorder.Group axis="y" values={activeModules} onReorder={handleReorder} className="space-y-4">
              {activeModules.map((module) => (
                <Reorder.Item
                  key={module.id}
                  value={module}
                  onDoubleClick={() => toggleVisibility(module.id)}
                  className={`hud-panel p-4 border transition-all duration-300 cursor-default select-none ${
                    module.priority === 'high' ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 
                    module.priority === 'medium' ? 'border-white/10' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-slate-600 cursor-grab active:cursor-grabbing" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{module.title}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase mono ${
                            module.priority === 'high' ? 'bg-cyan-500/20 text-cyan-400' :
                            module.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {module.priority}_PRIORITY
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); cyclePriority(module.id); }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                        title="Cycle Priority"
                      >
                        <Star className={`w-4 h-4 ${module.priority === 'high' ? 'text-cyan-400 fill-cyan-400' : 'text-slate-600'}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(module.id); }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                        title="Remove from Dashboard"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </button>
                    </div>
                  </div>

                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      {renderModule(module.id)}
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="hud-panel p-12 border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-30">
              <Layers className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-[10px] uppercase tracking-widest font-bold">No active modules. Double-click from repository below to reactivate.</p>
            </div>
          )}
        </section>

        {/* Available Modules Section */}
        {availableModules.length > 0 && (
          <section className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <Database className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural_Module_Repository</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableModules.map((module) => (
                <div
                  key={module.id}
                  onDoubleClick={() => toggleVisibility(module.id)}
                  className="hud-panel p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group select-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-white/5">
                        <EyeOff className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{module.title}</span>
                        <span className="text-[7px] text-slate-600 mono uppercase tracking-tighter">Status: Deactivated</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleVisibility(module.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUp className="w-3 h-3 text-cyan-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
