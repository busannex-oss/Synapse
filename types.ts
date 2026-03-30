
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
  | 'PIKA_2_0';

export interface AjaSettings {
  name: string;
  gender: 'male' | 'female';
  tone: 'professional' | 'friendly' | 'robotic' | 'empathetic';
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  accessibility: boolean;
  availability: '24/7' | 'business_hours' | 'scheduled';
  schedule?: { start: string; end: string };
  isSuperAdmin: boolean;
  humanoidFormDetails: string;
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

export interface VideoGeneration {
  id: string;
  timestamp: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'awaiting_review';
  url?: string;
  route: VideoRoute;
  type: 'tutorial' | 'demonstration' | 'briefing';
  videoName: string;
  userGenerating: string;
  libraryStatus: 'persistent' | 'temporary' | 'archived';
  groupId?: string;
  systemId: string; // Unique identification structure
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
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'warning' | 'success' | 'critical';
  module: string;
  message: string;
  route?: AIRoute;
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

  // Original Data (Essential for Integrity)
  originalName: string;
  originalLocation: string;
  originalPhone?: string;
  originalWebsite?: string;
}

export interface BusinessStrategy {
  analysis: string;
  valueProposition: string;
  revenueOpportunities: string[];
  // Q5 specific outputs
  proposalDraft: string;
  outreachEmail: string;
  followUpEmail: string;
  pitchText: string;
  voiceScript: string;
  pitchDeckOutline: string[];
}
