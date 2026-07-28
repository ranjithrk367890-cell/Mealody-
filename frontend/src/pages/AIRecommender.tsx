import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Sparkles, Mic, Search, Menu, MessageSquare, Trash2, Plus, PanelLeft, PanelLeftClose, Lock as LockIcon } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import { useAuth } from '../context/AuthContext';

interface ChatHistoryItem {
  id: string;
  moodInput: string;
  timestamp: number;
  result: RecommendResponse;
}

interface RecommendResponse {
  mood: string;
  foods: any[];
  drinks: any[]; // legacy
  pairedDrink?: any;
  foodDessertPairings?: {
    bestDessert: any;
  };
  drinksTab?: {
    trending: any[];
    moodSuggested: any[];
    explore: any[];
  };
  songs: any[];
  conversationalReply?: string;
  aiAnalysis?: {
    detectedIntent: string;
    confidence: number;
    reason: string;
    weather?: string;
    season?: string;
    cravings?: string;
  };
}

const moodCategories = [
  { name: 'Happy 😊',     value: 'happy',     color: 'from-green-400 to-emerald-500' },
  { name: 'Sad 😔',       value: 'sad',        color: 'from-blue-400 to-indigo-500' },
  { name: 'Love ❤️',      value: 'love',       color: 'from-pink-400 to-rose-500' },
  { name: 'Relaxed 😌',   value: 'relaxed',    color: 'from-teal-300 to-cyan-500' },
  { name: 'Stressed 😰',  value: 'stressed',   color: 'from-purple-400 to-fuchsia-500' },
  { name: 'Angry 😡',     value: 'angry',      color: 'from-red-500 to-orange-500' },
  { name: 'Excited 🤩',   value: 'excited',    color: 'from-yellow-400 to-amber-500' },
  { name: 'Lonely 🥺',    value: 'lonely',     color: 'from-slate-400 to-gray-600' },
  { name: 'Motivated 💪', value: 'motivated',  color: 'from-orange-400 to-red-500' },
  { name: 'Tired 😴',     value: 'tired',      color: 'from-indigo-300 to-purple-400' },
];

import { getValidatedImage } from '../utils/imageValidation';

const moodBackgrounds: Record<string, string> = {
  happy:     'from-amber-500/20 via-orange-500/10 to-transparent',
  energetic: 'from-orange-500/20 via-red-500/10 to-transparent',
  excited:   'from-yellow-400/20 via-amber-500/10 to-transparent',
  calm:      'from-cyan-400/20 via-blue-500/10 to-transparent',
  relaxed:   'from-teal-300/20 via-emerald-500/10 to-transparent',
  sad:       'from-blue-600/20 via-indigo-900/10 to-transparent',
  lonely:    'from-slate-500/20 via-gray-700/10 to-transparent',
  stressed:  'from-purple-500/20 via-fuchsia-900/10 to-transparent',
  angry:     'from-red-600/20 via-orange-900/10 to-transparent',
  motivated: 'from-emerald-500/20 via-teal-900/10 to-transparent',
  tired:     'from-indigo-500/20 via-slate-900/10 to-transparent',
  love:      'from-pink-500/20 via-rose-900/10 to-transparent',
};

