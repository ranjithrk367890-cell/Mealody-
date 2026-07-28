import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('songs').select('*');
  if (error) {
    console.error('Error fetching songs:', error);
  } else {
    console.log('Songs fetched successfully:', JSON.stringify(data, null, 2));
  }
}

run();
