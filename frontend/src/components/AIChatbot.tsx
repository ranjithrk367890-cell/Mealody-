import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Music, UtensilsCrossed } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  foods?: { food_name: string; image: string; category: string }[];
  songs?: { song_name: string; movie_name: string; mood: string; image: string }[];
}

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Vanakkam! 🙏 How are you feeling today? Tell me your mood, and I will find the perfect food and music for you.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    document.addEventListener('openChatbot', handleOpenChatbot);
    return () => document.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Call backend recommend endpoint using central api client
      const [recRes, songsRes, foodsRes] = await Promise.all([
        api.post('/api/recommend', { text: currentInput, userId: user?.id }),
        api.get('/api/songs'),
        api.get('/api/foods')
      ]);

      const recData = recRes.data;
      const allSongs: any[] = songsRes.data;
      const allFoods: any[] = foodsRes.data;

      const matchedFoods = allFoods.filter(f => f.type === 'food' && recData.recommended_foods?.includes(f.id)).slice(0, 2);
      const matchedSongs = allSongs.filter(s => s.type === 'song' && recData.recommended_songs?.includes(s.id)).slice(0, 2);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: recData.reply || "I've found something perfect for your mood!",
        foods: matchedFoods,
        songs: matchedSongs,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry da, I'm having trouble connecting right now. Make sure the backend is running! 🙏",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, rotate: -5 }}
            transition={{ type: 'spring' as const, damping: 20, stiffness: 260 }}
            className="fixed bottom-8 right-8 w-96 h-[36rem] glass-card z-50 flex flex-col overflow-hidden border border-text-main/20 shadow-2xl rounded-3xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-secondary to-cyan p-4 flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-text-main/20 flex items-center justify-center relative shadow-inner">
                  <Sparkles className="w-5 h-5 text-text-main animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-bg-dark" />
                </div>
                <div>
                  <h3 className="text-text-main font-extrabold font-heading text-sm tracking-wide">Mealody AI Assistant</h3>
                  <p className="text-text-main/70 text-[10px] tracking-wider font-semibold">ONLINE · REAL-TIME AI</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-text-main/80 hover:text-text-main transition-colors hover:bg-white/15 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-dark/80 scrollbar-none">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-tr-sm'
                        : 'bg-text-main/10 text-text-muted border border-white/5 rounded-tl-sm backdrop-blur-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Mini Food & Song Cards with Slide-in Transition */}
                    {msg.sender === 'ai' && (msg.foods?.length || msg.songs?.length) ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3 w-full space-y-2"
                      >
                        {msg.foods?.map((food, i) => (
                          <motion.div 
                            whileHover={{ scale: 1.03, x: 5 }}
                            key={i} 
                            className="flex items-center gap-3 bg-text-main/5 hover:bg-text-main/10 border border-text-main/10 rounded-2xl p-2.5 backdrop-blur-md cursor-pointer transition-all"
                          >
                            <img src={food.image} alt={food.food_name} className="w-11 h-11 rounded-xl object-cover shadow-md" />
                            <div>
                              <p className="text-xs font-bold text-text-main leading-tight">{food.food_name}</p>
                              <p className="text-[10px] text-cyan mt-1 flex items-center gap-1">
                                <UtensilsCrossed className="w-3 h-3" />
                                {food.category}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        {msg.songs?.map((song, i) => (
                          <motion.div 
                            whileHover={{ scale: 1.03, x: 5 }}
                            key={i} 
                            className="flex items-center gap-3 bg-text-main/5 hover:bg-text-main/10 border border-text-main/10 rounded-2xl p-2.5 backdrop-blur-md cursor-pointer transition-all"
                          >
                            <img src={song.image} alt={song.song_name} className="w-11 h-11 rounded-xl object-cover shadow-md" />
                            <div>
                              <p className="text-xs font-bold text-text-main leading-tight">{song.song_name}</p>
                              <p className="text-[10px] text-secondary mt-1 flex items-center gap-1">
                                <Music className="w-3 h-3" />
                                {song.movie_name}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : null}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-text-main/10 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex space-x-2 items-center backdrop-blur-md">
                    <span className="text-xs text-text-muted mr-1 animate-pulse">Thinking</span>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-cyan" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-cyan" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips with sequential slide-in */}
            <div className="px-3 py-2 bg-bg-dark/95 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              {['I feel stressed 😓', 'Happy vibes 😊', 'Suggest music 🎵', 'Need energy ⚡'].map((s, idx) => (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs text-text-muted bg-white/5 border border-white/10 rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-gradient-to-r hover:from-primary/20 hover:to-cyan/20 hover:border-primary/40 hover:text-white transition-all duration-300"
                >
                  {s}
                </motion.button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-bg-dark/95 border-t border-text-main/10 backdrop-blur-md shrink-0">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your mood..."
                  className="w-full bg-text-main/5 border border-text-main/10 rounded-full pl-5 pr-14 py-3.5 text-sm text-text-main placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
