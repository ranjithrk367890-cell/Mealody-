import { Food, Song } from '../config/mockData.js';

export interface AIAnalysis {
  detectedIntent: string;
  confidence: number;
  reason: string;
  mood: string;
  weather?: string;
  season?: string;
  cravings?: string;
}

export interface UnifiedRecommendationResponse {
  mood: string;
  foods: any[];
  foodDessertPairings: {
    bestDessert: any;
  };
  pairedDrink: any;
  songs: any[];
  isUnified: boolean;
  aiAnalysis: AIAnalysis;
  conversationalReply: string;
}

// Semantic dictionaries for NLU
const INTENT_PATTERNS = {
  summer_cooling: {
    name: 'Summer Cooling Foods',
    mood: 'relaxed',
    weather: 'sunny/hot',
    season: 'summer',
    cravings: 'cooling & refreshing',
    keywords: [
      'summer', 'cool', 'cold', 'fresh', 'hot weather', 'sun', 'refreshing', 'cooling', 
      'veyil', 'kulirchi', 'adhigam veyil', 'romba adhigam', 'kulirchiyana', 'juice', 
      'drink', 'cooler', 'ice cream', 'buttermilk', 'curd rice', 'tender coconut', 
      'watermelon', 'elaneer', 'payasam', 'jigarthanda', 'lassi', 'smoothie'
    ],
    searchTerms: ['curd', 'fruit', 'salad', 'ice cream', 'lassi', 'juice', 'cooler', 'smoothie', 'watermelon', 'coconut', 'buttermilk', 'jigarthanda', 'elaneer']
  },
  rainy_spicy: {
    name: 'Rainy Day Spicy Comfort',
    mood: 'energetic',
    weather: 'rainy/cold',
    season: 'monsoon',
    cravings: 'spicy & warming',
    keywords: [
      'rain', 'rainy', 'monsoon', 'drizzle', 'spicy', 'hot', 'masala', 'pepper', 'kara', 
      'kaara', 'sapdanum', 'bajji', 'pakoda', 'biryani', 'soup', 'chicken 65', 'pepper chicken', 
      'kulir', 'winter', 'cold day', 'rain ah', 'mazhai', 'weather ku', 'vibe'
    ],
    searchTerms: ['biryani', 'chettinad', 'pepper', 'mutton', 'chicken', 'spicy', 'tikka', 'kebab', 'curry', 'masala', 'fry', 'soup']
  },
  gym_protein: {
    name: 'Post-Workout Muscle Recovery',
    mood: 'motivated',
    weather: 'neutral',
    season: 'any',
    cravings: 'high protein & recovery',
    keywords: [
      'gym', 'workout', 'protein', 'muscle', 'exercise', 'fitness', 'chicken breast', 'egg', 
      'omelette', 'paneer', 'smoothie', 'vanthen', 'mudichu', 'training', 'lift', 'gym mudichu', 
      'post workout', 'protein shake', 'tofu'
    ],
    searchTerms: ['chicken', 'egg', 'paneer', 'tofu', 'mutton', 'protein', 'fish', 'prawn']
  },
  sad_comfort: {
    name: 'Emotional Comfort & Mood Uplift',
    mood: 'sad',
    weather: 'neutral',
    season: 'any',
    cravings: 'comforting & sweet',
    keywords: [
      'sad', 'low', 'depressed', 'sogam', 'kavalai', 'sad ah', 'cry', 'upset', 
      'hurt', 'comfort', 'bad day', 'depressing'
    ],
    searchTerms: ['rice', 'dosa', 'pongal', 'pasta', 'pizza', 'sandwich', 'vada', 'samosa', 'gulab', 'brownie', 'kesari', 'kheer']
  }
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ['happy', 'joy', 'great', 'awesome', 'good', 'celebrat', 'thrilled', 'wonderful', 'amazing', 'delighted', 'santhosham', 'magizhchi'],
  excited: ['excited', 'hype', 'pumped', 'thrilled', 'woo', 'yay', 'fire', 'lit'],
  sad: ['sad', 'down', 'cry', 'blue', 'upset', 'hurt', 'heartbroken', 'gloomy', 'sorrowful', 'melancholic', 'sogama', 'sogam', 'kavalai'],
  stressed: ['stress', 'stressed', 'tense', 'overwhelmed', 'frazzled', 'worried', 'tension'],
  relaxed: ['relaxed', 'calm', 'peaceful', 'serene', 'tranquil', 'centered', 'grounded', 'balanced', 'mellow', 'meditat', 'nimmadhi'],
  energetic: ['energetic', 'fired up', 'powerful', 'charged', 'vitality', 'vigor', 'unstoppable', 'focused', 'coding', 'gym', 'workout'],
  romantic: ['romantic', 'love', 'date', 'partner', 'crush', 'sweet', 'affection', 'intimate', 'beloved', 'kadhal', 'kathal'],
  angry: ['angry', 'frustrated', 'irritated', 'furious', 'enraged', 'livid', 'seething', 'aggravated', 'kobam', 'kovam'],
  tired: ['tired', 'exhausted', 'sleepy', 'drained', 'fatigued', 'weary', 'spent', 'thookam', 'soorva'],
  lonely: ['lonely', 'alone', 'isolated', 'solitude', 'unconnected', 'miss', 'missing'],
  motivated: ['motivated', 'motivate', 'motivation', 'hustle', 'grind', 'determined', 'ambitious', 'goal', 'inspire'],
  wellness: ['wellness', 'healing', 'self-care', 'sick', 'fever', 'cold', 'healthy', 'immunity', 'weight loss']
};

