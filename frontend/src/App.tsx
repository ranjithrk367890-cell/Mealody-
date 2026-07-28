import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import Footer from './components/Footer';
import { SpotifyPlayerProvider } from './context/SpotifyPlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

import LandingPage from './pages/LandingPage';
import AIRecommender from './pages/AIRecommender';
import TamilSongs from './pages/TamilSongs';
import IndianFoods from './pages/IndianFoods';
import UserDashboard from './pages/UserDashboard';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SpotifyPlayerProvider>
            <div className="min-h-screen flex flex-col relative overflow-hidden">
              <Navbar />
              <main className="flex-grow z-10">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/recommender" element={<AIRecommender />} />
                  <Route path="/songs" element={<TamilSongs />} />
                  <Route path="/foods" element={<IndianFoods />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </main>
              <Footer />
              <AIChatbot />
            </div>
          </SpotifyPlayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

