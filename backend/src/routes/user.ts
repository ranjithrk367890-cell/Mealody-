import { Router, Request, Response } from 'express';
import { supabase, memoryStore, withTimeout } from '../config/supabase.js';

const router = Router();

// Local fallback pools for rich, premium imagery and descriptions
const localDesserts = [
  { id: 901, food_name: 'Gulab Jamun', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s', description: 'Soft, syrup-soaked milk dumplings fragrant with rose water.' },
  { id: 902, food_name: 'Rava Kesari', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ37BBVifwTTZsN5BgiXM7cIYJU7ITM_HZR_w&s', description: 'Traditional semolina ghee dessert with saffron and cardamom.' },
  { id: 903, food_name: 'Jigarthanda', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvi22Zh1mbBQKCgndFQxWL33r1VIclYHdAqQ&s', description: 'Iconic chilled dessert with almond gum, ice cream and rose syrup.' },
  { id: 904, food_name: 'Chocolate Brownie', category: 'dessert', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800', description: 'Rich, fudgy dark chocolate brownie with a glossy top.' },
  { id: 905, food_name: 'Laddu', category: 'dessert', image: 'https://t4.ftcdn.net/jpg/05/95/86/23/360_F_595862367_Mq2DESdDGSeEyDEvY5swpZsDz8lXQ9DX.jpg', description: 'Traditional sweet yellow laddu.' }
];

const localDrinks = [
  { id: 801, food_name: 'Cold Coffee', category: 'beverage', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800', description: 'Refreshing cold coffee.' },
  { id: 802, food_name: 'Mango Smoothie', category: 'beverage', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800', description: 'Sweet mango smoothie.' },
  { id: 803, food_name: 'Lemon Mint Cooler', category: 'beverage', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', description: 'Minty lemon cooler.' },
  { id: 804, food_name: 'Strawberry Milkshake', category: 'beverage', image: 'https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800', description: 'Creamy strawberry shake.' },
  { id: 805, food_name: 'Mojito', category: 'beverage', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800', description: 'Classic virgin mojito.' }
];

function getPairings(mood: string, mainFoodName: string) {
  const foodName = (mainFoodName || '').toLowerCase();
  let dessert = localDesserts[0];
  let drink = localDrinks[0];

  if (foodName.includes('biryani') || foodName.includes('chettinad') || foodName.includes('pepper') || foodName.includes('spicy')) {
    dessert = localDesserts[2]; // Jigarthanda
    drink = localDrinks[2]; // Lemon Mint Cooler
  } else if (mood === 'sad' || mood === 'tired') {
    dessert = localDesserts[0]; // Gulab Jamun
    drink = localDrinks[0]; // Cold Coffee
  } else if (mood === 'relaxed' || mood === 'calm') {
    dessert = localDesserts[1]; // Rava Kesari
    drink = localDrinks[4]; // Mojito
  } else if (mood === 'happy' || mood === 'excited') {
    dessert = localDesserts[4]; // Laddu
    drink = localDrinks[1]; // Mango Smoothie
  }

  return { dessert, drink };
}

// GET /api/user/history - load recommendation history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const userId = (req.query.userId as string) || 'default_user';

  let historyItems: any[] = [];

  try {
    const { data: rawHistory, error } = await withTimeout(
      supabase
        .from('recommendation_history')
        .select(`
          id,
          mood,
          created_at,
          foods (id, food_name, image, category, description),
          songs (id, song_name, artist, image)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      2500,
      { data: null, error: null } as any
    );

    if (error) {
      console.warn('⚠️ Supabase history query failed, checking memory store:', error.message || error);
    } else if (rawHistory) {
      historyItems = rawHistory;
    }
  } catch (err: any) {
    console.warn('⚠️ Exception during history fetch:', err.message || err);
  }

  // Fallback to memory store items if DB returned nothing or failed
  if (historyItems.length === 0) {
    const memHistory = memoryStore.getUserHistory(userId);
    historyItems = memHistory;
  }

  // Map history to resolve deterministic desserts and drinks
  const formattedHistory = historyItems.map((item: any) => {
    const mainFoodName = item.foods?.food_name || '';
    const { dessert, drink } = getPairings(item.mood || 'happy', mainFoodName);
    return {
      ...item,
      dessert,
      drink
    };
  });

  res.json(formattedHistory);
});

// GET /api/user/analytics - dashboard aggregator
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  const userId = (req.query.userId as string) || 'default_user';

  try {
    let userProfile: any = null;
    let rawHistory: any[] = [];
    let foodPrefs: any[] = [];
    let musicPrefs: any[] = [];

    // 1. Attempt DB Queries
    try {
      const { data: profile } = await withTimeout(
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        2500,
        { data: null, error: null } as any
      );
      userProfile = profile;

      const { data: hist } = await withTimeout(
        supabase
          .from('recommendation_history')
          .select(`
            id,
            mood,
            created_at,
            foods (id, food_name, image, category, description),
            songs (id, song_name, artist, image)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        2500,
        { data: null, error: null } as any
      );
      if (hist) rawHistory = hist;

      const { data: fp } = await withTimeout(
        supabase
          .from('food_preferences')
          .select('likes, dislikes, food_id, foods (id, food_name, image, category)')
          .eq('user_id', userId),
        2500,
        { data: null, error: null } as any
      );
      if (fp) foodPrefs = fp;

      const { data: mp } = await withTimeout(
        supabase
          .from('music_preferences')
          .select('likes, dislikes, song_id, songs (id, song_name, artist, image)')
          .eq('user_id', userId),
        2500,
        { data: null, error: null } as any
      );
      if (mp) musicPrefs = mp;

    } catch (dbErr: any) {
      console.warn('⚠️ Supabase error during analytics fetch:', dbErr.message || dbErr);
    }

    // Fallbacks from memory store
    if (!userProfile) {
      userProfile = memoryStore.getUserById(userId);
    }
    if (rawHistory.length === 0) {
      rawHistory = memoryStore.getUserHistory(userId);
    }
    if (foodPrefs.length === 0) {
      foodPrefs = memoryStore.getFoodPrefs(userId);
    }
    if (musicPrefs.length === 0) {
      musicPrefs = memoryStore.getMusicPrefs(userId);
    }

    let language = userProfile?.language || 'English';
    if (language.trim().toLowerCase() === 'en') {
      language = 'English';
    }

    const fallbackProfile = {
      name: userProfile?.name || userProfile?.username || 'Mealody User',
      email: userProfile?.email || 'user@mealody.ai',
      language: language,
      created_at: userProfile?.created_at || new Date().toISOString()
    };

    const totalRecommendations = rawHistory.length;

    // Resolve dessert/drink for each history record
    const history = rawHistory.map((item: any) => {
      const mainFoodName = item.foods?.food_name || '';
      const { dessert, drink } = getPairings(item.mood || 'happy', mainFoodName);
      return {
        ...item,
        dessert,
        drink
      };
    });

    // Compute Mood Analytics
    let mostSelectedMood = 'Happy';
    const moodCounts: Record<string, number> = {};
    let moodAnalytics: { mood: string; percentage: number }[] = [];

    if (totalRecommendations > 0) {
      history.forEach(h => {
        const moodKey = (h.mood || 'happy').toLowerCase();
        moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;
      });

      mostSelectedMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || 'Happy';

      moodAnalytics = Object.keys(moodCounts).map(mood => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1),
        percentage: Math.round((moodCounts[mood] / totalRecommendations) * 100)
      })).sort((a, b) => b.percentage - a.percentage);
    } else {
      moodAnalytics = [
        { mood: 'Happy', percentage: 50 },
        { mood: 'Energetic', percentage: 30 },
        { mood: 'Relaxed', percentage: 20 }
      ];
    }

    const foodLikesCount = foodPrefs.filter(fp => fp.likes).length;
    const foodDislikesCount = foodPrefs.filter(fp => fp.dislikes).length;

    const musicLikesCount = musicPrefs.filter(mp => mp.likes).length;
    const musicDislikesCount = musicPrefs.filter(mp => mp.dislikes).length;

    const totalLikes = foodLikesCount + musicLikesCount;
    const totalDislikes = foodDislikesCount + musicDislikesCount;
    const favoritesCount = totalLikes;

    // Determine Favorite Items
    let favoriteFood: any = null;
    let favoriteDrink: any = null;
    let favoriteSong: any = null;

    const likedFoods = foodPrefs.filter(fp => {
      const food = Array.isArray(fp.foods) ? fp.foods[0] : fp.foods;
      if (!food) return false;
      const cat = (food as any).category || '';
      return fp.likes && cat !== 'beverage' && cat !== 'drink';
    });
    if (likedFoods.length > 0) {
      const food = Array.isArray(likedFoods[0].foods) ? likedFoods[0].foods[0] : likedFoods[0].foods;
      favoriteFood = {
        name: (food as any).food_name,
        image: (food as any).image
      };
    }

    const likedDrinks = foodPrefs.filter(fp => {
      const food = Array.isArray(fp.foods) ? fp.foods[0] : fp.foods;
      if (!food) return false;
      const cat = (food as any).category || '';
      return fp.likes && (cat === 'beverage' || cat === 'drink');
    });
    if (likedDrinks.length > 0) {
      const food = Array.isArray(likedDrinks[0].foods) ? likedDrinks[0].foods[0] : likedDrinks[0].foods;
      favoriteDrink = {
        name: (food as any).food_name,
        image: (food as any).image
      };
    } else {
      favoriteDrink = {
        name: localDrinks[2].food_name,
        image: localDrinks[2].image
      };
    }

    const likedSongs = musicPrefs.filter(mp => {
      const song = Array.isArray(mp.songs) ? mp.songs[0] : mp.songs;
      return mp.likes && song;
    });
    if (likedSongs.length > 0) {
      const song = Array.isArray(likedSongs[0].songs) ? likedSongs[0].songs[0] : likedSongs[0].songs;
      favoriteSong = {
        name: (song as any).song_name,
        image: (song as any).image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800'
      };
    }

    // Fallbacks if no explicit favorites saved
    if (!favoriteFood) {
      favoriteFood = { name: 'Chettinad Biriyani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800' };
    }
    if (!favoriteSong) {
      favoriteSong = { name: 'Munbe Vaa', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800' };
    }

    // Recent Activity Builder
    const recentActivity: { type: 'like' | 'dislike' | 'recommend'; text: string; time: string; timestamp: number }[] = [];

    history.slice(0, 5).forEach(h => {
      recentActivity.push({
        type: 'recommend',
        text: `Generated ${(h.mood || 'happy').charAt(0).toUpperCase() + (h.mood || 'happy').slice(1)} recommendation`,
        time: h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Recently',
        timestamp: h.created_at ? new Date(h.created_at).getTime() : Date.now()
      });
    });

    foodPrefs.slice(0, 5).forEach(fp => {
      const food = Array.isArray(fp.foods) ? fp.foods[0] : fp.foods;
      if (food) {
        if (fp.likes) {
          recentActivity.push({
            type: 'like',
            text: `Liked ${(food as any).food_name}`,
            time: 'Recently',
            timestamp: Date.now() - 3600000
          });
        }
      }
    });

    const sortedActivity = recentActivity
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8)
      .map(act => ({
        type: act.type,
        text: act.text,
        time: act.time
      }));

    // Calculate Most Recommended Food, Drink, and Song
    let mostRecommendedFood: any = null;
    let mostRecommendedDrink: any = null;
    let mostRecommendedSong: any = null;

    if (history.length > 0) {
      const foodCounts: Record<string, { name: string; image: string; count: number }> = {};
      const drinkCounts: Record<string, { name: string; image: string; count: number }> = {};
      const songCounts: Record<string, { name: string; image: string; count: number }> = {};

      history.forEach((h: any) => {
        if (h.foods?.food_name) {
          const k = h.foods.food_name;
          foodCounts[k] = { name: k, image: h.foods.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800', count: (foodCounts[k]?.count || 0) + 1 };
        }
        if (h.drink?.food_name) {
          const k = h.drink.food_name;
          drinkCounts[k] = { name: k, image: h.drink.image || 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', count: (drinkCounts[k]?.count || 0) + 1 };
        }
        if (h.songs?.song_name) {
          const k = h.songs.song_name;
          songCounts[k] = { name: k, image: h.songs.image || 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', count: (songCounts[k]?.count || 0) + 1 };
        }
      });

      const sortedFoods = Object.values(foodCounts).sort((a, b) => b.count - a.count);
      if (sortedFoods.length > 0) mostRecommendedFood = { name: sortedFoods[0].name, image: sortedFoods[0].image };

      const sortedDrinks = Object.values(drinkCounts).sort((a, b) => b.count - a.count);
      if (sortedDrinks.length > 0) mostRecommendedDrink = { name: sortedDrinks[0].name, image: sortedDrinks[0].image };

      const sortedSongs = Object.values(songCounts).sort((a, b) => b.count - a.count);
      if (sortedSongs.length > 0) mostRecommendedSong = { name: sortedSongs[0].name, image: sortedSongs[0].image };
    }

    if (!mostRecommendedFood) mostRecommendedFood = favoriteFood;
    if (!mostRecommendedDrink) mostRecommendedDrink = favoriteDrink;
    if (!mostRecommendedSong) mostRecommendedSong = favoriteSong;

    res.json({
      userProfile: fallbackProfile,
      quickStats: {
        mostSelectedMood: mostSelectedMood.charAt(0).toUpperCase() + mostSelectedMood.slice(1),
        totalRecommendations,
        likeCount: totalLikes,
        dislikeCount: totalDislikes,
        favoritesCount
      },
      favoriteItems: {
        food: favoriteFood,
        drink: favoriteDrink,
        song: favoriteSong
      },
      mostRecommended: {
        food: mostRecommendedFood,
        drink: mostRecommendedDrink,
        song: mostRecommendedSong
      },
      moodAnalytics,
      recentActivity: sortedActivity,
      history: history.slice(0, 10)
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Analytics calculation failed.' });
  }
});

// GET /api/user/favorites or /favorites
router.get('/favorites', async (req: Request, res: Response): Promise<void> => {
  const { userId = 'default_user' } = req.query;

  try {
    let foodLikes: any[] = [];
    let musicLikes: any[] = [];

    try {
      const { data: fp } = await supabase
        .from('food_preferences')
        .select('food_id, foods (*)')
        .eq('user_id', userId as string)
        .eq('likes', true);
      if (fp) foodLikes = fp.map(item => item.foods).filter(Boolean);

      const { data: mp } = await supabase
        .from('music_preferences')
        .select('song_id, songs (*)')
        .eq('user_id', userId as string)
        .eq('likes', true);
      if (mp) musicLikes = mp.map(item => item.songs).filter(Boolean);
    } catch (dbErr) {
      console.warn('⚠️ Supabase favorites lookup error, checking memory store:', dbErr);
    }

    if (foodLikes.length === 0) {
      const memFood = memoryStore.getFoodPrefs(userId as string).filter(p => p.likes);
      foodLikes = memFood.map(p => p.foods).filter(Boolean);
    }
    if (musicLikes.length === 0) {
      const memMusic = memoryStore.getMusicPrefs(userId as string).filter(p => p.likes);
      musicLikes = memMusic.map(p => p.songs).filter(Boolean);
    }

    // Default sample fallback if no liked items yet
    if (foodLikes.length === 0) {
      foodLikes = [
        { id: 1, food_name: 'Chettinad Biriyani', category: 'main_course', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800', spice_level: 3, mood: 'energetic' },
        { id: 4, food_name: 'Masala Dosa', category: 'main_course', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800', spice_level: 1, mood: 'happy' }
      ];
    }
    if (musicLikes.length === 0) {
      musicLikes = [
        { id: 2, song_name: 'Munbe Vaa', movie_name: 'Sillunu Oru Kadhal', hero: 'Suriya', music_director: 'A.R. Rahman', mood: 'romantic', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800' },
        { id: 4, song_name: 'Naa Ready', movie_name: 'Leo', hero: 'Vijay', music_director: 'Anirudh', mood: 'energetic', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800' }
      ];
    }

    res.json({
      foods: foodLikes,
      songs: musicLikes,
      total: foodLikes.length + musicLikes.length
    });
  } catch (err: any) {
    console.error('Favorites endpoint error:', err);
    res.status(500).json({ error: 'Failed to load user favorites.' });
  }
});

// GET /dashboard alias router
router.get('/dashboard', (req: Request, res: Response) => {
  res.redirect(307, `/api/user/analytics?${new URLSearchParams(req.query as any).toString()}`);
});

export default router;
