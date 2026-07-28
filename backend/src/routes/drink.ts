import { Router } from 'express';
import { supabase, withTimeout } from '../config/supabase.js';
import { mockFoods } from '../config/mockData.js';

const router = Router();

// Get all drinks
router.get('/', async (req, res) => {
  try {
    let { data, error } = await withTimeout(supabase.from('drinks').select('*'), 2500, { data: null, error: null } as any);
    if (error || !data || data.length === 0) {
      const { data: foodData, error: foodErr } = await withTimeout(supabase.from('foods').select('*'), 2500, { data: null, error: null } as any);
      if (foodErr) throw foodErr;
      const dbBeverages = (foodData || [])
        .filter((f: any) => f.category?.toLowerCase() === 'beverage' || f.category?.toLowerCase() === 'drink')
        .map((f: any) => ({ ...f, drink_name: f.food_name, type: 'drink' }));
      
      const seenNames = new Set(dbBeverages.map((d: any) => d.drink_name.toLowerCase().trim()));
      const mergedDrinks = [...dbBeverages];
      
      mockFoods
        .filter(f => f.category === 'beverage' || f.category === 'drink')
        .forEach(mf => {
          if (!seenNames.has(mf.food_name.toLowerCase().trim())) {
            mergedDrinks.push({
              ...mf,
              drink_name: mf.food_name,
              type: 'drink'
            } as any);
          }
        });
      data = mergedDrinks;
    }
    res.json((data || []).map((d: any) => ({ ...d, type: 'drink', food_name: d.drink_name || d.food_name })));
  } catch (err: any) {
    console.error('Error fetching drinks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get trending drinks
router.get('/trending', async (req, res) => {
  try {
    let { data, error } = await withTimeout(supabase.from('drinks').select('*'), 2500, { data: null, error: null } as any);
    if (error || !data || data.length === 0) {
      const { data: foodData, error: foodErr } = await withTimeout(supabase.from('foods').select('*'), 2500, { data: null, error: null } as any);
      if (foodErr) throw foodErr;
      data = (foodData || []).filter((f: any) => f.category?.toLowerCase() === 'beverage' || f.category?.toLowerCase() === 'drink').map((f: any) => ({ ...f, drink_name: f.food_name }));
    }
    
    // Simulate trending score logic
    const trending = (data || []).map((d: any) => ({
      ...d,
      type: 'drink',
      food_name: d.drink_name || d.food_name,
      trendingScore: Math.random() * 100
    })).sort((a: any, b: any) => b.trendingScore - a.trendingScore);

    res.json(trending);
  } catch (err: any) {
    res.status(500).json([]);
  }
});

export default router;
