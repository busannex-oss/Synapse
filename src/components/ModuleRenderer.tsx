
import React from 'react';
import MarketSummary from './MarketSummary';
import StabilityMonitor from './StabilityMonitor';
import SystemAudit from './SystemAudit';
import DatabaseTable from './DatabaseTable';
import LeadCard from './LeadCard';
import ProjectManagerPanel from './ProjectManagerPanel';
import SystemsTraining from './SystemsTraining';
import MemoryPanel from './MemoryPanel';
import AnalysisPanel from './AnalysisPanel';
import ProductCatalog from './ProductCatalog';
import { Lead, MarketData, SystemLog, Signal, Directive, AgentStatus, PMReport, VideoGeneration, BusinessStrategy } from '../types';

interface ModuleRendererProps {
  id: string;
  leads: Lead[];
  marketData: MarketData[];
  logs: SystemLog[];
  successRate: number;
  signals?: Signal[];
  directives?: Directive[];
  agents?: AgentStatus[];
  pmReports?: PMReport[];
  advice?: string;
  isAnalyzing?: boolean;
  isMaintenanceMode?: boolean;
  isNeuralActive?: boolean;
  onAction: (lead: Lead) => void;
  onDismissDirective?: (id: string) => void;
  onRunMaintenance?: () => void;
  onRunNeuralScan?: () => void;
  onUpdateAgent?: (agentId: string, updates: Partial<AgentStatus>) => void;
  onHandleRecommendation?: (agentId: string, recommendationId: string, action: 'accept' | 'reject') => void;
  onReleaseFindings?: () => void;
  onLog?: (log: any) => void;
  onDelete?: (id: string) => void;
  onViewStrategy?: (lead: Lead) => void;
  onClearLogs?: () => void;
  onAudit?: () => void;
  isAuditing?: boolean;
  videos?: VideoGeneration[];
  onGenerateVideo?: (prompt: string, type: VideoGeneration['type'], options?: any) => void;
  onAddVideo?: (video: VideoGeneration) => void;
  onDeleteVideo?: (id: string) => void;
  isGeneratingVideo?: boolean;
  defaultOverlayOpacity?: number;
  defaultOverlayBlendMode?: VideoGeneration['overlayBlendMode'];
  strategy?: BusinessStrategy | null;
  isAnalyzingStrategy?: boolean;
}

const ModuleRenderer: React.FC<ModuleRendererProps> = ({ 
  id, leads, marketData, logs, successRate, 
  signals = [], directives = [], agents = [], pmReports = [], advice = '', 
  isAnalyzing = false, isMaintenanceMode = false, isNeuralActive = false,
  onAction, onDismissDirective = () => {}, onRunMaintenance = () => {}, 
  onRunNeuralScan = () => {}, onUpdateAgent = () => {}, onHandleRecommendation = () => {},
  onReleaseFindings = () => {},
  onLog = () => {}, onDelete = () => {}, onViewStrategy = () => {},
  onClearLogs = () => {}, onAudit = () => {}, isAuditing = false,
  videos = [], onGenerateVideo = () => {}, onAddVideo = () => {}, onDeleteVideo = () => {},
  isGeneratingVideo = false, defaultOverlayOpacity = 0.5, defaultOverlayBlendMode = 'normal',
  strategy = null, isAnalyzingStrategy = false
}) => {
  switch (id) {
    case 'market':
      return <MarketSummary leads={leads} marketData={marketData} />;
    case 'pipeline':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leads.filter(l => l.queue !== 'archive').slice(0, 4).map(lead => (
            <LeadCard key={lead.id} lead={lead} onDelete={onDelete} onAdd={onAction} onViewStrategy={onViewStrategy} />
          ))}
        </div>
      );
    case 'stability':
      return <StabilityMonitor rate={successRate} />;
    case 'audit':
      return <SystemAudit logs={logs} onClear={onClearLogs} onAudit={onAudit} isAuditing={isAuditing} />;
    case 'database':
      return <DatabaseTable leads={leads} logs={logs} onDelete={onDelete} onExport={() => {}} onViewStrategy={onViewStrategy} />;
    case 'products':
      return <ProductCatalog />;
    case 'signals':
      return (
        <ProjectManagerPanel 
          signals={signals} 
          directives={directives} 
          agents={agents}
          pmReports={pmReports}
          logs={logs}
          advice={advice}
          isAnalyzing={isAnalyzing}
          isMaintenanceMode={isMaintenanceMode}
          isNeuralActive={isNeuralActive}
          onDismissDirective={onDismissDirective}
          onRunMaintenance={onRunMaintenance}
          onRunNeuralScan={onRunNeuralScan}
          onUpdateAgent={onUpdateAgent}
          onHandleRecommendation={onHandleRecommendation}
          onReleaseFindings={onReleaseFindings}
        />
      );
    case 'training':
      return (
        <SystemsTraining 
          videos={videos} 
          onGenerateVideo={onGenerateVideo} 
          onAddVideo={onAddVideo} 
          onDeleteVideo={onDeleteVideo} 
          isGenerating={isGeneratingVideo} 
          defaultOverlayOpacity={defaultOverlayOpacity}
          defaultOverlayBlendMode={defaultOverlayBlendMode}
          logs={logs}
        />
      );
    case 'memory':
      return <MemoryPanel agents={agents} onLog={onLog} />;
    case 'analysis':
      return <AnalysisPanel lead={leads[0] || null} strategy={leads[0]?.proposal || null} loading={isAnalyzingStrategy} />;
    default:
      return null;
  }
};

export default ModuleRenderer;
