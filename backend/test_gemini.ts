import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || '';
console.log('API Key length:', geminiApiKey.length);

async function test() {
  try {
    console.log('Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    console.log('Getting model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Generating content...');
    const result = await model.generateContent('Say hello in 5 words');
    console.log('Result:', result.response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