export function analyzeIntent(text: string): AIAnalysis {
  const lower = text.toLowerCase().trim();
  
  // 1. Check strict NLU intent mappings
  for (const [key, config] of Object.entries(INTENT_PATTERNS)) {
    const matched = config.keywords.filter(kw => lower.includes(kw));
    if (matched.length > 0) {
      const confidence = Math.min(85 + (matched.length * 5), 98);
      let matchDesc = matched.join(', ');
      
      return {
        detectedIntent: config.name,
        confidence,
        reason: `Detected intent matching "${config.name}" based on indicators: "${matchDesc}"`,
        mood: config.mood,
        weather: config.weather,
        season: config.season,
        cravings: config.cravings
      };
    }
  }

  // 2. Fallback to generic mood detection
  let detectedMood = 'calm';
  let bestMatches: string[] = [];
  let maxMatches = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const matched = keywords.filter(kw => lower.includes(kw));
    if (matched.length > maxMatches) {
      maxMatches = matched.length;
      detectedMood = mood;
      bestMatches = matched;
    }
  }

  const confidence = maxMatches > 0 ? Math.min(75 + (maxMatches * 5), 92) : 75;
  const reason = maxMatches > 0 
    ? `Semantic analysis detected mood state "${detectedMood}" based on: "${bestMatches.join(', ')}"`
    : `Defaulted to steady "${detectedMood}" mood using general semantic safety logic.`;

  return {
    detectedIntent: `${detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)} Alignment`,
    confidence,
    reason,
    mood: detectedMood,
    cravings: 'balanced alignment'
  };
}

export function detectLanguage(text: string): 'TAMIL' | 'TANGLISH' | 'ENGLISH' | 'MIXED' {
  if (/[\u0b80-\u0bff]/.test(text)) {
    return 'TAMIL';
  }

  const lower = text.toLowerCase().trim();

  const tanglishMarkers = [
    'enaku', 'inniku', 'iruken', 'semma', 'sapdanum', 'sapida', 'iruku', 'sapdu', 'machan', 
    'macha', 'machi', 'kudu', 'ku', 'romba', 'adhigam', 'veyil', 'sapadu', 'kulirchi', 'venum', 
    'nalla', 'pola', 'kudithu', 'pudikum', 'iruka', 'panra', 'kuduthuruken', 'theriyuthu', 
    'panniruken', 'irukura', 'kuda', 'ila', 'illa', 'iruken'
  ];

  const englishMarkers = [
    'today', 'feel', 'feeling', 'happy', 'sad', 'angry', 'relaxed', 'motivated', 'exhausted',
    'tired', 'workout', 'gym', 'training', 'protein', 'food', 'drink', 'song', 'music', 'recommend'
  ];

  const tanglishMatches = tanglishMarkers.filter(word => lower.includes(word));
  const englishMatches = englishMarkers.filter(word => lower.includes(word));

  if (tanglishMatches.length > 0 && englishMatches.length > 0) {
    return 'MIXED';
  }
  if (tanglishMatches.length > 0) {
    return 'TANGLISH';
  }
  return 'ENGLISH';
}

