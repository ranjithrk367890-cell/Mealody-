import { useState } from 'react';
import api from '../utils/api';
import { ThumbsUp, ThumbsDown, Sparkles, Leaf, Music2, Film } from 'lucide-react';
import { motion } from 'framer-motion';

export interface RecommendationCardProps {
  id: number | string;
  type: 'food' | 'music';
  title: string;
  subtitle: string;
  image: string;
  description?: string;
  matchReason?: string;
  benefit?: string;
  movieName?: string;
  popularity?: number;
  delay?: number;
  youtubeLink?: string;
  spotifyLink?: string;
}

const FoodCard = ({ id, title, subtitle, image, description, matchReason, benefit, popularity, delay = 0 }: RecommendationCardProps) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = async (action: 'like' | 'dislike') => {
    setFeedback(action);
    try {
      const storedUser = localStorage.getItem('mealody_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const currentUserId = parsedUser?.id || '00000000-0000-0000-0000-000000000000';

      await api.post(`/api/feedback/food`, {
        userId: currentUserId,
        foodId: id,
        action,
        foodObj: { id, food_name: title, image, category: subtitle }
      });
    } catch (err) {
      setFeedback(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 group hover:border-orange-400/30 transition-all duration-500 flex flex-col shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Food Image */}
      <div className="relative h-80 w-full overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent" />
        <div className="absolute top-6 left-6">
          <span className="bg-black/60 backdrop-blur-xl text-orange-400 text-xs font-black px-4 py-2 rounded-full border border-orange-500/30 shadow-2xl tracking-tighter uppercase">
            {subtitle}
          </span>
        </div>
        {popularity && (
          <div className="absolute top-6 right-6">
            <span className="bg-yellow-500/20 backdrop-blur-xl text-yellow-400 text-xs font-black px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-1 shadow-2xl">
              ⭐ Pop Score: {popularity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow -mt-16 relative z-10">
        <h4 className="text-3xl font-black text-theme-heading mb-4 leading-tight tracking-tight">{title}</h4>

        {description && (
          <p className="text-base text-theme-desc mb-6 leading-relaxed line-clamp-3 font-medium">{description}</p>
        )}

        <div className="flex-grow space-y-6">
          {/* Why this food? */}
          {matchReason && (
            <div className="rounded-3xl overflow-hidden border border-purple-500/15 bg-purple-500/[0.03] backdrop-blur-sm">
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="p-2 rounded-full bg-purple-500/20 text-purple-500 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-500/70 uppercase tracking-[0.2em] mb-1 block">The Match Reason</span>
                  <p className="text-sm text-theme-desc leading-relaxed font-semibold italic">"{matchReason}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Expected benefit */}
          {benefit && (
            <div className="rounded-3xl overflow-hidden border border-green-500/15 bg-green-500/[0.03] backdrop-blur-sm">
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-500/20 text-green-600 shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-green-500/70 uppercase tracking-[0.2em] mb-1 block">Expected Benefit</span>
                  <p className="text-sm text-theme-desc leading-relaxed font-bold">{benefit}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => handleFeedback('like')}
            className={`flex-1 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest
              ${feedback === 'like' ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-white/10 text-text-muted hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/10'}`}
          >
            <ThumbsUp className="w-4 h-4" /> Love
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={`flex-1 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest
              ${feedback === 'dislike' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 text-text-muted hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            <ThumbsDown className="w-4 h-4" /> Pass
          </button>
        </div>

        {/* 🛍️ Order Now — Swiggy & Zomato */}
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.2em] text-center mb-3">Order Now</p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                const q = encodeURIComponent(title.trim());
                window.open(`https://www.swiggy.com/search?query=${q}`, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #FC8019 0%, #e07012 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(252,128,25,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
            >
              🛵 Order on Swiggy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                const q = encodeURIComponent(title.trim());
                window.open(`https://www.zomato.com/search?q=${q}`, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #E23744 0%, #c42d3a 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(226,55,68,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
            >
              🍽️ Order on Zomato
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MusicCard = ({ id, title, subtitle, image, matchReason, movieName, youtubeLink, spotifyLink, delay = 0 }: RecommendationCardProps) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = async (action: 'like' | 'dislike') => {
    setFeedback(action);
    try {
      const storedUser = localStorage.getItem('mealody_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const currentUserId = parsedUser?.id || '00000000-0000-0000-0000-000000000000';

      await api.post(`/api/feedback/music`, {
        userId: currentUserId,
        songId: id,
        action,
        songObj: { id, song_name: title, artist: subtitle, image }
      });
    } catch (err) {
      setFeedback(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 group hover:border-cyan/30 transition-all duration-500 flex flex-col shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Music Image */}
      <div className="relative h-64 w-full overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent" />
        {movieName && (
          <div className="absolute top-6 left-6">
            <span className="bg-black/60 backdrop-blur-xl text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 uppercase tracking-tighter">
              <Film className="w-3 h-3" /> {movieName}
            </span>
          </div>
        )}
        {/* Music note overlay */}
        <div className="absolute bottom-6 right-6 w-12 h-12 bg-cyan/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-cyan/30 shadow-2xl">
          <Music2 className="w-6 h-6 text-cyan" />
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow -mt-12 relative z-10">
        <h4 className="text-3xl font-black text-theme-heading mb-1 leading-tight tracking-tight">🎵 {title}</h4>
        <p className="text-xs font-black text-cyan uppercase tracking-[0.2em] mb-4">👤 {subtitle}</p>

        {/* Play Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 w-full">
          {youtubeLink && youtubeLink.trim() !== '' && youtubeLink !== 'https://youtube.com/watch' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(youtubeLink, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 min-w-[130px] py-3 rounded-2xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/30 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              ▶ Watch on YouTube
            </motion.button>
          )}

          {spotifyLink && spotifyLink.trim() !== '' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(spotifyLink, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 min-w-[130px] py-3 rounded-2xl bg-[#1DB954]/95 hover:bg-[#1DB954] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#1DB954]/40 transition-all shadow-[0_0_15px_rgba(29,185,84,0.3)]"
            >
              🎧 Listen on Spotify
            </motion.button>
          )}
        </div>

        <div className="flex-grow">
          {matchReason && (
            <div className="rounded-3xl overflow-hidden border border-cyan/15 bg-cyan/[0.03] backdrop-blur-sm">
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="p-2 rounded-full bg-cyan/20 text-cyan shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-cyan/70 uppercase tracking-[0.2em] mb-1 block">Why this vibe?</span>
                  <p className="text-sm text-theme-desc leading-relaxed font-bold italic">"{matchReason}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => handleFeedback('like')}
            className={`flex-1 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest
              ${feedback === 'like' ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-white/10 text-text-muted hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/10'}`}
          >
            <ThumbsUp className="w-4 h-4" /> Liked
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={`flex-1 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest
              ${feedback === 'dislike' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 text-text-muted hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            <ThumbsDown className="w-4 h-4" /> Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const RecommendationCard = (props: RecommendationCardProps) => {
  // Before rendering each card, log its details for strict audit validation
  console.log({
    id: props.id,
    food_name: props.title,
    image: props.image,
    category: props.subtitle
  });

  if (props.type === 'food') return <FoodCard {...props} />;
  return <MusicCard {...props} />;
};

export default RecommendationCard;
