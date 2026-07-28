-- MoodMitra AI Supabase Schema
-- Run this entire file in your Supabase SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

-- Users Table (Extending Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  favorite_mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
  id SERIAL PRIMARY KEY,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  mood TEXT,
  spice_level INTEGER DEFAULT 0,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foods are viewable by everyone" ON public.foods FOR SELECT USING (true);

-- Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
  id SERIAL PRIMARY KEY,
  song_name TEXT NOT NULL,
  movie_name TEXT,
  hero TEXT,
  music_director TEXT,
  mood TEXT,
  image TEXT,
  youtube_link TEXT,
  spotify_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);

-- User Favorites (Junction Table for foods)
CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, food_id)
);

ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their favorite foods" ON public.user_favorite_foods FOR ALL USING (auth.uid() = user_id);

-- User Favorites (Junction Table for songs)
CREATE TABLE IF NOT EXISTS public.user_favorite_songs (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  song_id INTEGER REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, song_id)
);

ALTER TABLE public.user_favorite_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their favorite songs" ON public.user_favorite_songs FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- SEED DATA — FOODS
-- ============================================================

INSERT INTO public.foods (food_name, category, image, mood, spice_level, region) VALUES

-- energetic foods
('Chettinad Biriyani',   'main_course',    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800', 'energetic', 3, 'Chettinad'),
('Chicken 65',           'snack',          'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800', 'energetic', 3, 'Tamil Nadu'),
('Pepper Mutton Fry',    'main_course',    'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800', 'energetic', 3, 'South India'),

-- happy foods
('Masala Dosa',          'main_course',    'https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800', 'happy', 1, 'South India'),
('Pongal',               'main_course',    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', 'happy', 0, 'Tamil Nadu'),
('Jigarthanda',          'dessert',        'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?q=80&w=800', 'happy', 0, 'Madurai'),

-- relaxed foods
('Filter Coffee',        'beverage',       'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800', 'relaxed', 0, 'South India'),
('Idli Sambar',          'main_course',    'https://images.unsplash.com/photo-1589301773066-32f8059eb3fb?q=80&w=800', 'relaxed', 0, 'South India'),
('Adai Avial',           'main_course',    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800', 'relaxed', 1, 'Kerala'),

-- sad foods
('Rasam Rice',           'main_course',    'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=800', 'sad', 1, 'South India'),
('Curd Rice',            'main_course',    'https://images.unsplash.com/photo-1585557290-2de9ffe05f16?q=80&w=800', 'sad', 0, 'South India'),
('Vada',                 'snack',          'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', 'sad', 1, 'South India'),

-- romantic foods
('Paneer Butter Masala', 'main_course',    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800', 'romantic', 1, 'North India'),
('Chocolate Lassi',      'beverage',       'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?q=80&w=800', 'romantic', 0, 'Punjab'),
('Stuffed Paratha',      'main_course',    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800', 'romantic', 0, 'Punjab');


-- ============================================================
-- SEED DATA — SONGS
-- ============================================================

INSERT INTO public.songs (song_name, movie_name, hero, music_director, mood, image, youtube_link, spotify_link) VALUES

-- romantic songs
('Ennavale Adi Ennavale',    'Kadhalan',        'Prabhu Deva',    'A.R. Rahman',    'romantic',  'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', 'https://www.youtube.com/watch?v=VBcFh8CJQHM', 'https://open.spotify.com/track/62gYIu0T1G53q7k7oNchvP'),
('Munbe Vaa',                'Sillunu Oru Kadhal', 'Suriya',       'A.R. Rahman',    'romantic',  'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', 'https://www.youtube.com/watch?v=lD3hBXVBaKk', 'https://open.spotify.com/track/1fR4JpM74t25U25aX2Z0Cq'),
('Vennilave Vennilave',      'Minsara Kanavu',  'Arvind Swamy',   'A.R. Rahman',    'romantic',  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', 'https://www.youtube.com/watch?v=oOzl9I3XHLU', 'https://open.spotify.com/track/3s74K39YxRngpL73fR5FmE'),

-- energetic songs
('Naa Ready',               'Leo',              'Vijay',          'Anirudh',         'energetic', 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', 'https://www.youtube.com/watch?v=7wKRj-axSFI', 'https://open.spotify.com/track/5j2jK05yKqGj6s6P8H55Jz'),
('Arabic Kuthu',            'Beast',            'Vijay',          'Anirudh',         'energetic', 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', 'https://www.youtube.com/watch?v=r7OiS71NElA', 'https://open.spotify.com/track/0528e0L9a6bUqIuhJgSPhu'),
('Vaathi Coming',           'Master',           'Vijay',          'Anirudh',         'energetic', 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', 'https://www.youtube.com/watch?v=8cw4OW7T8cA', 'https://open.spotify.com/track/5T8LshTki986kX0164m6Rk'),

-- sad songs
('Thenpandi Cheemayile',    'Nayakan',          'Kamal Haasan',   'Ilaiyaraaja',     'sad',       'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', 'https://www.youtube.com/watch?v=XCXHpQHb0_U', 'https://open.spotify.com/track/25S6vEUt91B1U2pB52N6v1'),
('Kannazhaga',              'Mouna Ragam',      'Karthik',        'Ilaiyaraaja',     'sad',       'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', 'https://www.youtube.com/watch?v=XCXHpQHb0_U', 'https://open.spotify.com/track/2tH8XJzYJjGj6s6P8H55Jz'),
('Uyire',                   'Bombay',           'Arvind Swamy',   'A.R. Rahman',     'sad',       'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', 'https://www.youtube.com/watch?v=iVfWMBUqKT8', 'https://open.spotify.com/track/0XyK05yKqGj6s6P8H55Jz'),

-- happy songs
('Aalaporan Tamizhan',      'Mersal',           'Vijay',          'A.R. Rahman',     'happy',     'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', 'https://www.youtube.com/watch?v=HxVfOPgA3DA', 'https://open.spotify.com/track/4XyK05yKqGj6s6P8H55Jz'),
('Verithanam',              'Bigil',            'Vijay',          'A.R. Rahman',     'happy',     'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', 'https://www.youtube.com/watch?v=u2VTIKzV1D0', 'https://open.spotify.com/track/3XyK05yKqGj6s6P8H55Jz'),
('Surviva',                 'Thalapathy 63',    'Vijay',          'A.R. Rahman',     'happy',     'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', 'https://www.youtube.com/watch?v=9zHMEAnVvpk', 'https://open.spotify.com/track/2XyK05yKqGj6s6P8H55Jz'),

-- relaxed songs
('Vellai Pookal',           'Kannathil Muthamittal', 'Madhavan',  'A.R. Rahman',     'relaxed',   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', 'https://www.youtube.com/watch?v=gPl8T_VeCKA', 'https://open.spotify.com/track/1XyK05yKqGj6s6P8H55Jz'),
('Nenjame',                 'Soorarai Pottru',  'Suriya',         'G.V. Prakash',    'relaxed',   'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', 'https://www.youtube.com/watch?v=3P2qCHvKaV0', 'https://open.spotify.com/track/5XyK05yKqGj6s6P8H55Jz'),
('Kanave Kanave',           'David',            'Vikram',         'Anirudh',         'relaxed',   'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', 'https://www.youtube.com/watch?v=T0wifTMrxV8', 'https://open.spotify.com/track/6XyK05yKqGj6s6P8H55Jz');
