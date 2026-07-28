import { Router } from 'express';
import { supabase, withTimeout } from '../config/supabase.js';
import { mockFoods } from '../config/mockData.js';

const router = Router();

// Pseudo-random number generator for daily seeded rotation
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getDailySeed() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
  return parseInt(dateStr, 10);
}

router.get('/trending', async (req, res) => {
  try {
    let allFoods = [];
    const { data, error } = await withTimeout(supabase.from('foods').select('*'), 2500, { data: null, error: null } as any);
    
    // Filter helper to ensure only non-beverages are returned from this route
    const isSolidFood = (f: any) => {
      const cat = (f.category || '').toLowerCase().trim();
      return cat !== 'beverage' && cat !== 'drink';
    };

    if (error || !data || data.length === 0) {
      allFoods = mockFoods.filter(isSolidFood).map((f: any) => ({ ...f, type: 'food' }));
    } else {
      allFoods = data.filter(isSolidFood).map((f: any) => ({ ...f, type: 'food' }));
    }

    const seed = getDailySeed();

    // Calculate trending score for each item
    const trendingList = allFoods.map((food: any) => {
      // Simulate analytics based on food ID and today's seed
      const itemSeed = seed + (food.id * 12345);
      const itemRand = mulberry32(itemSeed)();
      
      const simulatedLikes = Math.floor(itemRand * 500);
      const simulatedViews = Math.floor(itemRand * 10000);
      const simulatedRating = Number((itemRand * 5).toFixed(1));
      const simulatedRecs = Math.floor(itemRand * 200);

      const trendingScore = (simulatedLikes * 2) + (simulatedViews * 0.1) + (simulatedRating * 10) + (simulatedRecs * 3);

      return {
        ...food,
        trendingScore
      };
    });

    // Sort by descending trending score
    trendingList.sort((a: any, b: any) => b.trendingScore - a.trendingScore);

    // Return all items for the page view
    res.json(trendingList);

  } catch (err: any) {
    console.warn('⚠️ Exception fetching trending foods:', err.message || err);
    res.status(500).json([]);
  }
});

router.get('/', async (req, res) => {
  try {
    const { data, error } = await withTimeout(supabase.from('foods').select('*'), 2500, { data: null, error: null } as any);
    
    const isSolidFood = (f: any) => {
      const cat = (f.category || '').toLowerCase().trim();
      return cat !== 'beverage' && cat !== 'drink';
    };

    let allFoods = [];
    if (error || !data || data.length === 0) {
      allFoods = mockFoods.map(f => ({ ...f, type: 'food' }));
    } else {
      // Merge database items with mock foods to ensure every section has plenty of items!
      const dbFoods = data.map((f: any) => ({ ...f, type: 'food' }));
      const seenNames = new Set(dbFoods.map((f: any) => f.food_name.toLowerCase().trim()));
      
      const mergedFoods = [...dbFoods];
      mockFoods.forEach(mf => {
        if (!seenNames.has(mf.food_name.toLowerCase().trim())) {
          mergedFoods.push({ ...mf, type: 'food' });
        }
      });
      allFoods = mergedFoods;
    }

    res.json(allFoods.filter(isSolidFood));
  } catch (err: any) {
    console.warn('⚠️ Exception fetching foods, falling back to local seed data:', err.message || err);
    res.json(mockFoods.map(f => ({ ...f, type: 'food' })));
  }
});

export default router;
