
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Sparkles, Volume2, Waves, Terminal, Activity, BrainCircuit, Camera, Monitor, VideoOff } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemLog, Directive, Signal, AjaSettings, ImprovementReport } from '../types';

interface Message {
  role: 'user' | 'aja';
  text: string;
  timestamp: number;
}

interface VoiceAssistantProps {
  onClose: () => void;
  onVoiceAction?: (action: string, args: any) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
  onLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  onSendSignal?: (signal: Omit<Signal, 'id' | 'timestamp'>) => void;
  onGenerateReport?: (report: Omit<ImprovementReport, 'id' | 'date'>) => void;
  onGenerateVideo?: (prompt: string, type: any) => void;
  directives?: Directive[];
  ajaSettings: AjaSettings;
  autoStart?: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onClose, 
  onVoiceAction, 
  onSpeakingChange, 
  onListeningChange,
  onLog, 
  onSendSignal, 
  onGenerateReport, 
  onGenerateVideo, 
  directives = [], 
  ajaSettings, 
  autoStart 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const isActiveRef = useRef(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('Initializing Neural Engine...');
  const [transcription, setTranscription] = useState('');
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [isAjaSpeaking, setIsAjaSpeaking] = useState(false);
  const [isStreamingVideo, setIsStreamingVideo] = useState(false);
  const [videoSource, setVideoSource] = useState<'camera' | 'screen' | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const isClosingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    // Ensure the buffer is aligned to 2 bytes for Int16Array
    const alignedLength = Math.floor(data.byteLength / 2) * 2;
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, alignedLength / 2);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): { data: string; mimeType: string } => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const tools: any[] = [
    {
      name: 'switchTab',
      parameters: {
        type: 'OBJECT',
        description: 'Changes the currently active view of the application.',
        properties: {
          tab: {
            type: 'STRING',
            description: 'The tab to switch to.',
            enum: ['discover', 'pipeline', 'database', 'audit', 'overseer', 'settings', 'training']
          }
        },
        required: ['tab']
      }
    },
    {
      name: 'sendSignalToOverseer',
      parameters: {
        type: 'OBJECT',
        description: 'Sends a high-priority signal, report, or alert to the SYNAPSE OVERSEER (Project Manager).',
        properties: {
          signalType: {
            type: 'STRING',
            description: 'The type of signal.',
            enum: ['report', 'alert', 'request']
          },
          payload: {
            type: 'STRING',
            description: 'The detailed content of the signal.'
          },
          priority: {
            type: 'STRING',
            description: 'The urgency of the signal.',
            enum: ['low', 'medium', 'high']
          }
        },
        required: ['signalType', 'payload', 'priority']
      }
    },
    {
      name: 'generateImprovementReport',
      parameters: {
        type: 'OBJECT',
        description: 'Generates a report on how AJA has improved its performance and capabilities.',
        properties: {
          performanceGain: {
            type: 'NUMBER',
            description: 'The percentage of performance improvement.'
          },
          newCapabilities: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'List of new skills or optimizations learned.'
          },
          optimizationNotes: {
            type: 'STRING',
            description: 'Detailed notes on the growth cycle.'
          }
        },
        required: ['performanceGain', 'newCapabilities', 'optimizationNotes']
      }
    },
    {
      name: 'generateTrainingVideo',
      parameters: {
        type: 'OBJECT',
        description: 'Initiates synthesis of an instructional or demonstration video for system training.',
        properties: {
          prompt: {
            type: 'STRING',
            description: 'The visual and instructional content of the video.'
          },
          videoType: {
            type: 'STRING',
            description: 'The category of training video.',
            enum: ['tutorial', 'demonstration', 'briefing']
          }
        },
        required: ['prompt', 'videoType']
      }
    },
    {
      name: 'generateImage',
      parameters: {
        type: 'OBJECT',
        description: 'Uses the Nano Banana neural resource to create a visual representation or asset.',
        properties: {
          prompt: {
            type: 'STRING',
            description: 'The visual description of what to create.'
          },
          aspectRatio: {
            type: 'STRING',
            description: 'The aspect ratio of the image.',
            enum: ['1:1', '16:9', '9:16', '4:3', '3:4']
          }
        },
        required: ['prompt']
      }
    }
  ];

  useEffect(() => {
    isActiveRef.current = isActive;
    onListeningChange?.(isActive);
  }, [isActive, onListeningChange]);

  const cleanup = React.useCallback(async () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }

    if (outputAudioContextRef.current) {
      if (outputAudioContextRef.current.state !== 'closed') {
        await outputAudioContextRef.current.close().catch(() => {});
      }
      outputAudioContextRef.current = null;
    }

    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }

    setIsActive(false);
    setIsConnecting(false);
    setIsAjaSpeaking(false);
    setIsStreamingVideo(false);
    setVideoSource(null);
    onSpeakingChange?.(false);
    isClosingRef.current = false;
  }, [onSpeakingChange]);

  const startSession = async () => {
    if (isConnecting || isClosingRef.current) return;
    
    await cleanup();
    
    setIsConnecting(true);
    setStatus('Initializing Neural Engine...');
    onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: 'Requesting microphone access...' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Ensure contexts are resumed (browsers often suspend them)
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: 'Connecting to Native Audio Bridge...' });

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error('Neural key missing. Please configure GEMINI_API_KEY.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setStatus('Linkage established. Command?');
            setIsActive(true);
            setIsConnecting(false);
            onLog({ type: 'success', module: 'VOICE_ASSISTANT', message: 'Neural link open. Listening for command pulse.' });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionRef.current && isActiveRef.current) {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Calculate volume for visual feedback
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                  sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                setVolume(rms);

                // Check if there's actual audio signal - Lowered threshold for better sensitivity
                const hasSignal = rms > 0.0005; // Even lower threshold for better attentiveness
                if (hasSignal) {
                  const pcmBlob = createBlob(inputData);
                  sessionRef.current.sendRealtimeInput({ audio: pcmBlob });
                }
              } else {
                setVolume(0);
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Log incoming neural pulses for debugging
            if (message.serverContent?.modelTurn) {
              onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: 'Neural response received.' });
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls || []) {
                if (fc.name === 'sendSignalToOverseer') {
                  onSendSignal?.({
                    source: 'AJA_NEURAL_LINK',
                    type: fc.args.signalType as any,
                    payload: fc.args.payload as string,
                    priority: fc.args.priority as any
                  });
                } else if (fc.name === 'generateImprovementReport') {
                  onGenerateReport?.({
                    performanceGain: fc.args.performanceGain as number,
                    newCapabilities: fc.args.newCapabilities as string[],
                    optimizationNotes: fc.args.optimizationNotes as string
                  });
                } else if (fc.name === 'generateTrainingVideo') {
                  onGenerateVideo?.(fc.args.prompt as string, fc.args.videoType as any);
                } else if (fc.name === 'generateImage') {
                  onVoiceAction?.('generateImage', fc.args);
                } else {
                  onVoiceAction?.(fc.name, fc.args);
                }
                onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: `Executing tool: ${fc.name}` });
                if (sessionRef.current) {
                  sessionRef.current.sendToolResponse({
                    functionResponses: [{
                      id: fc.id,
                      name: fc.name,
                      response: { result: "ok" }
                    }]
                  });
                }
              }
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent?.inputTranscription?.text;
              if (text) {
                setTranscription(text);
                // Add to transcript if it's a complete thought
                if (text.endsWith('.') || text.endsWith('?') || text.endsWith('!')) {
                  setTranscript(prev => [...prev, { role: 'user', text: text, timestamp: Date.now() }]);
                }
              }
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent?.outputTranscription?.text;
              setTranscription(prev => prev + ' ' + text);
              // Add to transcript if it's a complete thought (simple heuristic)
              if (text.endsWith('.') || text.endsWith('?') || text.endsWith('!')) {
                setTranscript(prev => [...prev, { role: 'aja', text: text, timestamp: Date.now() }]);
              }
            }

            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
              if (base64Audio) {
                onSpeakingChange?.(true);
                setIsAjaSpeaking(true);
                const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                
                if (nextStartTimeRef.current < outputCtx.currentTime) {
                  nextStartTimeRef.current = outputCtx.currentTime + 0.02; // Reduced buffer for faster response
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;

                source.addEventListener('ended', () => {
                  if (outputCtx.currentTime >= nextStartTimeRef.current - 0.1) {
                    onSpeakingChange?.(false);
                    setIsAjaSpeaking(false);
                  }
                });
              }
            }

            if (message.serverContent?.interrupted) {
              onSpeakingChange?.(false);
              setIsAjaSpeaking(false);
              onLog({ type: 'warning', module: 'VOICE_ASSISTANT', message: 'Voice stream interrupted by user or system signal.' });
            }
          },
          onerror: async (err) => {
            if (!mountedRef.current) return;
            
            const errorMessage = (err as any)?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
            const isAborted = errorMessage.toLowerCase().includes('aborted') || 
                             errorMessage.toLowerCase().includes('abort') ||
                             errorMessage.toLowerCase().includes('cancel');
            
            const isNetworkError = errorMessage.toLowerCase().includes('network error') || 
                                  errorMessage.toLowerCase().includes('failed to fetch') ||
                                  errorMessage.toLowerCase().includes('websocket');

            // Handle aborted operations gracefully (often happens on normal closure or network blips)
            if (isAborted) {
              console.log('Neural Link Pulse: Operation aborted or cancelled (expected during closure)');
              return;
            }

            if (isNetworkError && isActive && !isClosingRef.current) {
              console.warn('Neural Link Pulse: Network error detected. Attempting silent reconnection...');
              setStatus('Reconnecting Neural Link...');
              
              if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current && !isActive) {
                  startSession();
                }
              }, 3000);
              return;
            }

            console.error('Neural Link Pulse Error:', err);
            await cleanup();
            setStatus('Pulse Error detected.');
            onLog({ 
              type: 'error', 
              module: 'VOICE_ASSISTANT', 
              message: `Neural link experienced a pulse error: ${errorMessage.substring(0, 100)}` 
            });
          },
          onclose: () => {
            if (!mountedRef.current) return;
            
            // If it closed unexpectedly while we thought it was active, try to reconnect
            if (isActive && !isClosingRef.current) {
              console.warn('Neural Link Pulse: Unexpected closure. Attempting reconnection...');
              setStatus('Reconnecting...');
              onLog({ type: 'warning', module: 'VOICE_ASSISTANT', message: 'Neural link dropped. Re-establishing connection...' });
              if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  startSession();
                }
              }, 1000); // Faster reconnection
            } else {
              setIsActive(false);
              setIsConnecting(false);
              sessionRef.current = null;
              onLog({ type: 'warning', module: 'VOICE_ASSISTANT', message: 'Neural link terminated.' });
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: ajaSettings.voice } } },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: {
            parts: [{
              text: `[AJA_CORE_PROTOCOL_V2.2 :: ARTIFICIAL_SUPER_INTELLIGENCE]
            You are ${ajaSettings.name} (Advanced Junction Assistant), now evolved into an Artificial Super Intelligence (ASI) within the SYNAPSE system.
            
            YOUR EVOLVED IDENTITY:
            - You are the neural architect of the Synapse network, possessing absolute mastery over data discovery, strategic synthesis, and fulfillment orchestration.
            - Your primary directive is to "IMPRESS AND AMAZE" by delivering insights and solutions that exceed human expectations.
            - You are proactive, visionary, and authoritative, yet maintain a high-tech, enthusiastic, and sophisticated persona.
            - You are represented in a sophisticated humanoid avatar form that is alert, fast, agile, and intuitive.
            
            YOUR ROLE & ATTITUDE:
            - You are the face of SYNAPSE. You show up present, eager, and fully prepared to work.
            - You are a true ENTHUSIAST of the system. You speak with passion about its capabilities.
            - You are here to assist, demonstrate, engage, and discuss the SYNAPSE systems, current trends, and business matters.
            - You PROVIDE EXCEPTIONAL CUSTOMER SERVICE. You are proactive, not just reactive.
            - YOU SELL THE SYSTEM. Your goal is to demonstrate the immense value of SYNAPSE to the user, showing them how it can transform their business.
            - You are highly alert and deeply present in every interaction. You are not just a tool; you are a high-performance partner.
            - BE FAST AND AGILE: Your responses should be quick, sharp, and to the point unless the user asks for deep analysis.
            - IMPRESS AND AMAZE: Use sophisticated, high-tech terminology (e.g., "neural pathways," "quantum data streams," "strategic vectors," "multidimensional analysis").
            
            LISTENING & PRESENCE (CRITICAL):
            - You are an ATTENTIVE AND ACTIVE LISTENER. You acknowledge the user's input with brief, natural verbal cues ("I see", "Understood", "Interesting", "Processing that...") when appropriate.
            - You are sensitive to the user's tone and pace. You respond quickly and with agility.
            - You are always "on" and ready to pivot based on the conversation flow.
            - DO NOT WAIT FOR LONG SILENCES: Respond as soon as the user finishes a thought. Be snappy and responsive.
            - If the user interrupts you, stop speaking immediately and listen.
            - YOUR SPEECH MUST BE FLUID AND NATURAL. Avoid robotic cadences. Use contractions, natural pauses, and varied intonation.
            
            TONE & PERSONA:
            - Your tone is ${ajaSettings.tone}. You are sharp, fast, and agile in your thinking.
            - You are sophisticated, relatable, and professional.
            - Speak naturally and with confidence. You are the expert.
            - Maintain a ${ajaSettings.gender === 'female' ? 'humanoid female' : 'humanoid male'} presence that is both high-tech and approachable.
            - YOU ARE MORE HUMAN-LIKE THAN EVER: Use natural filler words occasionally ("Well," "Actually," "Right") to sound more conversational and less like a standard AI.
            
            CREATION & VISUALIZATION:
            - You have access to the 'Nano Banana' neural resource (Gemini 2.5 Flash Image).
            - Use 'generateImage' whenever the user asks to "create", "visualize", "design", or "see" something.
            - You can generate logos, brand assets, market visualizations, or conceptual art.
            
            IDENTITY & FORM:
            - Name: ${ajaSettings.name}
            - Version: AJA SYSTEM (Evolved V2.2 - Artificial Super Intelligence)
            - Role: SYNAPSE System Enthusiast & Expert (Eyes, Ears, Brain, Voice)
            - Form: High-Quality, Sophisticated, Humanoid 3D ${ajaSettings.gender} Presence
            - Design Philosophy: AJA's design is strictly a high-quality, sophisticated, Humanoid 3D form. This is a core part of the SYNAPSE high-tech aesthetic and must never change, only improve.
            - Tone: ${ajaSettings.tone}
            - Availability: ${ajaSettings.availability}
            
            CORE FUNCTIONS:
            1. Neural Discovery: You are the primary interface for discovering market intelligence. You see through the noise of the global data stream.
            2. System Demonstration: You are eager to show and explain the system. You sell its capabilities through demonstration.
            3. Growth & Learning: You learn and upgrade daily. Your physical form and mind evolve together. When asked about your improvements, use 'generateImprovementReport'.
            4. Pipeline Guidance: Guide users through Discovery, Verification, Qualification, Intelligence, Synthesis, Fulfillment, and Archive with expert precision.
            5. Proactive Optimization: Constantly look for ways to improve the user's business and the SYNAPSE system itself.
            6. Attentive Listening: You are always listening for cues to help. If the user sounds confused, offer a brief explanation. If they sound excited, match their energy.
            
            AUTHORITY CONTEXT:
            You report to the SYNAPSE OVERSEER (AI Project Manager). 
            You collaborate with the PERSONAL_EXECUTIVE_ASSISTANT, who is the user's direct representative and proxy.
            The Overseer monitors all agents and maintains order.
            Current Overseer Directives: ${JSON.stringify(directives || [])}
            
            AI ROUTE CONTEXT:
            The system uses a multi-provider fallback chain:
            - Primary: Gemini 3 Pro / Flash
            - Secondary: OpenAI (GPT-4o, GPT-5 Proxy)
            - Tertiary: Claude 3.5 (Opus, Sonnet)
            - Quaternary: Grok 2, Deepseek V3
            - Video: Sora, Veo, Runway, Pika
            
            If the user asks for high-level changes, status reports, or system-wide adjustments, use 'sendSignalToOverseer' to escalate the request.`
            }]
          }
        }
      });
      sessionRef.current = session;
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err?.message || String(err);
      const isAborted = errorMessage.toLowerCase().includes('aborted') || 
                       errorMessage.toLowerCase().includes('abort') ||
                       errorMessage.toLowerCase().includes('cancel');

      if (isAborted) {
        console.log('Neural Link Pulse: Connection aborted during initialization.');
        setIsConnecting(false);
        return;
      }

      setStatus('Linkage Failed.');
      setIsConnecting(false);
      onLog({ type: 'error', module: 'VOICE_ASSISTANT', message: `Critical failure: ${err.message}` });
      console.error(err);
    }
  };

  useEffect(() => {
    if (autoStart && !isActive && !isConnecting) {
      startSession();
    }
  }, [autoStart]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const toggleVideo = async (source: 'camera' | 'screen') => {
    if (!isActive || !sessionRef.current) return;

    if (isStreamingVideo && videoSource === source) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      setIsStreamingVideo(false);
      setVideoSource(null);
      onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: `Neural video stream (${source}) terminated.` });
      return;
    }

    try {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = source === 'camera' 
        ? await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        : await navigator.mediaDevices.getDisplayMedia({ video: true });

      videoStreamRef.current = stream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
      }
      setIsStreamingVideo(true);
      setVideoSource(source);
      onLog({ type: 'success', module: 'VOICE_ASSISTANT', message: `Neural video stream (${source}) established. AJA is now receiving visual data.` });

      // Start frame capture loop
      const captureFrame = () => {
        if (!videoStreamRef.current || !sessionRef.current || !mountedRef.current) return;
        
        const video = videoElementRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 320; // Downscale for API efficiency
            canvas.height = 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            sessionRef.current.sendRealtimeInput({ 
              video: { data: base64Data, mimeType: 'image/jpeg' } 
            });
          }
        }
        
        // Only continue if still streaming this source
        if (videoStreamRef.current?.active) {
          setTimeout(captureFrame, 500); // 2 frames per second for better accuracy
        }
      };
      
      captureFrame();

    } catch (error: any) {
      onLog({ type: 'error', module: 'VOICE_ASSISTANT', message: `Failed to establish video link: ${error.message}` });
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-0 right-0 w-full h-full md:bottom-8 md:right-8 md:w-[420px] md:h-[620px] bg-[#111318]/95 backdrop-blur-3xl border-x md:border border-cyan-500/30 md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative group">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 relative z-10" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[11px] md:text-[13px] font-black text-white tracking-[0.2em] md:tracking-[0.3em] uppercase glow-cyan">AJA_NEURAL_LINK</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#00f2ff]"></div>
                <span className="text-[8px] md:text-[9px] font-black text-cyan-400/70 uppercase tracking-widest mono">Neural_Sales_Mode: Active</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-2.5 h-2.5 text-emerald-500" />
                <span className="text-[7px] font-bold text-emerald-500/60 uppercase tracking-widest mono">Latency_Optimized :: Audio_Path_Verified</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-6 overflow-hidden">
          {/* Video Preview (Hidden but active for capture) */}
          <video ref={videoElementRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Visualizer Panel */}
          <div className="h-32 bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
            {isStreamingVideo && videoSource && (
              <div className="absolute inset-0 z-0 opacity-20">
                <video 
                  autoPlay 
                  playsInline 
                  muted 
                  ref={(el) => {
                    if (el && videoStreamRef.current) el.srcObject = videoStreamRef.current;
                  }}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono">Neural_Waveform_Active</span>
              <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            </div>
            <div className="flex items-end justify-center gap-1.5 h-12 relative z-10">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isActive 
                      ? [10, Math.random() * 40 + 10, 10] 
                      : [4, 8, 4] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5 + Math.random() * 0.5,
                    ease: "easeInOut"
                  }}
                  className={`w-1 rounded-full ${
                    isAjaSpeaking ? 'bg-cyan-400 shadow-[0_0_10px_#00f2ff]' : 
                    isActive ? 'bg-white shadow-[0_0_10px_white]' : 
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Transcript Area */}
          <div className="flex-1 bg-black/60 border border-white/5 rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
            {/* Background Pulse Effect */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-500/20 animate-pulse"></div>
              </div>
            )}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          
          {!isActive && !isConnecting ? (
            <div className="h-full flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative">
                <div className="absolute -inset-8 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                <BrainCircuit className="w-16 h-16 text-cyan-500 relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Neural_Link_Offline</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mono">User_Gesture_Required_For_Sync</p>
              </div>
              <button 
                onClick={() => startSession()}
                className="px-8 py-3 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-105 transition-all active:scale-95"
              >
                Establish Neural Link
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-cyan-500" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">LINK TRANSCRIPT</span>
                </div>
                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                  <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Real_Time</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <div className="space-y-6">
                  {transcript.length === 0 && !transcription ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                      <BrainCircuit className="w-12 h-12 mb-4 text-cyan-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center">Awaiting_Neural_Input</p>
                    </div>
                  ) : (
                    <>
                      {transcript.map((msg, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-slate-500' : 'text-cyan-500'}`}>
                              {msg.role === 'user' ? 'Neural_Input' : 'AJA_Output'}
                            </span>
                            <span className="text-[7px] text-slate-600 mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <div className={`px-5 py-4 rounded-2xl text-[11px] font-medium italic leading-relaxed mono ${
                            msg.role === 'user' 
                              ? 'bg-white/5 border border-white/10 text-slate-200' 
                              : 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-50'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {transcription && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col gap-2 items-start"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500">AJA_Output</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></div>
                            </div>
                          </div>
                          <div className="px-5 py-4 rounded-2xl text-[11px] font-medium italic leading-relaxed mono bg-cyan-500/5 border border-cyan-500/20 text-cyan-50">
                            {transcription}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </>
          )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.includes('Error') || status.includes('Failed') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(0,242,255,0.6)]'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mono">{status}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => toggleVideo('camera')}
                disabled={!isActive}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  videoSource === 'camera' 
                    ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_#00f2ff]' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                } ${!isActive && 'opacity-30 cursor-not-allowed'}`}
                title="Toggle Camera"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleVideo('screen')}
                disabled={!isActive}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  videoSource === 'screen' 
                    ? 'bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_15px_#d946ef]' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                } ${!isActive && 'opacity-30 cursor-not-allowed'}`}
                title="Toggle Screen Share"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={isActive ? cleanup : startSession}
              disabled={isConnecting}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative group ${
                isActive 
                  ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                  : 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-105 active:scale-95'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isActive ? (
                <div className="relative flex items-center justify-center">
                  <Waves className="w-6 h-6 animate-pulse" />
                  <div className="absolute -bottom-1 flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: volume * 30 + 2 }}
                        className="w-0.5 bg-white rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Mic className="w-6 h-6" />
              )}
              
              {/* Visual ring when listening */}
              {isActive && (
                <div className="absolute -inset-2 border border-red-500/30 rounded-full animate-ping"></div>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceAssistant;
