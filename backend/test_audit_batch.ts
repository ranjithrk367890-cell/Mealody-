import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || '';

async function test() {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const songs = [
    { id: 980, song_name: "Kaadhal Endrum Iravu", artist: "Deva", genre: "Melody" },
    { id: 981, song_name: "Mazhai Kanne Vaa", artist: "Illaiyaraaja", genre: "Jazz" },
    { id: 982, song_name: "Sollamale Sollamale", artist: "Santhosh Narayanan", genre: "Kuthu" },
    { id: 983, song_name: "Unnale Vaanam Pagal", artist: "Yuvan Shankar Raja", genre: "Classical" },
    { id: 984, song_name: "Vaa Endrum Mounam", artist: "Yuvan Shankar Raja", genre: "Kuthu" }
  ];

  const songListText = songs.map((s, index) => `${index + 1}. ID: ${s.id} | Song Name: "${s.song_name}" | Artist: "${s.artist || 'Unknown'}" | Genre: "${s.genre || ''}"`).join('\n');

  const prompt = `You are a music catalog expert specializing in Indian cinema (specifically Tamil cinema).
For the following list of songs, find the official or most popular YouTube watch link (in the format: https://www.youtube.com/watch?v=...) and the official Spotify track link (in the format: https://open.spotify.com/track/...).

Rules:
1. Ensure the links are correct and match the song and artist.
2. Return ONLY a valid JSON array of objects. Do not include any markdown backticks or explanations.
3. Each object in the array MUST have the fields: "id" (number), "youtube_link" (string), and "spotify_link" (string).

Song List:
${songListText}
`;

  try {
    console.log('Sending prompt to Gemini...');
    const response = await model.generateContent(prompt);
    console.log('Response text:', response.response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