const AIRecommender = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [selectedMood,   setSelectedMood]   = useState((location.state as any)?.initialMood || '');
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState<RecommendResponse | null>(null);
  const [chatReply,      setChatReply]      = useState<string | null>(null); // friendly-only reply
  const [error,          setError]          = useState('');
  const [moodInput,      setMoodInput]      = useState('');
  const [activeTab,      setActiveTab]      = useState<'foods' | 'drinks' | 'music'>('foods');
  const [history,        setHistory]        = useState<ChatHistoryItem[]>([]);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [msgCount,       setMsgCount]       = useState(0); // track conversation length for chat route

  const { isLoggedIn, user } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount (only for logged-in users)
  useEffect(() => {
    if (!isLoggedIn) { setHistory([]); return; }
    const saved = localStorage.getItem('mealody_chat_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (_) {}
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (error || activeTab) { /* referenced */ }
  }, [error, activeTab]);

  // Scroll chat area into view when chat reply appears
  useEffect(() => {
    if (chatReply || result) {
      setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [chatReply, result]);

  const currentBg = moodBackgrounds[selectedMood as keyof typeof moodBackgrounds] || 'from-primary/10 via-bg-dark to-transparent';

  const handleAnalyze = () => {
    if (!moodInput.trim()) return;
    handleInput(moodInput);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Try Chrome!');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMoodInput(transcript);
      handleInput(transcript);
    };
    recognition.start();
  };

  useEffect(() => {
    const initialMood = (location.state as any)?.initialMood;
    if (initialMood) handleInput(initialMood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Main input handler ─────────────────────────────────────────────────────
  const handleInput = async (rawText: string) => {
    if (!rawText) return;
    const text = rawText.trim();
    setMoodInput('');
    setSelectedMood(text);
    setLoading(true);
    setResult(null);
    setChatReply(null);
    setError('');
    setActiveTab('foods');

    try {
      // Step 1: check if it's a greeting / chitchat
      const chatRes = await api.post('/api/chat', {
        message: text,
        conversationLength: msgCount,
      });
      setMsgCount(c => c + 1);

      const { reply, isChatOnly } = chatRes.data;

      if (isChatOnly) {
        // Pure conversation — show only the AI reply bubble
        setChatReply(reply);
        setLoading(false);
        return;
      }

      // Step 2: has mood signal → fetch full recommendations
      const url = user?.id
        ? `/api/recommendations?mood=${encodeURIComponent(text)}&userId=${user.id}`
        : `/api/recommendations?mood=${encodeURIComponent(text)}`;
      const res = await api.get(url);
      setResult(res.data);
      setSelectedMood(res.data.mood || text);

      // Save to history only if logged in
      if (isLoggedIn) {
        const newItem: ChatHistoryItem = {
          id: Date.now().toString(),
          moodInput: text,
          timestamp: Date.now(),
          result: res.data,
        };
        setHistory(prev => {
          const updated = [newItem, ...prev];
          localStorage.setItem('mealody_chat_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Recommendation failed:', err);
      setError(err.response?.data?.error || 'Could not connect to the recommendation engine. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // mood chip quick-select goes straight to recommendations (skip chat check)
  const handleMoodChip = (moodValue: string) => {
    handleRecommend(moodValue);
  };

  const handleRecommend = async (moodValue: string) => {
    if (!moodValue) return;
    setMoodInput('');
    setSelectedMood(moodValue);
    setLoading(true);
    setResult(null);
    setChatReply(null);
    setError('');
    setActiveTab('foods');

    try {
      const url = user?.id
        ? `/api/recommendations?mood=${encodeURIComponent(moodValue)}&userId=${user.id}`
        : `/api/recommendations?mood=${encodeURIComponent(moodValue)}`;
      const res = await api.get(url);
      setResult(res.data);
      setSelectedMood(res.data.mood || moodValue);

      if (isLoggedIn) {
        const newItem: ChatHistoryItem = {
          id: Date.now().toString(),
          moodInput: moodValue,
          timestamp: Date.now(),
          result: res.data,
        };
        setHistory(prev => {
          const updated = [newItem, ...prev];
          localStorage.setItem('mealody_chat_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Recommendation failed:', err);
      setError('Could not connect to the recommendation engine. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, x: -50 },
    show:   { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 50, damping: 12 } },
  };

  const loadHistoryItem = (item: ChatHistoryItem) => {
    setResult(item.result);
    setChatReply(null);
    setSelectedMood(item.result.mood);
    setMoodInput(item.moodInput);
    setActiveTab('foods');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('mealody_chat_history', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="flex min-h-screen pt-20 bg-bg-dark">
      {/* Dynamic Immersive Background */}
      <AnimatePresence>
        <motion.div
          key={selectedMood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={`fixed inset-0 bg-gradient-to-b ${currentBg} pointer-events-none z-0`}
        />
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ChatGPT Style Sidebar */}
      <aside className={`fixed top-20 bottom-0 left-0 z-50 w-72 bg-bg-dark/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:flex p-2 hover:bg-text-main/10 rounded-xl transition-colors text-text-muted hover:text-text-main shrink-0"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setResult(null);
              setChatReply(null);
              setSelectedMood('');
              setMoodInput('');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="flex-1 flex items-center justify-start gap-3 bg-text-main/5 hover:bg-text-main/10 text-text-main px-4 py-3 rounded-xl transition-all font-bold group"
          >
            <Plus className="w-5 h-5 text-cyan group-hover:rotate-90 transition-transform duration-300" /> New Journey
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="px-2 pb-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            Mealody AI Chats History
          </div>
          {history.length === 0 ? (
            <p className="text-text-muted text-sm text-center mt-8 px-4">Your mood journeys will appear here.</p>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                onClick={() => loadHistoryItem(item)}
                className={`group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border ${result && item.id === history.find(h => h.result === result)?.id ? 'bg-white/10 border-cyan/30' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="w-4 h-4 text-cyan/70 shrink-0" />
                  <span className="text-sm text-text-main/90 truncate">{item.moodInput}</span>
                </div>
                <button
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-text-muted transition-all p-1.5 rounded-md hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 relative w-full h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>

        {/* Desktop Open Sidebar Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-24 left-6 z-40 hidden md:flex p-2.5 bg-bg-dark/80 backdrop-blur-md border border-text-main/10 hover:bg-text-main/20 rounded-xl transition-all shadow-lg group"
            title="Open sidebar"
          >
            <PanelLeft className="w-5 h-5 text-text-muted group-hover:text-text-main" />
          </button>
        )}

        <div className="pt-8 pb-24 px-4 md:px-12 max-w-5xl mx-auto relative z-10 flex flex-col items-center">

          {/* Mobile Hamburger */}
          <div className="w-full flex md:hidden justify-start mb-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-text-main/5 hover:bg-text-main/10 transition-colors rounded-xl border border-text-main/10">
              <Menu className="w-6 h-6 text-text-main" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-center w-full mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
              How are you feeling <span className="text-gradient">today?</span>
            </h1>

            {/* Interactive neon-outlined input box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl relative group mx-auto mb-12"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan rounded-full blur-md opacity-25 group-focus-within:opacity-75 transition-opacity duration-300" />
              <div className="relative glass-card rounded-full flex items-center p-2.5 border border-text-main/20 shadow-2xl backdrop-blur-xl">
                <Search className="w-6 h-6 text-cyan ml-4 shrink-0" />
                <input
                  type="text"
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Say anything... 'hi bro', 'I feel happy', 'gym mudichu vanthen'..."
                  className="flex-grow bg-transparent border-none outline-none px-4 py-3.5 text-text-main placeholder-text-muted/70 focus:ring-0 min-w-0 text-lg"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoice}
                  className="bg-text-main/10 hover:bg-primary/20 p-3 rounded-full transition-colors mr-2"
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3.5 rounded-full font-bold shadow-lg"
                >
                  Analyze
                </motion.button>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              {moodCategories.map((mood, idx) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleMoodChip(mood.value)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${selectedMood === mood.value ? 'bg-text-main text-bg-dark border-text-main shadow-[0_0_20px_rgba(var(--color-primary),0.3)]' : 'bg-text-main/5 border-text-main/10 text-text-main hover:bg-text-main/10'}`}
                >
                  {mood.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ── Responses area ──────────────────────────────────────────── */}
          <div ref={chatScrollRef} className="w-full" />

          <AnimatePresence mode="wait">

            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 border-t-4 border-cyan rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-2 border-b-4 border-primary rounded-full opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <p className="text-xl font-medium text-cyan animate-pulse">Thinking...</p>
              </motion.div>
            )}

            {/* ── Chat-only reply (greeting / chitchat) ─────────────────── */}
            {chatReply && !loading && (
              <motion.div
                key="chat-reply"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl mx-auto space-y-6 mt-6"
              >
                {/* User bubble */}
                <div className="flex items-start gap-4 justify-end w-full">
                  <div className="glass-card bg-cyan/10 p-5 rounded-3xl rounded-tr-none border border-cyan/30 text-right text-lg font-medium text-text-main max-w-[85%] shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <p>{selectedMood}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-xl shrink-0 shadow-lg select-none">
                    👤
                  </div>
                </div>

                {/* AI reply bubble */}
                <div className="flex items-start gap-4 justify-start w-full">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xl shrink-0 shadow-lg select-none">
                    🤖
                  </div>
                  <div className="glass-card bg-primary/10 p-5 rounded-3xl rounded-tl-none border border-primary/30 text-left text-lg font-medium text-text-main max-w-[85%] shadow-[0_0_20px_rgba(var(--color-primary),0.15)]">
                    <p className="leading-relaxed whitespace-pre-line">{chatReply}</p>
                  </div>
                </div>

                {/* Hint to pick a mood */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-sm text-text-muted mt-2"
                >
                  ↑ Pick a mood chip above or type how you feel to get food & music!
                </motion.p>
              </motion.div>
            )}

            {/* ── Full recommendation result (old timeline UI) ────────── */}
            {result && !loading && (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full flex flex-col gap-12 mt-10"
              >

                {/* Dynamic Heading */}
                <motion.div variants={timelineItemVariants} className="text-center space-y-4">
                  <span className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(6,182,212,0.15)] inline-block">
                    Your Harmonized Companion Journey
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black text-theme-title drop-shadow-xl">
                    Tailored Especially for <span className="text-gradient">Your Vibe</span>
                  </h2>
                  <p className="text-theme-desc text-base max-w-xl mx-auto font-medium leading-relaxed">
                    Here's a curated selection designed to perfectly match your feelings, cravings, and elevate your day.
                  </p>
                </motion.div>

                {/* Chat-style conversation container */}
                <div className="w-full max-w-2xl mx-auto space-y-6 mb-8 relative z-10">
                  {/* 👤 User Message Bubble */}
                  <motion.div variants={timelineItemVariants} className="flex items-start gap-4 justify-end w-full">
                    <div className="glass-card bg-cyan/10 p-5 rounded-3xl rounded-tr-none border border-cyan/30 text-right text-lg font-medium text-text-main max-w-[85%] relative shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                      <p className="relative z-10">{selectedMood}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-xl shrink-0 shadow-lg select-none">
                      👤
                    </div>
                  </motion.div>

                  {/* 🤖 AI Response Bubble */}
                  {result.conversationalReply && (
                    <motion.div variants={timelineItemVariants} className="flex items-start gap-4 justify-start w-full">
                      <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xl shrink-0 shadow-lg select-none">
                        🤖
                      </div>
                      <div className="glass-card bg-primary/10 p-5 rounded-3xl rounded-tl-none border border-primary/30 text-left text-lg font-medium text-text-main max-w-[85%] relative shadow-[0_0_20px_rgba(var(--color-primary),0.15)]">
                        <p className="relative z-10 leading-relaxed italic">
                          "{result.conversationalReply}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Connected Vertical Timeline Journey */}
                <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">

                  {/* Glowing Connector Track */}
                  <div className="absolute top-24 bottom-24 left-12 md:left-1/2 md:-translate-x-1/2 w-[4px] h-[calc(100%-12rem)] z-0 hidden sm:block">
                    <div className="w-full h-full bg-white/5 rounded-full" />
                    <motion.div
                      className="absolute top-0 left-0 w-full bg-gradient-to-b from-orange-500 via-pink-500 via-cyan-500 to-purple-500 rounded-full"
                      initial={{ height: '0%' }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                      style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.7), 0 0 25px rgba(6, 182, 212, 0.7)' }}
                    />
                  </div>

                  <div className="w-full space-y-24 relative z-10">

                    {/* STEP 1: 🍔 RECOMMENDED FOOD */}
                    {result.foods && result.foods[0] && (
                      <motion.div variants={timelineItemVariants} className="relative flex flex-col md:flex-row items-stretch gap-8 w-full">
                        <div className="absolute -left-3 sm:left-7 md:left-1/2 md:-translate-x-1/2 top-8 z-20 w-10 h-10 rounded-full bg-orange-500 border-4 border-bg-dark flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.6)]">1</div>
                        <div className="w-full md:pr-12 md:text-right md:w-1/2 flex flex-col justify-center items-start md:items-end order-2 md:order-1">
                          <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-2 block">Step One</span>
                          <h3 className="text-3xl font-black text-theme-title mb-3">🍔 Main Food Course</h3>
                          <p className="text-theme-desc text-sm font-medium leading-relaxed max-w-sm md:text-right text-left">
                            A grounding, delicious main dish tailored perfectly to satisfy your cravings and match your emotional energy level.
                          </p>
                        </div>
                        <div className="w-full md:pl-12 md:w-1/2 order-3 md:order-2 pl-8 sm:pl-20 md:pl-12">
                          <RecommendationCard
                            key={`food-main-${result.foods[0].id}`}
                            id={result.foods[0].id}
                            type="food"
                            title={result.foods[0].food_name}
                            subtitle={result.foods[0].category || 'Main Course'}
                            image={getValidatedImage('food', result.foods[0].image, result.foods[0].food_name, result.foods[0].category)}
                            description={result.foods[0].description}
                            matchReason={result.foods[0].matchReason}
                            delay={0.1}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: 🍰 BEST PAIRING DESSERT */}
                    {result.foodDessertPairings && result.foodDessertPairings.bestDessert && (
                      <motion.div variants={timelineItemVariants} className="relative flex flex-col md:flex-row items-stretch gap-8 w-full">
                        <div className="absolute -left-3 sm:left-7 md:left-1/2 md:-translate-x-1/2 top-8 z-20 w-10 h-10 rounded-full bg-pink-500 border-4 border-bg-dark flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]">2</div>
                        <div className="w-full md:pl-12 md:w-1/2 order-2 flex flex-col justify-center items-start pl-8 sm:pl-20 md:pl-12">
                          <span className="text-xs font-black text-pink-400 uppercase tracking-[0.2em] mb-2 block">Step Two</span>
                          <h3 className="text-3xl font-black text-theme-title mb-3">🍰 Best Pairing Dessert</h3>
                          <p className="text-theme-desc text-sm font-medium leading-relaxed max-w-sm">
                            A curated sweet delight that cleanses the palate and beautifully complements the savory profiles of your main dish.
                          </p>
                        </div>
                        <div className="w-full md:pr-12 md:w-1/2 order-3 md:order-1 pl-8 sm:pl-20 md:pr-12 md:pl-0 relative group">
                          {!isLoggedIn ? (
                            <div className="absolute inset-0 z-20 bg-bg-dark/85 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                              <div className="p-3 bg-pink-500/10 rounded-full border border-pink-500/30">
                                <LockIcon className="w-6 h-6 text-pink-400" />
                              </div>
                              <h4 className="text-sm font-black text-text-main">Dessert Locked 🔒</h4>
                              <p className="text-[11px] text-text-muted max-w-xs leading-normal">Login to unlock Drinks, Desserts and Music Recommendations.</p>
                              <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md cursor-pointer mt-1">Unlock Recommendation</button>
                            </div>
                          ) : null}
                          <RecommendationCard
                            key={`food-dessert-${result.foodDessertPairings.bestDessert.id}`}
                            id={result.foodDessertPairings.bestDessert.id}
                            type="food"
                            title={result.foodDessertPairings.bestDessert.food_name}
                            subtitle={result.foodDessertPairings.bestDessert.category || 'Dessert'}
                            image={getValidatedImage('food', result.foodDessertPairings.bestDessert.image, result.foodDessertPairings.bestDessert.food_name, result.foodDessertPairings.bestDessert.category)}
                            description={result.foodDessertPairings.bestDessert.description}
                            matchReason={result.foodDessertPairings.bestDessert.matchReason}
                            delay={0.3}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: 🥤 BEST MATCHING DRINK */}
                    {result.pairedDrink && (
                      <motion.div variants={timelineItemVariants} className="relative flex flex-col md:flex-row items-stretch gap-8 w-full">
                        <div className="absolute -left-3 sm:left-7 md:left-1/2 md:-translate-x-1/2 top-8 z-20 w-10 h-10 rounded-full bg-cyan-500 border-4 border-bg-dark flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]">3</div>
                        <div className="w-full md:pr-12 md:text-right md:w-1/2 flex flex-col justify-center items-start md:items-end order-2 md:order-1">
                          <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-2 block">Step Three</span>
                          <h3 className="text-3xl font-black text-theme-title mb-3">🥤 Best Matching Drink</h3>
                          <p className="text-theme-desc text-sm font-medium leading-relaxed max-w-sm md:text-right text-left">
                            A fresh, thirst-quenching drink crafted to enrich your meal experience, balancing spice and sweetness.
                          </p>
                        </div>
                        <div className="w-full md:pl-12 md:w-1/2 order-3 md:order-2 pl-8 sm:pl-20 md:pl-12 relative group">
                          {!isLoggedIn ? (
                            <div className="absolute inset-0 z-20 bg-bg-dark/85 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                              <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                                <LockIcon className="w-6 h-6 text-cyan" />
                              </div>
                              <h4 className="text-sm font-black text-text-main">Beverage Locked 🔒</h4>
                              <p className="text-[11px] text-text-muted max-w-xs leading-normal">Login to unlock Drinks, Desserts and Music Recommendations.</p>
                              <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md cursor-pointer mt-1">Unlock Recommendation</button>
                            </div>
                          ) : null}
                          <RecommendationCard
                            key={`food-drink-${result.pairedDrink.id}`}
                            id={result.pairedDrink.id}
                            type="food"
                            title={result.pairedDrink.food_name}
                            subtitle={result.pairedDrink.category || 'Beverage'}
                            image={getValidatedImage('food', result.pairedDrink.image, result.pairedDrink.food_name, result.pairedDrink.category)}
                            description={result.pairedDrink.description}
                            matchReason={result.pairedDrink.matchReason}
                            delay={0.5}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: 🎵 RECOMMENDED MUSIC */}
                    {result.songs && result.songs[0] && (
                      <motion.div variants={timelineItemVariants} className="relative flex flex-col md:flex-row items-stretch gap-8 w-full">
                        <div className="absolute -left-3 sm:left-7 md:left-1/2 md:-translate-x-1/2 top-8 z-20 w-10 h-10 rounded-full bg-purple-500 border-4 border-bg-dark flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]">4</div>
                        <div className="w-full md:pl-12 md:w-1/2 order-2 flex flex-col justify-center items-start pl-8 sm:pl-20 md:pl-12">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-2 block">Step Four</span>
                          <h3 className="text-3xl font-black text-theme-title mb-3">🎵 Recommended Music</h3>
                          <p className="text-theme-desc text-sm font-medium leading-relaxed max-w-sm">
                            The absolute perfect auditory pairing. Elevates your sensory dining experience and perfectly mirrors your emotions.
                          </p>
                        </div>
                        <div className="w-full md:pr-12 md:w-1/2 order-3 md:order-1 pl-8 sm:pl-20 md:pr-12 md:pl-0 relative group">
                          {!isLoggedIn ? (
                            <div className="absolute inset-0 z-20 bg-bg-dark/85 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                              <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/30">
                                <LockIcon className="w-6 h-6 text-purple-400" />
                              </div>
                              <h4 className="text-sm font-black text-text-main">Music Playlist Locked 🔒</h4>
                              <p className="text-[11px] text-text-muted max-w-xs leading-normal">Login to unlock Drinks, Desserts and Music Recommendations.</p>
                              <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-md cursor-pointer mt-1">Unlock Recommendation</button>
                            </div>
                          ) : null}
                          <RecommendationCard
                            key={`music-song-${result.songs[0].id}`}
                            id={result.songs[0].id}
                            type="music"
                            title={result.songs[0].song_name}
                            subtitle={`${result.songs[0].artist} • ${result.songs[0].genre}`}
                            image={getValidatedImage('music', result.songs[0].image)}
                            matchReason={result.songs[0].matchReason}
                            youtubeLink={result.songs[0].youtube_link}
                            spotifyLink={result.songs[0].spotify_link}
                            delay={0.7}
                          />
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>

                {/* Reset Journey */}
                <motion.button
                  variants={timelineItemVariants}
                  onClick={() => {
                    setResult(null);
                    setChatReply(null);
                    setSelectedMood('');
                    setMoodInput('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mx-auto mt-16 px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 hover:border-cyan/50 hover:text-cyan transition-all text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-3 shadow-lg"
                >
                  <RefreshCcw className="w-4 h-4 animate-spin-slow" /> Start a New Journey
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AIRecommender;
