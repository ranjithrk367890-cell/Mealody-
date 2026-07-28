import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Tilt3DProps {
  children: React.ReactNode;
  maxTilt?: number; // default: 8
  scale?: number;   // default: 1.03
  className?: string;
  glareColor?: string; // e.g. "rgba(170, 59, 255, 0.15)" or similar
}

const Tilt3D: React.FC<Tilt3DProps> = ({
  children,
  maxTilt = 8,
  scale = 1.03,
  className = '',
  glareColor = 'rgba(255, 255, 255, 0.15)'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if coarse pointer (touch device) for smooth fallback
  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsMobile(mediaQuery.matches);
    
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Motion values for x/y mouse percentages relative to card bounds (-0.5 to 0.5)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth spring physics for fluid interaction (no lag)
  const springConfig = { damping: 25, stiffness: 220, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);
  
  // Glare tracking coordinates
  const glareX = useSpring(useTransform(x, [0, 1], ['0%', '100%']), springConfig);
  const glareY = useSpring(useTransform(y, [0, 1], ['0%', '100%']), springConfig);
  
  // Opacity of the glare effect: fades in on hover
  const glareOpacity = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates between 0 and 1
    x.set(mouseX / width);
    y.set(mouseY / height);
    
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    // Return gracefully to neutral position
    x.set(0.5);
    y.set(0.5);
    glareOpacity.set(0);
  };

  if (isMobile) {
    // Touch screen / Mobile gracefully bypasses tilt/glare to preserve performance
    return (
      <motion.div
        whileHover={{ scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`glass-card relative overflow-hidden transition-shadow duration-300 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale, z: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card relative overflow-hidden cursor-pointer transition-shadow duration-300 shadow-xl hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Dynamic 3D Glare Sheet */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle 180px at var(--glare-x, 50%) var(--glare-y, 50%), ${glareColor}, transparent 80%)`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 30,
          opacity: glareOpacity,
        }}
        className="absolute inset-0"
        animate={{
          // Apply raw CSS variable bindings for coordinates to support smooth CSS gradients
          // using framer motion to sync with springs
          '--glare-x': glareX.get(),
          '--glare-y': glareY.get(),
        } as any}
      />
      
      {/* Main card contents with preserved 3D child perspective */}
      <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default Tilt3D;