// Upgraded Context-Aware Conversational Generator
export function generateFriendlyReply(text: string, intent: AIAnalysis): string {
  const lang = detectLanguage(text);
  const lower = text.toLowerCase().trim();
  const mood = intent.mood;

  // 1. Situation: SUMMER / SUN / HOT
  if (/\b(summer|hot|sun|veyil|temperature|heavysummer|scorch|romba hot|hot ah)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'வெயில் சும்மா சுட்டெரிக்குது நண்பா 🥵! உடம்பை நல்லா கூல் பண்ண அருமையான குளிர்ச்சியான உணவுகளும் பானங்களும் இதோ.';
    }
    if (lang === 'ENGLISH') {
      return 'Spot on! The weather is scorching hot today 🥵. Let\'s check out some cooling foods and refreshing drinks to beat the heat.';
    }
    return 'Correct bro 🥵. Veyil semma adikuthu. Cooling ah irukura foods and drinks paapom.';
  }

  // 2. Situation: LOVE BREAKUP / LONELY / HEARTBREAK
  if (/\b(breakup|love fail|cheated|alone|lonely|sogam|heartbreak|love failure|pirivu)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'மனசு கொஞ்சம் கஷ்டமா இருக்கும் நண்பா 💔. பரவாயில்லை, உங்க மைண்ட் கொஞ்சம் பிரெஷ் ஆக சில இதமான காம்பினேஷன்ஸ் பார்ப்போம்.';
    }
    if (lang === 'ENGLISH') {
      return 'Heartbreaks are tough, friend 💔. Take it easy and pamper yourself. Let\'s look at some comforting options to refresh your mind.';
    }
    return 'Macha... konjam kashtama irukum da 💔. Aana seri, konjam mind fresh aagura maari suggestions paapom.';
  }

  // 3. Situation: TENSION / STRESS / PRESSURE
  if (/\b(tension|stress|pressure|headache|furious|irritat|tension ah)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'என்ன ஆச்சு நண்பா 😕? கொஞ்சம் டென்ஷனா அல்லது பிரஷர்ல இருக்கீங்க போல. சரி விடுங்க, மைண்ட் ரிலாக்ஸ் ஆக சில நல்ல சஜஷன்ஸ் பார்ப்போம்.';
    }
    if (lang === 'ENGLISH') {
      return 'Under a lot of pressure today? 😕 Don\'t worry, let\'s pause for a bit. Let\'s find some relaxing comfort items to take the edge off.';
    }
    return 'Macha enna achu da 😕? Konjam pressure la iruka pola. Seri vidu, konjam relax aagura maari sila recommendations paapom.';
  }

  // 4. Situation: CELEBRATION / CELEBRATE / HAPPY
  if (mood === 'happy' || /\b(celebrat|birthday|won|passed|passed exam|santhosham|happy|semma happy|happy da)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'அடேய் செம நண்பா 😄🔥! இன்னைக்கு உங்க வைப் வேற லெவல்ல இருக்கு போல. இந்த சூப்பர் மூடுக்கு செட் ஆகுற காம்போஸ் இதோ!';
    }
    if (lang === 'ENGLISH') {
      return 'That\'s fantastic! 😄🔥 You seem to be in an absolutely great mood today. Here are some perfect celebratory pairings for your vibe!';
    }
    return 'Adei semma da 😄🔥! Un vibe vera level la iruku pola. Intha mood-ku set aagura recommendations ready.';
  }

  // 5. Situation: EXAM / STUDY
  if (/\b(exam|exams|test|study|studying|college|school|math|exam nala|syllabus|fail)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'தேர்வு டென்ஷன் எல்லாருக்கும் வர்றதுதான் நண்பா! 😅 கொஞ்சம் பிரேக் எடுத்து ரிலாக்ஸ் பண்ணுங்க. உங்க மைண்ட் பிரெஷ் ஆக சில ரெகமெண்டேஷன்ஸ் இதோ.';
    }
    if (lang === 'ENGLISH') {
      return 'Exam stress is completely normal, friend! 😅 Take a short break and relax. I\'ve prepared some refreshing recommendations to clear your head.';
    }
    return 'Bro exam stress ellarukum varum 😅. Konjam break eduthu relax pannu. Un mind fresh aagura maari sila recommendations ready panniruken.';
  }

  // 6. Situation: OFFICE / WORK
  if (/\b(office|work|job|boss|meeting|project|deadline|corporate|desk|office work)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'வேலை பளு அதிகமா இருக்கு போல நண்பா 😓! கொஞ்சம் ரீசார்ஜ் ஆக அருமையான உணவுகளும், சில்லுனு பானங்களும் கொடுத்திருக்கேன். மனச தளரவிடாதீங்க!';
    }
    if (lang === 'ENGLISH') {
      return 'Work deadlines can be so draining 😓. Take a minute to recharge with these comforting food, drink, and music suggestions.';
    }
    return 'Work load adhigama iruku pola bro 😓. Konjam recharge aagura maari food, drinks and music suggestions kuduthuruken.';
  }

  // 7. Situation: RAIN
  if (/\b(rain|rainy|drizzle|monsoon|storm|mazhai|rain ah)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'செம மழை நண்பா! 🌧️ இந்த இதமான குளிருக்கு நல்லா காரசாரமான ஸ்பைசி உணவுகளும் சுடச்சுட பஜ்ஜி, டீயும் ரெடி!';
    }
    if (lang === 'ENGLISH') {
      return 'What beautiful rainy day vibes! 🌧️ Perfect time for warm, spicy comfort foods and hot cardamom chai. Enjoy the cozy setup!';
    }
    return 'Rain ah iruku spicy ah sapdanum nu nenaikuringa 🌧️! Semma vibe bro. Bold spicy main, warm dessert and hot drinks ready.';
  }

  // 8. Situation: GYM / WORKOUT
  if (/\b(gym|workout|protein|exercise|fitness|vanthen|mudichu|lift|gym mudichu)\b/.test(lower)) {
    if (lang === 'TAMIL') {
      return 'ஜிம் போயிட்டு வந்துருக்கீங்க போல, சூப்பர் நண்பா! 💪 உடம்புக்கு தேவையான நல்ல புரோட்டீன் உணவுகளும், எனர்ஜி கொடுக்கிற பானங்களும் இப்போதைக்கு ரொம்ப முக்கியம்.';
    }
    if (lang === 'ENGLISH') {
      return 'Awesome post-workout grind! 💪 Your muscles need clean protein and recovery nutrients right now. I have paired high-protein meals with a recovery drink for you.';
    }
    return 'Gym mudichu vantheenga pola macha 💪! Muscle build panna protein foods and recovery drinks ready.';
  }

  // 9. Standard fallbacks based on general moods
  if (mood === 'relaxed' || mood === 'calm') {
    if (lang === 'TAMIL') {
      return 'ரொம்ப அமைதியான இதமான வைப்ல இருக்கீங்க, சூப்பர் நண்பா! 😌 இந்த அமைதியை மெயின்டெய்ன் பண்ண அருமையான உணவுகளும், மெலடி பாடல்களும் இதோ.';
    }
    if (lang === 'ENGLISH') {
      return 'Such a wonderful, relaxed energy 😌. To help you maintain this peaceful flow, here are some incredibly soothing pairings.';
    }
    return 'Nice bro 😌. Intha calm vibe maintain panna perfect light foods, soothing drinks and relaxing melodies completely ready.';
  }

  // 10. Per-mood cool Tanglish / Tamil / English replies for direct mood button clicks

  if (mood === 'angry') {
    if (lang === 'TAMIL') {
      return 'ஏன் இவ்ளோ கோபம் நண்பா 😤! என்ன பிரச்சனையா இருந்தாலும் பரவாயில்லை, நான் உன் கோபம் ஒரு கொஞ்சம் குறைக்க உதவுவேன். இதோ cooling foods & music ready!';
    }
    if (lang === 'ENGLISH') {
      return "Whoa, feeling that heat? 😤 No worries, I've got cooling foods and calming music to help bring that anger down a notch. You've got this!";
    }
    return "Tension nahh irukiya bro 😤! Ena problem lama iruthalum, na un tension kami panra maari foods and soothing songs suggestion kuduthuruken. Konjam relax aagu da!";
  }

  if (mood === 'sad') {
    if (lang === 'TAMIL') {
      return 'ஏன் இவ்ளோ சோகமா இருக்கீங்க நண்பா 😔? பரவாயில்லை, இந்த உணர்வு தாத்காலிகம்தான். உங்க மனசுக்கு ஒரு கொஞ்சம் ஆறுதல் கிடைக்க சில comfort foods & melodies ready.';
    }
    if (lang === 'ENGLISH') {
      return "Hey, it's okay to feel low sometimes 😔. You're stronger than you think! Here are some comforting foods and soulful songs to lift your spirits a little.";
    }
    return "Enna da bro, konjam down ah feel aagura 😔? Paravailla, na irukken! Un manasula oru spark kudukka best comfort foods and soulful songs ready panniruken. Better aaguvai!";
  }

  if (mood === 'stressed') {
    if (lang === 'TAMIL') {
      return 'டென்ஷன் வேண்டாம் நண்பா 😣! ஒரு மூச்சு எடு. உன் ஸ்ட்ரெஸ் குறைக்க perfect foods and calming songs ready பண்ணியிருக்கேன்.';
    }
    if (lang === 'ENGLISH') {
      return "Take a deep breath, you're doing great! 😣 Stress is temporary. I've lined up calming foods and relaxing music to help you decompress right now.";
    }
    return "Di bro tension la moozhgi iruka pola 😣! Breathe out pannu first. Un stress kami panra maari perfect calming combinations ready panniruken. Nee fine aaguvai!";
  }

  if (mood === 'happy' || mood === 'excited') {
    if (lang === 'TAMIL') {
      return 'அடேய் செம மூட்ல இருக்கீங்க நண்பா 😄🔥! இந்த energy-ஐ boost பண்ண vibey foods and party songs ready. Enjoy பண்ணுங்க!';
    }
    if (lang === 'ENGLISH') {
      return "Yesss! That energy is absolutely contagious 😄🔥! To keep this amazing vibe alive, here are some celebratory food and music combos just for you!";
    }
    return "Adei semma happy/excited ah iruka bro 😄🔥! Un vibe vera level la iruku. Intha super mood-ku set aagura bold foods and high energy songs ready da. Enjoy pannu!";
  }

  if (mood === 'lonely') {
    if (lang === 'TAMIL') {
      return 'தனிமையா இருக்கீங்களா நண்பா 🥺? பரவாயில்லை, நான் இங்கே இருக்கேன்! உங்களுக்கு warmth குடுக்க cozy foods and soulful songs ready பண்ணியிருக்கேன்.';
    }
    if (lang === 'ENGLISH') {
      return "You're never truly alone, friend 🥺. I've prepared some warm, cozy food and heartwarming songs that'll make you feel a little less lonely today.";
    }
    return "Enna da bro alone ah feel aagura 🥺? Paravailla, na irukken! Un manasula warmth kudukka cozy comfort foods and soulful songs ready. Nee oru valiant person!";
  }

  if (mood === 'tired') {
    if (lang === 'TAMIL') {
      return 'ரொம்ப தளர்ந்துட்டீங்க போல நண்பா 😴! ஒரு கொஞ்சம் recharge ஆகுங்க. உன் உடம்புக்கு energy கொடுக்க perfect foods and refreshing drinks ready!';
    }
    if (lang === 'ENGLISH') {
      return "Running on empty, huh? 😴 Rest is productive! Here are some energizing foods and refreshing drinks to help you recharge and bounce back strong.";
    }
    return "Ayyo bro romba thaldha pola 😴! Konjam recharge aagu da. Un body ku energy kudukka perfect foods and refreshing drinks ready panniruken. Back to full charge aaguvai!";
  }

  if (mood === 'motivated') {
    if (lang === 'TAMIL') {
      return 'செம motivated-ஆ இருக்கீங்க நண்பா 💪🔥! இந்த energy-ஐ sustain பண்ண high protein foods and power songs ready. Nothing can stop you!';
    }
    if (lang === 'ENGLISH') {
      return "That hustle energy is absolutely fire 💪🔥! To fuel your grind, I've put together high-energy foods and power-packed music. Nothing can stop you now!";
    }
    return "Semma motivated ah iruka bro 💪🔥! Intha beast mode energy maintain panna protein foods and power songs ready da. Un goal reach panra varai na unna support pannuven!";
  }

  if (mood === 'romantic' || mood === 'love') {
    if (lang === 'TAMIL') {
      return 'அன்பான மனநிலையில் இருக்கீங்க நண்பா ❤️! இந்த sweet mood-க்கு match ஆகுற romantic foods and tender songs ready பண்ணியிருக்கேன்.';
    }
    if (lang === 'ENGLISH') {
      return "Aww, love is in the air! ❤️ I've put together some romantic food and music pairings to make this feeling even more special and memorable.";
    }
    return "Aww love mood la iruka bro ❤️! Romba sweet da. Intha feeling-ku perfectly match aagura romantic foods and soulful songs ready panniruken. Enjoy this vibe!";
  }

  if (mood === 'wellness') {
    if (lang === 'TAMIL') {
      return 'உடல் ஆரோக்கியத்தை கவனிக்கிறீங்க, super நண்பா 🌿! உங்களுக்கு healing foods and restorative drinks ready பண்ணியிருக்கேன்.';
    }
    if (lang === 'ENGLISH') {
      return "Taking care of yourself is the best thing you can do 🌿! Here are some nourishing, healing foods and calming drinks to support your wellness journey.";
    }
    return "Semma bro 🌿! Nee un health-a care panra, that's the best decision. Healing foods and restorative drinks ready panniruken. Take it slow and glow!";
  }

  // Final general fallbacks
  if (lang === 'TAMIL') {
    return 'வணக்கம் நண்பா! 😊 உங்களோட மனநிலைக்கு ஏத்த மாதிரி ஒரு சூப்பரான காம்பினேஷன் ரெடி பண்ணியிருக்கேன். பிடிக்கும்னு நம்புறேன்!';
  }
  if (lang === 'TANGLISH') {
    return 'Hello bro! 😄 Un vibe-க்கு ஏத்த மாதிரி செம combinations ரெடி பண்ணியிருக்கேன். Enjoy பண்ணுங்க!';
  }
  return 'Hello, friend! 😄 Based on your request, I have prepared a perfect curated selection tailored to match your exact vibe.';
}

