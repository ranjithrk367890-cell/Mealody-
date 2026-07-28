-- ============================================================
-- FULL MEALODY AI DATABASE SCHEMA & AUTH SYNCHRONIZATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Public Users Table (Synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  favorite_mood TEXT,
  language TEXT DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users insertable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users updatable by everyone" ON public.users;

CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users insertable by everyone" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users updatable by everyone" ON public.users FOR UPDATE USING (true);

-- Trigger Function: Automatic Sync from auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = COALESCE(public.users.name, EXCLUDED.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
  id SERIAL PRIMARY KEY,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  description TEXT,
  mood TEXT,
  mood_tags JSONB DEFAULT '[]'::jsonb,
  spice_level INTEGER DEFAULT 0,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Foods viewable by everyone" ON public.foods;
CREATE POLICY "Foods viewable by everyone" ON public.foods FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_foods_mood_tags ON public.foods USING GIN (mood_tags);

-- 3. Drinks Table
CREATE TABLE IF NOT EXISTS public.drinks (
  id SERIAL PRIMARY KEY,
  drink_name TEXT NOT NULL,
  category TEXT DEFAULT 'beverage',
  image TEXT,
  description TEXT,
  mood TEXT,
  spice_level INTEGER DEFAULT 0,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drinks viewable by everyone" ON public.drinks;
CREATE POLICY "Drinks viewable by everyone" ON public.drinks FOR SELECT USING (true);

-- 4. Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
  id SERIAL PRIMARY KEY,
  song_name TEXT NOT NULL,
  artist TEXT,
  movie_name TEXT,
  hero TEXT,
  music_director TEXT,
  genre TEXT,
  language TEXT DEFAULT 'Tamil',
  mood TEXT,
  image TEXT,
  youtube_link TEXT,
  spotify_link TEXT,
  mood_tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Songs viewable by everyone" ON public.songs;
CREATE POLICY "Songs viewable by everyone" ON public.songs FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_songs_mood_tags ON public.songs USING GIN (mood_tags);

-- 5. Recommendation History
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recommendation history viewable by everyone" ON public.recommendation_history;
DROP POLICY IF EXISTS "Recommendation history insertable by everyone" ON public.recommendation_history;

CREATE POLICY "Recommendation history viewable by everyone" ON public.recommendation_history FOR SELECT USING (true);
CREATE POLICY "Recommendation history insertable by everyone" ON public.recommendation_history FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_history_user_date ON public.recommendation_history(user_id, created_at);

-- 6. Food Preferences
CREATE TABLE IF NOT EXISTS public.food_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  likes BOOLEAN DEFAULT FALSE,
  dislikes BOOLEAN DEFAULT FALSE,
  interaction_count INTEGER DEFAULT 1,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, food_id)
);

ALTER TABLE public.food_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Food preferences all access" ON public.food_preferences;
CREATE POLICY "Food preferences all access" ON public.food_preferences FOR ALL USING (true);

-- 7. Music Preferences
CREATE TABLE IF NOT EXISTS public.music_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES public.songs(id) ON DELETE CASCADE,
  likes BOOLEAN DEFAULT FALSE,
  dislikes BOOLEAN DEFAULT FALSE,
  interaction_count INTEGER DEFAULT 1,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, song_id)
);

ALTER TABLE public.music_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Music preferences all access" ON public.music_preferences;
CREATE POLICY "Music preferences all access" ON public.music_preferences FOR ALL USING (true);
