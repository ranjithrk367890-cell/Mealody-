import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  // Query count with non-null YouTube links
  const { count: ytCount, error: ytError } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .not('youtube_link', 'is', null);

  // Query count with non-null Spotify links
  const { count: spCount, error: spError } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .not('spotify_link', 'is', null);

  // Query last 20 songs that have non-null links
  const { data: recentSongs, error: recentError } = await supabase
    .from('songs')
    .select('song_name, youtube_link, spotify_link')
    .not('youtube_link', 'is', null)
    .limit(20);

  if (ytError || spError) {
    console.error('Error querying counts:', ytError || spError);
  } else {
    console.log('--- VERIFICATION RESULTS ---');
    console.log(`YouTube Links Count: ${ytCount}`);
    console.log(`Spotify Links Count: ${spCount}`);
    console.log('--- RECENTLY UPDATED SONGS (UP TO 20) ---');
    console.log(JSON.stringify(recentSongs, null, 2));
  }
}

verify();
