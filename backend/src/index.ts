import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import foodRoutes from './routes/food.js';
import songRoutes from './routes/song.js';
import drinkRoutes from './routes/drink.js';
import recommendRoutes from './routes/recommend.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/user.js';
import recommendationsRoutes from './routes/recommendations.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for cross-origin requests
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Standard API Routes under /api/*
app.use('/api/foods', foodRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/drinks', drinkRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Helper function to preserve query string when rewriting req.url
function passWithQuery(targetPath: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const qIndex = req.url.indexOf('?');
    const queryStr = qIndex !== -1 ? req.url.slice(qIndex) : '';
    req.url = targetPath + queryStr;
    next();
  };
}

// Root Endpoint Wrappers for maximum compatibility with all legacy & audit endpoints
app.post('/signup', passWithQuery('/signup'), authRoutes);
app.post('/login', passWithQuery('/login'), authRoutes);
app.get('/foods', passWithQuery('/'), foodRoutes);
app.get('/trending', passWithQuery('/trending'), foodRoutes);
app.get('/dashboard', passWithQuery('/analytics'), userRoutes);
app.get('/favorites', passWithQuery('/favorites'), userRoutes);
app.get('/history', passWithQuery('/history'), userRoutes);
app.post('/recommend', passWithQuery('/'), recommendRoutes);
app.post('/mood-analysis', passWithQuery('/mood-analysis'), recommendRoutes);
app.post('/chat', passWithQuery('/'), chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mealody AI API is running on port ' + PORT });
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found on Mealody AI API` });
});

app.listen(PORT, () => {
  console.log(`🚀 Mealody AI Express Server running on port ${PORT}`);
});
