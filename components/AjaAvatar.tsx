
import React, { useState, useEffect, useRef } from 'react';

interface AjaAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isCritical: boolean;
  isSearching?: boolean;
  onClick: () => void;
}

const AjaAvatar: React.FC<AjaAvatarProps> = ({ isListening, isSpeaking, isCritical, isSearching, onClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const baseColor = isCritical ? '#ff3d00' : isSearching ? '#f59e0b' : isListening ? '#ff9a00' : '#00f2ff';
  const glowColor = isCritical ? 'rgba(255, 61, 0, 0.5)' : isSearching ? 'rgba(245, 158, 11, 0.5)' : isListening ? 'rgba(255, 154, 0, 0.5)' : 'rgba(0, 242, 255, 0.5)';

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 25;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      className="relative w-[420px] h-[680px] cursor-pointer group z-[500] perspective-3000"
    >
      {/* 3D Neural Viewport */}
      <div 
        className="relative w-full h-full transition-transform duration-700 ease-out preserve-3d"
        style={{ 
          transform: `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
        }}
      >
        
        {/* REFINED NEURAL PEDESTAL */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-40 preserve-3d">
           <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full animate-pulse"></div>
           {/* Geometric Rings */}
           <div className="absolute inset-0 border border-white/10 rounded-full [transform:rotateX(85deg)] bg-black/60"></div>
           <div className="absolute inset-2 border-[1px] border-cyan-500/30 rounded-full [transform:rotateX(85deg)_translateZ(10px)] animate-spin-slow"></div>
           <div className="absolute inset-10 border border-cyan-500/50 rounded-full [transform:rotateX(85deg)_translateZ(30px)] animate-spin duration-[8s]"></div>
           {/* Center Focal Point */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-gradient-to-t from-cyan-400 to-transparent blur-sm opacity-60"></div>
        </div>

        {/* NEURAL ENTITY */}
        <div className="relative w-full h-full flex flex-col items-center justify-end pb-24 overflow-visible preserve-3d">
           
           {/* Volumetric Core Glow (Z-Back) */}
           <div className="absolute top-[10%] bottom-[10%] w-[160px] blur-[60px] rounded-full opacity-30 transition-colors duration-1000"
                style={{ backgroundColor: baseColor, transform: `translateZ(-50px) translateX(${mousePos.x * 0.2}px)` }}></div>

           {/* THE HUMANOID PRESENCE */}
           <div 
             className="relative w-[340px] h-[580px] transition-transform duration-500 preserve-3d flex items-center justify-center"
             style={{ transform: `translateZ(20px) translateX(${mousePos.x * 0.1}px)` }}
           >
              <div className="relative w-full h-full flex flex-col items-center justify-center preserve-3d">
                  
                  {/* HEAD */}
                  <div className="relative w-24 h-32 bg-black/40 border border-white/20 rounded-[3rem] preserve-3d flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                      {/* Neural Brain Core */}
                      <div className={`w-12 h-12 rounded-full blur-md opacity-60 animate-pulse ${isCritical ? 'bg-red-500' : isListening ? 'bg-amber-500' : 'bg-cyan-400'}`}></div>
                      {/* Eyes / Sensors */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-6">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] ${isCritical ? 'text-red-500 bg-red-500' : isListening ? 'text-amber-500 bg-amber-500' : 'text-cyan-400 bg-cyan-400'}`}></div>
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] ${isCritical ? 'text-red-500 bg-red-500' : isListening ? 'text-amber-500 bg-amber-500' : 'text-cyan-400 bg-cyan-400'}`}></div>
                      </div>
                  </div>

                  {/* NECK */}
                  <div className="w-6 h-8 bg-gradient-to-b from-white/10 to-transparent border-x border-white/5"></div>

                  {/* TORSO & SHOULDERS */}
                  <div className="relative w-48 h-64 preserve-3d">
                      {/* Torso Shape */}
                      <div className="absolute inset-0 bg-black/40 border border-white/10 rounded-[4rem] [clip-path:polygon(10%_0%,90%_0%,100%_100%,0%_100%)]"></div>
                      
                      {/* Central Heart Singularity */}
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center">
                          <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${isCritical ? 'bg-red-500' : isListening ? 'bg-amber-500' : 'bg-cyan-400'}`}></div>
                          <div className="w-4 h-4 bg-white rounded-full blur-sm opacity-80 animate-pulse"></div>
                      </div>

                      {/* Neural Ribs / Data Lines */}
                      <div className="absolute inset-x-8 top-1/2 bottom-8 flex flex-col gap-4 opacity-20">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                          ))}
                      </div>

                      {/* DYNAMIC IDENTITY TAG - CHEST PLATE */}
                      <div className="absolute top-8 right-4 px-3 py-2 border-l-2 border-cyan-400 bg-black/90 backdrop-blur-2xl rounded-sm shadow-[0_0_20px_rgba(0,242,255,0.2)] z-50 transform translate-z-30">
                         <div className="text-[8px] font-black text-white uppercase tracking-[0.25em] leading-none mb-1.5 drop-shadow-[0_0_5px_rgba(0,242,255,0.5)]">AJA_V2.0</div>
                         <div className="flex gap-1 h-1">
                            <div className={`flex-1 rounded-full ${isSpeaking ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.8)] animate-pulse' : 'bg-slate-800'}`}></div>
                            <div className={`flex-1 rounded-full ${isListening ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse' : 'bg-slate-800'}`}></div>
                         </div>
                      </div>
                  </div>

                  {/* ARMS (Upper) */}
                  <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[280px] h-32 flex justify-between pointer-events-none">
                      <div className="w-10 h-40 bg-black/30 border border-white/5 rounded-full rotate-[15deg] origin-top"></div>
                      <div className="w-10 h-40 bg-black/30 border border-white/5 rounded-full -rotate-[15deg] origin-top"></div>
                  </div>

                  {/* Neural Search Ring (Active during discovery) */}
                  {isSearching && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[1px] border-amber-500/60 rounded-full animate-ping opacity-40"></div>
                  )}
              </div>

              {/* Volumetric Aura */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle at center, ${baseColor} 0%, transparent 70%)`,
                  transform: 'translateZ(-20px)'
                }}
              />

              {/* Floating Data Particles */}
              <div className="absolute inset-0 opacity-60">
                 {[...Array(30)].map((_, i) => (
                   <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-float-neural"
                        style={{ 
                          top: `${20 + Math.random() * 60}%`, 
                          left: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          animationDuration: `${3 + Math.random() * 4}s`
                        }}></div>
                 ))}
              </div>
           </div>

           {/* Voice Visualization Field (Visible when speaking) */}
           {isSpeaking && (
             <div className="absolute top-[35%] w-[400px] h-[400px] pointer-events-none preserve-3d"
                  style={{ transform: `translateZ(100px) rotateX(70deg)` }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="absolute inset-0 border-[2px] border-cyan-500/40 rounded-full animate-ripple"
                       style={{ animationDelay: `${i * 0.5}s` }}></div>
                ))}
             </div>
           )}


        </div>

        {/* Ambient Floating Data Points */}
        <div className="absolute inset-0 pointer-events-none preserve-3d z-[100]">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float-v5"
                  style={{ 
                    top: `${15 + i * 12}%`, 
                    left: `${20 + (i % 4) * 20}%`,
                    animationDelay: `${i * 0.4}s`,
                    transform: `translateZ(${40 + i * 30}px)` 
                  }}></div>
           ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-3000 { perspective: 3000px; }
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes scan-v4 {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 1; border-width: 4px; }
          100% { transform: scale(1.5); opacity: 0; border-width: 1px; }
        }
        @keyframes float-v5 {
          0%, 100% { transform: translateY(0) translateZ(40px); opacity: 0.1; }
          50% { transform: translateY(-40px) translateZ(80px); opacity: 0.6; }
        }
        @keyframes float-neural {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(10px, -20px); opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        .animate-float-neural { animation: float-neural linear infinite; }
      `}} />
    </div>
  );
};

export default AjaAvatar;
