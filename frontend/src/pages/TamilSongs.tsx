import { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import SongCard from '../components/SongCard';
import ResponsiveCardGrid from '../components/ResponsiveCardGrid';
import { Music, AlertCircle, RefreshCw } from 'lucide-react';
import { getValidatedImage } from '../utils/imageValidation';

interface Song {
  id: number;
  song_name: string;
  artist?: string;
  movie_name?: string;
  hero?: string;
  music_director?: string;
  mood: string;
  mood_tags?: string[];
  image: string;
  youtube_link?: string;
  spotify_link?: string;
}

const moodFilters = [
  'All', 'happy', 'sad', 'energetic', 'romantic', 'relaxed', 'love', 'excited', 'stressed', 'lonely', 'angry', 'motivated', 'tired'
];

const moodMeta: Record<string, { emoji: string; label: string; gradient: string; glow: string; border: string }> = {
  love: {
    emoji: '❤️',
    label: 'Romantic Vibes',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]',
    border: 'border-pink-500/30',
  },
  excited: {
    emoji: '🤩',
    label: 'High Energy',
    gradient: 'from-yellow-500/20 via-orange-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    border: 'border-yellow-500/30',
  },
  sad: {
    emoji: '😔',
    label: 'Melancholic Melodies',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    border: 'border-blue-500/30',
  },
  happy: {
    emoji: '😊',
    label: 'Happy Anthems',
    gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.2)]',
    border: 'border-green-500/30',
  },
  relaxed: {
    emoji: '😌',
    label: 'Chill & Relaxed',
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]',
    border: 'border-cyan-500/30',
  },
  stressed: {
    emoji: '😰',
    label: 'Stress Relief',
    gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    border: 'border-purple-500/30',
  },
  lonely: {
    emoji: '🥺',
    label: 'Lonely Nights',
    gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(99,102,241,0.2)]',
    border: 'border-indigo-500/30',
  },
  angry: {
    emoji: '😡',
    label: 'Rage Mode',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    border: 'border-red-500/30',
  },
  motivated: {
    emoji: '💪',
    label: 'Motivated Beats',
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]',
    border: 'border-orange-500/30',
  },
  tired: {
    emoji: '😴',
    label: 'Soft Lullabies',
    gradient: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.2)]',
    border: 'border-slate-500/30',
  },
  energetic: {
    emoji: '⚡',
    label: 'Kuthu Beats',
    gradient: 'from-yellow-500/20 via-red-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.25)]',
    border: 'border-yellow-500/30',
  },
  romantic: {
    emoji: '💖',
    label: 'Love Melodies',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]',
    border: 'border-pink-500/30',
  },
};

const TamilSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchSongs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/songs');
      setSongs(response.data);
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      setError(err.userMessage || 'Could not fetch songs from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSongs(); }, []);

  const getFilterText = (filter: string) => {
    const count = songs.filter(s =>
      filter === 'All' ? true : (
        s.mood === filter ||
        (Array.isArray(s.mood_tags) && s.mood_tags.includes(filter))
      )
    ).length;

    if (filter === 'All') {
      return `All 🎵 ${count} songs`;
    }
    const emoji = moodMeta[filter]?.emoji || '';
    const capitalizedMood = filter.charAt(0).toUpperCase() + filter.slice(1);
    return `${capitalizedMood} ${emoji}${count} songs`;
  };

  // When 'All' → flat list of all songs split into category sections
  // When specific mood → grouped section
  const isAllMode = activeFilter === 'All';

  const allSongsFlat = songs; // all songs, no filter

  const groupedSongs = (() => {
    const moods = ['happy', 'sad', 'love', 'relaxed', 'stressed', 'angry', 'excited', 'lonely', 'motivated', 'tired'];
    if (!isAllMode) {
      return [
        {
          mood: activeFilter,
          songs: songs.filter(s =>
            s.mood === activeFilter ||
            (Array.isArray(s.mood_tags) && s.mood_tags.includes(activeFilter))
          ),
        }
      ].filter(g => g.songs.length > 0);
    }
    return moods.map(mood => ({
      mood: mood,
      songs: songs.filter(s =>
        s.mood === mood ||
        (Array.isArray(s.mood_tags) && s.mood_tags.includes(mood))
      ),
    })).filter(g => g.songs.length > 0);
  })();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto relative">
      {/* Dynamic Background Blur */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 100 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/25 text-secondary px-4 py-2 rounded-full mb-6 text-sm cursor-pointer shadow-[0_0_15px_rgba(255,59,154,0.15)]"
        >
          <Music className="w-4 h-4 animate-bounce" />
          Tamil Cinema Beats
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Cinematic <span className="text-gradient font-extrabold">Tamil Beats</span>
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
          Immerse yourself in our collection of Tamil movie tracks, perfectly curated to elevate your current mood.
        </p>
      </motion.div>

      {/* Mood Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring' as const }}
        className="flex flex-wrap justify-center gap-3 mb-16 relative z-10"
      >
        {moodFilters.map((filter) => (
          <motion.button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-300 border ${
              activeFilter === filter
                ? 'bg-secondary/20 border-secondary/50 text-text-main shadow-[0_0_20px_rgba(255,59,154,0.3)]'
                : 'bg-text-main/5 border-text-main/10 text-text-muted hover:border-text-main/20 hover:text-text-main'
            }`}
          >
            {getFilterText(filter)}
          </motion.button>
        ))}
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center h-64 relative z-10">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-64 gap-4 text-center relative z-10"
        >
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 max-w-md">{error}</p>
          <button
            onClick={fetchSongs}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-text-main/10 hover:bg-text-main/20 border border-text-main/20 text-sm text-text-main transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </motion.div>
      )}

      {!loading && !error && (
        <div className="relative z-10 space-y-16">
          <AnimatePresence mode="popLayout">

            {/* Header when All is selected */}
            {isAllMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4"
              >
                <span className="text-2xl">🎵</span>
                <div>
                  <h2 className="text-2xl font-extrabold text-text-main">All Tamil Songs</h2>
                  <p className="text-xs text-text-muted mt-0.5">{allSongsFlat.length} tracks organized by mood categories</p>
                </div>
              </motion.div>
            )}

            {groupedSongs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-text-muted py-24"
              >
                <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">No songs found in the database.</p>
              </motion.div>
            ) : (
              groupedSongs.map((group, groupIndex) => {
                const meta = moodMeta[group.mood] || { emoji: '🎵', label: group.mood, gradient: 'from-primary/10 to-transparent', glow: '', border: 'border-primary/20' };
                const capitalizedMood = group.mood.charAt(0).toUpperCase() + group.mood.slice(1);
                
                return (
                  <motion.section
                    key={group.mood}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring' as const, stiffness: 80, delay: groupIndex * 0.08 }}
                    className="space-y-6"
                  >
                    {/* Section Header with exact format specified by user */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${meta.gradient} border ${meta.border} ${meta.glow} backdrop-blur-sm`}>
                      <div>
                        <h2 className="text-2xl font-black text-text-main capitalize flex items-center gap-2">
                          {capitalizedMood} {meta.emoji}{group.songs.length} songs
                        </h2>
                      </div>
                      <div className="ml-auto h-px flex-1 bg-white/10" />
                    </div>

                    {/* Songs Grid */}
                    <ResponsiveCardGrid itemCount={group.songs.length}>
                      {group.songs.map((song, index) => (
                        <motion.div
                          key={song.id}
                          layout
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            type: 'spring' as const,
                            stiffness: 90,
                            damping: 15,
                            delay: index * 0.04,
                          }}
                          className="h-full flex"
                        >
                          <div className="w-full h-full flex flex-col items-stretch">
                            <SongCard
                              songName={song.song_name}
                              movieName={song.movie_name || ''}
                              artist={song.artist}
                              mood={song.mood || group.mood}
                              image={getValidatedImage('music', song.image)}
                              youtubeLink={song.youtube_link}
                              spotifyLink={song.spotify_link}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </ResponsiveCardGrid>
                  </motion.section>
                );
              })
            )}

          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default TamilSongs;
