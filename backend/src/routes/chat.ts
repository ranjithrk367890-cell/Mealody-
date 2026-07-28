import { Router, Request, Response } from 'express';
import { detectLanguage } from '../utils/recommendationEngine.js';

const router = Router();

// ─── Greeting / chitchat patterns ──────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hey|hello|hlo|hii|hai|haii|yo|sup|wassup|what'?s up|howdy)\b/i,
  /^(vanakkam|vana|ayyo|machan|macha|machi|da|bro|anna|akka)\b/i,
  /^(good (morning|evening|night|afternoon))\b/i,
  /^(how are you|how r u|how r ya|how are ya|epdi iruka|epdi|eppadi)\b/i,
  /^(who are you|what are you|nee yaaru|enna panna mudiyum)\b/i,
  /^(thanks|thank you|nandri|super|ok|okay|cool|nice|great|wow|semma|enna)\b/i,
  /^(what can you do|help)\b/i,
];

const MOOD_KEYWORDS = [
  'happy','sad','angry','excited','stressed','relaxed','lonely','tired','motivated','love',
  'hungry','food','eat','sapdanum','sapadu','sapta','vendum','feel','feeling','mood',
  'gym','workout','rain','summer','hot','cold','hurt','cry','down','bored',
  'happy ah','sad ah','tired ah','semma','romba','konjam','irukan','iruken',
  'unmaiya','actually','today','inniku','ippo',
];

function isGreeting(text: string): boolean {
  const lower = text.toLowerCase().trim();
  // If any mood keyword found — it's NOT a pure greeting → wants recommendations
  const hasMoodKeyword = MOOD_KEYWORDS.some(kw => lower.includes(kw));
  if (hasMoodKeyword) return false;
  // Check greeting patterns
  return GREETING_PATTERNS.some(p => p.test(lower));
}

function isChitchat(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const hasMoodKeyword = MOOD_KEYWORDS.some(kw => lower.includes(kw));
  return !hasMoodKeyword && text.trim().length < 80;
}

// Friendly bilingual reply bank
const GREETING_REPLIES: Record<string, string[]> = {
  ENGLISH: [
    "Heyy! 😄 Great to see you here! How are you feeling today? Tell me your vibe and I'll recommend the perfect food + music for you! 🍔🎵",
    "Hi there, friend! 👋 I'm Mealody AI, your personal food & music AI. How's your day going? Share your mood and let's get started! ✨",
    "Hello! 🌟 I'm here to make your day better with the right food and music. So tell me — how are you feeling right now?",
  ],
  TANGLISH: [
    "Hii broo! 😄 Epdi iruka? Today mood epdi iruku? Sollu, unga vibe-ku perfect food + music suggest pannuven! 🍔🎵",
    "Ayyo machan welcome! 👋 Na Mealody AI — un mood paarutu best food and songs suggest pannuveen. Today epdi pochu? Solunga! 🌟",
    "Heyy broo! 😎 Ithu Mealody AI. Nee epdi feel panra nu sollu, na unga feeling ku semma food and vibe ready pannuven! ✨",
  ],
  TAMIL: [
    "வணக்கம் நண்பா! 😄 இன்னைக்கு நீங்க எப்படி feel பண்றீங்க? உங்க மூட் சொல்லுங்க, perfect food & music suggest பண்றேன்! 🍔🎵",
    "ஹாய்! 👋 நான் Mealody AI. உங்க mood-க்கு ஏத்த உணவும் இசையும் suggest பண்றேன். இன்னைக்கு எப்படி இருக்கீங்க? ✨",
  ],
  MIXED: [
    "Hii broo! 😄 Epdi iruka? Today mood epdi iruku? Sollu, unga vibe-ku perfect food + music suggest pannuven! 🍔🎵",
  ],
};

