import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export interface WellnessItem {
  title: string;
  why: string;
  effect: string;
  bestTime: string;
  wellnessScore: number;
  image: string;
  moodBadge?: string;
  category?: string;
}

interface WellnessCardProps {
  item: WellnessItem;
  delay?: number;
}

const WellnessCard = ({ item, delay = 0 }: WellnessCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: 'spring' as const, stiffness: 90, damping: 16 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="glass-card overflow-hidden rounded-[2.5rem] border border-text-main/10 shadow-[0_0_45px_rgba(0,255,255,0.12)] bg-text-main/5 backdrop-blur-2xl"
    >
      <div className="relative h-72 overflow-hidden">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/95 via-bg-dark/40 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-4 py-2 text-xs text-text-main uppercase tracking-[0.24em] border border-text-main/10 backdrop-blur-md">
          {item.category || 'Wellness'}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-cyan/15 px-4 py-2 text-xs font-semibold text-cyan-100 border border-cyan/30 backdrop-blur-md">
          {item.wellnessScore}%
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan font-semibold mb-2">Wellness pick</p>
            <h3 className="text-2xl font-bold text-text-main leading-tight">{item.title}</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-text-main/10 bg-text-main/10 px-3 py-2 text-xs font-semibold text-text-main/90">
            <HeartPulse className="w-4 h-4 text-cyan" />
            {item.moodBadge || 'Balanced'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-text-main/5 border border-text-main/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">Emotional explanation</p>
            <p className="text-sm leading-6 text-text-main">{item.why}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-text-main/5 border border-text-main/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 mb-2">Mood effect</p>
              <p className="text-sm leading-6 text-text-main">{item.effect}</p>
            </div>
            <div className="rounded-3xl bg-text-main/5 border border-text-main/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 mb-2">Best time</p>
              <p className="text-sm leading-6 text-text-main">{item.bestTime}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WellnessCard;
