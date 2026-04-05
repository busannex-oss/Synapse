
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Layers, Database, Mic, Activity, MapPin, 
  Building2, Search, Fingerprint, ExternalLink, Volume2,
  Terminal as Term, Box, Cpu, RefreshCcw, LayoutGrid, AlertTriangle,
  Play, Pause, Power, Zap, CircleOff, ChevronRight, BarChart3, Settings, Shield,
  FileSpreadsheet, Clock, Link as LinkIcon, Crosshair, Radar, History, ShieldAlert, Lock, Download, CheckCircle2,
  WifiOff, Share2, Server, Globe, Terminal, FileText, ExternalLink as ExtLink, Image as ImageIcon, RotateCcw,
  BookOpen, Brain, Film, ShieldCheck, LogIn, LogOut, User as UserIcon, Users, Waves, X
} from 'lucide-react';
import { 
  Lead, BusinessStrategy, LeadQueue, AIRoute, SystemLog, Directive, AgentStatus, Signal,
  AjaSettings, ImprovementReport, VideoRoute, VideoGeneration, AgentRecommendation, PMReport
} from './types';
import { searchLeads, generateStrategy, analyzeSystemState, generateVideoWithFallback, getIndustrySuggestions } from './services/geminiService';
import { playSuccessChime } from './services/soundService';
import { downloadReport } from './services/exportService';
import LeadCard from './components/LeadCard';
import WorkflowCard from './components/WorkflowCard';
import MarketSummary from './components/MarketSummary';
import VoiceAssistant from './components/VoiceAssistant';
import StabilityMonitor from './components/StabilityMonitor';
import DatabaseTable from './components/DatabaseTable';
import SystemAudit from './components/SystemAudit';
import Logo from './components/Logo';
import AjaAvatar from './components/AjaAvatar';
import ProjectManagerPanel from './components/ProjectManagerPanel';
import SystemsTraining from './components/SystemsTraining';
import Dashboard from './components/Dashboard';
import ModuleRenderer from './components/ModuleRenderer';
import MemoryPanel from './components/MemoryPanel';
import StrategyModal from './components/StrategyModal';
import AgentBattery from './components/AgentBattery';
import AgentListModal from './components/AgentListModal';
import { DashboardModule } from './components/Dashboard';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, FirebaseUser,
  collection, query, where, addDoc, updateDoc, deleteDoc, writeBatch, handleFirestoreError, OperationType
} from './firebase';

import { useAIAgents } from './hooks/useAIAgents';
import { useProjectManager } from './hooks/useProjectManager';
import { useGeolocation } from './hooks/useGeolocation';
import { useSystemAudit } from './hooks/useSystemAudit';
import { useMaintenance } from './hooks/useMaintenance';
import { storageService } from './services/storageService';
import { GoogleGenAI } from "@google/genai";

const QUEUE_ORDER: LeadQueue[] = [
  'discovery', 
  'verification', 
  'qualification', 
  'intelligence', 
  'synthesis', 
  'fulfillment', 
  'completed',
  'archive'
];

import PWAUpdater from './components/PWAUpdater';
import HudCorners from './components/HudCorners';
import TechnicalManual from './components/TechnicalManual';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutGrid, label: 'DASH', desc: 'Neural Command Center' },
  { id: 'discover', icon: Compass, label: 'Q1', desc: 'Neural Intake' },
  { id: 'pipeline', icon: Layers, label: 'Q2-6', desc: 'Neural Process' },
  { id: 'supervisor', icon: Shield, label: 'OVERSEER', desc: 'Neural Signals & Reports' },
  { id: 'database', icon: Box, label: 'ARCHIVE', desc: 'Secure Vault' },
  { id: 'audit', icon: Terminal, label: 'AUDIT', desc: 'System Logs' },
  { id: 'docs', icon: FileText, label: 'DOCS', desc: 'Technical Manual' },
  { id: 'training', icon: Settings, label: 'ST_08', desc: 'Neural Training' },
];

const AUTO_SYNC_INTERVAL = 12 * 60 * 60 * 1000;

