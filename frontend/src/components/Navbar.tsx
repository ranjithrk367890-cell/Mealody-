import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, Sun, Moon, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, isGuest, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Recommender', path: '/recommender' },
    { name: 'Trending Foods 🍲', path: '/foods' },
    ...(isLoggedIn ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
  ];

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed w-full z-50 top-0 left-0 px-4 md:px-6 py-4"
      >
        <div className="glass-card max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src="/logo.png" alt="Mealody AI Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-heading font-bold text-gradient tracking-wider">
              Mealody <span className="text-text-main">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors duration-300 hover:text-text-main ${isActive ? 'text-text-main' : 'text-text-muted'}`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-light shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-text-main/10 hover:bg-text-main/20 border border-text-main/20 transition-all duration-300 text-text-main flex items-center justify-center cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown or Login Button */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center text-sm border-2 border-white/20 hover:border-cyan/50 transition-all shadow-md cursor-pointer select-none"
                >
                  {getInitials(user.name)}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 glass-card border border-white/10 p-4 shadow-2xl z-20 flex flex-col gap-2.5 backdrop-blur-xl"
                      >
                        <div className="border-b border-white/5 pb-2.5 mb-1 text-left">
                          <p className="text-sm font-black text-text-main truncate">{user.name}</p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <UserIcon className="w-4 h-4 text-cyan" />
                          <span>My Dashboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 text-sm text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer text-left font-bold"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Logout Session</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-5 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/15 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Login / Unlock ✨</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_15px_rgba(170,59,255,0.4)] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-text-main p-1 hover:bg-text-main/10 rounded-lg transition-colors cursor-pointer"
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[72px] left-0 right-0 z-40 px-4 md:hidden overflow-hidden"
          >
            <div className="glass-card border border-text-main/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/20 text-text-main border border-primary/30'
                        : 'text-text-muted hover:text-text-main hover:bg-text-main/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              {!isLoggedIn && (
                <button
                  onClick={() => { navigate('/auth'); setMobileOpen(false); }}
                  className="mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold text-center cursor-pointer"
                >
                  Try AI Recommender ✨
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

