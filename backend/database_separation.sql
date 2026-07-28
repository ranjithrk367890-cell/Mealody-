-- Stand-alone custom users table for Custom Email/Password Auth
-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if preferred, or allow public access for your custom backend integration.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow backend system inserts" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow individuals update" ON public.users FOR UPDATE USING (true);
