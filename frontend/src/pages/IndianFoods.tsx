import { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../components/FoodCard';
import ResponsiveCardGrid from '../components/ResponsiveCardGrid';
import { UtensilsCrossed, AlertCircle, RefreshCw, Sparkles, TrendingUp, Flame } from 'lucide-react';

interface Food {
  id: number;
  food_name: string;
  category: string;
  image: string;
  spice_level: number;
  mood: string;
  region?: string;
  trendingScore?: number;
  type?: string;
}

const categoryFilters = [
  { label: '🔥 Trending Foods', value: 'trending', emoji: '🔥', description: 'Top 10–15 most popular culinary highlights.' },
  { label: '🍛 Main Courses', value: 'main_course', emoji: '🍛', description: 'Full meal dishes only. Hearty, satisfying meals and thalis.' },
  { label: '🥟 Savory Snacks', value: 'snack', emoji: '🥟', description: 'Savory snacks only. Golden, crispy golden bites.' },
  { label: '🍰 Sweet Delights', value: 'dessert', emoji: '🍰', description: 'Traditional desserts, sweets, and chilled sweet creations.' },
  { label: '🥗 Light Starters', value: 'starter', emoji: '🥗', description: 'Delectable appetizers and starters served before the main course.' },
  { label: '🥤 Beverages', value: 'beverage', emoji: '🥤', description: 'Thirst-quenching beverages, chilled drinks, and filter coffee.' },
];

const IndianFoods = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [visibleLimit, setVisibleLimit] = useState<number>(15);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const [foodsRes, drinksRes] = await Promise.all([
        api.get('/api/foods'),
        api.get('/api/drinks')
      ]);
      
      // Calculate active scores for all items to sort by trending dynamically
      const today = new Date().getDate();
      const scoredFoods = foodsRes.data.map((f: any) => {
        const itemSeed = today + (f.id * 777);
        const pseudoRand = ((itemSeed * 9301 + 49297) % 233280) / 233280;
        return {
          ...f,
          type: 'food',
          trendingScore: Math.floor(pseudoRand * 500) + 100
        };
      });

      const scoredDrinks = drinksRes.data.map((d: any) => {
        const itemSeed = today + (d.id * 888);
        const pseudoRand = ((itemSeed * 9301 + 49297) % 233280) / 233280;
        return {
          ...d,
          food_name: d.drink_name || d.food_name,
          category: d.category || 'beverage',
          type: 'drink',
          trendingScore: Math.floor(pseudoRand * 500) + 100
        };
      });

      setFoods([...scoredFoods, ...scoredDrinks]);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError('Could not connect to the backend database. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Reset limit when category changes
  useEffect(() => {
    setVisibleLimit(15);
  }, [selectedCategory]);

  // Compute all matching items for the selected category
  const getAllCategoryItems = () => {
    if (selectedCategory === 'trending') {
      return [...foods]
        .filter(f => f.type !== 'drink' && (f.category || '').toLowerCase() !== 'beverage')
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    }
    return foods.filter(f => (f.category || '').toLowerCase() === selectedCategory.toLowerCase());
  };

  const allCategoryItems = getAllCategoryItems();
  
  // Slice to visible limit (10-15 only by default)
  const filteredFoods = allCategoryItems.slice(0, visibleLimit);
  const activeFilterInfo = categoryFilters.find(f => f.value === selectedCategory);



  return (
    <div className="min-h-screen pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden bg-bg-dark">
      {/* Visual background lights */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/15 to-cyan/15 border border-cyan/20 text-cyan px-5 py-2 rounded-full mb-6 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <UtensilsCrossed className="w-4 h-4 text-orange-400" />
          Mealody AI Food Gallery
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white leading-tight">
          Explore Golden <span className="text-gradient font-extrabold">Cuisines</span>
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          Sift through our curated catalog of handpicked dishes and refreshing drinks. Filter by category to discover your perfect culinary match!
        </p>

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 max-w-4xl mx-auto">
          {categoryFilters.map((filter) => {
            const isActive = selectedCategory === filter.value;

            return (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(filter.value)}
                className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex items-center gap-2.5 shadow-md relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500/25 to-pink-500/25 border-orange-500 text-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.25)]' 
                    : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-text-main'}`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Dynamic description box for current active category */}
      {activeFilterInfo && !loading && !error && (
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card max-w-4xl mx-auto mb-10 p-6 rounded-3xl border border-white/5 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              {selectedCategory === 'trending' ? <Flame className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">{activeFilterInfo.label}</h3>
              <p className="text-text-muted text-sm font-medium">{activeFilterInfo.description}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-black text-text-main uppercase tracking-widest shrink-0">
            📊 Foods
          </div>
        </motion.div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center h-80 relative z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-orange-500 border-b-transparent rounded-full animate-spin opacity-60" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-80 gap-4 text-center relative z-10"
        >
          <AlertCircle className="w-14 h-14 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
          <p className="text-red-400 text-lg font-bold max-w-md">{error}</p>
          <button
            onClick={fetchFoods}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-text-main/10 hover:bg-text-main/20 border border-text-main/20 text-sm font-black text-text-main transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </motion.div>
      )}

      {/* Dynamic foods grid */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          <div className="flex flex-col gap-12 w-full">
            <ResponsiveCardGrid 
              key={selectedCategory}
              className="relative z-10"
              itemCount={filteredFoods.length}
            >
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food, index) => (
                  <motion.div
                    key={`${selectedCategory}-${food.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full flex"
                  >
                    <div className="w-full h-full flex flex-col items-stretch">
                      <FoodCard
                        foodName={food.food_name}
                        category={food.category}
                        image={food.image}
                        spiceLevel={food.spice_level}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-text-muted font-bold text-lg w-full">
                  No culinary items found in the "{activeFilterInfo?.label}" category.
                </div>
              )}
            </ResponsiveCardGrid>

            {/* Load More Button if there are remaining matches */}
            {allCategoryItems.length > visibleLimit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleLimit(prev => prev + 15)}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-orange-500/10 to-cyan/10 border border-white/10 hover:border-cyan/50 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:text-cyan transition-all"
              >
                <TrendingUp className="w-4 h-4" /> Load More Masterpieces
              </motion.button>
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default IndianFoods;
