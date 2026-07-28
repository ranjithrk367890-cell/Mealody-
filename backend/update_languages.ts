import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating user languages in database...');
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ language: 'English' })
      .or('language.eq.en,language.eq.en-US,language.is.null');

    if (error) {
      console.error('Update error:', error);
    } else {
      console.log('Update completed successfully.');
    }
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

run();
