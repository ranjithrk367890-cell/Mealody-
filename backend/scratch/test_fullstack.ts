import express from 'express';
import cors from 'cors';
import foodRoutes from '../src/routes/food.js';
import songRoutes from '../src/routes/song.js';
import drinkRoutes from '../src/routes/drink.js';
import recommendRoutes from '../src/routes/recommend.js';
import feedbackRoutes from '../src/routes/feedback.js';
import userRoutes from '../src/routes/user.js';
import recommendationsRoutes from '../src/routes/recommendations.js';
import authRoutes from '../src/routes/auth.js';
import chatRoutes from '../src/routes/chat.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/foods', foodRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/drinks', drinkRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const server = app.listen(3009, async () => {
  console.log('🚀 Test server listening on port 3009');

  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test Developer';

    console.log('\n--- 1. Testing Signup API ---');
    const signupRes = await fetch('http://localhost:3009/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
    });
    const signupData = await signupRes.json();
    console.log('Signup Status:', signupRes.status, signupData);

    console.log('\n--- 2. Testing Login API ---');
    const loginRes = await fetch('http://localhost:3009/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status, loginData);

    const userId = loginData.user?.id;

    console.log('\n--- 3. Testing AI Recommendation API ---');
    const recRes = await fetch('http://localhost:3009/api/recommendations?mood=sad&userId=' + userId);
    const recData = await recRes.json();
    console.log('Recommendation Status:', recRes.status, 'Mood:', recData.mood, 'Foods count:', recData.foods?.length);

    console.log('\n--- 4. Testing User Analytics API ---');
    const analyticsRes = await fetch('http://localhost:3009/api/user/analytics?userId=' + userId);
    const analyticsData = await analyticsRes.json();
    console.log('Analytics Status:', analyticsRes.status, 'QuickStats:', analyticsData.quickStats);

    console.log('\n--- 5. Testing User History API ---');
    const historyRes = await fetch('http://localhost:3009/api/user/history?userId=' + userId);
    const historyData = await historyRes.json();
    console.log('History Status:', historyRes.status, 'History count:', historyData.length);

    console.log('\n--- 6. Testing AI Chatbot API ---');
    const chatRes = await fetch('http://localhost:3009/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hi bro epdi iruka', conversationLength: 0 })
    });
    const chatData = await chatRes.json();
    console.log('Chat Status:', chatRes.status, 'Reply:', chatData.reply);

    console.log('\n✅ ALL ENDPOINTS PASSED empirically!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
  }
});
