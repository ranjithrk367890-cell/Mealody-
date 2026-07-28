import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, memoryStore, withTimeout } from '../config/supabase.js';
import { analyzeIntent, filterSemanticFoods, generateFriendlyReply } from '../utils/recommendationEngine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enrichedJsonPath = path.resolve(__dirname, '../config/songs_enriched.json');

import { mockFoods, mockSongs } from '../config/mockData.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const rawInput = (req.query.mood as string || 'happy').trim();
  const userId = req.query.userId as string | undefined;

  console.log('\n==================================================');
  console.log(`[LOG] Request received: GET /api/recommendations?mood=${encodeURIComponent(rawInput)}${userId ? '&userId=' + userId : ''}`);

  try {
    // 1. NLP Mood Detection & Intent Analysis
    const aiAnalysis = analyzeIntent(rawInput);
    const mood = aiAnalysis.mood;
    console.log(`[LOG] Mood detected: "${mood}" (Intent: ${aiAnalysis.detectedIntent}, Confidence: ${aiAnalysis.confidence}%)`);

    // 2. Gemini API Request with 4000ms strict timeout
    console.log(`[LOG] Gemini API request started`);
    let geminiReply: string | null = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('placeholder') && !apiKey.includes('dummy')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are Mealody AI. User mood input: "${rawInput}" (Detected mood: "${mood}"). Write a warm 2-sentence conversational reply acknowledging their mood and offering comforting advice.`;

        const fetchPromise = model.generateContent(prompt).then(r => r.response.text());
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
        geminiReply = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (geminiErr: any) {
        console.warn(`⚠️ [LOG] Gemini API call error: ${geminiErr?.message || geminiErr}`);
      }
    }

    if (geminiReply) {
      console.log(`[LOG] Gemini API response received`);
    } else {
      console.log(`[LOG] Gemini API response skipped/timed out (Using rule engine fallback)`);
    }

    // 3. Supabase Database Queries with parallel execution and 2500ms timeout
    console.log(`[LOG] Database query started`);
    const [dbFoodsRes, dbDrinksRes, dbSongsRes] = await Promise.all([
      withTimeout(supabase.from('foods').select('*'), 2500, { data: null, error: null } as any),
      withTimeout(supabase.from('drinks').select('*'), 2500, { data: null, error: null } as any),
      withTimeout(supabase.from('songs').select('*'), 2500, { data: null, error: null } as any)
    ]);

    let allFoods: any[] = dbFoodsRes.data || [];
    let allDrinks: any[] = dbDrinksRes.data || [];
    let allSongs: any[] = dbSongsRes.data || [];

    console.log(`[LOG] Database query completed (DB Foods: ${allFoods.length}, DB Drinks: ${allDrinks.length}, DB Songs: ${allSongs.length})`);

    // Fallbacks if database returned empty or failed
    if (allFoods.length === 0) {
      allFoods = mockFoods.map(f => ({ ...f, type: 'food' }));
    }
    if (allSongs.length === 0) {
      allSongs = mockSongs.map(s => ({ ...s, type: 'song' }));
    }

    // Filter out beverages/drinks from allFoods
    allFoods = allFoods.filter((f: any) => {
      const cat = (f.category || '').toLowerCase();
      const name = (f.food_name || f.name || '').toLowerCase();
      const type = (f.type || '').toLowerCase();
      
      const isDrink = type === 'drink' || type === 'beverage' ||
                      cat.includes('beverage') || cat.includes('drink') || 
                      cat.includes('juice') || cat.includes('shake') || 
                      name.includes('coffee') || name.includes('tea') || 
                      name.includes('juice') || name.includes('smoothie') || 
                      name.includes('milk') || name.includes('cooler') || 
                      name.includes('mojito');
      return !isDrink;
    });

    if (!allDrinks || allDrinks.length === 0) {
      allDrinks = [
        { id: 'fallback-1', food_name: 'Cold Coffee', category: 'coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800', type: 'drink', description: 'Refreshing cold coffee.' },
        { id: 'fallback-2', food_name: 'Mango Smoothie', category: 'smoothie', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800', type: 'drink', description: 'Sweet mango smoothie.' },
        { id: 'fallback-3', food_name: 'Lemon Mint Cooler', category: 'juice', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', type: 'drink', description: 'Minty lemon cooler.' },
        { id: 'fallback-4', food_name: 'Strawberry Milkshake', category: 'milkshake', image: 'https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800', type: 'drink', description: 'Creamy strawberry shake.' },
        { id: 'fallback-5', food_name: 'Watermelon Juice', category: 'juice', image: 'https://images.unsplash.com/photo-1589182373715-0b0bbbe19000?q=80&w=800', type: 'drink', description: 'Fresh watermelon juice.' },
        { id: 'fallback-6', food_name: 'Mojito', category: 'mocktail', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800', type: 'drink', description: 'Classic virgin mojito.' },
        { id: 'fallback-7', food_name: 'Rose Milk', category: 'milk', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800', type: 'drink', description: 'Sweet rose milk.' },
        { id: 'fallback-8', food_name: 'Bubble Tea', category: 'tea', image: 'https://images.unsplash.com/photo-1558857563-b37103fac9eb?q=80&w=800', type: 'drink', description: 'Boba bubble tea.' },
        { id: 'fallback-9', food_name: 'Green Tea', category: 'tea', image: 'https://images.unsplash.com/photo-1606791405730-bea15cd92a51?q=80&w=800', type: 'drink', description: 'Relaxing hot green tea.' },
        { id: 'fallback-10', food_name: 'Hot Chocolate', category: 'chocolate', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=800', type: 'drink', description: 'Warm hot chocolate.' }
      ];
    }

    const formattedDrinks = allDrinks.map((d: any) => ({
      ...d,
      food_name: d.drink_name || d.food_name,
      popularity: Math.floor(Math.random() * 40) + 60
    }));

    // MOOD MATCHING HELPER
    // 'motivated' maps to 'energetic' since DB uses energetic/happy/excited tags
    const MOOD_ALIAS: Record<string, string[]> = {
      motivated: ['energetic', 'excited', 'happy', 'motivated'],
      love:      ['romantic', 'love'],
      excited:   ['excited', 'happy', 'energetic'],
    };
    const matchesMood = (item: any) => {
      const tags = Array.isArray(item.mood_tags) ? item.mood_tags.map((t: string) => t.toLowerCase()) : [];
      const aliases = MOOD_ALIAS[mood] || [mood];
      return aliases.some(alias => tags.includes(alias)) ||
             (item.mood && aliases.includes(item.mood.toLowerCase()));
    };

    // Separate Mains and Desserts
    const dessertsList = allFoods.filter((f: any) => {
       const cat = (f.category || '').toLowerCase();
       const name = (f.food_name || f.name || '').toLowerCase();
       const isSpicySavory = name.includes('pizza') || name.includes('burger') || name.includes('pasta') || name.includes('curry') || name.includes('biryani') || name.includes('biriyani') || name.includes('tikka') || name.includes('kebab') || name.includes('soup') || name.includes('fry') || name.includes('roast') || name.includes('masala') || name.includes('sandwich') || name.includes('salad') || name.includes('tacos') || name.includes('fries') || name.includes('vada') || name.includes('samosa') || name.includes('rice') || name.includes('pongal') || name.includes('dosa') || name.includes('idli') || name.includes('noodles') || name.includes('noodle');
       if (isSpicySavory) return false;
       return cat.includes('dessert') || cat.includes('sweet') || name.includes('cake') || name.includes('ice cream') || name.includes('brownie') || name.includes('payasam') || name.includes('halwa') || name.includes('gulab') || name.includes('jalebi') || name.includes('kesari') || name.includes('jigarthanda') || name.includes('laddu');
    });

    // 3. NLP Dynamic Semantic Search for Food Main Course
    let moodMains = filterSemanticFoods(allFoods.filter((f: any) => !dessertsList.find(d => d.id === f.id)), aiAnalysis);
    if (moodMains.length === 0) moodMains = allFoods.filter((f: any) => !dessertsList.find(d => d.id === f.id));
    if (moodMains.length === 0) moodMains = allFoods; // final fallback
    
    const selectedMain = [...moodMains].sort(() => 0.5 - Math.random())[0];

    // Determine logical pairings based on user intent
    const intentName = aiAnalysis.detectedIntent;
    
    // ─── Rich local dessert pool (used when DB desserts are empty/insufficient) ───
    const localDessertPool = [
      {
        id: 'local-dessert-1',
        food_name: 'Gulab Jamun',
        category: 'dessert',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s',
        description: 'Soft, syrup-soaked milk dumplings fragrant with rose water and cardamom.'
      },
      {
        id: 'local-dessert-2',
        food_name: 'Rava Kesari',
        category: 'dessert',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ37BBVifwTTZsN5BgiXM7cIYJU7ITM_HZR_w&s',
        description: 'Golden semolina halwa cooked in ghee with saffron and cashews.'
      },
      {
        id: 'local-dessert-3',
        food_name: 'Jigarthanda',
        category: 'dessert',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvi22Zh1mbBQKCgndFQxWL33r1VIclYHdAqQ&s',
        description: 'Iconic Madurai chilled dessert with almond gum, ice cream and sarsaparilla syrup.'
      },
      {
        id: 'local-dessert-4',
        food_name: 'Chocolate Brownie',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800',
        description: 'Rich, fudgy dark chocolate brownie with a glossy crackled top.'
      },
      {
        id: 'local-dessert-5',
        food_name: 'Rasgulla',
        category: 'dessert',
        image: 'https://i.pinimg.com/474x/37/cb/d5/37cbd5945b0947a3d48e99e4ca6622b8.jpg',
        description: 'Spongy cottage cheese dumplings soaked in light sugar syrup.'
      },
      {
        id: 'local-dessert-6',
        food_name: 'Paal Payasam',
        category: 'dessert',
        image: 'https://thumbs.dreamstime.com/b/delicious-payasam-kerala-cuisine-homemade-98980037.jpg',
        description: 'Creamy rice and milk pudding simmered slow with cardamom and cashews.'
      },
      {
        id: 'local-dessert-7',
        food_name: 'Mango Ice Cream',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800',
        description: 'Velvety mango ice cream made with real Alphonso pulp and cream.'
      },
      {
        id: 'local-dessert-8',
        food_name: 'Jalebi',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
        description: 'Crispy spiral fritters soaked in warm saffron sugar syrup.'
      },
      {
        id: 'local-dessert-9',
        food_name: 'Mysore Pak',
        category: 'dessert',
        image: 'https://www.shreemithai.com/cdn/shop/products/spl-mysore-pak-206182.jpg?v=1707820107&width=800',
        description: 'Melt-in-mouth gram flour fudge cooked in generous ghee from Mysore.'
      },
      {
        id: 'local-dessert-10',
        food_name: 'Cheesecake Slice',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800',
        description: 'Creamy New York-style cheesecake on a buttery biscuit crust.'
      },
      {
        id: 'local-dessert-11',
        food_name: 'Laddu',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1637944394993-1f0bdcd57143?q=80&w=800',
        description: 'Traditional besan laddoos rolled with ghee, nuts and cardamom.'
      },
      {
        id: 'local-dessert-12',
        food_name: 'Kulfi',
        category: 'dessert',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzDXp7RK5wdj8ixRy-3g45Ithb6LGGkFIyUA&s',
        description: 'Dense, creamy Indian ice cream with pistachio and cardamom.'
      },
    ];

    // Helper: pick a dessert from DB list or fallback pool, varying by mood + main food name
    function pickDessert(pool: any[], fallbackPool: any[], seedStr: string) {
      const src = pool.length > 0 ? pool : fallbackPool;
      const hash = seedStr.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
      return src[hash % src.length];
    }

    // ─── Rich local drink pool (used when DB drinks are empty/insufficient) ───
    const localDrinkPool = [
      {
        id: 'local-drink-1',
        food_name: 'Filter Coffee',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800',
        description: 'Classic South Indian filter coffee brewed with chicory.'
      },
      {
        id: 'local-drink-2',
        food_name: 'Mint Lemon Cooler',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
        description: 'Tangy lime and fresh mint cooler — perfectly refreshing.'
      },
      {
        id: 'local-drink-3',
        food_name: 'Mango Smoothie',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1553530666-ba3a7d5efd50?q=80&w=800',
        description: 'Thick, velvety mango smoothie made with Alphonso pulp.'
      },
      {
        id: 'local-drink-4',
        food_name: 'Masala Chai',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800',
        description: 'Spiced Indian tea with ginger, cardamom and cinnamon.'
      },
      {
        id: 'local-drink-5',
        food_name: 'Strawberry Milkshake',
        category: 'beverage',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsEb1TSZzfhADYmeMQfWDmtVihRHaGNdSFYQ&s',
        description: 'Creamy strawberry milkshake with real fruit and vanilla ice cream.'
      },
      {
        id: 'local-drink-6',
        food_name: 'Watermelon Juice',
        category: 'beverage',
        image: 'https://img.freepik.com/free-photo/cold-watermelon-smoothie-dark-background_1150-41818.jpg?semt=ais_hybrid&w=740&q=80',
        description: 'Fresh, chilled watermelon juice with a hint of lime.'
      },
      {
        id: 'local-drink-7',
        food_name: 'Virgin Mojito',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800',
        description: 'Classic mocktail with muddled mint, lime and sparkling water.'
      },
      {
        id: 'local-drink-8',
        food_name: 'Rose Milk',
        category: 'beverage',
        image: 'https://thumbs.dreamstime.com/b/popular-ramazan-drink-i-e-rose-falooda-shake-transparent-glass-along-raw-milk-another-honey-syrup-essence-also-225549696.jpg',
        description: 'Sweet chilled rose-flavored milk — a South Indian favourite.'
      },
      {
        id: 'local-drink-9',
        food_name: 'Hot Chocolate',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=800',
        description: 'Rich, velvety hot chocolate with a dusting of cocoa powder.'
      },
      {
        id: 'local-drink-10',
        food_name: 'Green Tea',
        category: 'beverage',
        image: 'https://media.istockphoto.com/id/597657478/photo/like-tea.jpg?s=612x612&w=0&k=20&c=PgfvY_uI6B1K3FYV_wNen0hC32JVk6Mhm0yKIrFn6tI=',
        description: 'Calming Japanese green tea — light and antioxidant-rich.'
      },
      {
        id: 'local-drink-11',
        food_name: 'Mango Lassi',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f280c2?q=80&w=800',
        description: 'Thick, frothy mango yogurt drink with cardamom.'
      },
      {
        id: 'local-drink-12',
        food_name: 'Coconut Water',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1567265826255-254b8283a8f4?q=80&w=800',
        description: 'Pure, hydrating coconut water — nature\'s sports drink.'
      },
      {
        id: 'local-drink-13',
        food_name: 'Lemon Ginger Honey Tea',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800',
        description: 'Warm healing tea with lemon, ginger and raw honey.'
      },
      {
        id: 'local-drink-14',
        food_name: 'Beetroot Juice',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1553530666-ba3a7d5efd50?q=80&w=800',
        description: 'Vibrant beetroot juice packed with iron and natural energy.'
      },
      {
        id: 'local-drink-15',
        food_name: 'Bubble Tea',
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1558857563-b37103fac9eb?q=80&w=800',
        description: 'Taiwanese milk tea with chewy tapioca pearls.'
      },
    ];

    // Mood → best-fit drink names from localDrinkPool
    const moodDrinkMap: Record<string, string[]> = {
      happy:       ['Mango Smoothie', 'Strawberry Milkshake', 'Mango Lassi', 'Watermelon Juice'],
      energetic:   ['Beetroot Juice', 'Mango Smoothie', 'Mint Lemon Cooler', 'Coconut Water'],
      motivated:   ['Beetroot Juice', 'Coconut Water', 'Mango Smoothie', 'Mint Lemon Cooler'],
      excited:     ['Strawberry Milkshake', 'Mango Smoothie', 'Virgin Mojito', 'Bubble Tea'],
      sad:         ['Hot Chocolate', 'Masala Chai', 'Rose Milk', 'Lemon Ginger Honey Tea'],
      lonely:      ['Hot Chocolate', 'Rose Milk', 'Masala Chai', 'Lemon Ginger Honey Tea'],
      stressed:    ['Green Tea', 'Lemon Ginger Honey Tea', 'Coconut Water', 'Masala Chai'],
      anxious:     ['Green Tea', 'Coconut Water', 'Lemon Ginger Honey Tea', 'Rose Milk'],
      angry:       ['Coconut Water', 'Mint Lemon Cooler', 'Watermelon Juice', 'Green Tea'],
      tired:       ['Filter Coffee', 'Masala Chai', 'Lemon Ginger Honey Tea', 'Beetroot Juice'],
      relaxed:     ['Filter Coffee', 'Masala Chai', 'Green Tea', 'Rose Milk'],
      calm:        ['Green Tea', 'Masala Chai', 'Filter Coffee', 'Lemon Ginger Honey Tea'],
      romantic:    ['Rose Milk', 'Mango Lassi', 'Hot Chocolate', 'Strawberry Milkshake'],
      nostalgic:   ['Filter Coffee', 'Masala Chai', 'Rose Milk', 'Mango Lassi'],
      wellness:    ['Green Tea', 'Lemon Ginger Honey Tea', 'Coconut Water', 'Beetroot Juice'],
      overthinking:['Green Tea', 'Lemon Ginger Honey Tea', 'Coconut Water', 'Masala Chai'],
      summer:      ['Watermelon Juice', 'Mint Lemon Cooler', 'Coconut Water', 'Mango Smoothie'],
      rainy:       ['Masala Chai', 'Hot Chocolate', 'Lemon Ginger Honey Tea', 'Filter Coffee'],
      workout:     ['Beetroot Juice', 'Mango Smoothie', 'Coconut Water', 'Mango Lassi'],
      spicy:       ['Mint Lemon Cooler', 'Coconut Water', 'Mango Lassi', 'Watermelon Juice'],
      default:     ['Mango Lassi', 'Filter Coffee', 'Mint Lemon Cooler', 'Masala Chai'],
    };

    // Helper: pick a drink from DB list or local pool, varying by mood + seed string
    function pickDrink(dbDrinks: any[], moodKey: string, seedStr: string) {
      // 1. Try DB drinks first — filter by keyword match
      if (dbDrinks.length > 0) {
        const keywords = (moodDrinkMap[moodKey] || moodDrinkMap.default)
          .map(n => n.toLowerCase().split(' ')[0]); // first word as keyword
        const matched = dbDrinks.filter((d: any) =>
          keywords.some(k => (d.food_name || '').toLowerCase().includes(k))
        );
        if (matched.length > 0) {
          const hash = seedStr.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
          return matched[hash % matched.length];
        }
        // No keyword match — pick any DB drink by hash
        const hash = seedStr.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
        return dbDrinks[hash % dbDrinks.length];
      }
      // 2. Fall back to local pool, using mood map
      const preferred = (moodDrinkMap[moodKey] || moodDrinkMap.default)
        .map(name => localDrinkPool.find(d => d.food_name === name))
        .filter(Boolean) as any[];
      const src = preferred.length > 0 ? preferred : localDrinkPool;
      const hash = seedStr.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
      return src[hash % src.length];
    }

    let pairingDessert: any = null;
    let pairingDrink: any = null;
    let pairingMusic: any = null;

    let dessertReason = '';
    let drinkReason = '';
    let musicReason = '';

    if (intentName.includes('Summer Cooling')) {
      // Intent 1: Summer Cooling Foods
      pairingDessert = dessertsList.find((d: any) =>
        d.food_name.toLowerCase().includes('ice cream') ||
        d.food_name.toLowerCase().includes('kesari') ||
        d.food_name.toLowerCase().includes('jigarthanda') ||
        d.food_name.toLowerCase().includes('payasam') ||
        d.food_name.toLowerCase().includes('kulfi')
      ) || pickDessert(
        localDessertPool.filter(d => ['Jigarthanda','Mango Ice Cream','Kulfi'].includes(d.food_name)),
        localDessertPool,
        mood + 'summer'
      );
      dessertReason = 'A cold, creamy, and soothing dessert to keep you refreshed and instantly lower your body heat in this hot summer.';

      pairingDrink = pickDrink(formattedDrinks, 'summer', mood + 'summer');
      drinkReason = 'The ultimate summer quencher that hydrates, replaces vital electrolytes, and keeps your system perfectly cool.';

      const relaxingSongs = allSongs.filter(s => {
        const tags = Array.isArray(s.mood_tags) ? s.mood_tags.map((t: string) => t.toLowerCase()) : [];
        return tags.includes('relaxed') || tags.includes('calm') || s.genre?.toLowerCase() === 'melody';
      });
      pairingMusic = relaxingSongs.length > 0 ? relaxingSongs[Math.floor(Math.random() * relaxingSongs.length)] : allSongs[0];
      musicReason = 'A breezy, relaxing melody that flows like a cool wind, perfect for taking it easy on a hot day.';

    } else if (intentName.includes('Rainy') || intentName.includes('Spicy')) {
      // Intent 2: Rainy Day Spicy Comfort
      pairingDessert = dessertsList.find((d: any) =>
        d.food_name.toLowerCase().includes('gulab') ||
        d.food_name.toLowerCase().includes('halwa') ||
        d.food_name.toLowerCase().includes('kesari')
      ) || pickDessert(
        localDessertPool.filter(d => ['Gulab Jamun','Rava Kesari','Jalebi'].includes(d.food_name)),
        localDessertPool,
        mood + 'rainy'
      );
      dessertReason = 'Warm sweetness that acts as the ultimate comfort contrast to the cold, rainy weather and spicy meal.';

      pairingDrink = pickDrink(formattedDrinks, 'rainy', mood + 'rainy');
      drinkReason = 'A steaming hot cup of ginger tea to boost immunity, keep you warm, and complement the rain perfectly.';

      const cozySongs = allSongs.filter(s => {
        const tags = Array.isArray(s.mood_tags) ? s.mood_tags.map((t: string) => t.toLowerCase()) : [];
        return tags.includes('romantic') || tags.includes('relaxed') || s.genre?.toLowerCase() === 'melody';
      });
      pairingMusic = cozySongs.length > 0 ? cozySongs[Math.floor(Math.random() * cozySongs.length)] : allSongs[0];
      musicReason = 'Melodious Tamil romantic tunes that elevate the beautiful, atmospheric sound of rainfall.';

    } else if (intentName.includes('Muscle Recovery') || intentName.includes('Workout')) {
      // Intent 3: Post-Workout Recovery
      pairingDessert = dessertsList.find((d: any) =>
        d.food_name.toLowerCase().includes('cheesecake') ||
        d.food_name.toLowerCase().includes('brownie') ||
        d.food_name.toLowerCase().includes('yogurt')
      ) || pickDessert(
        localDessertPool.filter(d => ['Cheesecake Slice','Chocolate Brownie','Kulfi'].includes(d.food_name)),
        localDessertPool,
        mood + 'workout'
      );
      dessertReason = 'A clean, nutrient-rich sweet reward that supports muscle rebuilding without sugar crashes.';

      pairingDrink = pickDrink(formattedDrinks, 'workout', mood + 'workout');
      drinkReason = 'Packed with potassium and recovery minerals to soothe worked muscles and restore vital energy.';

      const motivSongs = allSongs.filter(s => {
        const tags = Array.isArray(s.mood_tags) ? s.mood_tags.map((t: string) => t.toLowerCase()) : [];
        return tags.includes('energetic') || tags.includes('happy') || tags.includes('excited') || s.genre?.toLowerCase() === 'kuthu';
      });
      pairingMusic = motivSongs.length > 0 ? motivSongs[Math.floor(Math.random() * motivSongs.length)] : allSongs[0];
      musicReason = 'High-tempo motivational Kuthu beats to keep your post-workout dopamine levels high!';

    } else if (mood === 'motivated') {
      // ── Motivated Mood Branch ────────────────────────────────────────
      // Pick energising, high-BPM songs (tagged energetic/happy/excited or kuthu genre)
      pairingDessert = dessertsList.find((d: any) =>
        d.food_name.toLowerCase().includes('brownie') ||
        d.food_name.toLowerCase().includes('cheesecake') ||
        d.food_name.toLowerCase().includes('kulfi')
      ) || pickDessert(
        localDessertPool.filter(d => ['Chocolate Brownie','Cheesecake Slice','Kulfi'].includes(d.food_name)),
        localDessertPool,
        mood + 'motivated'
      );
      dessertReason = 'A quick-energy sweet treat to fuel your hustle and keep your focus sharp.';

      pairingDrink = pickDrink(formattedDrinks, 'workout', mood + 'motivated');
      drinkReason = 'A power-packed energy drink to sustain your momentum and grind through the day.';

      // Prioritise: energetic > excited > happy > kuthu genre
      const powerSongs = allSongs.filter((s: any) => {
        const tags = Array.isArray(s.mood_tags) ? s.mood_tags.map((t: string) => t.toLowerCase()) : [];
        const genre = (s.genre || '').toLowerCase();
        return tags.includes('energetic') || tags.includes('excited') || tags.includes('motivated') ||
               genre === 'kuthu' || genre === 'hip hop' || genre === 'hip-hop' || genre === 'rap';
      });
      // If still empty, grab happy songs as the final safety net
      const songPool = powerSongs.length > 0
        ? powerSongs
        : allSongs.filter((s: any) => {
            const tags = Array.isArray(s.mood_tags) ? s.mood_tags.map((t: string) => t.toLowerCase()) : [];
            return tags.includes('happy');
          });
      const finalPool = songPool.length > 0 ? songPool : allSongs;
      pairingMusic = finalPool[Math.floor(Math.random() * finalPool.length)];
      musicReason = 'High-energy anthems to fire up your motivation and keep you in beast mode all day!';

    } else {
      // Default / Mood-based standard pipeline
      const mainName = (selectedMain?.food_name || '').toLowerCase();
      
      if (mainName.includes('biryani') || mainName.includes('chettinad') || mainName.includes('pepper') || mainName.includes('mutton') || mainName.includes('chicken') || mainName.includes('spicy')) {
        pairingDessert = dessertsList.find((d: any) =>
          d.food_name.toLowerCase().includes('gulab') ||
          d.food_name.toLowerCase().includes('jigarthanda') ||
          d.food_name.toLowerCase().includes('ice cream') ||
          d.food_name.toLowerCase().includes('kulfi')
        ) || pickDessert(
          localDessertPool.filter(d => ['Gulab Jamun','Jigarthanda','Mango Ice Cream','Kulfi'].includes(d.food_name)),
          localDessertPool,
          mainName + mood
        );
        dessertReason = 'Balances the spicy main course heat with rich sweet comfort.';

        pairingDrink = pickDrink(formattedDrinks, 'spicy', mainName + mood);
        drinkReason = 'Cooling citrus helps wash down the heavy spices and refresh the mouth.';

        const kuthuSongs = allSongs.filter((s: any) => s.genre?.toLowerCase() === 'kuthu' || matchesMood(s));
        pairingMusic = kuthuSongs.length > 0 ? kuthuSongs[Math.floor(Math.random() * kuthuSongs.length)] : allSongs[0];
        musicReason = 'Upbeat beats to complement the energetic, bold South Indian flavors.';

      } else {
        // Use DB desserts if available; otherwise rotate through the local pool based on mood
        pairingDessert = dessertsList.length > 0
          ? dessertsList[Math.abs(mood.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % dessertsList.length]
          : pickDessert([], localDessertPool, mood + mainName);
        dessertReason = 'A classic traditional touch to round off your meal.';

        pairingDrink = pickDrink(formattedDrinks, mood, mood + mainName);
        drinkReason = 'The chicory warmth perfectly closes a comforting meal.';

        let moodSongs = allSongs.filter(matchesMood);
        if (moodSongs.length === 0) moodSongs = allSongs;
        pairingMusic = moodSongs[Math.floor(Math.random() * moodSongs.length)];
        musicReason = `Soothing tunes that align with your current ${mood} mood state.`;
      }
    }

    const conversationalReply = geminiReply || generateFriendlyReply(rawInput, aiAnalysis);

    console.log(`[LOG] Recommendation generated`);

    // Ensure pairedDrink is always a complete valid object
    const mainNameForFallback = (selectedMain?.food_name || '').toLowerCase();
    const safePairedDrink = pairingDrink && pairingDrink.food_name ? {
      ...pairingDrink,
      matchReason: drinkReason
    } : {
      ...pickDrink(formattedDrinks, mood, mood + mainNameForFallback),
      matchReason: drinkReason || 'A perfectly matched drink to complement your mood and meal.'
    };

    const safePairingDessert = pairingDessert && pairingDessert.food_name ? {
      ...pairingDessert,
      matchReason: dessertReason
    } : {
      id: 'fallback-dessert-default',
      food_name: 'Rava Kesari',
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
      description: 'Traditional semolina ghee dessert with saffron and cardamom.',
      matchReason: dessertReason || 'A classic traditional touch to round off your meal.'
    };

    // Non-blocking history record with 1500ms timeout
    if (userId && selectedMain && selectedMain.id && pairingMusic && pairingMusic.id) {
      const foodIdNum = typeof selectedMain.id === 'number' ? selectedMain.id : 1;
      const songIdNum = typeof pairingMusic.id === 'number' ? pairingMusic.id : 1;

      withTimeout(
        supabase.from('recommendation_history').insert({
          user_id: userId,
          mood: mood,
          food_id: foodIdNum,
          song_id: songIdNum
        }),
        1500,
        { error: null } as any
      ).then(res => {
        if (res && (res as any).error) {
          console.warn('⚠️ Warning: Failed to insert recommendation history:', (res as any).error.message);
        } else {
          console.log('✅ Successfully logged recommendation to history for user:', userId);
        }
      }).catch(err => {
        console.warn('⚠️ Exception inserting history:', err);
      });

      // Always save to memory store for fallback guarantee
      memoryStore.addHistory({
        user_id: userId,
        mood: mood,
        food_id: foodIdNum,
        song_id: songIdNum,
        created_at: new Date().toISOString(),
        foods: selectedMain,
        songs: pairingMusic
      });
    }

    // Dynamically enrich song links using cache
    let enrichedMusic = null;
    if (pairingMusic) {
      let yt = pairingMusic.youtube_link;
      let sp = pairingMusic.spotify_link;
      
      try {
        if (fs.existsSync(enrichedJsonPath)) {
          const cache = JSON.parse(fs.readFileSync(enrichedJsonPath, 'utf-8'));
          const cacheKey = `${pairingMusic.song_name.toLowerCase()}_${(pairingMusic.artist || '').toLowerCase()}`;
          if (cache[cacheKey]) {
            yt = cache[cacheKey].youtube_link;
            sp = cache[cacheKey].spotify_link;
          }
        }
      } catch (e) {
        console.warn('⚠️ Cache error in recommendation route:', e);
      }

      enrichedMusic = {
        ...pairingMusic,
        youtube_link: yt,
        spotify_link: sp,
        matchReason: musicReason
      };
    }

    console.log(`[LOG] Response sent`);
    console.log('==================================================\n');

    res.json({
      mood,
      foods: selectedMain ? [{
        ...selectedMain,
        image: selectedMain.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800'
      }] : [],
      foodDessertPairings: {
        bestDessert: safePairingDessert
      },
      pairedDrink: safePairedDrink,
      songs: enrichedMusic ? [enrichedMusic] : [],
      isUnified: true,
      aiAnalysis,
      conversationalReply
    });

  } catch (error: any) {
    console.error('NLP Unified Recommendation Engine Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
