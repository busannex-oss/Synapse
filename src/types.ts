
export type LeadQueue = 
  | 'discovery' 
  | 'verification' 
  | 'qualification' 
  | 'intelligence' 
  | 'synthesis' 
  | 'fulfillment' 
  | 'completed'
  | 'archive';

export type AIRoute = 
  | 'GEMINI_3_PRO' 
  | 'GEMINI_3_FLASH' 
  | 'CLAUDE_3_5_OPUS' 
  | 'CLAUDE_3_5_SONNET'
  | 'OPENAI_GPT_4O'
  | 'OPENAI_GPT_5_PROXY'
  | 'GROK_3_TUNNEL'
  | 'DEEPSEEK_V3'
  | 'EXTERNAL_BRIDGE';

export type VideoRoute = 
  | 'SORA'
  | 'VEO_3_1'
  | 'RUNWAY_GEN_3'
  | 'PIKA_2_0'
  | 'FFMPEG_GEMINI'
  | 'WEBCODECS_NEURAL'
  | 'LIVE_CAPTURE';

export interface AjaSettings {
  name: string;
  gender: 'male' | 'female';
  tone: 'professional' | 'friendly' | 'robotic' | 'empathetic' | 'humanoid_relatable' | 'alert_engaged';
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  accessibility: boolean;
  availability: '24/7' | 'business_hours' | 'scheduled';
  schedule?: { start: string; end: string };
  isSuperAdmin: boolean;
  humanoidFormDetails: string;
}

export interface NeuralBackgroundSettings {
  enabled: boolean;
  motionEnabled: boolean;
  speed: number; // 0.1 to 2.0
  transparency: number; // 0 to 1
  deactivateOnInteraction: boolean;
  interactive: boolean;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  type: 'audit' | 'performance' | 'security' | 'maintenance';
  timestamp: string;
  author: string;
  status: 'draft' | 'final' | 'archived';
  directives?: any[];
}

export interface PMReport {
  id: string;
  title: string;
  generatedBy: string;
  status: 'reviewed' | 'approved' | 'pending';
  date: string;
  content: string;
}

export interface ImprovementReport {
  id: string;
  date: string;
  performanceGain: number;
  newCapabilities: string[];
  optimizationNotes: string;
}

export interface Directive {
  id: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  instruction: string;
  status: 'pending' | 'executing' | 'completed' | 'dismissed';
  agentId: string;
}

export interface Signal {
  id: string;
  timestamp: string;
  source: string;
  type: 'report' | 'alert' | 'request';
  payload: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ImageGeneration {
  id: string;
  timestamp: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  url?: string;
  imageName: string;
  systemId: string;
  aspectRatio: string;
}

export interface VideoGeneration {
  id: string;
  timestamp: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  url?: string;
  route: VideoRoute;
  type: 'tutorial' | 'demonstration' | 'briefing';
  videoName: string;
  companyName?: string;
  userGenerating: string;
  bgPrompt?: string;
  overlayPrompt?: string;
  overlayOpacity?: number;
  overlayBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'lighten' | 'darken';
  codec?: 'H.264' | 'VP9';
  resolution?: '720p' | '1080p';
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'warning' | 'error';
  lastAction: string;
  efficiency: number;
  signalsSent: number;
  uptime: string;
  specialization?: string;
  
  // Humanized Fields
  firstName: string;
  lastName: string;
  age: number;
  personality: string;
  tone: string;
  gender: 'male' | 'female' | 'non-binary';
  language: string;
  responsibilities: string;
  educationalBackground: string;
  memoryLink: string;
  headshotUrl?: string;
  recommendations?: AgentRecommendation[];

  // Identity & Governance
  identity: string;
  securityLayer: string;
  capabilities: string[];
  governanceLayer: string;
  memoryLog: string[];
  improvement: string;
  intelligence: number;
}

export interface AgentRecommendation {
  id: string;
  type: 'speed' | 'quality' | 'accuracy' | 'revenue' | 'leads' | 'performance' | 'capacity' | 'recovery' | 'error_reduction' | 'infrastructure' | 'reliability' | 'security' | 'overall';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'implemented' | 'rejected' | 'pending';
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  agentId: string;
  content: string;
  embedding: number[];
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'warning' | 'success' | 'critical';
  module: string;
  message: string;
  route?: AIRoute;
  agentId?: string;
}

export interface Lead {
  id: string;
  name: string;
  industry: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  address: string;
  businessNeed: string;
  searchDate: string;
  location: string;
  status: 'no_website' | 'no_social' | 'no_digital';
  missingElements: string[];
  description: string;
  enrichmentSources: string[];
  confidenceScore: number;
  website?: string;
  scoreBreakdown: {
    satellite: number;
    yellowPages: number;
    melissaData: number;
    dAndB: number;
  };
  
  // 7-Stage Pipeline tracking
  queue: LeadQueue;
  isProcessing: boolean;
  processingProgress: number;
  processingTargetQueue?: LeadQueue;
  
  // Q3 Qualification Stats
  yearsInBusiness?: number;
  sentimentTrend: 'positive' | 'neutral' | 'negative';
  competitionDensity: 'low' | 'medium' | 'high';
  readinessScore: number;

  // Q5 Synthesis Data
  proposal?: BusinessStrategy;
  
  // Q7 Revenue Tracking
  fulfillmentOutcome?: 'success' | 'failure';
  completedAt?: string;
  revenuePerLead?: number;
  conversionRate?: number;
  marketActivityScore?: number;

  // Original Data (Essential for Integrity)
  originalName: string;
  originalLocation: string;
  originalPhone?: string;
  originalWebsite?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  lastUpdated: string;
  source: string;
}

export interface BusinessStrategy {
  id: string;
  analysis: string;
  valueProposition: string;
  revenueOpportunities: string[];
  serviceCostBreakdown: {
    service: string;
    cost: number;
    description: string;
  }[];
  // Q5 specific outputs
  proposalDraft: string;
  outreachEmail: string;
  followUpEmail: string;
  pitchText: string;
  voiceScript: string;
  postalLetter: string;
  aiReceptionistScript: string;
  pitchDeckOutline: string[];
  aiAudit?: {
    howItHelps: string;
    whyNow: string;
    strategicUncoverings: string;
  };
}
