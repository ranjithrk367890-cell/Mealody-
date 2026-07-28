import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import SpotifyPlayer from '../components/SpotifyPlayer';

interface ActiveTrack {
  songName: string;
  movieName: string;
  spotifyLink?: string;
}

interface SpotifyPlayerContextType {
  activeTrack: ActiveTrack | null;
  playTrack: (track: ActiveTrack) => void;
  closeTrack: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export const SpotifyPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null);

  const playTrack = (track: ActiveTrack) => {
    setActiveTrack(track);
  };

  const closeTrack = () => {
    setActiveTrack(null);
  };

  return (
    <SpotifyPlayerContext.Provider value={{ activeTrack, playTrack, closeTrack }}>
      {children}
      <SpotifyPlayer track={activeTrack} onClose={closeTrack} />
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error('useSpotifyPlayer must be used within a SpotifyPlayerProvider');
  }
  return context;
};
