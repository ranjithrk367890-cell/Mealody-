import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { 
  User, Mail, Globe, Calendar, Activity, History, Star, 
  ShieldAlert, Sparkles, TrendingUp, Compass, ArrowRight, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResponsiveCardGrid from '../components/ResponsiveCardGrid';

interface HistoryItem {
  id: number;
  mood: string;
  created_at: string;
  foods?: { id: number; food_name: string; image: string; category?: string };
  songs?: { id: number; song_name: string; artist?: string; image?: string };
  dessert?: { id: number; food_name: string; image: string; category?: string };
  drink?: { id: number; food_name: string; image: string; category?: string };
}

interface UserProfile {
  name?: string;
  email?: string;
  language?: string;
  created_at?: string;
}

interface QuickStats {
  mostSelectedMood?: string;
  totalRecommendations?: number;
  likeCount?: number;
  dislikeCount?: number;
  favoritesCount?: number;
}

interface FavoriteItem {
  name: string;
  image: string;
}

interface FavoriteItems {
  food?: FavoriteItem | null;
  drink?: FavoriteItem | null;
  song?: FavoriteItem | null;
}

interface MoodAnalytic {
  mood: string;
  percentage: number;
}

interface MostRecommended {
  food?: FavoriteItem | null;
  drink?: FavoriteItem | null;
  song?: FavoriteItem | null;
}

interface RecentActivity {
  type: 'like' | 'dislike' | 'recommend';
  text: string;
  time: string;
}

interface DashboardPayload {
  userProfile?: UserProfile;
  quickStats?: QuickStats;
  favoriteItems?: FavoriteItems;
  moodAnalytics?: MoodAnalytic[];
  mostRecommended?: MostRecommended;
  recentActivity?: RecentActivity[];
  history?: HistoryItem[];
}

const UserDashboard = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await api.get(`/api/user/analytics?userId=${user.id}`);
        setData(res.data || {});
        setAllHistory(res.data?.history || []);
      } catch (err) {
        console.error('Failed to fetch dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, user]);

  const loadFullHistory = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/user/history?userId=${user.id}`);
      setAllHistory(res.data || []);
      setShowAllHistory(true);
    } catch (err) {
      console.error('Failed to fetch full history:', err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${formattedDate} - ${formattedTime}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getMoodEmoji = (mood?: string) => {
    const key = (mood || '').toLowerCase().trim();
    if (key.includes('happy') || key.includes('excited')) return '😊';
    if (key.includes('sad') || key.includes('lonely')) return '😢';
    if (key.includes('relax') || key.includes('calm')) return '😌';
    if (key.includes('stress') || key.includes('tire')) return '😰';
    if (key.includes('angry')) return '😡';
    return '😄';
  };

  // Safe fallback extractions
  const userProfile = {
    name: data?.userProfile?.name || user?.name || 'Mealody User',
    email: data?.userProfile?.email || user?.email || 'user@mealody.ai',
    language: data?.userProfile?.language || 'English',
    created_at: data?.userProfile?.created_at || new Date().toISOString(),
  };

  const quickStats = {
    mostSelectedMood: data?.quickStats?.mostSelectedMood || 'Happy',
    totalRecommendations: data?.quickStats?.totalRecommendations ?? 0,
    likeCount: data?.quickStats?.likeCount ?? 0,
    dislikeCount: data?.quickStats?.dislikeCount ?? 0,
    favoritesCount: data?.quickStats?.favoritesCount ?? 0,
  };

  const favoriteItems = {
    food: data?.favoriteItems?.food ?? null,
    drink: data?.favoriteItems?.drink ?? null,
    song: data?.favoriteItems?.song ?? null,
  };

  const mostRecommended = {
    food: data?.mostRecommended?.food ?? data?.favoriteItems?.food ?? null,
    drink: data?.mostRecommended?.drink ?? data?.favoriteItems?.drink ?? null,
    song: data?.mostRecommended?.song ?? data?.favoriteItems?.song ?? null,
  };

  const moodAnalytics = data?.moodAnalytics ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const historyList = data?.history && data.history.length > 0 ? data.history : allHistory;

  const hasHistory = quickStats.totalRecommendations > 0 || historyList.length > 0;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-6 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 border border-white/10 rounded-3xl flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
            <ShieldAlert className="w-10 h-10 text-yellow-400 animate-bounce" />
          </div>
          
          <h2 className="text-3xl font-black text-text-main font-heading leading-tight">
            Premium <span className="text-gradient">Dashboard Locked</span>
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Please log in to your premium Mealody AI account to unlock personalized recommendation tracking, flavor statistics, and music matching history.
          </p>
          
          <button
            onClick={() => navigate('/auth', { state: { from: '/dashboard' } })}
            className="w-full mt-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-cyan text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-cyan/25 transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Log In / Create Account
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
          <p className="text-text-muted text-xs font-bold tracking-widest uppercase animate-pulse">Assembling Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl font-black flex items-center text-text-main font-heading">
            <Activity className="w-10 h-10 mr-4 text-cyan animate-pulse" />
            Flavor <span className="text-gradient ml-3">Mind Space</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm max-w-2xl leading-relaxed">
            Explore your personalized mood metrics, flavor preferences, and premium recommendations aggregated in real-time.
          </p>
        </div>
        
        {hasHistory && (
          <button 
            onClick={() => navigate('/recommender')}
            className="self-start md:self-auto flex items-center gap-2 px-6 py-3 text-xs font-extrabold tracking-wider bg-white/5 hover:bg-white/10 text-text-main border border-white/10 rounded-2xl transition-all hover:scale-102 hover:border-primary/40 cursor-pointer"
          >
            Generate Recommendations
            <ArrowRight className="w-4 h-4 text-cyan" />
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: PROFILE & GENERAL STATS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* USER PROFILE CARD */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden backdrop-blur-xl group"
          >
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            
            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main leading-tight">{userProfile.name}</h3>
                <span className="text-[10px] font-black tracking-widest text-cyan uppercase bg-cyan/10 px-2 py-0.5 rounded">PREMIUM</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-muted truncate select-all">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-main font-semibold flex items-center gap-2">
                  {userProfile.language}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-muted">Member since {formatDate(userProfile.created_at)}</span>
              </div>
            </div>
          </motion.div>

          {/* QUICK STATS PANEL */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Metrics Overview
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Mood Card */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="glass-card p-4 rounded-2xl border border-white/5 hover:border-primary/20 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  😊 Top Mood
                </span>
                <div>
                  <span className="text-3xl font-black text-white flex items-center gap-1">
                    {hasHistory ? getMoodEmoji(quickStats.mostSelectedMood) : '—'}
                  </span>
                  <p className="text-xs text-text-muted font-bold truncate mt-1 capitalize">
                    {hasHistory ? quickStats.mostSelectedMood : 'No Mood logged'}
                  </p>
                </div>
              </motion.div>

              {/* Total Recs */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="glass-card p-4 rounded-2xl border border-white/5 hover:border-cyan/20 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">
                  🍔 Recommendations
                </span>
                <div>
                  <span className="text-3xl font-black text-gradient">
                    {quickStats.totalRecommendations}
                  </span>
                  <p className="text-xs text-text-muted font-semibold mt-1">Sessions generated</p>
                </div>
              </motion.div>

              {/* Likes */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="glass-card p-4 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-1">
                  ❤️ Likes
                </span>
                <div>
                  <span className="text-3xl font-black text-emerald-400">
                    {quickStats.likeCount}
                  </span>
                  <p className="text-xs text-text-muted font-semibold mt-1">Foods & Songs</p>
                </div>
              </motion.div>

              {/* Dislikes */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="glass-card p-4 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">
                  👎 Dislikes
                </span>
                <div>
                  <span className="text-3xl font-black text-rose-400">
                    {quickStats.dislikeCount}
                  </span>
                  <p className="text-xs text-text-muted font-semibold mt-1">Skipped or disliked</p>
                </div>
              </motion.div>

              {/* Favorites count */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="col-span-2 glass-card p-4 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Favorites Saved
                  </span>
                  <p className="text-xs text-text-muted font-semibold mt-1">Total items saved in library</p>
                </div>
                <span className="text-3xl font-black text-yellow-400 mr-2">
                  {quickStats.favoritesCount}
                </span>
              </motion.div>
            </div>
          </div>

          {/* MOOD ANALYTICS VIEW */}
          {hasHistory && moodAnalytics.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 rounded-3xl border border-white/10 space-y-5"
            >
              <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2 mb-2">
                😊 Mood Analytics
              </h3>
              
              <div className="space-y-4">
                {moodAnalytics.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-text-main">
                      <span className="flex items-center gap-1.5">
                        {getMoodEmoji(item.mood)} {item.mood}
                      </span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          item.mood.toLowerCase().includes('happy') ? 'from-green-400 to-emerald-500' :
                          item.mood.toLowerCase().includes('relax') ? 'from-cyan-400 to-teal-400' :
                          item.mood.toLowerCase().includes('sad') ? 'from-blue-400 to-indigo-500' :
                          'from-purple-400 to-fuchsia-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* MAIN CONTENT: RECS HISTORY, FAVORITES & ACTIVITY */}
        <div className="lg:col-span-8 space-y-8">
          
          {!hasHistory ? (
            /* COMPACT FRIENDLY EMPTY STATE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-6 justify-center min-h-[450px]"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/10 to-cyan/20 flex items-center justify-center text-primary-light animate-pulse border border-primary/20">
                <Compass className="w-12 h-12 text-cyan" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-black text-text-main font-heading">Start exploring recommendations</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Mealody AI keeps track of your selected moods, favorite foods, songs, and preferences. Get your first customized culinary-music recommendation to build your dashboard!
                </p>
              </div>
              
              <button
                onClick={() => navigate('/recommender')}
                className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-103 transition-transform cursor-pointer"
              >
                Get First Recommendation
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            /* REAL HISTORICAL DATA EXISTS */
            <>
              {/* FAVORITES & MOST RECOMMENDED ROW */}
              <ResponsiveCardGrid itemCount={2} className="mb-8">
                
                {/* FAVORITE ITEMS PANEL */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 h-full flex flex-col justify-between"
                >
                  <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2 mb-2">
                    ⭐ Favorite Items
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Top Food */}
                    {favoriteItems?.food ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={favoriteItems.food.image} alt={favoriteItems.food.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-primary-light uppercase">TOP FOOD</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5">{favoriteItems.food.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Favorite Food Yet</div>
                    )}
                    
                    {/* Top Drink */}
                    {favoriteItems?.drink ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={favoriteItems.drink.image} alt={favoriteItems.drink.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-cyan uppercase">TOP DRINK</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5">{favoriteItems.drink.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Favorite Drink Yet</div>
                    )}
                    
                    {/* Top Song */}
                    {favoriteItems?.song ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={favoriteItems.song.image} alt={favoriteItems.song.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-secondary uppercase">TOP SONG</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5 truncate max-w-[150px]">{favoriteItems.song.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Favorite Song Yet</div>
                    )}
                  </div>
                </motion.div>

                {/* MOST RECOMMENDED */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 h-full flex flex-col justify-between"
                >
                  <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2 mb-2">
                    🔥 Most Recommended
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Food */}
                    {mostRecommended?.food ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={mostRecommended.food.image} alt={mostRecommended.food.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-primary-light uppercase">MOST FREQUENT FOOD</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5">{mostRecommended.food.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Data Available</div>
                    )}

                    {/* Drink */}
                    {mostRecommended?.drink ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={mostRecommended.drink.image} alt={mostRecommended.drink.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-cyan uppercase">MOST SUGGESTED DRINK</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5">{mostRecommended.drink.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Data Available</div>
                    )}

                    {/* Song */}
                    {mostRecommended?.song ? (
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors">
                        <img src={mostRecommended.song.image} alt={mostRecommended.song.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-secondary uppercase">MOST FREQUENT SONG</span>
                          <h4 className="text-sm font-bold text-text-main leading-tight mt-0.5 truncate max-w-[150px]">{mostRecommended.song.name}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-text-muted bg-white/5 rounded-2xl">No Data Available</div>
                    )}
                  </div>
                </motion.div>
              </ResponsiveCardGrid>

              {/* RECOMMENDATION HISTORY TABLE */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan" /> Latest Recommendations ({Math.min(10, historyList.length)})
                  </h3>
                  
                  {!showAllHistory && historyList.length > 5 && (
                    <button 
                      onClick={loadFullHistory}
                      className="text-xs font-bold text-cyan hover:text-cyan-light flex items-center gap-1 group transition-colors cursor-pointer"
                    >
                      View All History 
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-wider text-text-muted font-black">
                        <th className="py-4 px-6">Mood</th>
                        <th className="py-4 px-6">Food (Main Course)</th>
                        <th className="py-4 px-6">Dessert</th>
                        <th className="py-4 px-6">Drink</th>
                        <th className="py-4 px-6">Music & Melody</th>
                        <th className="py-4 px-6 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-semibold">
                      {(showAllHistory ? historyList : historyList.slice(0, 10)).map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          {/* Mood */}
                          <td className="py-4 px-6 font-bold capitalize text-text-main">
                            <span className="mr-1.5">{getMoodEmoji(item.mood)}</span>
                            {item.mood}
                          </td>
                          {/* Food */}
                          <td className="py-4 px-6">
                            {item.foods ? (
                              <div className="flex items-center gap-2.5">
                                <img src={item.foods.image} alt={item.foods.food_name} className="w-9 h-9 rounded-lg object-cover shadow" />
                                <span className="text-text-main text-xs truncate max-w-[120px]">{item.foods.food_name}</span>
                              </div>
                            ) : '—'}
                          </td>
                          {/* Dessert */}
                          <td className="py-4 px-6">
                            {item.dessert ? (
                              <div className="flex items-center gap-2.5">
                                <img src={item.dessert.image} alt={item.dessert.food_name} className="w-9 h-9 rounded-lg object-cover shadow" />
                                <span className="text-text-main text-xs truncate max-w-[120px]">{item.dessert.food_name}</span>
                              </div>
                            ) : '—'}
                          </td>
                          {/* Drink */}
                          <td className="py-4 px-6">
                            {item.drink ? (
                              <div className="flex items-center gap-2.5">
                                <img src={item.drink.image} alt={item.drink.food_name} className="w-9 h-9 rounded-lg object-cover shadow" />
                                <span className="text-text-main text-xs truncate max-w-[120px]">{item.drink.food_name}</span>
                              </div>
                            ) : '—'}
                          </td>
                          {/* Music */}
                          <td className="py-4 px-6">
                            {item.songs ? (
                              <div className="flex items-center gap-2.5">
                                <img src={item.songs.image} alt={item.songs.song_name} className="w-9 h-9 rounded-lg object-cover shadow" />
                                <div className="leading-tight">
                                  <p className="text-text-main text-xs truncate max-w-[120px]">{item.songs.song_name}</p>
                                  <span className="text-[10px] text-text-muted">{item.songs.artist}</span>
                                </div>
                              </div>
                            ) : '—'}
                          </td>
                          {/* Date Time */}
                          <td className="py-4 px-6 text-right text-[11px] text-text-muted whitespace-nowrap">
                            {formatDateTime(item.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* RECENT ACTIVITY & UPDATES */}
              {recentActivity.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-6 rounded-3xl border border-white/10 space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-main/80 tracking-widest uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" /> Recent Activity
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentActivity.map((activity, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-inner ${
                          activity.type === 'like' ? 'bg-gradient-to-tr from-emerald-500/20 to-green-500/20 text-emerald-400' :
                          activity.type === 'dislike' ? 'bg-gradient-to-tr from-rose-500/20 to-red-500/20 text-rose-400' :
                          'bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan'
                        }`}>
                          {activity.type === 'like' ? '❤️' : activity.type === 'dislike' ? '👎' : '🤖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-main truncate">{activity.text}</p>
                          <span className="text-[10px] text-text-muted mt-0.5 block">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
