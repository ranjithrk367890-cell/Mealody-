import { Router } from 'express';
import { supabase, withTimeout } from '../config/supabase.js';
import { mockSongs } from '../config/mockData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enrichedJsonPath = path.resolve(__dirname, '../config/songs_enriched.json');

const router = Router();

// Helper to get enriched links from local JSON cache
function getEnrichedLinks() {
  if (fs.existsSync(enrichedJsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(enrichedJsonPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse enriched songs JSON:', e);
    }
  }
  return {};
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await withTimeout(supabase.from('songs').select('*'), 2500, { data: null, error: null } as any);
    const enrichedCache = getEnrichedLinks();
    
    if (error) {
      console.warn('⚠️ Supabase error fetching songs, falling back to local seed data:', error.message);
      res.json(mockSongs.map(s => ({ ...s, type: 'song' })));
      return;
    }
    
    // If table returned but is empty, use fallbacks
    if (!data || data.length === 0) {
      res.json(mockSongs.map(s => ({ ...s, type: 'song' })));
      return;
    }

    // Dynamic enrichment fallback: merge links from songs_enriched.json
    const enrichedData = data.map((song: any) => {
      const localSong = mockSongs.find(
        (s) => s.song_name.toLowerCase() === song.song_name.toLowerCase()
      );
      
      const cacheKey = `${song.song_name.toLowerCase()}_${(song.artist || '').toLowerCase()}`;
      const cached = enrichedCache[cacheKey];

      return {
        ...song,
        youtube_link: song.youtube_link || cached?.youtube_link || localSong?.youtube_link,
        spotify_link: song.spotify_link || cached?.spotify_link || localSong?.spotify_link,
        type: 'song'
      };
    });

    res.json(enrichedData);
  } catch (err: any) {
    console.warn('⚠️ Exception fetching songs, falling back to local seed data:', err.message || err);
    res.json(mockSongs.map(s => ({ ...s, type: 'song' })));
  }
});

export default router;