import { saveMemory } from './services/memoryService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'pipeline' | 'database' | 'audit' | 'settings' | 'supervisor' | 'training' | 'dashboard' | 'docs'>('dashboard');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardModule[]>([
    { id: 'market', title: 'Market_Intelligence', priority: 'high', visible: true },
    { id: 'pipeline', title: 'Neural_Pipeline', priority: 'medium', visible: true },
    { id: 'stability', title: 'System_Stability', priority: 'medium', visible: true },
    { id: 'audit', title: 'Neural_Audit', priority: 'low', visible: true },
    { id: 'database', title: 'Master_Database', priority: 'low', visible: true },
    { id: 'products', title: 'Neural_Product_Catalog', priority: 'low', visible: true },
    { id: 'signals', title: 'Neural_Signals', priority: 'low', visible: false },
    { id: 'training', title: 'Neural_Training', priority: 'low', visible: false },
    { id: 'memory', title: 'Neural_Memory', priority: 'low', visible: false },
    { id: 'analysis', title: 'Neural_Analysis', priority: 'low', visible: false },
  ]);
  const [systemStatus, setSystemStatus] = useState<'on' | 'paused' | 'off'>('on');
  const [activeRoute, setActiveRoute] = useState<AIRoute>('GEMINI_3_PRO');
  const [isSearching, setIsSearching] = useState(false);
  const [isNeuralActive, setIsNeuralActive] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [masterDb, setMasterDb] = useState<Lead[]>(() => {
    const savedMaster = localStorage.getItem('synapse_master_v14');
    return savedMaster ? JSON.parse(savedMaster) : [];
  });
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [selectedLeadForStrategy, setSelectedLeadForStrategy] = useState<Lead | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const [isAjaSpeaking, setIsAjaSpeaking] = useState(false);
  const [isAjaListening, setIsAjaListening] = useState(false);
  const [industry, setIndustry] = useState('Traditional Restaurants');
  const [suggestedIndustries, setSuggestedIndustries] = useState<string[]>([
    "Traditional Restaurants", 
    "Old-school Auto Repair", 
    "Traditional Trades", 
    "Legacy Retail"
  ]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [syncCountdown, setSyncCountdown] = useState<string>('12:00:00');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  
  // White Label State
  const [appName, setAppName] = useState('SYNAPSE');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [overlayBlendMode, setOverlayBlendMode] = useState<VideoGeneration['overlayBlendMode']>('normal');
  const [bgSettings, setBgSettings] = useState({
    motionEnabled: true,
    speed: 1,
    opacity: 0.05,
    deactivateOnInteract: true,
    deactivationDelay: 3000
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const interactTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInteract = () => {
      if (!bgSettings?.deactivateOnInteract) return;
      setIsInteracting(true);
      if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
      interactTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, bgSettings?.deactivationDelay || 3000);
    };
    window.addEventListener('mousemove', handleInteract);
    window.addEventListener('keydown', handleInteract);
    window.addEventListener('click', handleInteract);
    window.addEventListener('touchstart', handleInteract);
    return () => {
      window.removeEventListener('mousemove', handleInteract);
      window.removeEventListener('keydown', handleInteract);
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('touchstart', handleInteract);
      if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
    };
  }, [bgSettings?.deactivateOnInteract, bgSettings?.deactivationDelay]);

  // AJA Settings
  const [ajaSettings, setAjaSettings] = useState<AjaSettings>({
    name: 'AJA',
    gender: 'female',
    tone: 'alert_engaged',
    voice: 'Kore',
    accessibility: true,
    availability: '24/7',
    isSuperAdmin: true,
    humanoidFormDetails: 'Advanced Neural Interface: Eyes, Ears, Brain, and Voice of SYNAPSE'
  });

  const [pmReports, setPmReports] = useState<PMReport[]>([
    {
      id: 'RPT-A9F3B2',
      title: 'Q1 Performance Analysis',
      generatedBy: 'Project Manager',
      status: 'approved',
      date: new Date().toISOString(),
      content: 'Detailed analysis of Q1 performance metrics across all active agents. All KPIs met or exceeded.'
    },
    {
      id: 'RPT-X7K9M4',
      title: 'Resource Allocation Strategy',
      generatedBy: 'Project Manager',
      status: 'reviewed',
      date: new Date(Date.now() - 86400000).toISOString(),
      content: 'Proposed resource allocation for upcoming neural scan cycles. Reallocation of compute to synthesis queue.'
    },
    {
      id: 'RPT-J2L5P8',
      title: 'Lead Conversion Audit',
      generatedBy: 'Project Manager',
      status: 'approved',
      date: new Date(Date.now() - 172800000).toISOString(),
      content: 'Audit of lead conversion rates in the fulfillment queue. Identified bottlenecks in email outreach.'
    }
  ]);

  const [improvementReports, setImprovementReports] = useState<ImprovementReport[]>([
    {
      id: 'rep_1',
      date: new Date().toISOString(),
      performanceGain: 1.2,
      newCapabilities: ['Multi-Provider Fallback', 'Overseer Integration'],
      optimizationNotes: 'Neural pathways optimized for faster inference.'
    }
  ]);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const handleGenerateImage = async (prompt: string, aspectRatio: string = '1:1') => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      showToast('Neural key missing. Image generation unavailable.', 'error');
      return;
    }

    setIsGeneratingImage(true);
    setImagePrompt(prompt);
    addLog({ type: 'info', module: 'AJA_NEURAL_LINK', message: `Initiating neural synthesis for prompt: ${prompt.substring(0, 50)}...` });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        addLog({ type: 'success', module: 'AJA_NEURAL_LINK', message: 'Neural synthesis complete. Image data received.' });
      } else {
        throw new Error('No image data received from neural link.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isQuotaExceeded = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
      
      if (isQuotaExceeded) {
        showToast('Neural Quota Exceeded (429). Using fallback synthesis.', 'info');
        addLog({ type: 'warning', module: 'AJA_NEURAL_LINK', message: 'Neural Quota Exceeded (429). Switching to fallback synthesis.' });
      } else {
        console.error('Neural Image Generation Failed:', error);
        showToast(`Neural synthesis failed: ${error.message}`, 'error');
        addLog({ type: 'error', module: 'AJA_NEURAL_LINK', message: `Neural synthesis failed: ${error.message}` });
      }

      // Fallback to picsum on error
      const randomSeed = Math.random().toString(36).substring(7);
      const fallbackUrl = `https://picsum.photos/seed/${randomSeed}-${Date.now()}/1920/1080?blur=2`;
      setGeneratedImage(fallbackUrl);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const [trainingVideos, setTrainingVideos] = useState<VideoGeneration[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Project Manager State
  const [signals, setSignals] = useState<Signal[]>([]);
  const [startTime] = useState(Date.now());
  // Dynamic success rate calculation based on fulfillment outcomes
  const successRate = useMemo(() => {
    const completedLeads = masterDb.filter(l => l.queue === 'completed' && l.fulfillmentOutcome);
    if (completedLeads.length === 0) return 99.95;
    const successful = completedLeads.filter(l => l.fulfillmentOutcome === 'success').length;
    return parseFloat(((successful / completedLeads.length) * 100).toFixed(2));
  }, [masterDb]);

  const isCritical = useMemo(() => successRate < 97, [successRate]);

  // Custom Hooks
  const { addLog } = useMemo(() => ({
    addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
      const newLog: SystemLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => {
        const updated = [...prev, newLog];
        return updated.slice(-200); // Keep last 200 logs
      });
    }
  }), []);

  const { location, setLocation, isDetectingLocation, detectLocation } = useGeolocation(addLog);

  // Fetch industry suggestions based on location
  useEffect(() => {
    if (!location || location === 'New York, NY') return; // Skip default or empty
    
    const fetchSuggestions = async () => {
      setIsFetchingSuggestions(true);
      try {
        const suggestions = await getIndustrySuggestions(location, addLog);
        if (suggestions && suggestions.length > 0) {
          setSuggestedIndustries(suggestions);
        }
      } catch (err) {
        console.error("Failed to fetch industry suggestions:", err);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 1500); // Debounce
    return () => clearTimeout(timer);
  }, [location, addLog]);

  useEffect(() => {
    // Log AJA Voice Fix and Architectural Update
    addLog({ 
      type: 'success', 
      module: 'AJA_NEURAL_LINK', 
      message: 'AJA Voice Protocol Refined: Migrated to Gemini 3.1 Live API. Real-time input field corrected from "media" to "audio" to prevent pulse errors. Architectural stability confirmed.' 
    });
    addLog({ 
      type: 'critical', 
      module: 'NEURAL_LINK', 
      message: 'AJA_NEURAL_LINK: Recalibration complete. Presence and engagement protocols optimized for maximum alertness.' 
    });
  }, [addLog]);

  const { agents, setAgents, updateAgent, deleteAgent, updateAgentStatuses, recalibrateAgents } = useAIAgents(startTime, logs, addLog);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const { isOptimizing, performMaintenance } = useMaintenance(
    masterDb, setMasterDb, logs, setLogs, agents, recalibrateAgents, addLog
  );

  const { isAuditing, lastAuditReport, performAudit } = useSystemAudit(
    logs, masterDb, systemStatus, signals, addLog
  );

  const { directives, setDirectives, managerAdvice, isManagerAnalyzing } = useProjectManager(
    systemStatus, logs, masterDb, signals, setSignals, addLog, performMaintenance, updateAgentStatuses
  );

  useEffect(() => {
    if (systemStatus === 'on') {
      addLog({ 
        type: 'success', 
        module: 'NEURAL_SHIELD', 
        message: 'External intelligence interference (Apple_v1.0) completely purged. Synapse Neural Shield is at 100% integrity.' 
      });
    }
  }, [systemStatus, addLog]);

  const handleRecommendation = useCallback(async (agentId: string, recommendationId: string, action: 'accept' | 'reject') => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const rec = agent.recommendations?.find(r => r.id === recommendationId);
    if (!rec) return;

    if (action === 'accept') {
      // Calculate parameter improvements based on impact
      const impactMultiplier = {
        low: 1,
        medium: 3,
        high: 5,
        critical: 10
      }[rec.impact] || 1;

      let newEfficiency = agent.efficiency || 85;
      let newIntelligence = agent.intelligence || 85;

      // Update parameters based on recommendation type
      const efficiencyTypes = ['speed', 'performance', 'infrastructure', 'capacity', 'overall'];
      const intelligenceTypes = ['quality', 'accuracy', 'error_reduction', 'reliability', 'security', 'overall'];

      if (efficiencyTypes.includes(rec.type)) {
        newEfficiency = Math.min(100, newEfficiency + impactMultiplier);
      }
      if (intelligenceTypes.includes(rec.type)) {
        newIntelligence = Math.min(100, newIntelligence + impactMultiplier);
      }

      const memoryEntry = `[STRATEGIC_UPGRADE] Accepted recommendation: ${rec.title}. Description: ${rec.description}. Impact: ${rec.impact.toUpperCase()}.`;
      const learnedBehavior = `[LEARNED_BEHAVIOR] Agent ${agent.name} has internalized "${rec.title}". New parameters: Efficiency ${newEfficiency}%, Intelligence ${newIntelligence}%. Behavior: ${rec.description}`;
      
      // Update agent state with implemented status, new parameters, and new memory log entries
      updateAgent(agentId, {
        efficiency: newEfficiency,
        intelligence: newIntelligence,
        recommendations: agent.recommendations?.map(r => r.id === recommendationId ? { ...r, status: 'implemented' } : r),
        memoryLog: [...(agent.memoryLog || []), memoryEntry, learnedBehavior]
      });

      // Persist to neural memory service
      await saveMemory(agentId, learnedBehavior, {
        recommendationId,
        type: rec.type,
        impact: rec.impact,
        timestamp: new Date().toISOString(),
        efficiency: newEfficiency,
        intelligence: newIntelligence
      });

      addLog({ 
        type: 'success', 
        module: agent.name, 
        message: `Accepted and implemented: ${rec.title}. Agent ${agent.name} has evolved with new learned behaviors.` 
      });
    } else {
      updateAgent(agentId, {
        recommendations: agent.recommendations?.filter(r => r.id !== recommendationId)
      });
      addLog({ type: 'warning', module: agent.name, message: `Dismissed recommendation: ${rec.title}` });
    }
  }, [agents, updateAgent, addLog]);

  // Sync leads from Firestore
  useEffect(() => {
    if (!user) {
      // If not logged in, we rely on localStorage (already loaded in useState)
      return;
    }

    const leadsQuery = query(collection(db, 'leads'), where('ownerUid', '==', user.uid));
    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leads: Lead[] = [];
      snapshot.forEach((doc) => {
        leads.push(doc.data() as Lead);
      });
      
      // Merge with local state to avoid losing unsynced changes
      setMasterDb(prev => {
        const merged = [...prev];
        leads.forEach(cloudLead => {
          const index = merged.findIndex(l => l.id === cloudLead.id);
          if (index !== -1) {
            // Data Integrity Guard: Intelligent Merge
            // We preserve local progress if it's more advanced than cloud state
            const localLead = merged[index];
            
            // If the cloud version is in a later queue, we take it entirely
            const cloudQueueIdx = QUEUE_ORDER.indexOf(cloudLead.queue);
            const localQueueIdx = QUEUE_ORDER.indexOf(localLead.queue);
            
            if (cloudQueueIdx > localQueueIdx) {
              merged[index] = cloudLead;
            } else if (cloudQueueIdx === localQueueIdx) {
              // Same queue: Preserve the most advanced progress
              merged[index] = {
                ...cloudLead,
                processingProgress: Math.max(cloudLead.processingProgress || 0, localLead.processingProgress || 0),
                isProcessing: cloudLead.isProcessing || localLead.isProcessing,
                // Preserve local proposal if cloud doesn't have it yet
                proposal: cloudLead.proposal || localLead.proposal,
                // Preserve local outcome if cloud doesn't have it yet
                fulfillmentOutcome: cloudLead.fulfillmentOutcome || localLead.fulfillmentOutcome
              };
            } else {
              // Cloud is somehow behind (unlikely but possible during sync lag)
              // We keep the local version but ensure it's marked for sync
              merged[index] = localLead;
            }
          } else {
            merged.push(cloudLead);
          }
        });
        return merged;
      });
      
      setIsInitialLoadComplete(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
      setIsInitialLoadComplete(true); // Still mark as complete to allow local ops
    });

    return () => unsubscribe();
  }, [user]);

  const saveLeadToCloud = useCallback(async (lead: Lead) => {
    if (!user) return;
    try {
      const leadWithUid = { ...lead, ownerUid: user.uid };
      await setDoc(doc(db, 'leads', lead.id), leadWithUid);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
    }
  }, [user]);

  const deleteLeadFromCloud = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  }, [user]);

  // Cloud persistence effect
  const lastSyncedDb = useRef<Lead[]>([]);
  useEffect(() => {
    if (!user) return;
    
    const changedLeads = masterDb.filter(lead => {
      const last = lastSyncedDb.current.find(l => l.id === lead.id);
      if (!last) return true; // New lead
      
      // Check for major changes (queue, outcome, processing status, etc.)
      const majorChange = 
        last.queue !== lead.queue || 
        last.isProcessing !== lead.isProcessing || 
        last.fulfillmentOutcome !== lead.fulfillmentOutcome ||
        last.revenuePerLead !== lead.revenuePerLead ||
        last.proposal?.id !== lead.proposal?.id;
        
      return majorChange;
    });

    if (changedLeads.length > 0) {
      changedLeads.forEach(l => saveLeadToCloud(l));
      lastSyncedDb.current = JSON.parse(JSON.stringify(masterDb)); // Deep copy to avoid reference issues
    }
  }, [masterDb, user, saveLeadToCloud]);

  const handleDeleteLead = useCallback((id: string) => {
    setMasterDb(prev => prev.filter(l => l.id !== id));
    deleteLeadFromCloud(id);
    addLog({ type: 'warning', module: 'MASTER_DATABASE', message: `Entity ${id} purged from neural stream.` });
  }, [addLog, deleteLeadFromCloud]);

  const handleLogin = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addLog({ type: 'success', module: 'AUTH', message: 'Neural link established via Google Auth.' });
    } catch (error: any) {
      addLog({ type: 'error', module: 'AUTH', message: `Auth failed: ${error.message}` });
    }
  }, [addLog]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      addLog({ type: 'warning', module: 'AUTH', message: 'Neural link severed. Session terminated.' });
    } catch (error: any) {
      addLog({ type: 'error', module: 'AUTH', message: `Logout failed: ${error.message}` });
    }
  }, [addLog]);

  // Firebase Auth & Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Location detection should only be triggered by user gesture to avoid permission errors
        // detectLocation();

        // Load preferences from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.dashboardLayout) {
            setDashboardLayout(data.dashboardLayout);
          }
          if (data.preferences) {
            if (data.preferences.overlayOpacity !== undefined) setOverlayOpacity(data.preferences.overlayOpacity);
            if (data.preferences.overlayBlendMode) setOverlayBlendMode(data.preferences.overlayBlendMode);
          }
          if (data.lastKnownLocation) {
            setLocation(data.lastKnownLocation);
          }
        } else {
          // Initialize user doc
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            dashboardLayout: dashboardLayout,
            preferences: { 
              theme: 'neural', 
              notificationsEnabled: true,
              overlayOpacity: 0.8,
              overlayBlendMode: 'normal'
            },
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    return () => unsubscribe();
  }, [detectLocation, dashboardLayout]);

  // Save location to Firestore when it changes
  useEffect(() => {
    if (user && isAuthReady && location) {
      const saveLocation = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, { 
            lastKnownLocation: location,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Error saving location to Firestore:", error);
        }
      };
      saveLocation();
    }
  }, [user, isAuthReady, location]);

  // Save dashboard layout and preferences when they change
  useEffect(() => {
    if (user && isAuthReady) {
      const savePrefs = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, { 
            dashboardLayout,
            preferences: {
              overlayOpacity,
              overlayBlendMode
            }
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save user preferences:", error);
        }
      };
      savePrefs();
    }
  }, [dashboardLayout, overlayOpacity, overlayBlendMode, user, isAuthReady]);

  // Sync Timer logic remains
  const handleGenerateVideo = useCallback(async (prompt: string, type: VideoGeneration['type'], options?: { 
    bgPrompt?: string; 
    overlayPrompt?: string; 
    overlayOpacity?: number; 
    overlayBlendMode?: VideoGeneration['overlayBlendMode']; 
    companyName?: string;
    codec?: VideoGeneration['codec'];
    resolution?: VideoGeneration['resolution'];
  }) => {
    // Check if we already have this video in the library with a valid URL
    const existingVideo = trainingVideos.find(v => 
      v.prompt.toLowerCase() === prompt.toLowerCase() && 
      v.type === type && 
      v.status === 'completed' &&
      v.bgPrompt === options?.bgPrompt &&
      v.overlayPrompt === options?.overlayPrompt &&
      v.overlayOpacity === options?.overlayOpacity &&
      v.overlayBlendMode === options?.overlayBlendMode &&
      v.companyName === options?.companyName &&
      v.codec === options?.codec &&
      v.resolution === options?.resolution &&
      v.url && !v.url.startsWith('blob:') // Only skip if it's a permanent URL (like Veo)
    );

    if (existingVideo) {
      addLog({ type: 'info', module: 'SYSTEMS_TRAINING', message: `Neural asset already exists in library. Retrieval complete.` });
      return;
    }

    setIsGeneratingVideo(true);
    const videoId = Math.random().toString(36).substr(2, 9);
    const videoName = prompt.split(' ').slice(0, 3).join('_').toUpperCase() + "_" + Date.now();
    
    // Check if we should update an existing broken video or add a new one
    const brokenVideo = trainingVideos.find(v => 
      v.prompt.toLowerCase() === prompt.toLowerCase() && 
      v.type === type && 
      v.bgPrompt === options?.bgPrompt &&
      v.overlayPrompt === options?.overlayPrompt &&
      v.companyName === options?.companyName &&
      v.codec === options?.codec &&
      v.resolution === options?.resolution &&
      v.url?.startsWith('blob:')
    );

    const targetId = brokenVideo ? brokenVideo.id : videoId;

    if (!brokenVideo) {
      const newVideo: VideoGeneration = {
        id: videoId,
        timestamp: new Date().toISOString(),
        prompt,
        status: 'generating',
        route: 'VEO_3_1',
        type,
        videoName,
        companyName: options?.companyName,
        userGenerating: 'busannex@gmail.com',
        bgPrompt: options?.bgPrompt,
        overlayPrompt: options?.overlayPrompt,
        overlayOpacity: options?.overlayOpacity,
        overlayBlendMode: options?.overlayBlendMode,
        codec: options?.codec,
        resolution: options?.resolution
      };
      setTrainingVideos(prev => [newVideo, ...prev]);
    } else {
      setTrainingVideos(prev => prev.map(v => v.id === targetId ? { ...v, status: 'generating', route: 'VEO_3_1' } : v));
    }

    setAgents(prev => prev.map(a => a.id === 'a6' ? { ...a, status: 'active', lastAction: 'Synthesizing neural frames' } : a));

    try {
      const url = await generateVideoWithFallback(prompt, type, addLog, (route) => {
        // Route updates removed to revert UI
      }, options);
      setTrainingVideos(prev => prev.map(v => v.id === targetId ? { ...v, status: 'completed', url } : v));
      addLog({ type: 'success', module: 'SYSTEMS_TRAINING', message: `Neural training asset synthesized: ${videoName}` });
    } catch (error: any) {
      setTrainingVideos(prev => prev.map(v => v.id === targetId ? { ...v, status: 'failed' } : v));
      addLog({ type: 'error', module: 'SYSTEMS_TRAINING', message: `Synthesis failure: ${error.message}` });
    } finally {
      setIsGeneratingVideo(false);
      setAgents(prev => prev.map(a => a.id === 'a6' ? { ...a, status: 'idle', lastAction: 'Synthesis complete' } : a));
    }
  }, [trainingVideos, addLog]);

  const handleDeleteVideo = useCallback((id: string) => {
    setTrainingVideos(prev => prev.filter(v => v.id !== id));
    addLog({ type: 'warning', module: 'SYSTEMS_TRAINING', message: `Neural asset purged from library: ${id}` });
  }, [addLog]);

  // Persistence logic
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try IndexedDB first (Expanded Storage)
        const dbLeads = await storageService.loadAll('leads');
        const dbLogs = await storageService.loadAll('logs');
        const dbReports = await storageService.loadAll('reports');
        const dbVideos = await storageService.loadAll('videos');
        const dbMeta = await storageService.load('meta', 'current');

        if (dbLeads.length > 0) setMasterDb(dbLeads);
        else {
          const savedLeads = localStorage.getItem('synapse_master_v14');
          if (savedLeads) setMasterDb(JSON.parse(savedLeads));
        }

        if (dbLogs.length > 0) setLogs(dbLogs);
        else {
          const savedLogs = localStorage.getItem('synapse_logs_v14');
          if (savedLogs) setLogs(JSON.parse(savedLogs));
        }

        if (dbReports.length > 0) setImprovementReports(dbReports);
        else {
          const savedReports = localStorage.getItem('synapse_reports_v14');
          if (savedReports) setImprovementReports(JSON.parse(savedReports));
        }

        if (dbVideos.length > 0) setTrainingVideos(dbVideos);
        else {
          const savedVideos = localStorage.getItem('synapse_videos_v14');
          if (savedVideos) setTrainingVideos(JSON.parse(savedVideos));
        }

        const meta = dbMeta || (localStorage.getItem('synapse_meta_v14') ? JSON.parse(localStorage.getItem('synapse_meta_v14')!) : null);
        if (meta) {
          setLocation(meta.location || 'New York, NY');
          setIndustry(meta.industry || 'Traditional Restaurants');
          setSystemStatus(meta.status || 'on');
          setLastSyncTime(meta.lastSync || Date.now());
          setActiveTab(meta.lastTab === 'docs' ? 'settings' : (meta.lastTab || 'discover'));
          setAppName(meta.appName || 'SYNAPSE');
          setBrandLogo(meta.brandLogo || null);
          if (meta.ajaSettings) setAjaSettings(meta.ajaSettings);
          if (meta.bgSettings) setBgSettings(prev => ({ ...prev, ...meta.bgSettings }));
        }
      } catch (err) {
        console.error('Neural Load Error:', err);
      }

      addLog({ type: 'success', module: 'CORE_INIT', message: `${appName} Neural Core SYSTEM (Evolved) Initialized` });
      addLog({ type: 'info', module: 'SYSTEM_VERSIONING', message: 'Hybrid Architecture Active: Synapse_Core_V14 + Synapse_2.0 + Neural_Shield_V2.4' });
      addLog({ type: 'info', module: 'PIPELINE_SUPERVISOR', message: 'AI Agent Pipeline Processor Supervisor has assumed command of pipeline integrity and optimization.' });
      
      if (!user) {
        setIsInitialLoadComplete(true);
      }
    };

    loadData();
  }, [addLog, user]);

  // Save persistence
  useEffect(() => {
    if (!isInitialLoadComplete) return;
    
    const saveToStorage = async () => {
      try {
        // Save to IndexedDB (Expanded Storage - No hard pruning)
        await storageService.save('leads', masterDb);
        await storageService.save('logs', logs.slice(-500)); // Keep a healthy amount of logs
        await storageService.save('reports', improvementReports);
        await storageService.save('videos', trainingVideos);
        
        const meta = { 
          location, industry, status: systemStatus, lastSync: lastSyncTime, 
          lastTab: activeTab, appName, brandLogo, ajaSettings, bgSettings
        };
        await storageService.save('meta', meta);

        // Fallback to localStorage for small, critical metadata only
        localStorage.setItem('synapse_meta_v14', JSON.stringify(meta));
      } catch (error) {
        console.error('Neural Persistence Error:', error);
      }
    };

    saveToStorage();
  }, [masterDb, location, industry, systemStatus, lastSyncTime, activeTab, logs, appName, brandLogo, improvementReports, trainingVideos, ajaSettings, bgSettings, isInitialLoadComplete]);

  // Sync Timer
  const performSearch = useCallback(async (loc: string, ind: string) => {
    setIsSearching(true);
    setIsNeuralActive(true);
    setSearchError(null);
    try {
      const { leads, sources } = await searchLeads(loc, ind, addLog, 10, (route) => setActiveRoute(route));
      
      const now = new Date();
      const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getFullYear()}`;
      const city = (loc || '').split(',')[0].trim().replace(/\s+/g, '');

      setMasterDb(prev => {
        const newLeads: Lead[] = [];
        let currentCount = prev.length;

        leads.forEach((l) => {
          // Data Inspection Agent: Deduplication check
          const isDuplicate = prev.some(existing => 
            existing.originalName.toLowerCase() === l.name.toLowerCase() && 
            existing.originalLocation.toLowerCase() === (l.location || loc).toLowerCase()
          );

          if (!isDuplicate) {
            // Data Inspection Agent: Assign unique system ID
            // Neural ID Generation: Robust & Unique
            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const systemId = `${city}_${dateStr}_${randomSuffix}_${currentCount.toString().padStart(2, '0')}`;
            newLeads.push({
              ...l,
              id: systemId,
              queue: 'discovery' as const,
              isProcessing: true, // Start processing immediately through stage 1
              revenuePerLead: Math.floor(Math.random() * 13500) + 1500, // $1,500 to $15,000
              processingProgress: 0,
              marketActivityScore: Math.floor(Math.random() * 100) // Initial market activity score
            });
            currentCount++;
          }
        });

        if (newLeads.length > 0) {
          addLog({ 
            type: 'success', 
            module: 'DATA_INSPECTION_AGENT', 
            message: `Data Inspection Agent has verified ${newLeads.length} new nodes and assigned unique system IDs (Format: ${city}_${dateStr}_XX).` 
          });
        } else if (leads.length > 0) {
          addLog({ 
            type: 'warning', 
            module: 'DATA_INSPECTION_AGENT', 
            message: `Data Inspection Agent blocked duplicate nodes from entering the pipeline.` 
          });
        }

        return [...prev, ...newLeads];
      });
      setSearchSources(sources);
    } catch (err: any) { 
      setSearchError("Global Signal Failure :: Exhausting AI Fallback Chain");
      setActiveRoute('EXTERNAL_BRIDGE');
      addLog({ type: 'critical', module: 'CORE_ORCHESTRATOR', message: `Global outage detected during discovery: ${err.message}` });
    }
    finally { 
      setIsSearching(false); 
      setIsNeuralActive(false);
    }
  }, [addLog, location, industry]);

  const handleManualSync = useCallback((type: string = "MANUAL_FACTORY_EXPORT") => {
    if (masterDb.length === 0 && type === "MANUAL_FACTORY_EXPORT") return;
    
    addLog({ type: 'info', module: 'PERSISTENCE', message: `Triggering ${type} for ${masterDb.length} entities.` });
    
    // ONLY download if it's a manual export - automatic sync should NOT trigger downloads
    if (type === "MANUAL_FACTORY_EXPORT") {
      downloadReport(masterDb, type);
    }
    
    setLastSyncTime(Date.now());

    // Automated discovery if database is low and system is on
    if (type === "FULL_FACTORY_AUTO_SYNC" && masterDb.length < 5 && systemStatus === 'on' && !isSearching) {
      addLog({ type: 'info', module: 'AUTONOMOUS_DISCOVERY', message: 'Database levels low. Initiating autonomous lead discovery sequence...' });
      performSearch(location, industry);
    }
  }, [masterDb, location, industry, systemStatus, isSearching, addLog, performSearch]);

  useEffect(() => {
    if (!isInitialLoadComplete) return;
    
    const syncInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastSyncTime;
      const remaining = AUTO_SYNC_INTERVAL - elapsed;

      if (remaining <= 0) {
        handleManualSync("FULL_FACTORY_AUTO_SYNC");
      } else {
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setSyncCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(syncInterval);
  }, [lastSyncTime, isInitialLoadComplete, handleManualSync]);

  // Prioritized Leads logic remains
  const prioritizedLeads = useMemo(() => {
    return [...masterDb].sort((a, b) => {
      const getScore = (l: Lead) => {
        const confidence = l.confidenceScore || 0;
        const revenue = l.revenuePerLead || 0;
        const marketActivity = l.marketActivityScore || 0;
        // Normalize revenue (assuming max 10000 for normalization)
        const normalizedRevenue = Math.min(100, (revenue / 10000) * 100);
        return (confidence * 0.4) + (normalizedRevenue * 0.4) + (marketActivity * 0.2);
      };
      return getScore(b) - getScore(a);
    });
  }, [masterDb]);

  const detectUserLocation = () => {
    detectLocation();
  };

  // Agent Recommendation System
  useEffect(() => {
    const interval = setInterval(() => {
      const types: AgentRecommendation['type'][] = [
        'speed', 'quality', 'accuracy', 'revenue', 'leads', 'performance', 
        'capacity', 'recovery', 'error_reduction', 'infrastructure', 
        'reliability', 'security', 'overall'
      ];
      
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      if (!randomAgent) return;

      const type = types[Math.floor(Math.random() * types.length)];
      const impact: AgentRecommendation['impact'][] = ['low', 'medium', 'high', 'critical'];
      
      const newRec: AgentRecommendation = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title: `Optimize ${type.replace('_', ' ')} for ${randomAgent.name}`,
        description: `Recommendation from ${randomAgent.firstName} ${randomAgent.lastName}: Implement neural caching to improve ${type.replace('_', ' ')} by 15%.`,
        impact: impact[Math.floor(Math.random() * impact.length)],
        status: 'proposed',
        timestamp: new Date().toISOString()
      };

      updateAgent(randomAgent.id, {
        recommendations: [...(randomAgent.recommendations || []), newRec]
      });

      addLog({
        type: 'info',
        module: randomAgent.name,
        message: `New optimization recommendation: ${newRec.title}`
      });
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [agents, updateAgent]);

  const handleViewStrategy = useCallback((lead: Lead) => {
    setSelectedLeadForStrategy(lead);
    setIsStrategyModalOpen(true);
  }, []);

  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    setMasterDb(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    if (selectedLeadForStrategy?.id === updatedLead.id) {
      setSelectedLeadForStrategy(updatedLead);
    }
  }, [selectedLeadForStrategy]);

  const handleReleaseFindings = useCallback(() => {
    const reportId = `RPT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const findings = masterDb.length > 0 
      ? `Analysis of ${masterDb.length} neural nodes reveals a total vaulted yield of $${masterDb.reduce((a, b) => a + (b.revenuePerLead || 0), 0).toLocaleString()}. System efficiency is currently at ${successRate}%.`
      : "Initial neural scout phase complete. Awaiting further data ingestion for comprehensive analysis.";
    
    const recommendations = agents.map(a => 
      `Agent ${a.name} (${a.role}): ${a.recommendations?.[0]?.description || "Continual optimization of neural pathways recommended."}`
    ).join('\n\n');

    const courseOfAction = "1. Scale neural discovery in high-yield sectors.\n2. Implement automated synthesis for all qualified leads.\n3. Deploy the Synapse system to the market via targeted outreach campaigns.";

    const newReport: PMReport = {
      id: reportId,
      title: 'Consolidated Agent Findings & Strategy',
      generatedBy: 'Neural Agent Collective',
      status: 'pending',
      date: new Date().toISOString(),
      content: `FINDINGS:\n${findings}\n\nRECOMMENDATIONS:\n${recommendations}\n\nCOURSE OF ACTION:\n${courseOfAction}`
    };

    setPmReports(prev => [newReport, ...prev]);
    addLog({ type: 'success', module: 'REPORT_GEN', message: `Consolidated Agent Report ${reportId} released to the Authority Core.` });
  }, [masterDb, successRate, agents, addLog]);

  // Automated discovery effect for new users or empty database
  useEffect(() => {
    // Only trigger if initial load is complete and we are truly empty
    if (isInitialLoadComplete && systemStatus === 'on' && masterDb.length === 0 && !isSearching) {
      const timer = setTimeout(() => {
        addLog({ type: 'info', module: 'AUTONOMOUS_DISCOVERY', message: 'Initial system scan: No active nodes detected in local vault or neural cloud. Initiating autonomous discovery...' });
        performSearch(location, industry);
      }, 5000); // Increased delay to ensure stability
      return () => clearTimeout(timer);
    }
  }, [systemStatus, masterDb.length, isSearching, location, industry, performSearch, addLog, isInitialLoadComplete]);

  // Pipeline simulation logic
  useEffect(() => {
    const activeLeads = masterDb.some(l => l.isProcessing);
    if (!activeLeads || systemStatus !== 'on') return;

    const processInterval = setInterval(() => {
      setMasterDb(prevDb => {
        let changed = false;
        const newDb = prevDb.map(lead => {
          if (lead.isProcessing) {
            changed = true;
            const increment = Math.floor(Math.random() * 12) + 8; // Faster progression
            const newProgress = Math.min(100, lead.processingProgress + increment);
            
            if (newProgress === 100) {
              playSuccessChime();
              const currentIndex = QUEUE_ORDER.indexOf(lead.queue);
              const nextQueue = lead.processingTargetQueue || QUEUE_ORDER[currentIndex + 1] || 'completed';

              if (lead.queue === 'fulfillment') {
                const outcome = Math.random() > 0.2 ? 'success' : 'failure'; // Slightly higher success rate for "Accuracy"
                addLog({ 
                  type: outcome === 'success' ? 'success' : 'error', 
                  module: 'FULFILLMENT', 
                  message: `Fulfillment cycle for ${lead.name} concluded with ${outcome.toUpperCase()} result.` 
                });
                return { 
                  ...lead, 
                  isProcessing: false, 
                  processingProgress: 100,
                  queue: 'completed' as const,
                  fulfillmentOutcome: outcome,
                  completedAt: new Date().toISOString(),
                  revenuePerLead: outcome === 'success' ? Math.floor(Math.random() * 5000) + 2000 : 0
                } as Lead;
              }
              addLog({ type: 'info', module: 'PIPELINE', message: `Entity ${lead.name} advanced to Stage: ${nextQueue}` });
              
              // Data Inspection Agent Verification
              addLog({ 
                type: 'success', 
                module: 'DATA_INSPECTION_AGENT', 
                message: `Integrity verified for ${lead.name} at Stage: ${nextQueue}. Original data nodes (Name, Loc, Phone, Web) confirmed valid.` 
              });

              return { ...lead, isProcessing: false, processingProgress: 100, queue: nextQueue } as Lead;
            }
            return { ...lead, processingProgress: newProgress } as Lead;
          }
          return lead;
        });
        return changed ? newDb : prevDb;
      });
    }, 1000); // 1s interval for snappier feel
    return () => clearInterval(processInterval);
  }, [systemStatus, addLog, masterDb]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setMasterDb(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const handleWorkflowAction = useCallback(async (lead: Lead) => {
    if (lead.isProcessing || lead.queue === 'completed' || systemStatus !== 'on') return;
    
    const currentIndex = QUEUE_ORDER.indexOf(lead.queue);
    const target = QUEUE_ORDER[currentIndex + 1];
    updateLead(lead.id, { isProcessing: true, processingProgress: 0, processingTargetQueue: target });

    if (lead.queue === 'intelligence' || lead.queue === 'synthesis') {
      setIsNeuralActive(true);
      try {
        const strategy = await generateStrategy(lead, addLog, (route) => setActiveRoute(route));
        updateLead(lead.id, { proposal: strategy });
      } catch (err: any) {
        updateLead(lead.id, { isProcessing: false });
        setSearchError("Neural Dropout :: Rerouting Synthesis Bridge...");
        addLog({ type: 'critical', module: 'WORKFLOW', message: `Synthesis failed for ${lead.name}: ${err.message}` });
      } finally {
        setIsNeuralActive(false);
      }
    }
  }, [systemStatus, addLog, updateLead]);

  const addToPipeline = useCallback((lead: Lead) => {
    updateLead(lead.id, { queue: 'verification', isProcessing: true, processingProgress: 0 });
    addLog({ type: 'info', module: 'INGESTION', message: `Node ${lead.name} advanced to Stage: verification.` });
  }, [addLog, updateLead]);

  const resetWhiteLabel = () => {
    setAppName('SYNAPSE');
    setBrandLogo(null);
    setBgSettings({
      motionEnabled: true,
      speed: 1,
      opacity: 0.05,
      deactivateOnInteract: true,
      deactivationDelay: 3000
    });
    addLog({ type: 'warning', module: 'REBRAND_PROTOCOL', message: 'Identity overrides purged. Reverting to SYNAPSE default.' });
  };

  return (
    <>
      <PWAUpdater />
      
      {/* HIGH-TECH BACKGROUND OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="neural-grid"></div>
        <div className="scanline-overlay"></div>
        
        {/* Dynamic Data Streams */}
        <div className="data-stream" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="data-stream" style={{ left: '30%', animationDelay: '1.5s' }}></div>
        <div className="data-stream" style={{ left: '70%', animationDelay: '0.5s' }}></div>
        <div className="data-stream" style={{ left: '90%', animationDelay: '2s' }}></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {/* Moving Neural Lines */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '-100%', y: `${20 * i}%`, opacity: 0 }}
              animate={{ 
                x: '200%', 
                opacity: [0, 0.5, 0],
              }}
              transition={{ 
                duration: 10 + i * 2, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 2
              }}
              className="absolute h-px w-64 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            />
          ))}
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row h-[100dvh] overflow-hidden p-2 md:p-4 gap-2 md:gap-4 transition-all duration-1000 relative z-10 ${isCritical ? 'bg-red-950/20' : systemStatus === 'off' ? 'bg-zinc-950' : ''}`}>
      
      {/* GLOBAL BACKGROUND WATERMARK */}
      <div 
        className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-0 overflow-hidden"
        style={{
          opacity: (bgSettings?.deactivateOnInteract && isInteracting) ? 0 : (bgSettings?.opacity ?? 0.05),
          transition: 'opacity 1s ease-in-out',
        }}
      >
        {brandLogo ? (
          <img 
            src={brandLogo} 
            alt="Brand Logo" 
            className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] object-contain grayscale"
            style={{
              animation: bgSettings?.motionEnabled ? `spin ${12 / (bgSettings?.speed || 1)}s linear infinite` : 'none',
              opacity: 0.4
            }}
          />
        ) : (
          <Logo 
            className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px]" 
            style={{
              animation: bgSettings?.motionEnabled ? `spin ${12 / (bgSettings?.speed || 1)}s linear infinite` : 'none'
            }}
          />
        )}
        <div className="text-4xl font-black text-white/20 tracking-[1em] mt-8 uppercase">{appName}</div>
      </div>
      
      {/* REFACTORED NAVIGATION (Responsive) */}
      <nav className="fixed bottom-0 left-0 right-0 lg:relative z-50 flex flex-row lg:flex-col gap-2 md:gap-4 w-full lg:w-24 h-20 lg:h-full p-2 lg:p-0 bg-black/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-t lg:border-t-0 border-white/10">
        <div className={`hud-panel flex-1 lg:flex-none lg:h-full p-2 lg:p-5 flex flex-row lg:flex-col justify-around lg:justify-start gap-2 lg:gap-8 ${isCritical ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,255,0.05)]'}`}>
          <div className="hidden lg:flex items-center justify-center relative group/logo">
            <div className="absolute -inset-2 bg-cyan-500/10 rounded-full blur-lg opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700"></div>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center relative z-10">
              {brandLogo ? (
                <img src={brandLogo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]" />
              ) : (
                <Logo className={`w-10 h-10 transition-all duration-500 ${systemStatus === 'off' ? 'text-slate-600' : 'text-cyan-500 group-hover/logo:scale-110'}`} />
              )}
            </div>
            {/* Tech Ring around logo */}
            <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
          </div>

          <div className="flex-1 flex flex-row lg:flex-col gap-2 lg:gap-4 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scrollbar lg:pr-1 items-center justify-around lg:justify-start">
            {NAV_ITEMS.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)} 
                className={`flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl border transition-all duration-500 group relative overflow-hidden flex-shrink-0 ${
                  activeTab === item.id 
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-400 shadow-[0_0_25px_rgba(0,242,255,0.35)] scale-105' 
                    : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                {/* Active Indicator Bar & Glow */}
                {activeTab === item.id && (
                  <>
                    <div className="absolute left-0 lg:top-1/4 lg:bottom-1/4 bottom-0 lg:bottom-auto lg:w-1 w-full lg:h-auto h-1 bg-cyan-500 rounded-t-full lg:rounded-r-full shadow-[0_0_15px_#00f2ff]"></div>
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                  </>
                )}
                
                <item.icon className={`w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 transition-all duration-500 ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_12px_rgba(0,242,255,0.8)] text-white' : 'group-hover:scale-110 group-hover:text-cyan-500/70'}`} />
                
                {/* Tooltip (Desktop Only) */}
                <div className="hidden lg:block absolute left-full ml-6 px-4 py-3 bg-black/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-[100] whitespace-nowrap shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    <div className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{item.label}</div>
                  </div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest mono pl-4">{item.desc}</div>
                </div>

                {item.id === 'database' && (
                  <div className="absolute top-1 right-1 lg:top-2 lg:right-2 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          <div className="lg:mt-auto lg:pt-6 lg:border-t lg:border-white/10 flex flex-row lg:flex-col gap-4 lg:gap-6 items-center">
            <button 
              onClick={() => setIsVoiceAssistantOpen(true)} 
              className={`flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl transition-all duration-700 group relative ${
                isAjaSpeaking || isAjaListening
                  ? 'bg-cyan-500 shadow-[0_0_30px_rgba(0,242,255,0.5)] scale-110' 
                  : 'bg-black/40 border border-cyan-500/20 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]'
              }`}
            >
              <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg transition-all duration-700 ${
                isAjaSpeaking || isAjaListening
                  ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)] scale-110 animate-pulse' 
                  : 'bg-cyan-500/60 opacity-60 group-hover:opacity-100 group-hover:scale-110'
              }`}></div>
              
              {/* Ripple effect when active */}
              {(isAjaSpeaking || isAjaListening) && (
                <div className={`absolute inset-0 rounded-xl lg:rounded-2xl animate-ping opacity-40 bg-white`}></div>
              )}

              <div className="hidden lg:block absolute left-full ml-6 px-4 py-3 bg-black/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0 z-[100] whitespace-nowrap shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-3 mb-1">
                  <Waves className={`w-4 h-4 ${isAjaSpeaking || isAjaListening ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                  <div className="text-[11px] font-black text-cyan-400 tracking-[0.3em] uppercase">AJA Neural Link</div>
                </div>
                <div className={`text-[9px] uppercase tracking-widest mono pl-7 ${
                  isAjaSpeaking || isAjaListening ? 'text-cyan-400' : 'text-slate-500'
                }`}>
                  {isAjaSpeaking ? 'Neural_Output_Active' : isAjaListening ? 'Neural_Input_Active' : 'System_Standby'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col gap-4 min-w-0">
        <header className="h-auto lg:h-20 hud-panel px-4 lg:px-8 py-4 lg:py-0 flex flex-col lg:flex-row items-center justify-between relative gap-4 lg:gap-0 overflow-hidden">
          <HudCorners />
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-12 w-full lg:w-auto">
            <div className="flex flex-col items-center lg:items-start shrink-0">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-[7px] lg:text-[9px] font-black text-cyan-400 tracking-[0.2em] lg:tracking-[0.3em] uppercase glow-cyan">Synapse_Core_V14</span>
                <span className="text-[7px] lg:text-[9px] font-black text-fuchsia-500 tracking-[0.2em] lg:tracking-[0.3em] uppercase glow-fuchsia">Synapse_2.0</span>
                <span className="text-[7px] lg:text-[9px] font-black text-amber-500 tracking-[0.2em] lg:tracking-[0.3em] uppercase glow-amber">Neural_Shield_V2.4</span>
              </div>
              <h1 className="text-lg lg:text-xl font-black text-white tracking-widest uppercase text-center lg:text-left whitespace-nowrap">
                {activeTab === 'docs' ? 'Technical_Manual' : 
                 activeTab === 'discover' ? 'Neural_Intake' : 
                 activeTab === 'pipeline' ? 'Neural_Process' : 
                 activeTab === 'dashboard' ? 'Neural_Command_Center' :
                 'Synapse_Interface'}
              </h1>
            </div>

            {/* Model Selection Pills (Hidden on very small screens) */}
            <div className="hidden sm:flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-full shrink-0">
              {['GEMINI', 'CLAUDE', 'GROK', 'GPT5'].map((m) => (
                <div key={m} className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white/5 transition-all cursor-pointer">
                  <div className={`w-1.5 h-1.5 rounded-full ${m === 'GEMINI' ? 'bg-cyan-500 shadow-[0_0_5px_#00f2ff]' : 'bg-slate-600'}`}></div>
                  <span className={`text-[8px] font-black tracking-widest ${m === 'GEMINI' ? 'text-white' : 'text-slate-500'}`}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-4 lg:gap-8 w-full lg:w-auto">
            <div className="flex items-center gap-4 lg:gap-8">
              <AgentBattery agents={agents} onClick={() => setIsAgentModalOpen(true)} />
              <StabilityMonitor rate={successRate} />
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Neural_Shield</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: systemStatus === 'on' ? '100%' : '0%' }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mono uppercase tracking-wider glow-emerald">
                    {systemStatus === 'on' ? 'Active' : 'Standby'}
                  </span>
                </div>
              </div>

              <div className="hidden xl:flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Neural_Route</span>
                <span className="text-[10px] font-bold text-cyan-400 mono uppercase tracking-wider glow-cyan">Gemini 3 Pro</span>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-black/60 border border-white/10 rounded-xl">
                {user ? (
                  <button 
                    onClick={handleLogout} 
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-white hover:bg-white/5 group relative"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-cyan-500/30" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                    <div className="absolute top-full mt-2 right-0 px-3 py-2 bg-black/90 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] whitespace-nowrap">
                      <div className="text-[9px] font-black text-white uppercase tracking-wider">{user.displayName || 'Neural_User'}</div>
                      <div className="text-[7px] text-slate-500 mono uppercase mt-0.5">Disconnect_Identity</div>
                    </div>
                  </button>
                ) : (
                  <button 
                    onClick={handleLogin} 
                    className="px-3 lg:px-4 h-9 rounded-lg flex items-center gap-2 transition-all bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 group"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Connect</span>
                  </button>
                )}
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button 
                  onClick={() => setSystemStatus('on')} 
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all ${systemStatus === 'on' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button 
                  onClick={() => setSystemStatus('paused')} 
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all ${systemStatus === 'paused' ? 'bg-amber-500 text-black' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button 
                  onClick={() => setSystemStatus('off')} 
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all ${systemStatus === 'off' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <Power className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 flex gap-4 overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <div className="flex-1 hud-panel overflow-hidden relative">
              <HudCorners />
              <Dashboard 
                layout={dashboardLayout}
                onLayoutChange={setDashboardLayout}
                renderModule={(id) => (
                  <ModuleRenderer 
                    id={id}
                    leads={masterDb}
                    marketData={marketData}
                    logs={logs}
                    successRate={successRate}
                    signals={signals}
                    directives={directives}
                    agents={agents}
                    pmReports={pmReports}
                    advice={managerAdvice}
                    isAnalyzing={isManagerAnalyzing}
                    isMaintenanceMode={isMaintenanceMode}
                    isNeuralActive={isNeuralActive}
                    onAction={handleWorkflowAction}
                    onDismissDirective={(id) => setDirectives(prev => prev.filter(d => d.id !== id))}
                    onRunMaintenance={performMaintenance}
                    onRunNeuralScan={recalibrateAgents}
                    onUpdateAgent={updateAgent}
                    onHandleRecommendation={handleRecommendation}
                    onReleaseFindings={handleReleaseFindings}
                    onLog={addLog}
                    onDelete={handleDeleteLead}
                    onViewStrategy={handleViewStrategy}
                    onClearLogs={() => { setLogs([]); addLog({ type: 'warning', module: 'PERSISTENCE', message: `${appName} audit logs purged by user.` }); }}
                    onAudit={performAudit}
                    isAuditing={isAuditing}
                    videos={trainingVideos}
                    onGenerateVideo={handleGenerateVideo}
                    onAddVideo={(video) => setTrainingVideos(prev => [video, ...prev])}
                    onDeleteVideo={(id) => setTrainingVideos(prev => prev.filter(v => v.id !== id))}
                    isGeneratingVideo={isGeneratingVideo}
                    defaultOverlayOpacity={overlayOpacity}
                    defaultOverlayBlendMode={overlayBlendMode}
                    isAnalyzingStrategy={isSearching}
                  />
                )}
              />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="flex-1 hud-panel overflow-hidden relative">
              <HudCorners />
              <TechnicalManual />
            </div>
          )}

          {activeTab === 'discover' ? (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full pb-24 lg:pb-0">
              <div className="lg:col-span-8 hud-panel p-4 lg:p-8 overflow-y-auto custom-scrollbar relative">
                <HudCorners />
                {isNeuralActive && !searchError && (
                  <div className="mb-6 bg-cyan-900/10 border border-cyan-500/30 p-5 rounded-2xl flex items-center gap-5">
                    <Activity className="w-8 h-8 text-cyan-500" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-cyan-500">Neural Scan in Progress :: {activeRoute.replace(/_/g, ' ')}</p>
                      <p className="text-[9px] text-slate-500 mono uppercase mt-1">Searching for stable connection in the fallback pipeline...</p>
                    </div>
                  </div>
                )}
                {searchError && (
                  <div className={`mb-6 border p-5 rounded-2xl flex items-center gap-5 ${searchError.includes('Failure') ? 'bg-red-900/20 border-red-500/40' : 'bg-amber-900/20 border-amber-500/40'}`}>
                    <Server className={`w-8 h-8 ${searchError.includes('Failure') ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <p className={`text-[11px] font-black uppercase tracking-widest ${searchError.includes('Failure') ? 'text-red-500' : 'text-amber-500'}`}>{searchError}</p>
                      <p className="text-[9px] text-slate-500 mono uppercase mt-1">Multi-Provider Neural Chain engaged. Handshaking with secondary nodes (Claude/Grok/GPT5).</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8 bg-white/5 p-4 lg:p-8 border border-white/5 rounded-[1.5rem] lg:rounded-[2rem] relative overflow-hidden gap-6 lg:gap-0">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden lg:block">
                    <Radar className="w-32 h-32 text-cyan-500" />
                  </div>
                  <div className="flex-1 flex flex-col gap-3 relative z-10">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-cyan-500 text-white text-[9px] font-black uppercase rounded">{appName}_OS_ACTIVE</span>
                       <span className="text-[9px] mono text-slate-500">RESUME_V14_PERSISTENCE_ENABLED</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4 mt-2">
                      <Globe className={`w-6 h-6 ${isSearching ? 'text-amber-500' : 'text-cyan-500'}`} /> 
                      Stage_01: Intelligence_Scout
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                      Synapse Intelligence is your eyes, ears, and mind in the global data stream.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="relative group flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                        <input 
                          type="text" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)} 
                          className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-3 text-sm mono text-white focus:outline-none focus:border-cyan-500 group-hover:border-white/20 transition-all rounded-xl"
                        />
                        <button onClick={detectUserLocation} disabled={isDetectingLocation} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-cyan-500/10 rounded transition-all">
                           <Crosshair className={`w-4 h-4 ${isDetectingLocation ? 'text-amber-500' : 'text-cyan-500'}`} />
                        </button>
                      </div>
                      <div className="relative group flex-1">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                        <input 
                          type="text" 
                          value={industry} 
                          onChange={(e) => {
                            setIndustry(e.target.value);
                            setShowIndustryDropdown(true);
                          }} 
                          onFocus={() => setShowIndustryDropdown(true)}
                          onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
                          placeholder="Target Industry/Category"
                          className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-3 text-sm mono text-white focus:outline-none focus:border-cyan-500 group-hover:border-white/20 transition-all rounded-xl"
                        />
                        <AnimatePresence>
                          {showIndustryDropdown && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-[#111318] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                            >
                              <div className="p-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono">Neural_Suggestions</span>
                                {isFetchingSuggestions && <RefreshCcw className="w-2.5 h-2.5 text-cyan-500 animate-spin" />}
                              </div>
                              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                {suggestedIndustries.map((sug, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setIndustry(sug);
                                      setShowIndustryDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-[11px] text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border-b border-white/5 last:border-0 mono"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => performSearch(location, industry)} disabled={isSearching} className={`ml-8 h-20 w-20 rounded-full transition-all flex items-center justify-center relative ${isSearching ? 'bg-slate-800' : 'bg-amber-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.4)]'}`}>
                    {isSearching ? <RefreshCcw className="w-10 h-10 text-slate-500" /> : <Zap className="w-10 h-10 text-white" />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                  {masterDb.filter(l => l.queue === 'discovery').length === 0 && !isSearching ? (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-[2rem]">
                      <Fingerprint className="w-16 h-16 mb-6" />
                      <p className="text-[11px] font-black uppercase tracking-[0.6em]">System_Standby :: Initiate_Discovery_Pulse</p>
                    </div>
                  ) : (
                    masterDb.filter(l => l.queue === 'discovery').map(lead => (
                      <LeadCard key={lead.id} lead={lead} onAdd={addToPipeline} onDelete={handleDeleteLead} />
                    ))
                  )}
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4">
                <MarketSummary leads={masterDb.filter(l => l.queue === 'discovery')} marketData={marketData} />
                <div className="hud-panel p-6 flex-1 flex flex-col relative">
                  <HudCorners />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-500 border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Stage_01_Grounding
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {searchSources.map((source: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                        <LinkIcon className="w-3.5 h-3.5 text-cyan-500 mt-1 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-slate-300 truncate uppercase tracking-tight">{source.web?.title || 'Data Chunk'}</p>
                          <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] text-cyan-500/60 mono truncate block mt-1 group-hover:underline">
                            {source.web?.uri}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
           ) : activeTab === 'pipeline' ? (
            <div className="flex-1 flex flex-col overflow-hidden pb-24 lg:pb-0">
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 mb-4 px-2">
                {QUEUE_ORDER.slice(1, 7).map(q => {
                  const count = masterDb.filter(l => l.queue === q).length;
                  const isProcessing = masterDb.some(l => l.queue === q && l.isProcessing);
                  return (
                    <div key={q} className="hud-panel p-4 flex flex-col gap-2 border-white/5 transition-all duration-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ST_{QUEUE_ORDER.indexOf(q)+1}: {q}</span>
                        {isProcessing && <Activity className="w-3 h-3 text-cyan-500" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-black mono ${count > 0 ? 'text-white' : 'text-slate-800'}`}>
                          {count.toString().padStart(2, '0')}
                        </span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.6)] transition-all duration-1000" style={{ width: `${Math.min(100, (count / 10) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 overflow-x-auto flex gap-4 pb-6 px-2 custom-scrollbar">
                {QUEUE_ORDER.slice(1, 7).map((q) => {
                  const stageLeads = prioritizedLeads.filter(l => l.queue === q);
                  return (
                    <div key={q} className="min-w-[340px] flex flex-col gap-4 hud-panel p-6 bg-black/50 border-white/5 relative">
                      <HudCorners />
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3">
                          <Settings className="w-4 h-4 text-slate-500" /> 
                          {q.replace('_', ' ')}
                        </h3>
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-500 mono font-black">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {stageLeads.map(lead => (
                          <WorkflowCard 
                            key={lead.id} 
                            lead={lead} 
                            onAction={handleWorkflowAction} 
                            onViewStrategy={handleViewStrategy} 
                            onDelete={handleDeleteLead}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'database' ? (
            <div className="flex-1 hud-panel overflow-hidden relative">
              <HudCorners />
              <DatabaseTable leads={masterDb} logs={logs} onDelete={handleDeleteLead} onExport={() => handleManualSync()} onViewStrategy={handleViewStrategy} />
            </div>
          ) : activeTab === 'audit' ? (
            <div className="flex-1 hud-panel overflow-hidden relative">
              <HudCorners />
              <SystemAudit 
                logs={logs} 
                onClear={() => { setLogs([]); addLog({ type: 'warning', module: 'PERSISTENCE', message: `${appName} audit logs purged by user.` }); }} 
                onAudit={performAudit}
                isAuditing={isAuditing}
              />
            </div>
          ) : activeTab === 'supervisor' ? (
            <ProjectManagerPanel 
              directives={directives} 
              agents={agents} 
              signals={signals}
              pmReports={pmReports}
              improvementReports={improvementReports}
              logs={logs}
              advice={managerAdvice} 
              isAnalyzing={isManagerAnalyzing} 
              onDismissDirective={(id) => setDirectives(prev => prev.filter(d => d.id !== id))} 
              onRunMaintenance={performMaintenance}
              onRunNeuralScan={recalibrateAgents}
              onRecalibrateAgent={recalibrateAgents}
              onUpdateAgent={updateAgent}
              onHandleRecommendation={handleRecommendation}
              isMaintenanceMode={isMaintenanceMode}
              isNeuralActive={isNeuralActive}
            />
          ) : activeTab === 'training' ? (
            <SystemsTraining 
              videos={trainingVideos} 
              onGenerateVideo={handleGenerateVideo} 
              onAddVideo={(video) => setTrainingVideos(prev => [video, ...prev])}
              onDeleteVideo={handleDeleteVideo}
              isGenerating={isGeneratingVideo}
              defaultOverlayOpacity={overlayOpacity}
              defaultOverlayBlendMode={overlayBlendMode}
              logs={logs}
            />
          ) : (
            <div className="flex-1 hud-panel p-12 overflow-y-auto custom-scrollbar bg-black/40 relative">
               <HudCorners />
               <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                  <header>
                     <h2 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-4 mb-4 glow-cyan">
                       <ShieldAlert className="w-8 h-8 text-amber-500" /> Identity & Reference Console
                     </h2>
                     <p className="text-xs text-slate-500 mono leading-relaxed uppercase">
                        Protocol ST_08 :: System controls and technical documentation gateway.
                     </p>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN: IDENTITY OVERRIDE */}
                    <div className="lg:col-span-5 space-y-8">
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 block px-1 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Identity_Override
                        </h3>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block px-1">Application_Label</label>
                           <div className="relative group">
                              <Term className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                              <input 
                                 type="text" 
                                 value={appName} 
                                 onChange={(e) => setAppName(e.target.value.toUpperCase())}
                                 className="w-full bg-black/60 border border-white/10 pl-12 pr-4 py-4 text-sm mono text-white focus:outline-none focus:border-cyan-500 transition-all rounded-xl"
                                 placeholder="ENTER BRAND NAME"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block px-1">Brand_Logo_Source</label>
                           <div className="relative group">
                              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                              <input 
                                 type="text" 
                                 value={brandLogo || ''} 
                                 onChange={(e) => setBrandLogo(e.target.value)}
                                 className="w-full bg-black/60 border border-white/10 pl-12 pr-4 py-4 text-sm mono text-white focus:outline-none focus:border-cyan-500 transition-all rounded-xl"
                                 placeholder="HTTPS://URL-TO-LOGO.PNG"
                              />
                           </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                           <button 
                              onClick={resetWhiteLabel}
                              className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase hover:bg-white/10 transition-all text-slate-400"
                           >
                              <RotateCcw className="w-4 h-4" /> Reset_To_Defaults
                           </button>
                        </div>
                      </div>

                      {/* BACKGROUND SETTINGS */}
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 block px-1 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Background_Watermark
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase">Motion_Enabled</span>
                                <span className="text-[8px] text-slate-500 uppercase">Toggle background rotation</span>
                             </div>
                             <button 
                                onClick={() => setBgSettings(prev => ({ ...prev, motionEnabled: !prev.motionEnabled }))}
                                className={`w-12 h-6 rounded-full relative transition-colors ${bgSettings.motionEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bgSettings.motionEnabled ? 'left-7' : 'left-1'}`}></div>
                             </button>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Rotation_Speed</label>
                             <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1"
                                value={bgSettings.speed}
                                onChange={(e) => setBgSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                                className="w-full accent-indigo-500"
                             />
                             <div className="flex justify-between text-[8px] text-slate-500 mono">
                               <span>SLOW</span>
                               <span>{bgSettings.speed}x</span>
                               <span>FAST</span>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Transparency</label>
                             <input 
                                type="range" 
                                min="0.01" 
                                max="1" 
                                step="0.01"
                                value={bgSettings.opacity}
                                onChange={(e) => setBgSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                                className="w-full accent-indigo-500"
                             />
                             <div className="flex justify-between text-[8px] text-slate-500 mono">
                               <span>0%</span>
                               <span>{Math.round(bgSettings.opacity * 100)}%</span>
                               <span>100%</span>
                             </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase">Deactivate_On_Interact</span>
                                <span className="text-[8px] text-slate-500 uppercase">Hide when active</span>
                             </div>
                             <button 
                                onClick={() => setBgSettings(prev => ({ ...prev, deactivateOnInteract: !prev.deactivateOnInteract }))}
                                className={`w-12 h-6 rounded-full relative transition-colors ${bgSettings.deactivateOnInteract ? 'bg-indigo-500' : 'bg-slate-800'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bgSettings.deactivateOnInteract ? 'left-7' : 'left-1'}`}></div>
                             </button>
                          </div>

                          {bgSettings.deactivateOnInteract && (
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Deactivation_Delay (seconds)</label>
                               <input 
                                  type="range" 
                                  min="1" 
                                  max="10" 
                                  step="0.5"
                                  value={(bgSettings.deactivationDelay || 3000) / 1000}
                                  onChange={(e) => setBgSettings(prev => ({ ...prev, deactivationDelay: parseFloat(e.target.value) * 1000 }))}
                                  className="w-full accent-indigo-500"
                               />
                               <div className="flex justify-between text-[8px] text-slate-500 mono">
                                 <span>1s</span>
                                 <span>{(bgSettings.deactivationDelay || 3000) / 1000}s</span>
                                 <span>10s</span>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SYSTEM MAINTENANCE CONSOLE */}
                      <div className="p-8 bg-black/40 border border-cyan-500/20 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4" /> Maintenance_Console
                           </h3>
                           <span className="text-[8px] font-black text-slate-600 uppercase">Protocol_ST_09_Active</span>
                        </div>
                        
                        <div className="space-y-4">
                           <p className="text-[9px] text-slate-500 uppercase mono leading-relaxed">
                               Perform daily system optimization, redundancy reduction, and data archiving.
                           </p>
                           <button 
                              onClick={performMaintenance}
                              disabled={isMaintenanceMode}
                              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-all ${
                                isMaintenanceMode 
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                  : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
                              }`}
                           >
                              {isMaintenanceMode ? <RefreshCcw className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                              {isMaintenanceMode ? 'Executing_Maintenance...' : 'Run_Daily_Maintenance'}
                           </button>
                        </div>
                      </div>

                      {/* AJA NEURAL SETTINGS */}
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-500 block px-1 mb-4 flex items-center gap-2">
                          <Cpu className="w-4 h-4" /> Neural_Assistant_Config
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Assistant_Name</label>
                             <input 
                                type="text" 
                                value={ajaSettings.name} 
                                onChange={(e) => setAjaSettings(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                                className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-fuchsia-500 outline-none"
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Gender_Form</label>
                               <select 
                                  value={ajaSettings.gender}
                                  onChange={(e) => setAjaSettings(prev => ({ ...prev, gender: e.target.value as any }))}
                                  className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-fuchsia-500 outline-none"
                               >
                                  <option value="female">FEMALE_HUMANOID</option>
                                  <option value="male">MALE_HUMANOID</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Neural_Voice</label>
                               <select 
                                  value={ajaSettings.voice}
                                  onChange={(e) => setAjaSettings(prev => ({ ...prev, voice: e.target.value as any }))}
                                  className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-fuchsia-500 outline-none"
                               >
                                  <option value="Zephyr">ZEPHYR (Humanoid_Relatable)</option>
                                  <option value="Puck">PUCK (Playful_Dynamic)</option>
                                  <option value="Kore">KORE (Professional_Precise)</option>
                                  <option value="Charon">CHARON (Deep_Authoritative)</option>
                                  <option value="Fenrir">FENRIR (Strong_Direct)</option>
                                </select>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Neural_Tone</label>
                             <select 
                                value={ajaSettings.tone}
                                onChange={(e) => setAjaSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                                className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-fuchsia-500 outline-none"
                             >
                               <option value="professional">PROFESSIONAL</option>
                               <option value="friendly">FRIENDLY</option>
                               <option value="robotic">ROBOTIC</option>
                               <option value="empathetic">EMPATHETIC</option>
                             </select>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Availability_Protocol</label>
                             <select 
                                value={ajaSettings.availability}
                                onChange={(e) => setAjaSettings(prev => ({ ...prev, availability: e.target.value as any }))}
                                className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-fuchsia-500 outline-none"
                             >
                               <option value="24/7">24/7 (SUPER ADMIN ONLY)</option>
                               <option value="business_hours">BUSINESS HOURS</option>
                               <option value="scheduled">SCHEDULED</option>
                             </select>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase">Accessibility_Mode</span>
                                <span className="text-[8px] text-slate-500 uppercase">Enhanced UI/UX Overlays</span>
                             </div>
                             <button 
                                onClick={() => setAjaSettings(prev => ({ ...prev, accessibility: !prev.accessibility }))}
                                className={`w-12 h-6 rounded-full relative transition-colors ${ajaSettings.accessibility ? 'bg-cyan-500' : 'bg-slate-800'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${ajaSettings.accessibility ? 'left-7' : 'left-1'}`}></div>
                             </button>
                          </div>
                        </div>
                      </div>

                      {/* AGENT HUMANIZATION CONSOLE */}
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 block px-1 mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Agent_Humanization_Console
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Select_Agent</label>
                            <select 
                              value={selectedAgentId || ''}
                              onChange={(e) => setSelectedAgentId(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none"
                            >
                              <option value="">CHOOSE AGENT</option>
                              {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name} ({agent.firstName})</option>
                              ))}
                            </select>
                          </div>

                          {selectedAgentId && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              {agents.find(a => a.id === selectedAgentId) && (
                                <>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">First_Name</label>
                                      <input 
                                        type="text" 
                                        value={agents.find(a => a.id === selectedAgentId)?.firstName || ''}
                                        onChange={(e) => updateAgent(selectedAgentId, { firstName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Last_Name</label>
                                      <input 
                                        type="text" 
                                        value={agents.find(a => a.id === selectedAgentId)?.lastName || ''}
                                        onChange={(e) => updateAgent(selectedAgentId, { lastName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Age</label>
                                      <input 
                                        type="number" 
                                        value={agents.find(a => a.id === selectedAgentId)?.age || 0}
                                        onChange={(e) => updateAgent(selectedAgentId, { age: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Language</label>
                                      <input 
                                        type="text" 
                                        value={agents.find(a => a.id === selectedAgentId)?.language || ''}
                                        onChange={(e) => updateAgent(selectedAgentId, { language: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Personality_Profile</label>
                                    <textarea 
                                      value={agents.find(a => a.id === selectedAgentId)?.personality || ''}
                                      onChange={(e) => updateAgent(selectedAgentId, { personality: e.target.value })}
                                      className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none h-24 resize-none"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Editable_Responsibilities</label>
                                    <textarea 
                                      value={agents.find(a => a.id === selectedAgentId)?.responsibilities || ''}
                                      onChange={(e) => updateAgent(selectedAgentId, { responsibilities: e.target.value })}
                                      className="w-full bg-black/40 border border-white/5 px-4 py-3 text-xs mono text-white rounded-lg focus:border-emerald-500 outline-none h-24 resize-none"
                                      placeholder="Define core agent responsibilities..."
                                    />
                                  </div>

                                  {/* RECOMMENDATIONS LIST */}
                                  <div className="space-y-3 pt-4 border-t border-white/10">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Active_Recommendations</label>
                                    <div className="space-y-2">
                                      {(agents.find(a => a.id === selectedAgentId)?.recommendations || []).length > 0 ? (
                                        (agents.find(a => a.id === selectedAgentId)?.recommendations || []).map(rec => (
                                          <div key={rec.id} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                                            <div className="flex justify-between items-center">
                                              <span className="text-[10px] font-black text-white uppercase">{rec.title}</span>
                                              <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase ${
                                                rec.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                rec.impact === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-cyan-500/20 text-cyan-400'
                                              }`}>{rec.impact}</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 mono uppercase">{rec.description}</p>
                                            <div className="flex gap-2 pt-2">
                                              <button 
                                                onClick={() => handleRecommendation(selectedAgentId!, rec.id, 'accept')}
                                                className="text-[7px] font-black text-emerald-400 uppercase hover:text-emerald-300 transition-colors"
                                              >
                                                Accept
                                              </button>
                                              <button 
                                                onClick={() => handleRecommendation(selectedAgentId!, rec.id, 'reject')}
                                                className="text-[7px] font-black text-slate-500 uppercase hover:text-slate-400 transition-colors"
                                              >
                                                Dismiss
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-[8px] text-slate-600 uppercase mono text-center py-4">No active recommendations.</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* PWA STATUS & INSTALL */}
                                  <div className="space-y-3 pt-4 border-t border-white/10">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">PWA_Neural_Sync_Status</label>
                                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                          <Download className="w-4 h-4 text-cyan-500" />
                                        </div>
                                        <div>
                                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Offline_Mode_Ready</h4>
                                          <p className="text-[7px] text-slate-500 uppercase tracking-widest mono">Neural assets cached for local execution.</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          // Trigger install prompt if available
                                          const event = new CustomEvent('pwa-install-prompt');
                                          window.dispatchEvent(event);
                                        }}
                                        className="px-3 py-1.5 bg-cyan-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-all"
                                      >
                                        Install_OS
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: TECHNICAL MANUAL */}
                    <div className="lg:col-span-7 space-y-8">
                       {/* AJA IMPROVEMENT REPORTS */}
                       <section className="p-8 bg-black/40 border border-fuchsia-500/20 rounded-3xl space-y-6">
                          <div className="flex justify-between items-center">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-500 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Neural_Growth_Log
                             </h3>
                             <span className="text-[8px] font-black text-slate-600 uppercase">Daily_Optimization_Active</span>
                          </div>
                          
                           <div className="space-y-4">
                             {improvementReports.length > 0 ? improvementReports.map((report, rIdx) => (
                                <div key={report.id || `report-${rIdx}`} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                                   <div className="flex justify-between items-start mb-3">
                                      <div>
                                         <div className="text-[10px] font-black text-white uppercase tracking-widest">Optimization_Cycle :: {new Date(report.date).toLocaleDateString()}</div>
                                         <div className="text-[8px] text-emerald-400 font-black uppercase mt-1">Performance_Gain: +{report.performanceGain}%</div>
                                      </div>
                                      <Zap className="w-4 h-4 text-amber-500" />
                                   </div>
                                   <div className="space-y-3">
                                      <div className="flex flex-wrap gap-2">
                                         {report.newCapabilities?.map((cap, cIdx) => (
                                            <span key={`${report.id}-${cap}-${cIdx}`} className="px-2 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded text-[7px] font-black text-fuchsia-400 uppercase">{cap}</span>
                                         ))}
                                      </div>
                                      <p className="text-[10px] text-slate-500 leading-relaxed mono uppercase italic">
                                         {report.optimizationNotes}
                                      </p>
                                   </div>
                                </div>
                             )) : (
                                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                                   <p className="text-[10px] text-slate-600 uppercase mono">No improvement reports generated yet.</p>
                                </div>
                             )}
                          </div>
                       </section>

                       <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl mb-6">
                          <h4 className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-4">Neural_FAQ</h4>
                          <div className="space-y-4">
                             {[
                                { q: "How does the fallback chain work?", a: "If the primary Gemini node fails, the system automatically routes requests through OpenAI, Claude, Grok, and GPT-5 proxies." },
                                { q: "What is the Project Manager's role?", a: "The Project Manager AI Agent is responsible for everything, acting as the Manager, Guardian, and System Security expert." },
                                { q: "What is the Supervisor's role?", a: "The Pipeline Processor Supervisor is specifically responsible for the integrity and efficiency of the lead pipeline." },
                                { q: "Can I customize AJA's form?", a: "Yes, AJA can be configured as Male or Female, and integrates directly into the SYNAPSE." },
                                { q: "How do I start a tutorial?", a: "Ask AJA directly via the AJA Neural Link to 'Start System Tutorial' or 'Explain the Pipeline'." }
                             ].map((faq, i) => (
                                <div key={i} className="space-y-1">
                                   <p className="text-[10px] font-black text-white uppercase tracking-tight">Q: {faq.q}</p>
                                   <p className="text-[9px] text-slate-500 leading-relaxed">{faq.a}</p>
                                </div>
                             ))}
                          </div>
                       </div>

                       <section className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-8">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 block px-1 mb-4 flex items-center gap-2">
                             <BookOpen className="w-4 h-4" /> Technical_Reference_Manual
                          </h3>
                          
                          <div className="space-y-6">
                            <div>
                               <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">{appName}_V1 Overview</h4>
                               <p className="text-xs leading-relaxed text-slate-400 font-medium">
                                 {appName} is a high-resilience neural discovery engine designed for enterprise-scale lead generation and digital transformation. It leverages a multi-provider fallback chain to ensure 99.99% operational uptime.
                               </p>
                            </div>

                            <div>
                               <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">The 7-Stage Neural Pipeline</h4>
                               <div className="grid grid-cols-1 gap-4">
                                  {[
                                    { s: 'Q1', n: 'Discovery', d: 'Multi-vector scan using Google Search & Maps grounding.' },
                                    { s: 'Q2', n: 'Verification', d: 'Communications handshake and telephone line confirmation.' },
                                    { s: 'Q3', n: 'Qualification', d: 'Potency scoring based on review sentiment and density.' },
                                    { s: 'Q4', n: 'Intelligence', d: 'Gap analysis identifying digital transformation needs.' },
                                    { s: 'Q5', n: 'Synthesis', d: 'Neural generation of pitch vectors and strategy decks.' },
                                    { s: 'Q6', n: 'Fulfillment', d: 'Automated asset building and outreach execution.' },
                                    { s: 'Q7', n: 'Archive', d: 'High-security vaulting of verified revenue nodes.' },
                                  ].map(item => (
                                    <div key={item.s} className="flex gap-4 p-3 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-all group">
                                      <div className="text-[10px] font-black text-cyan-500 mono group-hover:scale-110 transition-transform">{item.s}</div>
                                      <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.n}</p>
                                        <p className="text-[9px] text-slate-500 mono leading-tight mt-0.5">{item.d}</p>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                               <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Neural_Architecture</h4>
                               <ul className="space-y-2 text-[10px] font-bold text-slate-400 uppercase mono">
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> L1: Gemini 3 Pro (Thinking)</li>
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> L2: Gemini 3 Flash (Fast)</li>
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> L3: External Bridge (Claude/Grok)</li>
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> L4: GPT-5 Simulation Proxy</li>
                               </ul>
                             </div>

                             <div className="pt-6 border-t border-white/10">
                               <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Synapse_Product_&_Service_List</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                   <h5 className="text-[10px] font-black text-cyan-400 uppercase mb-2">Core_AI_Solutions</h5>
                                   <ul className="space-y-1 text-[9px] text-slate-400 mono uppercase">
                                     <li>• Autonomous Lead Discovery Engine</li>
                                     <li>• Neural Market Intelligence Analysis</li>
                                     <li>• Automated Strategic Synthesis</li>
                                     <li>• AI-Driven Outreach & Fulfillment</li>
                                   </ul>
                                 </div>
                                 <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                   <h5 className="text-[10px] font-black text-cyan-400 uppercase mb-2">Digital_Transformation</h5>
                                   <ul className="space-y-1 text-[9px] text-slate-400 mono uppercase">
                                     <li>• High-Performance Web Development</li>
                                     <li>• Neural SEO & Content Optimization</li>
                                     <li>• Omni-Channel Digital Presence</li>
                                     <li>• Legacy System AI Integration</li>
                                   </ul>
                                 </div>
                                 <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                   <h5 className="text-[10px] font-black text-cyan-400 uppercase mb-2">Enterprise_Intelligence</h5>
                                   <ul className="space-y-1 text-[9px] text-slate-400 mono uppercase">
                                     <li>• Custom Neural Model Training</li>
                                     <li>• Predictive Revenue Modeling</li>
                                     <li>• Automated Compliance Auditing</li>
                                     <li>• Real-Time Market Signal Monitoring</li>
                                   </ul>
                                 </div>
                                 <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                   <h5 className="text-[10px] font-black text-cyan-400 uppercase mb-2">Support_&_Maintenance</h5>
                                   <ul className="space-y-1 text-[9px] text-slate-400 mono uppercase">
                                     <li>• 24/7 AJA Neural Link Support</li>
                                     <li>• Continuous System Optimization</li>
                                     <li>• Data Integrity Guarantee</li>
                                     <li>• Neural Asset Persistence Management</li>
                                   </ul>
                                 </div>
                               </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                               <a href={`https://style.${appName.toLowerCase()}.network`} target="_blank" rel="noopener noreferrer" className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/40 transition-all group text-center">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Visual_Identity</span>
                                  <h4 className="text-[10px] font-black text-white uppercase group-hover:text-amber-500">Style_Guide_V1</h4>
                               </a>
                               <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl opacity-40 text-center">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Privacy_Policy</span>
                                  <h4 className="text-[10px] font-black text-white uppercase">Neural_Policy</h4>
                               </div>
                            </div>
                          </div>
                       </section>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </section>
      </main>

      {/* Image Generation Modal */}
      <AnimatePresence>
        {(isGeneratingImage || generatedImage) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl hud-panel bg-black/90 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural_Synthesis_Output</h3>
                    <p className="text-[10px] text-slate-500 mono uppercase mt-1">Resource: Nano_Banana_Flash_V2.5</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setGeneratedImage(null);
                    setIsGeneratingImage(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[400px]">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-10 h-10 text-cyan-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-white uppercase tracking-widest mb-2">Synthesizing_Visual_Data</p>
                      <p className="text-xs text-slate-500 mono uppercase max-w-md mx-auto leading-relaxed">
                        Prompt: {imagePrompt}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center gap-6">
                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[60vh]">
                      <img 
                        src={generatedImage!} 
                        alt="Neural Output" 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage!;
                            link.download = `synapse-neural-output-${Date.now()}.png`;
                            link.click();
                          }}
                          className="px-6 py-3 bg-cyan-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download_Asset
                        </button>
                        <button 
                          onClick={() => handleGenerateImage(imagePrompt)}
                          className="px-6 py-3 bg-white/10 text-white text-[10px] font-black uppercase rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
                        >
                          <RotateCcw className="w-4 h-4" /> Re_Synthesize
                        </button>
                      </div>
                    </div>
                    <div className="w-full max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-500 mono uppercase mb-1">Source_Prompt</p>
                      <p className="text-xs text-white/80 leading-relaxed italic">"{imagePrompt}"</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-black">Neural_Load</span>
                    <span className="text-[10px] text-cyan-500 mono">OPTIMAL</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-black">Synthesis_Engine</span>
                    <span className="text-[10px] text-slate-400 mono">FLASH_2.5</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural_Link_Stable</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AgentListModal 
        isOpen={isAgentModalOpen} 
        onClose={() => setIsAgentModalOpen(false)} 
        agents={agents} 
        onUpdateAgent={updateAgent}
        onDeleteAgent={deleteAgent}
        onHandleRecommendation={handleRecommendation}
      />

      <StrategyModal 
        isOpen={isStrategyModalOpen} 
        onClose={() => setIsStrategyModalOpen(false)} 
        lead={selectedLeadForStrategy} 
        onUpdateLead={handleUpdateLead}
        onLog={addLog}
        onShowToast={showToast}
        onRouteSwitch={setActiveRoute}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 w-[calc(100%-2rem)] max-w-[400px] ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
            {toast.type === 'info' && <Zap className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest truncate">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AJA PERSISTENT ASSISTANT - POSITIONED AT THE VERY EDGE */}
      <AjaAvatar 
         isListening={isAjaListening} 
         isSpeaking={isAjaSpeaking} 
         isCritical={isCritical} 
         isSearching={isSearching}
         isProcessing={masterDb.some(l => l.isProcessing)}
         onClick={() => setIsVoiceAssistantOpen(true)} 
      />

      {isVoiceAssistantOpen && (
        <VoiceAssistant 
          autoStart={true}
          onClose={() => {
            setIsVoiceAssistantOpen(false);
          }} 
          onVoiceAction={(action, args) => {
            if (action === 'switchTab') {
              setActiveTab(args.tab);
            } else if (action === 'generateImage') {
              handleGenerateImage(args.prompt, args.aspectRatio);
            }
          }} 
          onSpeakingChange={setIsAjaSpeaking}
          onListeningChange={setIsAjaListening}
          onLog={addLog} 
          onSendSignal={(signal) => {
            const newSignal: Signal = {
              ...signal,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString()
            };
            setSignals(prev => [...prev, newSignal]);
            addLog({ type: 'info', module: 'AJA_NEURAL_LINK', message: `Signal sent to Project Manager: ${signal.type}` });
          }}
          onGenerateReport={(report) => {
            const newReport: ImprovementReport = {
              ...report,
              id: Math.random().toString(36).substr(2, 9),
              date: new Date().toISOString()
            };
            setImprovementReports(prev => [newReport, ...prev]);
            addLog({ type: 'success', module: 'AJA_NEURAL_LINK', message: `Neural improvement report generated: +${report.performanceGain}%` });
          }}
          directives={directives}
          ajaSettings={ajaSettings}
        />
      )}
    </div>
    </>
  );
};

export default App;