export function filterSemanticFoods(allFoods: any[], intent: AIAnalysis): any[] {
  const lowerIntent = intent.detectedIntent.toLowerCase();
  
  let searchTerms: string[] = [];
  if (lowerIntent.includes('summer') || lowerIntent.includes('cooling')) {
    searchTerms = INTENT_PATTERNS.summer_cooling.searchTerms;
  } else if (lowerIntent.includes('rainy') || lowerIntent.includes('spicy')) {
    searchTerms = INTENT_PATTERNS.rainy_spicy.searchTerms;
  } else if (lowerIntent.includes('workout') || lowerIntent.includes('protein')) {
    searchTerms = INTENT_PATTERNS.gym_protein.searchTerms;
  } else if (lowerIntent.includes('comfort') || lowerIntent.includes('uplift')) {
    searchTerms = INTENT_PATTERNS.sad_comfort.searchTerms;
  }

  if (searchTerms.length === 0) {
    const mood = intent.mood;
    const moodMatches = allFoods.filter(f => {
      const tags = Array.isArray(f.mood_tags) ? f.mood_tags.map((t: string) => t.toLowerCase()) : [];
      return tags.includes(mood) || (f.mood && f.mood.toLowerCase() === mood);
    });
    return moodMatches.length > 0 ? moodMatches : allFoods;
  }

  const matches = allFoods.filter(f => {
    const name = (f.food_name || '').toLowerCase();
    const cat = (f.category || '').toLowerCase();
    return searchTerms.some(term => name.includes(term) || cat.includes(term));
  });

  return matches.length > 0 ? matches : allFoods;
}
