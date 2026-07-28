import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import SongCard from '../components/SongCard';

const trendingFoods = [
  { foodName: 'Chettinad Biriyani', category: 'Spicy Dinner', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800', spiceLevel: 3 },
  { foodName: 'Filter Coffee', category: 'Beverage', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800', spiceLevel: 0 },
  { foodName: 'Masala Dosa', category: 'Breakfast', image: 'https://media.istockphoto.com/id/1156896023/photo/cheese-masala-dosa-recipe-with-sambar-and-chutney-selective-focus.jpg?s=612x612&w=0&k=20&c=ddWTTzN52tHM_jqSRj35G9WYoas2Da3HLwzOxaQ0WFY=', spiceLevel: 1 },
];

const trendingSongs = [
  { songName: 'Ennavale Adi Ennavale', movieName: 'Kadhalan', mood: 'Romantic', image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800' },
  { songName: 'Naa Ready', movieName: 'Leo', mood: 'Energetic', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800' },
];

const sliderImages = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200',
  'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=1200',
  'https://images.unsplash.com/photo-1460055106296-85ddb190f898?q=80&w=1200',
];

interface FoodParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  targetX: number;
  targetY: number;
  duration: number;
}

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<FoodParticle[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const spawnParticles = (e: React.MouseEvent, type: 'biriyani' | 'coffee' | 'dosa' | 'jigarthanda') => {
    const startX = e.clientX;
    const startY = e.clientY;

    const emojis = {
      biriyani: ['🍛', '🌶️', '🔥', '🧅', '🍗'],
      coffee: ['☕', '🥛', '🍩', '💨', '✨'],
      dosa: ['🫓', '🧈', '🥥', '🍃', '🧅'],
      jigarthanda: ['🍨', '🍦', '🍒', '🥛', '🍧']
    }[type];

    const newParticles = Array.from({ length: 15 }).map((_, idx) => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 220 + 80;
      
      return {
        id: Date.now() + Math.random() * 1000 + idx,
        emoji: randomEmoji,
        x: startX,
        y: startY,
        rotate: Math.random() * 1080 - 540,
        scale: Math.random() * 0.6 + 0.6,
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance - (type === 'coffee' ? 120 : 30),
        duration: Math.random() * 1.0 + 0.7
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 35 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen pt-24 overflow-hidden">
      {/* Interactive Floating Particles Emitter overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, scale: 0, rotate: 0, opacity: 1 }}
              animate={{ 
                x: p.x + p.targetX, 
                y: p.y + p.targetY, 
                scale: p.scale, 
                rotate: p.rotate,
                opacity: [1, 1, 0] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: 'easeOut' }}
              onAnimationComplete={() => {
                setParticles(prev => prev.filter(item => item.id !== p.id));
              }}
              className="absolute text-4xl select-none"
              style={{ left: -16, top: -16 }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Liquid background follow effect - Enhanced with ultra-low premium opacities and larger blur radius */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 transform-gpu"
        style={{
          background: `radial-gradient(850px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(170, 59, 255, 0.08), rgba(0, 240, 255, 0.03) 35%, transparent 70%)`
        }}
      />

      {/* Futuristic Floating Interactive Nodes Background - Restored, optimized for 60fps & smoother multi-layered floating motion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {[...Array(20)].map((_, i) => {
          // Semi-randomized values that stay constant for each index
          const size = 80 + (i * 12) % 110;
          const initialX = (i * 7) % 100;
          const initialY = (i * 11) % 85 + 10;
          const scale = 0.35 + (i * 0.03) % 0.45;
          const duration = 22 + (i * 3) % 18;
          const delay = (i * 1.5) % 8;
          const xMovement = 50 + (i * 15) % 80;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-tr from-white/[0.04] to-white/0 border border-white/[0.06] backdrop-blur-3xl shadow-[inset_0_4px_12px_rgba(255,255,255,0.02)] transform-gpu"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${initialX}%`,
                top: `${initialY}%`,
              }}
              initial={{
                scale: scale,
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 0
              }}
              animate={{
                y: [0, -180, 0],
                x: [0, i % 2 === 0 ? xMovement : -xMovement, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.85, 0.85, 0]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut'
              }}
            />
          );
        })}
      </div>

      {/* Main Hero Content */}
      <motion.div
        style={{ y, opacity }}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 container mx-auto px-6 h-[88vh] flex flex-col justify-center items-center text-center"
      >
        <motion.div variants={fadeInUp} className="mb-4 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Mealody AI Official Logo" 
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-2xl shadow-primary/40 border-2 border-white/20 hover:scale-105 transition-transform" 
          />
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-none"
        >
          Discover Your Perfect <br />
          <span className="text-gradient font-extrabold">Mood Match</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Get personalized food and music recommendations powered by Artificial Intelligence.
        </motion.p>

        {/* Premium Image Slider */}
        <motion.div
          variants={fadeInUp}
          className="relative w-full max-w-7xl h-[65vh] md:h-[85vh] rounded-3xl overflow-hidden mb-10 shadow-[0_0_40px_rgba(170,59,255,0.2)] group"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={sliderImages[currentSlide]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Hero Slider"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
          
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Animated Scroll Cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-main/35 flex flex-col items-center gap-1 cursor-pointer hover:text-text-main/60 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 text-cyan" />
        </motion.div>
      </motion.div>

      {/* Trending Section */}
      <div className="relative z-10 container mx-auto px-6 py-28 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Trending <span className="text-gradient font-extrabold">Right Now</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">The most-loved selections recommended by our AI to matches current local seasons.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {trendingFoods.map((food, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring' as const }}
              className="lg:col-span-1"
            >
              <FoodCard {...food} />
            </motion.div>
          ))}
          {trendingSongs.map((song, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 3) * 0.1, type: 'spring' as const }}
              className="lg:col-span-1"
            >
              <SongCard {...song} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 container mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            How <span className="text-gradient font-extrabold">Mealody AI</span> Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Share Your Vibe', desc: 'Describe how you feel, speak into the mic, or click suggestion chips.', icon: '🎭' },
            { step: '02', title: 'AI sentiment mapping', desc: 'Mealody AI analyzes sentiment context, matches seasonal time-weather variables.', icon: '🧠' },
            { step: '03', title: 'Feast & Listen', desc: 'Instantly view Tamil soundtracks paired with premium Indian dishes.', icon: '✨' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: 'spring' as const }}
              whileHover={{ y: -8, border: '1px solid rgba(0,240,255,0.3)', boxShadow: '0 10px 30px rgba(0,240,255,0.05)' }}
              className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-300 border-white/5 cursor-default"
            >
              <div className="absolute top-4 right-4 text-5xl font-extrabold text-text-main/5 font-heading select-none">{item.step}</div>
              <div className="text-5xl mb-5">{item.icon}</div>
              <h3 className="text-xl font-bold text-text-main mb-2">{item.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-cyan opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Funny Interactive Masala Food Playground Room */}
      <div className="relative z-10 container mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card max-w-4xl mx-auto p-8 rounded-[2.5rem] border border-primary/20 bg-gradient-to-r from-bg-card via-primary/5 to-cyan/5 text-center relative overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.07)]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-cyan/10 text-cyan border border-cyan/25 mb-4 tracking-wider uppercase animate-pulse">
              🌶️ South India Playroom
            </span>
            <h2 className="text-3xl font-extrabold text-text-main mb-2 font-heading">
              Interactive <span className="text-gradient">Masala Playground</span>
            </h2>
            <p className="text-text-muted text-sm max-w-xl mx-auto mb-8 leading-relaxed">
              *Warning: Extremely Addictive!* Tap any of the South Indian culinary icons below to trigger a hilarious food blast across your screen!
            </p>

            {/* Funny wiggling food buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Biriyani Blast 🍛', type: 'biriyani', color: 'from-orange-500/25 to-red-500/25 border-orange-500/40 text-orange-400' },
                { label: 'Coffee Splash ☕', type: 'coffee', color: 'from-amber-600/25 to-yellow-600/25 border-amber-600/40 text-amber-300' },
                { label: 'Dosa Frisbee 🫓', type: 'dosa', color: 'from-yellow-500/25 to-amber-500/25 border-yellow-500/40 text-yellow-400' },
                { label: 'Jigarthanda Melt 🍨', type: 'jigarthanda', color: 'from-pink-500/25 to-purple-500/25 border-pink-500/40 text-pink-400' }
              ].map((btn) => (
                <motion.button
                  key={btn.type}
                  onClick={(e) => spawnParticles(e, btn.type as any)}
                  whileHover={{ scale: 1.08, rotate: [0, -3, 3, -3, 0] }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring' as const, stiffness: 200 }}
                  className={`px-6 py-4 rounded-2xl bg-gradient-to-r ${btn.color} border font-bold text-sm shadow-md transition-shadow duration-300 hover:shadow-lg`}
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
