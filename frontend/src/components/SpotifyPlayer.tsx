import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Music2, Disc } from 'lucide-react';
import { useState, useEffect } from 'react';

// Helper to extract Spotify Track ID from full URL
const getSpotifyTrackId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

interface SpotifyPlayerProps {
  track: {
    songName: string;
    movieName: string;
    spotifyLink?: string;
  } | null;
  onClose: () => void;
}

const SpotifyPlayer = ({ track, onClose }: SpotifyPlayerProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [trackId, setTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (track?.spotifyLink) {
      const id = getSpotifyTrackId(track.spotifyLink);
      setTrackId(id);
      setIsMinimized(false); // Auto-maximize when a new song is chosen!
    } else {
      setTrackId(null);
    }
  }, [track]);

  if (!track || !trackId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          width: isMinimized ? '280px' : '360px',
          height: isMinimized ? '80px' : '420px',
        }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 18 }}
        className="fixed bottom-6 right-6 z-50 glass-card rounded-3xl border border-primary/40 shadow-[0_0_40px_rgba(170,59,255,0.25)] overflow-hidden flex flex-col backdrop-blur-2xl transition-all duration-300"
      >
        {/* Glow Line Indicator */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-cyan" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-dark/60 border-b border-text-main/10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            {isMinimized ? (
              <Disc className="w-5 h-5 text-cyan animate-spin" style={{ animationDuration: '4s' }} />
            ) : (
              <Music2 className="w-5 h-5 text-secondary animate-pulse" />
            )}
            <span className="text-xs font-bold tracking-wider text-text-muted uppercase truncate">
              {isMinimized ? track.songName : 'Now Previewing'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Maximize" : "Minimize"}
              className="p-1.5 rounded-lg hover:bg-text-main/10 text-text-muted hover:text-text-main transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close Player"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isMinimized ? (
              <motion.div
                key="maximized"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col"
              >
                {/* Meta details */}
                <div className="mb-4 text-center shrink-0">
                  <h4 className="text-lg font-extrabold text-text-main truncate">{track.songName}</h4>
                  <p className="text-xs text-cyan truncate">{track.movieName}</p>
                </div>

                {/* Spotify Iframe Embed with Dark Custom styling */}
                <div className="flex-grow rounded-2xl overflow-hidden relative border border-text-main/10 bg-bg-dark/40 shadow-inner">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen={false}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Spotify Player: ${track.songName}`}
                    className="absolute inset-0 border-0"
                  />
                </div>

                {/* Micro-animating Audio Equalizer Bar */}
                <div className="flex justify-center items-end gap-1 h-6 mt-4 opacity-40">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '24px', '4px'] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.6 + Math.random() * 0.4, 
                        ease: 'easeInOut', 
                        delay: i * 0.08 
                      }}
                      className="w-1 bg-gradient-to-t from-primary to-cyan rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="minimized"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setIsMinimized(false)}
                className="w-full h-full flex items-center justify-between cursor-pointer group"
              >
                <div className="truncate pr-4 flex-1">
                  <p className="text-xs text-text-muted font-medium truncate">Tap to open player</p>
                  <p className="text-sm font-bold text-text-main truncate group-hover:text-cyan transition-colors">{track.songName}</p>
                </div>
                <div className="flex gap-0.5 items-end h-4 opacity-70 shrink-0">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['2px', '16px', '2px'] }}
                      transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                      className="w-1 bg-cyan rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpotifyPlayer;
