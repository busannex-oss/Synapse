
import React, { useRef, useMemo, Suspense } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial, PerspectiveCamera, Environment, ContactShadows, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface AjaAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isCritical: boolean;
  isSearching?: boolean;
  isProcessing?: boolean;
  onClick: () => void;
}

const ParticleField: React.FC<{ color: string; count?: number }> = ({ color, count = 200 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 4;
      p[i * 3 + 1] = (Math.random() - 0.5) * 4;
      p[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color={color}
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const HumanoidModel: React.FC<{ isSpeaking: boolean; isListening: boolean; color: string }> = ({ isSpeaking, isListening, color }) => {
  const headRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Group>(null);
  const outerHaloRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Head movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      headRef.current.position.y = Math.sin(t * 2) * 0.05 + 1.2;
      if (isSpeaking) {
        headRef.current.position.y += Math.sin(t * 15) * 0.02;
      }
    }

    // Core pulse
    if (coreRef.current) {
      const pulse = isSpeaking ? Math.sin(t * 15) * 0.2 + 1.2 : Math.sin(t * 2) * 0.1 + 1;
      coreRef.current.scale.set(pulse, pulse, pulse);
      coreRef.current.rotation.y = t * 2;
    }

    // Arm movement
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.z = Math.sin(t * 1) * 0.1 - 0.2;
      rightArmRef.current.rotation.z = -Math.sin(t * 1) * 0.1 + 0.2;
      
      if (isSpeaking) {
        leftArmRef.current.rotation.x = Math.sin(t * 10) * 0.2;
        rightArmRef.current.rotation.x = -Math.sin(t * 10) * 0.2;
      }
    }

    // Halo movement
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.5;
    }
    if (outerHaloRef.current) {
      outerHaloRef.current.rotation.x = t * 0.3;
      outerHaloRef.current.rotation.y = t * 0.2;
    }
  });

  const statusColor = new THREE.Color(color);

  return (
    <group>
      {/* Head */}
      <group ref={headRef}>
        <Sphere args={[0.3, 32, 32]}>
          <MeshDistortMaterial
            color="white"
            emissive={statusColor}
            emissiveIntensity={isSpeaking ? 2.5 : 0.8}
            distort={isSpeaking ? 0.45 : 0.25}
            speed={isSpeaking ? 5 : 2}
            roughness={0}
            metalness={1}
          />
        </Sphere>
        {/* Eyes/Sensors */}
        <mesh position={[-0.12, 0.05, 0.25]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={color} />
          <pointLight color={color} intensity={2} distance={1} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.25]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={color} />
          <pointLight color={color} intensity={2} distance={1} />
        </mesh>
        {/* Neural Halo */}
        <group ref={haloRef} position={[0, 0, -0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.008, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.48, 0.004, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
        </group>
      </group>

      {/* Torso */}
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.25, 0.8, 4, 16]} />
        <MeshDistortMaterial
          color="white"
          emissive={statusColor}
          emissiveIntensity={0.3}
          distort={0.15}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Neural Core */}
      <mesh ref={coreRef} position={[0, 0.5, 0.2]}>
        <icosahedronGeometry args={[0.1, 1]} />
        <meshBasicMaterial color="white" wireframe />
        <pointLight color={color} intensity={isSpeaking ? 8 : 3} distance={3} />
      </mesh>

      {/* Outer Orbital Halo */}
      <group ref={outerHaloRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.2, 0.003, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.4, 0.7, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
        <meshStandardMaterial color="white" emissive={statusColor} emissiveIntensity={0.15} transparent opacity={0.7} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.4, 0.7, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
        <meshStandardMaterial color="white" emissive={statusColor} emissiveIntensity={0.15} transparent opacity={0.7} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 0.8, 4, 8]} />
        <meshStandardMaterial color="white" emissive={statusColor} emissiveIntensity={0.15} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 0.8, 4, 8]} />
        <meshStandardMaterial color="white" emissive={statusColor} emissiveIntensity={0.15} transparent opacity={0.7} />
      </mesh>

      {/* Particle Field */}
      <ParticleField color={color} count={300} />
    </group>
  );
};

/**
 * AJA_DESIGN_PHILOSOPHY:
 * Aja's only design is high-quality, sophisticated, Humanoid 3D.
 * This design is a core part of the SYNAPSE high-tech aesthetic and must never change, only improve.
 */
const AjaAvatar: React.FC<AjaAvatarProps> = React.memo(({ isListening, isSpeaking, isCritical, isSearching, isProcessing, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  const activeState = isCritical ? 'critical' : isSpeaking ? 'speaking' : isListening ? 'listening' : (isSearching || isProcessing) ? 'processing' : 'idle';

  const statusColor = useMemo(() => {
    if (isCritical) return '#ef4444'; // red-500
    if (isSpeaking) return '#06b6d4'; // cyan-500
    if (isListening) return '#a855f7'; // purple-500
    if (isSearching || isProcessing) return '#f59e0b'; // amber-500
    return '#06b6d4'; // default cyan
  }, [isSpeaking, isListening, isCritical, isSearching, isProcessing]);

  return (
    <motion.div 
      ref={containerRef}
      onClick={onClick}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-48 h-64 md:w-64 md:h-80 cursor-grab active:cursor-grabbing z-[999] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: activeState !== 'idle' ? (isSpeaking ? [1, 1.4, 1] : [1, 1.2, 1]) : 1,
          opacity: activeState !== 'idle' ? (isSpeaking ? [0.4, 0.7, 0.4] : [0.2, 0.4, 0.2]) : 0.1,
        }}
        transition={{ duration: isSpeaking ? 0.3 : 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-[80px] transition-colors duration-500"
        style={{ backgroundColor: `${statusColor}44` }}
      />

      {/* Neural Pulse Ring */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 border-2 rounded-full z-0"
            style={{ borderColor: statusColor }}
          />
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div className="relative z-10 w-full h-full">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={50} scale={4} size={2} speed={0.4} color={statusColor} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <HumanoidModel isSpeaking={isSpeaking} isListening={isListening} color={statusColor} />
            </Float>
            <Environment preset="city" />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          </Suspense>
        </Canvas>
      </div>

      {/* Status Indicators */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Neural_Sales_Mode</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default AjaAvatar;

