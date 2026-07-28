import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Checking if username column exists...');
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: 'testuser',
          email: 'test' + Math.random() + '@example.com'
        }
      ])
      .select();
    
    if (error) {
      console.error('Insert error:', error);
    } else {
      console.log('Insert successful:', data);
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
