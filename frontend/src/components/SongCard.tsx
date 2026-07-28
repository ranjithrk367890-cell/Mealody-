import { motion } from 'framer-motion';
import { useSpotifyPlayer } from '../context/SpotifyPlayerContext';

interface SongCardProps {
  songName: string;
  movieName: string;
  artist?: string;
  mood: string;
  image: string;
  youtubeLink?: string;
  spotifyLink?: string;
  delay?: number;
}

const SongCard = ({ songName, movieName, artist, mood, image, youtubeLink, spotifyLink, delay = 0 }: SongCardProps) => {
  const { playTrack } = useSpotifyPlayer();
  void playTrack; // used via context when needed

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Song clicked:", { song_name: songName, artist, spotify_link: spotifyLink, youtube_link: youtubeLink });
    
    if (spotifyLink && spotifyLink.trim() !== '') {
      window.open(spotifyLink, "_blank", "noopener,noreferrer");
    } else if (youtubeLink && youtubeLink.trim() !== '' && youtubeLink !== 'https://youtube.com/watch') {
      window.open(youtubeLink, "_blank", "noopener,noreferrer");
    } else {
      alert("Song link unavailable");
    }
  };

  const handleYoutubeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (youtubeLink && youtubeLink !== 'https://youtube.com/watch') {
      window.open(youtubeLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={handleCardClick}
      className="glass-card h-full min-h-[320px] rounded-3xl overflow-hidden relative group shadow-2xl cursor-pointer"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image || 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800'})` }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />

      {/* Action Buttons with Fallbacks */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {/* Watch on YouTube Button */}
        {youtubeLink && youtubeLink.trim() !== '' && youtubeLink !== 'https://youtube.com/watch' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleYoutubeClick}
            className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-text-main text-[11px] font-black px-3.5 py-2 rounded-full border border-red-500/30 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            ▶ Watch on YouTube
          </motion.button>
        )}

        {/* Listen on Spotify Button */}
        {spotifyLink && spotifyLink.trim() !== '' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCardClick}
            className="flex items-center gap-1.5 bg-[#1DB954]/95 hover:bg-[#1DB954] text-text-main text-[11px] font-black px-3.5 py-2 rounded-full border border-[#1DB954]/40 shadow-[0_0_15px_rgba(29,185,84,0.4)]"
          >
            🎧 Listen on Spotify
          </motion.button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 p-6 z-20 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-xs font-semibold px-3 py-1 bg-secondary/30 rounded-full border border-secondary/50 backdrop-blur-md inline-block mb-3 text-text-main shadow-[0_0_10px_rgba(255,59,154,0.3)]">
          {mood}
        </span>
        <h3 className="text-xl font-bold mb-1 text-text-main truncate">🎵 {songName}</h3>
        {artist && (
          <p className="text-sm text-cyan font-bold flex items-center gap-1.5 mb-1 truncate">
            <span>👤</span> {artist}
          </p>
        )}
        {movieName && <p className="text-xs text-text-muted truncate">🎬 {movieName}</p>}
      </div>
    </motion.div>
  );
};

export default SongCard;
