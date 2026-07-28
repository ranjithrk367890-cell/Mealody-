-- ============================================================
-- MOODMITRA SCHEMA UPGRADE
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Modify foods table
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS mood_tags JSONB DEFAULT '[]'::jsonb;
-- (Assuming we will still keep the 'image' and 'category' columns as they were, we just add the new ones)

-- 2. Modify songs table
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS mood_tags JSONB DEFAULT '[]'::jsonb;
-- (Assuming we keep song_name, image, youtube_link, spotify_link, etc.)

-- 3. Create recommendation_history
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own recommendation history" ON public.recommendation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendation history" ON public.recommendation_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create food_preferences
CREATE TABLE IF NOT EXISTS public.food_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  likes BOOLEAN DEFAULT FALSE,
  dislikes BOOLEAN DEFAULT FALSE,
  interaction_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, food_id)
);

ALTER TABLE public.food_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own food preferences" ON public.food_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own food preferences" ON public.food_preferences FOR ALL USING (auth.uid() = user_id);

-- 5. Create music_preferences
CREATE TABLE IF NOT EXISTS public.music_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES public.songs(id) ON DELETE CASCADE,
  likes BOOLEAN DEFAULT FALSE,
  dislikes BOOLEAN DEFAULT FALSE,
  interaction_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, song_id)
);

ALTER TABLE public.music_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own music preferences" ON public.music_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own music preferences" ON public.music_preferences FOR ALL USING (auth.uid() = user_id);
