import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Procedural 3D Mascot Mesh inside the Canvas
const Mascot3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Keep track of target mouse positions for slight attraction
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1]
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle horizontal floating and bobbing
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.15;
      groupRef.current.position.x = Math.cos(t * 0.8) * 0.08;

      // Mouse attraction: gently rotate the mascot to look at the cursor
      const targetRotY = mouse.current.x * 0.45;
      const targetRotX = -mouse.current.y * 0.3;
      
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.08;
    }

    if (ringRef.current) {
      // Outer orbits spinning in opposite direction
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.rotation.x = t * 0.2;
    }

    // Interactive blinking eyes logic (semi-randomized)
    const blink = Math.sin(t * 3) > 0.98 ? 0.1 : 1.0;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y += (blink - leftEyeRef.current.scale.y) * 0.3;
      rightEyeRef.current.scale.y += (blink - rightEyeRef.current.scale.y) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Orbit Torus Ring - Soft glassmorphic light element */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.04, 16, 100]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Futuristic Satellites rotating within the orbit */}
      <mesh position={[1.5, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial color="#ff3b9a" emissive="#ff3b9a" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-1.5, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhysicalMaterial color="#aa3bff" emissive="#aa3bff" emissiveIntensity={1.5} />
      </mesh>

      {/* Main Companion Body Sphere - Sleek, dynamic reflective liquid chrome */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.0, 64, 64]} />
        <MeshDistortMaterial
          color="#16171d"
          roughness={0.05}
          metalness={0.95}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          distort={0.15}
          speed={2.2}
        />
      </mesh>

      {/* Futuristic Emissive Glass Visor */}
      <mesh position={[0, 0.05, 0.72]}>
        <boxGeometry args={[1.1, 0.3, 0.4]} />
        <meshPhysicalMaterial
          color="#08060d"
          roughness={0.02}
          metalness={0.8}
          clearcoat={1.0}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Glowing Android Eyes inside the visor */}
      <mesh ref={leftEyeRef} position={[-0.32, 0.05, 0.92]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2.5}
          roughness={0}
        />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.32, 0.05, 0.92]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2.5}
          roughness={0}
        />
      </mesh>

      {/* Outer Halo Glow Accent Ring */}
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 32]} />
        <meshPhysicalMaterial
          color="#aa3bff"
          emissive="#aa3bff"
          emissiveIntensity={2.0}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Main Export Component with high-fidelity Interactive SVG Fallback
const AIMascot: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Detect WebGL capabilities
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setHasWebGL(supported);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] relative select-none flex items-center justify-center">
      {/* Soft Background Radial Aura Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-cyan/5 to-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-3000" />
      <div className="absolute w-[80%] h-[80%] bg-radial from-primary/5 via-cyan/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 45 }}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          gl={{ antialias: true, alpha: true }}
          onError={() => setHasWebGL(false)}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[-5, 5, 2]} intensity={1.0} color="#aa3bff" />
          <directionalLight position={[5, -5, 2]} intensity={0.8} color="#00f0ff" />
          <Mascot3D />
        </Canvas>
      ) : (
        /* Highly premium vector SVG glassmorphic mascot fallback for mobile/non-WebGL environments */
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-full h-full flex items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 200 200"
            className="w-[80%] h-[80%] drop-shadow-[0_20px_50px_rgba(170,59,255,0.25)]"
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Outer Pulsing Glow Rings */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="url(#cyan-glow-gradient)" strokeWidth="1.5" strokeDasharray="6,4" className="origin-center animate-[spin_50s_linear_infinite]" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="url(#purple-glow-gradient)" strokeWidth="1" />

            {/* Orbiting Satellites */}
            <circle cx="170" cy="100" r="4.5" fill="#ff3b9a" className="animate-pulse" />
            <circle cx="30" cy="100" r="4.5" fill="#00f0ff" className="animate-pulse" />

            {/* Head Floating Halo */}
            <ellipse cx="100" cy="45" rx="20" ry="3" fill="none" stroke="#aa3bff" strokeWidth="1.5" className="animate-pulse" />

            {/* Main Cybernetic Metal Body */}
            <circle cx="100" cy="100" r="45" fill="url(#body-gradient)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

            {/* Glassmorphic Visor Faceplate */}
            <rect x="70" y="85" width="60" height="22" rx="11" fill="rgba(8, 6, 13, 0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Friendly Android Glowing Blue Eyes */}
            <ellipse cx="88" cy="96" rx="4" ry="4" fill="#00f0ff" className="animate-pulse" />
            <ellipse cx="112" cy="96" rx="4" ry="4" fill="#00f0ff" className="animate-pulse" />

            {/* Subtle Reflection Glare */}
            <path d="M 68 85 A 45 45 0 0 1 132 85" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="3" />

            {/* Gradients Definitions */}
            <defs>
              <linearGradient id="body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b29" />
                <stop offset="60%" stopColor="#0f0d16" />
                <stop offset="100%" stopColor="#06050a" />
              </linearGradient>
              <linearGradient id="cyan-glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="purple-glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#aa3bff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ff3b9a" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </motion.svg>
        </motion.div>
      )}
    </div>
  );
};

export default AIMascot;
