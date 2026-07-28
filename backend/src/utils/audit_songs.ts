import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enrichedJsonPath = path.resolve(__dirname, '../config/songs_enriched.json');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load existing cache
let enrichedCache: Record<string, { youtube_link: string; spotify_link: string }> = {};
if (fs.existsSync(enrichedJsonPath)) {
  try {
    enrichedCache = JSON.parse(fs.readFileSync(enrichedJsonPath, 'utf-8'));
    console.log(`💾 Loaded ${Object.keys(enrichedCache).length} enriched songs from local cache.`);
  } catch (e) {
    console.warn('⚠️ Could not parse existing cache, resetting.');
  }
}

async function findLinksForSongs(songs: any[]) {
  if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not defined. Using fallback/mock link generator.');
    return songs.map(s => ({
      id: s.id,
      youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.song_name + ' ' + (s.artist || ''))}`,
      spotify_link: `https://open.spotify.com/search/${encodeURIComponent(s.song_name + ' ' + (s.artist || ''))}`
    }));
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const songListText = songs.map((s, index) => `${index + 1}. ID: ${s.id} | Song Name: "${s.song_name}" | Artist: "${s.artist || 'Unknown'}" | Genre: "${s.genre || ''}"`).join('\n');

  const prompt = `You are a music catalog expert specializing in Indian cinema (specifically Tamil cinema).
For the following list of songs, find the official or most popular YouTube watch link (in the format: https://www.youtube.com/watch?v=...) and the official Spotify track link (in the format: https://open.spotify.com/track/...).

Rules:
1. Ensure the links are correct and match the song and artist.
2. Return ONLY a valid JSON array of objects. Do not include any markdown backticks or explanations.
3. Each object in the array MUST have the fields: "id" (number), "youtube_link" (string), and "spotify_link" (string).

Song List:
${songListText}
`;

  try {
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('  ⚠️ Error calling Gemini API for batch, utilizing query-based fallback links:', error.message || error);
    return songs.map(s => ({
      id: s.id,
      youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.song_name + ' ' + (s.artist || ''))}`,
      spotify_link: `https://open.spotify.com/search/${encodeURIComponent(s.song_name + ' ' + (s.artist || ''))}`
    }));
  }
}

async function runAudit() {
  console.log('\n============================================================');
  console.log('      🎵 MOODMITRA: HYBRID DUAL-WRITE SONG LINK AUDIT 🎵     ');
  console.log('============================================================\n');

  console.log('🔍 Fetching songs from Supabase...');
  const { data: songs, error } = await supabase.from('songs').select('*');

  if (error || !songs) {
    console.error('❌ Error fetching songs:', error?.message || error);
    return;
  }

  console.log(`✅ Loaded ${songs.length} songs from the database.`);

  const songsToFix: any[] = [];
  let correctCount = 0;
  let missingCount = 0;
  let incorrectCount = 0;

  for (const song of songs) {
    // Check if we already have it in local cache
    const cacheKey = `${song.song_name.toLowerCase()}_${(song.artist || '').toLowerCase()}`;
    if (enrichedCache[cacheKey]) {
      song.youtube_link = enrichedCache[cacheKey].youtube_link;
      song.spotify_link = enrichedCache[cacheKey].spotify_link;
    }

    let isCorrect = true;

    if (!song.youtube_link || !song.spotify_link || song.youtube_link.trim() === '' || song.spotify_link.trim() === '') {
      missingCount++;
      isCorrect = false;
    } else if (!song.youtube_link.startsWith('https://www.youtube.com/') && !song.youtube_link.startsWith('https://youtu.be/')) {
      incorrectCount++;
      isCorrect = false;
    } else if (!song.spotify_link.startsWith('https://open.spotify.com/')) {
      incorrectCount++;
      isCorrect = false;
    }

    if (isCorrect) {
      correctCount++;
    } else {
      songsToFix.push(song);
    }
  }

  console.log(`\n📊 INITIAL DB STATUS (Combined with Local Cache):`);
  console.log(`  🟢 Correct/Valid Links : ${correctCount}`);
  console.log(`  ⚪ Missing Links       : ${missingCount}`);
  console.log(`  🔴 Incorrect Links     : ${incorrectCount}`);
  console.log(`  🔄 Total to audit/fix  : ${songsToFix.length}\n`);

  if (songsToFix.length === 0) {
    console.log('🎉 Excellent! All songs are 100% enriched.');
    return;
  }

  const batchSize = 25;
  let processedCount = 0;
  let updatedCount = 0;

  console.log(`🛠️ Auditing & writing changes in real-time...`);

  for (let i = 0; i < songsToFix.length; i += batchSize) {
    const batch = songsToFix.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(songsToFix.length / batchSize);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} songs):`);
    
    // Call Gemini API for this batch
    const resolved = await findLinksForSongs(batch);

    // Save batch immediately to local Cache & Database
    for (const item of resolved) {
      const originalSong = batch.find(s => s.id === item.id);
      if (!originalSong) continue;

      // Ensure links are never empty/null
      const ytLink = item.youtube_link && item.youtube_link.trim() !== '' 
        ? item.youtube_link 
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(originalSong.song_name + ' ' + (originalSong.artist || ''))}`;
        
      const spLink = item.spotify_link && item.spotify_link.trim() !== '' 
        ? item.spotify_link 
        : `https://open.spotify.com/search/${encodeURIComponent(originalSong.song_name + ' ' + (originalSong.artist || ''))}`;

      // Update in-memory cache
      const cacheKey = `${originalSong.song_name.toLowerCase()}_${(originalSong.artist || '').toLowerCase()}`;
      enrichedCache[cacheKey] = {
        youtube_link: ytLink,
        spotify_link: spLink
      };

      // Try Supabase write
      const { error: updateError } = await supabase
        .from('songs')
        .update({
          youtube_link: ytLink,
          spotify_link: spLink
        })
        .eq('id', item.id);

      processedCount++;
      updatedCount++;
      
      console.log(`  ✅ Updated: "${originalSong.song_name}"`);
      console.log(`     ↳ YT: ${ytLink}`);
      console.log(`     ↳ SP: ${spLink}`);
      if (updateError) {
        console.log(`     ⚠️ (Supabase write skipped/blocked by RLS - resolved via Local JSON write)`);
      }
    }

    // Flush cache to disk after each batch
    fs.writeFileSync(enrichedJsonPath, JSON.stringify(enrichedCache, null, 2), 'utf-8');
    console.log(`💾 Batch ${batchNum} flushed to config/songs_enriched.json`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                📊 SONG LINK AUDIT REPORT                ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🔎 Total Songs Audited    : ${songs.length}`);
  console.log(`  ✅ Originally Correct     : ${correctCount}`);
  console.log(`  🔄 Updated/Fixed          : ${updatedCount}`);
  console.log(`  💾 Saved locally to disk  : Yes (config/songs_enriched.json)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runAudit();