const FOLLOW_UP_REPLIES: Record<string, string[]> = {
  ENGLISH: [
    "Got it! 😊 Now tell me — how are you actually feeling right now? Are you happy, sad, stressed, motivated...? I'll tailor everything just for you! 🎯",
    "Nice talking to you! 😄 So what's the vibe today? Feeling happy? Tired? Hungry for something specific? Tell me and I'll sort you out! 🍽️",
    "Haha, I'm doing great! 😎 I'm Mealody AI — your AI buddy for food and music. Now your turn — how's YOUR day going? 🌟",
  ],
  TANGLISH: [
    "Semma machan! 😄 Now sollu — ippo actually epdi iruka? Happy ah? Sad ah? Tired ah? Un mood sollu, na perfect food & music suggest pannuven! 🎯",
    "Nice da bro! 😎 Na Mealody AI — un mood-ku semma food and songs ready pannuven. So inniki un vibe epdi iruku? 🌟",
    "Ayyo bromantic 😂! Seri da, serious-a sollu — today epdi feel panra? Na support panna ready irukken! 🍔🎵",
  ],
  TAMIL: [
    "சரி நண்பா! 😊 இப்போ சொல்லுங்க — இன்னைக்கு எப்படி feel பண்றீங்க? Happy-ஆ? Sad-ஆ? Stressed-ஆ? சொல்லுங்க, perfect food & music ready! 🎯",
    "நல்லா நண்பா! 😄 இப்போ உங்க turn — inniki எப்படி இருக்கீங்க? சொல்லுங்க! 🌟",
  ],
  MIXED: [
    "Semma machan! 😄 Now sollu — ippo actually epdi iruka? Happy ah? Sad ah? Tired ah? Un mood sollu, na perfect food & music suggest pannuven! 🎯",
  ],
};

const UNKNOWN_REPLIES: Record<string, string[]> = {
  ENGLISH: [
    "I'm all ears! 😊 Tell me how you're feeling — are you happy, sad, stressed, excited, tired? Share your mood and I'll recommend perfect food & music! 🍔🎵",
    "Hmm, I didn't quite catch that 🤔. But no worries! Just tell me your mood or what you're feeling right now and I'll take care of the rest! ✨",
  ],
  TANGLISH: [
    "Machan konjam puriyala 😅, but paravailla! Un mood epdi iruku nu sollu — happy, sad, tired, motivated... Edhuvum seri, na support pannuven! 🍔🎵",
    "Bro clear-a sollu da 😄! Ippo un feel epdi iruku? Na correct food + music suggest pannuven! ✨",
  ],
  TAMIL: [
    "நண்பா கொஞ்சம் புரியல 😅, ஆனா பரவாயில்லை! இப்போ எப்படி feel பண்றீங்க? சொல்லுங்க, I've got you! 🍔🎵",
  ],
  MIXED: [
    "Machan konjam puriyala 😅, but paravailla! Un mood epdi iruku nu sollu — happy, sad, tired, motivated... Edhuvum seri, na support pannuven! 🍔🎵",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post('/', (req: Request, res: Response) => {
  const { message = '', conversationLength = 0 } = req.body;
  const text = (message as string).trim();

  if (!text) {
    return res.json({
      reply: "Hey! 😄 Tell me how you're feeling and I'll suggest perfect food & music for you!",
      isChatOnly: true,
      askMood: true,
    });
  }

  const lang = detectLanguage(text);
  const replyBank = (bank: Record<string, string[]>) =>
    pickRandom(bank[lang] || bank['TANGLISH']);

  // 1. Pure greeting → warm welcome
  if (isGreeting(text)) {
    return res.json({
      reply: replyBank(GREETING_REPLIES),
      isChatOnly: true,
      askMood: true,
    });
  }

  // 2. Chitchat with no mood signal → follow-up / nudge
  if (isChitchat(text) && conversationLength > 0) {
    return res.json({
      reply: replyBank(FOLLOW_UP_REPLIES),
      isChatOnly: true,
      askMood: true,
    });
  }

  // 3. Unknown short input at start of conv
  if (text.length < 15 && conversationLength === 0) {
    return res.json({
      reply: replyBank(UNKNOWN_REPLIES),
      isChatOnly: true,
      askMood: true,
    });
  }

  // 4. Has mood signal → tell frontend to fetch recommendations
  return res.json({
    reply: null,
    isChatOnly: false,
    askMood: false,
  });
});

export default router;
