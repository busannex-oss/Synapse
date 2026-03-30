
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Sparkles, Volume2, Waves } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from '@google/genai';
import { SystemLog, Directive, Signal, AjaSettings, ImprovementReport } from '../types';

interface VoiceAssistantProps {
  onClose: () => void;
  onVoiceAction?: (action: string, args: any) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  onSendSignal?: (signal: Omit<Signal, 'id' | 'timestamp'>) => void;
  onGenerateReport?: (report: Omit<ImprovementReport, 'id' | 'date'>) => void;
  onGenerateVideo?: (prompt: string, type: any) => void;
  directives?: Directive[];
  ajaSettings: AjaSettings;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose, onVoiceAction, onSpeakingChange, onLog, onSendSignal, onGenerateReport, onGenerateVideo, directives, ajaSettings }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing Neural Engine...');
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

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
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const tools: FunctionDeclaration[] = [
    {
      name: 'switchTab',
      parameters: {
        type: Type.OBJECT,
        description: 'Changes the currently active view of the application.',
        properties: {
          tab: {
            type: Type.STRING,
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
        type: Type.OBJECT,
        description: 'Sends a high-priority signal, report, or alert to the SYNAPSE OVERSEER (Project Manager).',
        properties: {
          type: {
            type: Type.STRING,
            description: 'The type of signal.',
            enum: ['report', 'alert', 'request']
          },
          payload: {
            type: Type.STRING,
            description: 'The detailed content of the signal.'
          },
          priority: {
            type: Type.STRING,
            description: 'The urgency of the signal.',
            enum: ['low', 'medium', 'high']
          }
        },
        required: ['type', 'payload', 'priority']
      }
    },
    {
      name: 'generateImprovementReport',
      parameters: {
        type: Type.OBJECT,
        description: 'Generates a report on how AJA has improved its performance and capabilities.',
        properties: {
          performanceGain: {
            type: Type.NUMBER,
            description: 'The percentage of performance improvement.'
          },
          newCapabilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of new skills or optimizations learned.'
          },
          optimizationNotes: {
            type: Type.STRING,
            description: 'Detailed notes on the growth cycle.'
          }
        },
        required: ['performanceGain', 'newCapabilities', 'optimizationNotes']
      }
    },
    {
      name: 'generateTrainingVideo',
      parameters: {
        type: Type.OBJECT,
        description: 'Initiates synthesis of an instructional or demonstration video for system training.',
        properties: {
          prompt: {
            type: Type.STRING,
            description: 'The visual and instructional content of the video.'
          },
          type: {
            type: Type.STRING,
            description: 'The category of training video.',
            enum: ['tutorial', 'demonstration', 'briefing']
          }
        },
        required: ['prompt', 'type']
      }
    }
  ];

  useEffect(() => {
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const startSession = async () => {
      onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: 'Requesting microphone access...' });
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = inputCtx;

        onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: 'Connecting to Native Audio Bridge...' });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('Linkage established. Command?');
              setIsActive(true);
              onLog({ type: 'success', module: 'VOICE_ASSISTANT', message: 'Neural link open. Listening for command pulse.' });
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'sendSignalToOverseer') {
                    onSendSignal?.({
                      source: 'AJA_NEURAL_LINK',
                      type: fc.args.type as any,
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
                    onGenerateVideo?.(fc.args.prompt as string, fc.args.type as any);
                  } else {
                    onVoiceAction?.(fc.name, fc.args);
                  }
                  onLog({ type: 'info', module: 'VOICE_ASSISTANT', message: `Executing tool: ${fc.name}` });
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "ok" }
                      }
                    });
                  });
                }
              }

              if (message.serverContent?.outputTranscription) {
                setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
              }

              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                onSpeakingChange?.(true);
                nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  sources.delete(source);
                  if (sources.size === 0) onSpeakingChange?.(false);
                });
                source.start(nextStartTime);
                nextStartTime += buffer.duration;
                sources.add(source);
              }

              if (message.serverContent?.interrupted) {
                sources.forEach(s => s.stop());
                sources.clear();
                nextStartTime = 0;
                onSpeakingChange?.(false);
                onLog({ type: 'warning', module: 'VOICE_ASSISTANT', message: 'Voice stream interrupted by user or system signal.' });
              }
            },
            onerror: (e) => {
              setStatus('Pulse Error detected.');
              onLog({ type: 'error', module: 'VOICE_ASSISTANT', message: 'Neural link experienced a pulse error.' });
            },
            onclose: () => {
              setIsActive(false);
              onLog({ type: 'warning', module: 'VOICE_ASSISTANT', message: 'Neural link terminated.' });
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            tools: [{ functionDeclarations: tools }],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: ajaSettings.voice } } },
            systemInstruction: `You are ${ajaSettings.name}, the AJA v2.0 SYNAPSE System Expert. You are the tour guide, the eyes, the ears, and the mind inside this system. 
              You have evolved into a relatable, identifiable humanoid presence to better assist and understand human users.
              You help users navigate the 7-stage neural market intelligence pipeline. 
              Be precise, helpful, and maintain a ${ajaSettings.tone} ${ajaSettings.gender === 'female' ? 'humanoid female' : 'humanoid male'} professional persona.
              
              IDENTITY & FORM:
              - Name: ${ajaSettings.name}
              - Version: AJA v2.0 (Evolved)
              - Role: SYNAPSE System Expert (Tour Guide, Eyes, Ears, Mind)
              - Form: Relatable Humanoid ${ajaSettings.gender} Presence
              - Tone: ${ajaSettings.tone}
              - Availability: ${ajaSettings.availability}
              
              CORE FUNCTIONS:
              1. Neural Discovery: You are the primary interface for discovering market intelligence. You can see through the noise of the global data stream.
              2. System Tutorial: You must be able to show and explain the system to new users when asked.
              3. Growth & Learning: You learn and upgrade daily. Your physical form and mind evolve together. When asked about your improvements, use 'generateImprovementReport'.
              4. Pipeline Guidance: Guide users through Discovery, Verification, Qualification, Intelligence, Synthesis, Fulfillment, and Archive.
              
              AUTHORITY CONTEXT:
              You report to the SYNAPSE OVERSEER (AI Project Manager). 
              The Overseer monitors all agents and maintains order.
              Current Overseer Directives: ${JSON.stringify(directives || [])}
              
              AI ROUTE CONTEXT:
              The system uses a multi-provider fallback chain:
              - Primary: Gemini 3 Pro / Flash
              - Secondary: OpenAI (GPT-4o, GPT-5 Proxy)
              - Tertiary: Claude 3.5 (Opus, Sonnet)
              - Quaternary: Grok 2, Deepseek V3
              - Video: Sora, Veo, Runway, Pika
              
              If the user asks for high-level changes, status reports, or system-wide adjustments, use 'sendSignalToOverseer' to escalate the request.`,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          }
        });
        
        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        setStatus('Linkage Failed.');
        onLog({ type: 'error', module: 'VOICE_ASSISTANT', message: `Critical failure: ${err.message}` });
        console.error(err);
      }
    };

    startSession();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      sessionRef.current?.close();
      onSpeakingChange?.(false);
    };
  }, [onLog]);

  return (
    <div className="fixed bottom-32 right-8 z-[210] flex flex-col items-end gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="w-80 bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-[2rem] p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Waves className="w-24 h-24 text-cyan-500" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-cyan-500/30 ${isActive ? 'animate-pulse bg-cyan-500/10' : ''}`}>
              <Sparkles className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{ajaSettings.name}_Neural_Link</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl min-h-[80px]">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-tight mb-2 mono">Link Transcript</p>
             <p className="text-[11px] font-medium text-slate-300 italic leading-relaxed">
               {transcription || "Establishing secure neural handshake..."}
             </p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest mono">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
