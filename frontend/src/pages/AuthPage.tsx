import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [infoBanner, setInfoBanner] = useState('');
  
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from || '/recommender';

  const validateForm = () => {
    if (!isLogin && !name.trim()) {
      setError('Full Name is required');
      return false;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoBanner('');
    
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = isLogin ? 'login' : 'signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await api.post(`/api/auth/${endpoint}`, payload);
      login(res.data.user, res.data.token);
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Auth error:', err);
      const isNotFound = isLogin && (
        err.response?.status === 404 ||
        err.response?.data?.notFound ||
        (err.response?.data?.error && err.response.data.error.includes('User account not found'))
      );

      if (isNotFound) {
        // Auto-redirect user to Sign Up mode seamlessly!
        setIsLogin(false);
        if (!name.trim()) {
          const derivedName = email.split('@')[0];
          setName(derivedName.charAt(0).toUpperCase() + derivedName.slice(1));
        }
        setInfoBanner("No account was found with this email. We've automatically switched you to Sign Up — click 'Create My Account' to complete registration!");
      } else {
        const displayMsg = err.response?.data?.error || err.userMessage || 'Authentication failed. Please check your credentials.';
        setError(displayMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col justify-center items-center relative overflow-hidden bg-bg-dark">
      {/* Background Orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Promo / Aesthetics */}
        <div className="lg:col-span-6 space-y-6 text-left p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary-light border border-primary/25 tracking-widest uppercase inline-block mb-3">
              ⚡ MEALODY AI PLATFORM
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-theme-title font-heading tracking-tight leading-none">
              Mealody <span className="text-gradient">AI</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-theme-desc max-w-md leading-relaxed"
          >
            "Your Mood. Your Meal. Your Melody. — Discover foods, drinks &amp; music that match your vibe."
          </motion.p>

          {/* Features Preview Icons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4 pt-4 max-w-md"
          >
            {[
              { emoji: '🍔', title: 'Food Recommendations', desc: 'Savor main course dishes' },
              { emoji: '🍰', title: 'Dessert Pairings', desc: 'Indulge your sweet tooth' },
              { emoji: '🥤', title: 'Drink Pairings', desc: 'Refresh with top mocktails' },
              { emoji: '🎵', title: 'Music Mood Pairings', desc: 'Vibe with Tamil playlists' }
            ].map((feat, index) => (
              <div key={index} className="glass-card p-4 border-white/5 bg-white/[0.02] rounded-2xl flex flex-col items-start gap-1">
                <span className="text-3xl mb-1">{feat.emoji}</span>
                <span className="text-sm font-bold text-text-main">{feat.title}</span>
                <span className="text-[11px] text-text-muted">{feat.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Beautiful Glassmorphism Card Forms */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card w-full max-w-md p-8 border-white/10 shadow-[0_20px_50px_rgba(170,59,255,0.15)] relative overflow-hidden backdrop-blur-2xl"
          >
            {/* Header Switch Tabs */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black text-text-main font-heading">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-xs font-bold text-primary-light hover:text-cyan transition-colors uppercase tracking-wider"
              >
                {isLogin ? 'Sign Up Instead' : 'Login Instead'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {infoBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-cyan animate-pulse" />
                  <span>{infoBanner}</span>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-4 h-4 text-text-muted/65" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-main outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-text-muted/65" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-main outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-text-muted/65" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-sm text-text-main outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <span className="text-[10px] text-text-muted/70 block mt-1">Minimum 8 characters containing letters or symbols</span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_rgba(170,59,255,0.4)] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Login to Mealody AI' : 'Create My Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Separator / Guest Option */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-text-muted uppercase tracking-widest font-black">Or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuest}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-main py-3.5 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-2"
            >
              <span>Explore as Guest User</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan animate-pulse" />
            </motion.button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
