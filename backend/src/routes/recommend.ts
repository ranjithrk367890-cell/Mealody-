import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, memoryStore, withTimeout } from '../config/supabase.js';
import { mockFoods, mockSongs } from '../config/mockData.js';
import { analyzeIntent } from '../utils/recommendationEngine.js';

const router = Router();

type Recommendation = {
  food_name: string;
  type: 'food' | 'drink' | 'snack';
  category: string;
  image: string;
  mood_badge: string;
  recommendation_reason: string;
  why_it_helps: string;
  emotional_impact: string;
  physical_effect: string;
  mood_improvement: string;
  best_time: string;
  paired_activity: string;
  paired_music: string;
  wellness_tip: string;
  wellness_score: number;
};

type WellnessItem = {
  title: string;
  why: string;
  effect: string;
  bestTime: string;
  wellnessScore: number;
  image: string;
  moodBadge?: string;
  category?: string;
};

type FoodSuggestion = {
  name: string;
  benefit: string;
};

type MusicSuggestion = {
  title: string;
  reason: string;
};

type AIResponse = {
  sentiment: string;
  reply: string;
  wellness: WellnessItem[];
  foods: FoodSuggestion[];
  music: MusicSuggestion[];
  activities: string[];
  recommended_foods: number[];
  recommended_songs: number[];
  recommendations?: Recommendation[];
  mood?: string;
  item_preference?: 'drinks_only' | 'food_only' | 'both';
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 19) return 'evening';
  return 'night';
}

function findMockImage(foodName: string) {
  const match = mockFoods.find(f => f.food_name.toLowerCase() === foodName.toLowerCase());
  return match?.image || 'https://images.unsplash.com/photo-1598515214200-17c4ed87eef5?q=80&w=800';
}

function buildLocalRecommendations(mood: string, timeOfDay: string) {
  const base: Record<string, Recommendation[]> = {
    sad: [
      {
        food_name: 'Curd Rice',
        type: 'food',
        category: 'Comfort Meal',
        image: findMockImage('Curd Rice'),
        mood_badge: 'Comforting',
        recommendation_reason: 'Gentle, easy on the stomach and emotionally grounding.',
        why_it_helps: 'Curd Rice brings soothing probiotics and a cool, creamy texture that helps calm tension after a low day. It supports digestion while offering a familiar, comforting meal.',
        emotional_impact: 'It can soften sadness and provide a sense of home, making the mind feel steadier and less overwhelmed.',
        physical_effect: 'Your body may feel less heavy, with digestion eased and subtle hydration from the yogurt cooling the system.',
        mood_improvement: 'After eating, you may notice a gentle shift toward acceptance and quiet calm rather than forcing cheerfulness.',
        best_time: `Best in the ${timeOfDay} when you need a gentle emotional reset.`,
        paired_activity: 'Sit quietly with a warm blanket and journal one small gratitude note.',
        paired_music: 'Soft, soulful Tamil melodies that carry a warm, peaceful tone.',
        wellness_tip: 'Eat slowly and breathe deeply between bites to let the comfort settle in.',
        wellness_score: 87,
      },
      {
        food_name: 'Warm Rasam',
        type: 'drink',
        category: 'Restorative Broth',
        image: 'https://images.unsplash.com/photo-1589308078055-2857fc9dbf5b?q=80&w=800',
        mood_badge: 'Soothing',
        recommendation_reason: 'Warm liquid support helps calm stress and reconnect your body with a comforting rhythm.',
        why_it_helps: 'The spices in rasam gently stimulate circulation and digestion while the warmth signals safety to your nervous system.',
        emotional_impact: 'It can make your mood feel lighter and less tangled by turning physical warmth into emotional comfort.',
        physical_effect: 'The warm broth may relax muscle tension and improve breathing, helping you feel quietly restored.',
        mood_improvement: 'You may feel more centered, tender toward yourself, and open to a calmer evening.',
        best_time: `Especially helpful ${timeOfDay} if you need a soft emotional lift.`,
        paired_activity: 'Read a short poem or send a caring message to someone you trust.',
        paired_music: 'A gentle acoustic Tamil song with minimal instrumentation.',
        wellness_tip: 'Drink slowly and savor each spoonful so the warmth becomes a calming ritual.',
        wellness_score: 90,
      }
    ],
    stressed: [
      {
        food_name: 'Dark Chocolate',
        type: 'snack',
        category: 'Calm Snack',
        image: 'https://images.unsplash.com/photo-1505253219559-0a0b74d0c0ae?q=80&w=800',
        mood_badge: 'Stress relief',
        recommendation_reason: 'Rich cocoa triggers relaxing chemistry while satisfying a craving in a gentle way.',
        why_it_helps: 'Dark chocolate contains magnesium and antioxidants that help quiet the stress response and support a steadier mood.',
        emotional_impact: 'It often creates a small moment of pleasure and calm, making the body feel less tense and the mind more grounded.',
        physical_effect: 'Your energy may become smoother rather than spiking, with a subtle lift that is not overwhelming.',
        mood_improvement: 'After enjoying it, you may feel calmer, more emotionally settled, and more able to think clearly.',
        best_time: `Great for the ${timeOfDay} when you need a short mental break.`,
        paired_activity: 'Take a slow walk outside, focusing on your breath between bites.',
        paired_music: 'Light instrumental Tamil music for a soft background energy.',
        wellness_tip: 'Pair the chocolate with a glass of water to balance the sweetness and support digestion.',
        wellness_score: 88,
      },
      {
        food_name: 'Tulsi Lemon Tea',
        type: 'drink',
        category: 'Calming Beverage',
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800',
        mood_badge: 'Calming',
        recommendation_reason: 'Herbal warmth helps ease nerves and encourages a soothing emotional shift.',
        why_it_helps: 'Tulsi is known for its adaptogenic qualities, which help the body manage stress while lemon adds a fresh lift.',
        emotional_impact: 'It can lower the noise in your head, bringing a sense of clarity and gentle relief.',
        physical_effect: 'You may feel less breathless and more relaxed, with reduced muscle tension in your shoulders and neck.',
        mood_improvement: 'This drink helps pause the stress cycle so you can return to your day with more control.',
        best_time: `An ideal ${timeOfDay} companion when your mind feels crowded.`,
        paired_activity: 'Practice three minutes of mindful breathing while you sip.',
        paired_music: 'Soft ambient Tamil rhythms designed for focus and calm.',
        wellness_tip: 'Stir in a little honey only if you want a sweeter, more comforting sip.',
        wellness_score: 92,
      }
    ],
    anxious: [
      {
        food_name: 'Coconut Water',
        type: 'drink',
        category: 'Hydration',
        image: 'https://images.unsplash.com/photo-1567265826255-254b8283a8f4?q=80&w=800',
        mood_badge: 'Hydrating',
        recommendation_reason: 'Hydration and minerals help soothe nervous tension and support a calmer mind.',
        why_it_helps: 'Coconut water replenishes electrolytes while its gentle sweetness gives a reassuring, grounding sensation.',
        emotional_impact: 'It can soften anxious feelings and make you feel more present and balanced.',
        physical_effect: 'Your body may feel less jittery, with a cooler internal temperature and easier breathing.',
        mood_improvement: 'You may notice anxious thinking settle into a more manageable, less intense rhythm.',
        best_time: `Perfect for the ${timeOfDay} when anxiety feels strong.`,
        paired_activity: 'Close your eyes and focus on your senses for a full five breaths while drinking.',
        paired_music: 'Gentle Tamil instrumental with flowing rhythms.',
        wellness_tip: 'Sip slowly and keep your posture upright to help digestion and calmness.',
        wellness_score: 89,
      },
      {
        food_name: 'Steamed Idli',
        type: 'food',
        category: 'Light Comfort',
        image: findMockImage('Idli Sambar'),
        mood_badge: 'Gentle',
        recommendation_reason: 'A light, warm meal that avoids heavy sensations when your mind feels overactive.',
        why_it_helps: 'Idli is easy to digest and does not cause blood sugar spikes, which helps the body stay grounded during anxious moments.',
        emotional_impact: 'It gives a feeling of calm nourishment rather than agitation, helping your mind relax gently.',
        physical_effect: 'You may feel less bloated and more steady, with slow energy release from the rice and lentils.',
        mood_improvement: 'It supports a quieter internal state and gives your nervous system room to normalize.',
        best_time: `Best ${timeOfDay} when you want a safe, soothing meal.`,
        paired_activity: 'Enjoy it seated, focusing on the texture of each bite.',
        paired_music: 'Soft vocal Tamil music with a slow tempo.',
        wellness_tip: 'Avoid rushing, and take the time to savor the warmth.',
        wellness_score: 90,
      }
    ],
    tired: [
      {
        food_name: 'Filter Coffee',
        type: 'drink',
        category: 'Energy Booster',
        image: findMockImage('Filter Coffee'),
        mood_badge: 'Reviving',
        recommendation_reason: 'Warm caffeine and rich aroma help lift low energy without making you jittery.',
        why_it_helps: 'A classic filter coffee gives a gentle alertness while the warmth supports a feeling of being held by routine.',
        emotional_impact: 'You may feel more awake, positive, and connected to the present moment.',
        physical_effect: 'It can reduce fatigue, sharpen focus, and give a sustainable boost to your mind and body.',
        mood_improvement: 'After drinking, you should feel more capable and ready to move forward, not overwhelmed.',
        best_time: `Ideal for ${timeOfDay} energy slumps.`,
        paired_activity: 'Take a short walk after your first sip to lock in the lift.',
        paired_music: 'A lively Tamil track with bright percussion.',
        wellness_tip: 'Add a bit of milk or jaggery if you want something soothing as well as energizing.',
        wellness_score: 91,
      },
      {
        food_name: 'Banana Cardamom Smoothie',
        type: 'drink',
        category: 'Energy Smoothie',
        image: 'https://images.unsplash.com/photo-1572448862523-ee6f8c964847?q=80&w=800',
        mood_badge: 'Balancing',
        recommendation_reason: 'Natural sugars and spice create steady energy and a warm, comforting feeling.',
        why_it_helps: 'Banana provides potassium and carbohydrates while cardamom adds a calming aroma that helps energy feel gentle.',
        emotional_impact: 'It can soften fatigue and help you feel nourished rather than drained.',
        physical_effect: 'You may notice steadier energy and a more relaxed focus after a short rest.',
        mood_improvement: 'The sense of being cared for through food helps quiet fatigue and invites a more resilient mood.',
        best_time: `Effective in the ${timeOfDay} when you need recovery energy.`,
        paired_activity: 'Sit in natural light and breathe deeply as you sip.',
        paired_music: 'A calm, rhythmic Tamil song with uplifting melody.',
        wellness_tip: 'Use ripe bananas for natural sweetness and easier digestion.',
        wellness_score: 86,
      }
    ],
    lonely: [
      {
        food_name: 'Masala Dosa',
        type: 'food',
        category: 'Comfort Meal',
        image: findMockImage('Masala Dosa'),
        mood_badge: 'Warmth',
        recommendation_reason: 'A familiar, hearty dish that feels like shared comfort even when you are alone.',
        why_it_helps: 'The crisp dosa and spiced potato filling bring sensory pleasure and a sense of togetherness through food.',
        emotional_impact: 'It can make you feel supported and less isolated by recreating the cozy feeling of a shared meal.',
        physical_effect: 'The satisfying texture and warm spices can ease tension and invite restful contentment.',
        mood_improvement: 'You may feel less alone and more emotionally nourished after this meal.',
        best_time: `Perfect for ${timeOfDay} cravings for companionship and comfort.`,
        paired_activity: 'Call a friend while you eat or watch a light favorite show.',
        paired_music: 'A tender Tamil song with a storytelling mood.',
        wellness_tip: 'Prepare the dosa with care and enjoy the process as a small ritual.',
        wellness_score: 88,
      },
      {
        food_name: 'Chamomile Milk',
        type: 'drink',
        category: 'Comforting Beverage',
        image: 'https://images.unsplash.com/photo-1511193311910-6eeyo12p2?auto=format&q=80&w=800',
        mood_badge: 'Soothing',
        recommendation_reason: 'A warm drink that eases the heart and restores a calm, gentle rhythm.',
        why_it_helps: 'Chamomile supports relaxation and the milk adds a nourishing, cozy layer that feels nurturing.',
        emotional_impact: 'It helps soften feelings of loneliness and invites a more peaceful emotional state.',
        physical_effect: 'Your body may settle, breath rate may slow, and your mind can unwind into rest.',
        mood_improvement: 'This drink can shift your emotions from empty to softly held, helping you feel cared for.',
        best_time: `Best ${timeOfDay} when you need extra warmth and ease.`,
        paired_activity: 'Light a candle or journal a small memory that makes you smile.',
        paired_music: 'Soft lyrical Tamil music with reassuring tones.',
        wellness_tip: 'Drink while it is warm and take a moment to notice how your body responds.',
        wellness_score: 93,
      }
    ],
    angry: [
      {
        food_name: 'Lemon Turmeric Tea',
        type: 'drink',
        category: 'Cooling Beverage',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800',
        mood_badge: 'Cooling',
        recommendation_reason: 'This drink is gentle yet powerful for cooling anger and easing the nervous system.',
        why_it_helps: 'Lemon and turmeric help calm inflammation while warm water supports a feeling of release.',
        emotional_impact: 'It may slow your heartbeat and help anger soften into a calmer, more reflective state.',
        physical_effect: 'You may notice your muscles relax and your energy shift from reactive to grounded.',
        mood_improvement: 'It can turn sharp frustration into a quieter, more manageable mood.',
        best_time: `Most helpful ${timeOfDay} when irritation is high.`,
        paired_activity: 'Take a brief, gentle walk and breathe deeply between sips.',
        paired_music: 'Slow Tamil chants or tranquil instrumental music.',
        wellness_tip: 'Sip mindfully and avoid rushing while the tea cools slightly.',
        wellness_score: 91,
      },
      {
        food_name: 'Cucumber Mint Salad',
        type: 'food',
        category: 'Cooling Snack',
        image: 'https://images.unsplash.com/photo-1532009324734-20a7a5813719?q=80&w=800',
        mood_badge: 'Refreshing',
        recommendation_reason: 'Crunchy, cooling foods reduce heat and provide a calming sensory shift.',
        why_it_helps: 'Cucumber and mint are naturally soothing, helping to lower agitation and restore clarity.',
        emotional_impact: 'It supports a fresher, lighter feeling and helps you step out of the heated emotional state.',
        physical_effect: 'This snack can hydrate you and lower internal heat, making tension easier to release.',
        mood_improvement: 'You may feel more balanced and more capable of choosing your next response calmly.',
        best_time: `A great ${timeOfDay} option for cooling down quickly.`,
        paired_activity: 'Sit in a quiet place and notice the cool crunch of each bite.',
        paired_music: 'A gentle Tamil melody with soft piano or strings.',
        wellness_tip: 'Add a squeeze of lime for brightness and extra refreshment.',
        wellness_score: 89,
      }
    ],
    overthinking: [
      {
        food_name: 'Saffron Milk',
        type: 'drink',
        category: 'Calming Beverage',
        image: 'https://images.unsplash.com/photo-1535920527001-1d9b0f48bb8f?q=80&w=800',
        mood_badge: 'Grounding',
        recommendation_reason: 'Warm milk with saffron anchors the mind and invites thoughtful calm.',
        why_it_helps: 'Saffron has mood-supporting compounds and the milk provides gentle nourishment, which can ease overactive thought loops.',
        emotional_impact: 'It encourages peaceful reflection and helps racing thoughts soften into quiet focus.',
        physical_effect: 'You may feel your body relax and your breathing slow, allowing mental space to reset.',
        mood_improvement: 'This drink can help shift anxiety into a calmer, more centered feeling.',
        best_time: `Most supportive ${timeOfDay} when your mind is too busy.`,
        paired_activity: 'Write down one thing you are grateful for while it cools slightly.',
        paired_music: 'A soothing Tamil song with minimal instrumentation.',
        wellness_tip: 'Use a small pinch of saffron and warm, not boiling, milk for best comfort.',
        wellness_score: 94,
      },
      {
        food_name: 'Vegetable Upma',
        type: 'food',
        category: 'Focus Meal',
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800',
        mood_badge: 'Nourishing',
        recommendation_reason: 'A light, warm meal that supports calm energy and thoughtful clarity.',
        why_it_helps: 'Upma gives a steady release of carbohydrates and gentle spices that keep your mind grounded without overstimulation.',
        emotional_impact: 'It can make your thoughts feel less tangled and more manageable, reducing mental fatigue.',
        physical_effect: 'This meal helps prevent sugar crashes and supports steady focus through the rest of your day.',
        mood_improvement: 'You may feel more able to direct your energy calmly and overcome overthinking with ease.',
        best_time: `Best ${timeOfDay} when you need warm, gentle focus.`,
        paired_activity: 'Practice a short breathing exercise before the first bite.',
        paired_music: 'Soft instrumental Tamil music with a steady rhythm.',
        wellness_tip: 'Keep the spices mild so the meal stays soothing and not stimulating.',
        wellness_score: 92,
      }
    ],
    happy: [
      {
        food_name: 'Pongal',
        type: 'food',
        category: 'Comfort Breakfast',
        image: findMockImage('Pongal'),
        mood_badge: 'Celebratory',
        recommendation_reason: 'A warm, nourishing dish that supports happiness while keeping energy steady.',
        why_it_helps: 'Pongal combines mild spices and rice for a nourishing meal that feels joyful without overheating the mind.',
        emotional_impact: 'It can enhance your cheerful mood and help you feel grounded and content.',
        physical_effect: 'Your body may enjoy balanced energy and gentle fullness, with no heavy crash later.',
        mood_improvement: 'This meal reinforces your positive energy and helps sustain it through the day.',
        best_time: `Perfect for a ${timeOfDay} celebration of feeling good.`,
        paired_activity: 'Share the meal with someone or take a moment to savor each bite.',
        paired_music: 'Upbeat Tamil music that keeps the good mood flowing.',
        wellness_tip: 'Eat slowly and notice how the food supports your positive feelings.',
        wellness_score: 90,
      },
      {
        food_name: 'Fresh Fruit Salad',
        type: 'food',
        category: 'Light Boost',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
        mood_badge: 'Bright',
        recommendation_reason: 'A refreshing, light choice to keep your happiness buoyant and energized.',
        why_it_helps: 'Fresh fruit supports hydration, vitamins, and a naturally uplifting taste that matches a happy mood.',
        emotional_impact: 'It helps sustain joy and adds a bright, uplifting feeling to your day.',
        physical_effect: 'You may feel refreshed, lightly energized, and ready to keep moving creatively.',
        mood_improvement: 'This snack reinforces your good mood and helps carried positivity last longer.',
        best_time: `Wonderful any ${timeOfDay} when you want a clean, happy boost.`,
        paired_activity: 'Step outside for a few minutes of sunlight while you eat.',
        paired_music: 'Bright Tamil melody that feels fresh and lively.',
        wellness_tip: 'Use seasonal fruit and keep the salad light for maximum comfort.',
        wellness_score: 93,
      }
    ],
    nostalgic: [
      {
        food_name: 'Curd Rice with Pickle',
        type: 'food',
        category: 'Memory Meal',
        image: findMockImage('Curd Rice'),
        mood_badge: 'Sentimental',
        recommendation_reason: 'A simple dish that carries the warmth of cherished memories and family moments.',
        why_it_helps: 'This familiar comfort food connects you to the past while grounding you in the present, bringing peaceful reflection.',
        emotional_impact: 'It softens nostalgia into gentle appreciation, helping you celebrate memories with warmth rather than loss.',
        physical_effect: 'Your body relaxes into the cool, creamy texture, signaling safety and belonging.',
        mood_improvement: 'You may feel more connected to your heritage and more emotionally balanced after eating.',
        best_time: `Perfect for ${timeOfDay} when memory-tinged feelings arise.`,
        paired_activity: 'Look through old photos or listen to songs from a cherished era.',
        paired_music: 'Classic Tamil songs with timeless melodies.',
        wellness_tip: 'Eat mindfully and let each spoonful bring a small memory to mind.',
        wellness_score: 89,
      },
      {
        food_name: 'Jaggery Coffee',
        type: 'drink',
        category: 'Nostalgic Beverage',
        image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800',
        mood_badge: 'Comforting',
        recommendation_reason: 'A warm drink that tastes of simpler times and traditional comfort.',
        why_it_helps: 'Jaggery adds an earthy sweetness while the coffee provides warmth, creating a sensory experience tied to tradition.',
        emotional_impact: 'It evokes feelings of home and belonging, softening the ache of nostalgia into peaceful contentment.',
        physical_effect: 'You may feel grounded and warmly held, with a gentle energy boost that feels nurturing.',
        mood_improvement: 'This drink helps you hold memories with gratitude rather than longing.',
        best_time: `Ideal for ${timeOfDay} quiet moments of reflection.`,
        paired_activity: 'Write a letter to someone from your past or journal a favorite memory.',
        paired_music: 'Soft instrumental Tamil classics.',
        wellness_tip: 'Sip slowly and let the warmth remind you of cherished moments.',
        wellness_score: 88,
      }
    ],
    wellness: [
      {
        food_name: 'Turmeric Ginger Tea',
        type: 'drink',
        category: 'Nourishing Beverage',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
        mood_badge: 'Healing',
        recommendation_reason: 'A warm tonic that supports immunity and restores balance during wellness recovery.',
        why_it_helps: 'Turmeric and ginger both have soothing anti-inflammatory properties, while warm water helps calm digestion and nervous system tension.',
        emotional_impact: 'It can make you feel gently supported and more grounded, helping your mood feel steadier and healthier.',
        physical_effect: 'This beverage helps ease internal heat, supports circulation, and encourages relaxed breathing.',
        mood_improvement: 'You may feel more restored, centered, and ready to care for yourself with intention.',
        best_time: `Best in the ${timeOfDay} when you want a restorative reset.`,
        paired_activity: 'Take slow breaths and practice gratitude for one thing you appreciate.',
        paired_music: 'Soft ambient Tamil music with healing tones.',
        wellness_tip: 'Sip slowly and let the warmth settle in before moving on with your day.',
        wellness_score: 94,
      },
      {
        food_name: 'Kitchari',
        type: 'food',
        category: 'Healing Meal',
        image: 'https://images.unsplash.com/photo-1523987355523-c7b5b6f3c32b?q=80&w=800',
        mood_badge: 'Restorative',
        recommendation_reason: 'A gentle, nourishing one-pot meal that supports digestion and inner balance.',
        why_it_helps: 'Kitchari is easy to digest and provides gentle nourishment, making it ideal when your body needs calming support.',
        emotional_impact: 'It can help you feel held and cared for, reducing overwhelm with a simple, comforting meal.',
        physical_effect: 'Your digestion may feel lighter, your energy more even, and your body more able to absorb nutrients.',
        mood_improvement: 'This meal encourages gentle healing and a quieter, more centered mindset.',
        best_time: `Perfect for ${timeOfDay} when you need wellness-focused nourishment.`,
        paired_activity: 'Sit quietly while you eat and notice how the warmth heals your body.',
        paired_music: 'Slow, meditative Tamil chants.',
        wellness_tip: 'Eat slowly and allow each bite to calm both body and mind.',
        wellness_score: 92,
      }
    ],
    calm: [
      {
        food_name: 'Warm Milk with Honey',
        type: 'drink',
        category: 'Soothing Beverage',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxeisSyhM-JSCc40N7_1jiNb89GYaLHliO9w&s',
        mood_badge: 'Relaxing',
        recommendation_reason: 'A gentle drink that signals safety to your nervous system and invites complete relaxation.',
        why_it_helps: 'Warm milk contains tryptophan and honey adds natural sweetness, both supporting deep calm and contentment.',
        emotional_impact: 'It creates a feeling of being cared for, helping your mind settle into peaceful stillness.',
        physical_effect: 'Your muscles relax, your breathing deepens, and your entire body enters a state of gentle restoration.',
        mood_improvement: 'You may feel profoundly relaxed and ready for restful sleep or quiet contemplation.',
        best_time: `Best in the ${timeOfDay} when you want to anchor calm.`,
        paired_activity: 'Sit in silence or practice gentle meditation.',
        paired_music: 'Ambient Tamil instrumental with minimal instrumentation.',
        wellness_tip: 'Warm the milk gently and sip in a quiet, comfortable space.',
        wellness_score: 95,
      },
      {
        food_name: 'Vegetable Soup',
        type: 'food',
        category: 'Nourishing Meal',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIl1RiPdcL92FzB4GWqU7hcZcfnEV6jzhbzQ&s',
        mood_badge: 'Balancing',
        recommendation_reason: 'A warm, light meal that nourishes without stimulating, supporting steady calm.',
        why_it_helps: 'Light vegetables and broth provide gentle nourishment while the warmth signals rest to your nervous system.',
        emotional_impact: 'It helps you feel supported and nourished, creating a sense of gentle peace.',
        physical_effect: 'Your digestion feels easy and your energy stays balanced and steady throughout.',
        mood_improvement: 'You may feel centered and capable of maintaining calm through your day.',
        best_time: `Wonderful for ${timeOfDay} when calm must be sustained.`,
        paired_activity: 'Breathe deeply between sips or practice mindful eating.',
        paired_music: 'Gentle flowing Tamil music.',
        wellness_tip: 'Add a touch of ginger for subtle warmth without overheating.',
        wellness_score: 91,
      }
    ],
    energetic: [
      {
        food_name: 'Spicy Chicken 65',
        type: 'food',
        category: 'Energy Booster',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800',
        mood_badge: 'Invigorating',
        recommendation_reason: 'A bold, spicy dish that ignites your internal fire and amplifies your energetic drive.',
        why_it_helps: 'The heat from spices stimulates circulation and awakens your senses, matching and sustaining your energetic mood.',
        emotional_impact: 'It reinforces your powerful energy and confidence, making you feel unstoppable.',
        physical_effect: 'Your metabolism rises, your focus sharpens, and your body feels ready for dynamic action.',
        mood_improvement: 'You may feel even more charged, ambitious, and ready to tackle challenges.',
        best_time: `Perfect for ${timeOfDay} when you want to amplify your energy.`,
        paired_activity: 'Take a brisk walk or engage in an invigorating workout.',
        paired_music: 'High-energy Tamil dance tracks.',
        wellness_tip: 'Pair with plenty of water to balance the heat.',
        wellness_score: 92,
      },
      {
        food_name: 'Beetroot Juice',
        type: 'drink',
        category: 'Energy Drink',
        image: 'https://images.unsplash.com/photo-1553530666-ba3a7d5efd50?q=80&w=800',
        mood_badge: 'Powerful',
        recommendation_reason: 'A vibrant juice packed with natural energy and nutrients to fuel your dynamic mood.',
        why_it_helps: 'Beetroot juice brings natural nitrates that support blood flow and oxygen delivery for sustained energy.',
        emotional_impact: 'It makes you feel powerful and vitally alive, ready to accomplish your goals.',
        physical_effect: 'Your energy rises steadily without the crash, keeping you focused and driven throughout the day.',
        mood_improvement: 'You may feel energized, focused, and capable of maintaining momentum.',
        best_time: `Ideal for ${timeOfDay} when you need sustained power.`,
        paired_activity: 'Take on a challenging project or engage in active play.',
        paired_music: 'Upbeat Tamil tracks with strong rhythms.',
        wellness_tip: 'Add a splash of lemon for brightness and better absorption.',
        wellness_score: 93,
      }
    ],
  };

  const normalizedMood = mood.toLowerCase().trim();
  return base[normalizedMood] || base.calm || base.relaxed;
}

function normalizeRecommendationImage(recommendations: Recommendation[]) {
  return recommendations.map(rec => ({
    ...rec,
    image: rec.image || findMockImage(rec.food_name)
  }));
}

function mapRecommendationsToWellness(recommendations: Recommendation[]): WellnessItem[] {
  return recommendations.map(rec => ({
    title: rec.food_name,
    why: rec.why_it_helps || rec.recommendation_reason,
    effect: rec.emotional_impact || rec.physical_effect || 'Supports calm and balance.',
    bestTime: rec.best_time || 'Anytime',
    wellnessScore: rec.wellness_score || 80,
    image: rec.image || findMockImage(rec.food_name),
    moodBadge: rec.mood_badge,
    category: rec.category
  }));
}

function buildFoodSuggestionsFromRecommendations(recommendations: Recommendation[]): FoodSuggestion[] {
  return recommendations.slice(0, 3).map(rec => ({
    name: rec.food_name,
    benefit: rec.why_it_helps || rec.recommendation_reason
  }));
}

function buildMusicSuggestions(mood: string): MusicSuggestion[] {
  const normalizedMood = mood.toLowerCase().trim();
  const map: Record<string, MusicSuggestion[]> = {
    sad: [
      { title: 'Melancholic Strings', reason: 'Helps soften sadness and gently shift your mood toward calm.' },
      { title: 'Gentle Harp Waves', reason: 'Creates a peaceful soundscape for emotional rest.' }
    ],
    stressed: [
      { title: 'Calm Tamil LoFi', reason: 'Helps relax the mind during stress.' },
      { title: 'Soft Piano Rhythms', reason: 'Releases tension and encourages deeper breathing.' }
    ],
    anxious: [
      { title: 'Grounding Ambient', reason: 'Helps calm anxious thoughts with soothing soundscapes.' },
      { title: 'Slow Breathing Rhythms', reason: 'Encourages calm, steady breathing patterns.' }
    ],
    lonely: [
      { title: 'Comforting Melody', reason: 'Gives a sense of warmth and gentle company.' },
      { title: 'Soulful Tamil Vocals', reason: 'Creates a soft emotional connection through music.' }
    ],
    angry: [
      { title: 'Cooling Ambient', reason: 'Helps diffuse anger with a calm sonic palette.' },
      { title: 'Slow Instrumental', reason: 'Encourages peaceful, steady breathing.' }
    ],
    overthinking: [
      { title: 'Mindful Flow', reason: 'Helps quiet racing thoughts and restore focus.' },
      { title: 'Quiet Piano', reason: 'Encourages relaxation and mental clarity.' }
    ],
    tired: [
      { title: 'Gentle Uplift', reason: 'Offers a soft energy boost without overstimulation.' },
      { title: 'Warm Morning Rhythm', reason: 'Helps bring the body and mind into gentle alertness.' }
    ],
    happy: [
      { title: 'Joyful South Notes', reason: 'Compliments your good mood and keeps the energy bright.' },
      { title: 'Light Celebration Beats', reason: 'Keeps your positive momentum flowing.' }
    ],
    romantic: [
      { title: 'Tender Duet', reason: 'Helps deepen emotional warmth and connection.' },
      { title: 'Soft Love Ballad', reason: 'Creates a cozy, romantic atmosphere.' }
    ],
    wellness: [
      { title: 'Soothing Wellness Flow', reason: 'Supports gentle recovery with calming and restoring melodies.' },
      { title: 'Healing Horizon', reason: 'Helps you relax while honoring your need for balance and self-care.' }
    ],
    nostalgic: [
      { title: 'Classic Tamil Melodies', reason: 'Evokes cherished memories with timeless tunes.' },
      { title: 'Soulful Vintage Vibes', reason: 'Celebrates the beauty of moments past.' }
    ],
    calm: [
      { title: 'Deep Meditative Flow', reason: 'Guides your mind into profound stillness and peace.' },
      { title: 'Ambient Serenity', reason: 'Creates an enveloping cocoon of calm around you.' }
    ],
    energetic: [
      { title: 'High-Energy Tamil Hits', reason: 'Amplifies your drive and ignites unstoppable momentum.' },
      { title: 'Power Beats', reason: 'Keeps your energy soaring and your spirit charged.' }
    ],
    relaxed: [
      { title: 'Slow Breeze', reason: 'Supports a calm, balanced mood without pressure.' },
      { title: 'Mellow Acoustic', reason: 'Keeps your energy even and steady.' }
    ]
  };

  return map[normalizedMood] || map.calm || map.relaxed;
}

function buildActivitySuggestions(mood: string): string[] {
  const normalizedMood = mood.toLowerCase().trim();
  const map: Record<string, string[]> = {
    sad: ['Write a short gratitude note', 'Sip a warm drink slowly', 'Listen to soft instrumental music'],
    stressed: ['Try three deep breaths', 'Step outside for a 5-minute walk', 'Stretch gently at your desk'],
    anxious: ['Practice grounding by noticing five things around you', 'Drink warm herbal tea', 'Listen to calming music'],
    tired: ['Take a brief sunlight break', 'Hydrate with water', 'Try a gentle body scan'],
    lonely: ['Call someone who understands you', 'Prepare a comforting small meal', 'Journal a happy memory'],
    angry: ['Take slow breaths', 'Step outside and move your body', 'Listen to slow, cooling music'],
    overthinking: ['Write down one worry and let it go', 'Do a short breathing exercise', 'Listen to quiet focus music'],
    happy: ['Share your mood with a friend', 'Take a mindful walk', 'Enjoy a feel-good playlist'],
    romantic: ['Light a candle', 'Play soft music', 'Write a short love note'],
    wellness: ['Drink a warm restorative tea', 'Do a short nourishing breathing exercise', 'Write one kind intention for yourself'],
    nostalgic: ['Look through old photos', 'Listen to songs from your favorite era', 'Write a thank-you note to someone from your past'],
    calm: ['Practice meditation or breathwork', 'Take a peaceful walk in nature', 'Enjoy a calming tea ceremony'],
    energetic: ['Engage in vigorous exercise', 'Dance to your favorite upbeat music', 'Take on a challenging project'],
    relaxed: ['Stay present with warm tea', 'Read a pleasant poem', 'Do a gentle stretch']
  };

  return map[normalizedMood] || map.calm || map.relaxed;
}

function localSentimentClassify(text: string) {
  const lower = text.toLowerCase().trim();
  if (/\b(late night|night coding|coding mood|coding|programming|software development)\b/.test(lower)) {
    return { mood: 'energetic', reply: 'Late night coding calls for focused energy—let\'s suggest vibrant food and music to keep you going.' };
  }
  if (/\b(rainy|rain|drizzle|monsoon|stormy|evening vibe|vibe)\b/.test(lower) && /\b(romantic|love|date|partner|crush)\b/.test(lower)) {
    return { mood: 'romantic', reply: 'A rainy evening romantic vibe deserves tender food and soft music.' };
  }
  if (/\b(need wellness support|wellness support|need wellness|need support|self care|self-care|healing|wellness)\b/.test(lower)) {
    return { mood: 'wellness', reply: 'I\'ll recommend gentle wellness foods and nurturing practices to support your balance.' };
  }
  if (/\b(calm|peaceful|serene|tranquil|centered|grounded|balanced|mellow)\b/.test(lower)) {
    return { mood: 'calm', reply: 'I sense your peaceful energy. Let\'s nourish that calm with soothing choices.' };
  }
  if (/\b(energetic|fired up|pumped|powerful|charged|vitality|vigor|unstoppable|focused)\b/.test(lower)) {
    return { mood: 'energetic', reply: 'What powerful energy you have! Let\'s match it with dynamic food and high-energy music.' };
  }
  if (/\b(nostalgic|nostalgia|miss|remember|memories|used to|good old|back then|reminisce)\b/.test(lower)) {
    return { mood: 'nostalgic', reply: 'Those memories hold beauty. Let me suggest foods and music that honor those cherished moments.' };
  }
  if (/\b(happy|joy|great|awesome|good|celebrat|excited|thrilled|wonderful|amazing|delighted)\b/.test(lower)) {
    return { mood: 'happy', reply: 'Vanakkam! You seem joyful today, and I\'ll suggest food and music to keep that warmth flowing.' };
  }
  if (/\b(sad|down|cry|blue|upset|hurt|heartbroken|gloomy|sorrowful|melancholic)\b/.test(lower)) {
    return { mood: 'sad', reply: 'I\'m sorry you\'re feeling low. I\'ll suggest soothing comfort and gentle support.' };
  }
  if (/\b(romantic|love|date|partner|crush|sweet|affection|intimate|beloved|paramour)\b/.test(lower)) {
    return { mood: 'romantic', reply: 'A romantic mood is beautiful. Let\'s match it with tender food and soft music.' };
  }
  if (/\b(anxiety|anxious|panic|nervous|jittery|fearful|uneasy|apprehensive|worried)\b/.test(lower)) {
    return { mood: 'anxious', reply: 'Anxiety is heavy. Let me suggest grounding food and calming music to ease your mind.' };
  }
  if (/\b(stress|stressed|tense|overwhelmed|frazzled|worried)\b/.test(lower)) {
    return { mood: 'stressed', reply: 'Feeling stressed? I\'ll suggest calming choices to ease the day.' };
  }
  if (/\b(tired|exhausted|sleepy|drained|fatigued|weary|lethargic|spent)\b/.test(lower)) {
    return { mood: 'tired', reply: 'You sound tired. I\'ll recommend gentle nourishment and restorative sounds.' };
  }
  if (/\b(lonely|alone|isolated|solitude|unconnected)\b/.test(lower)) {
    return { mood: 'lonely', reply: 'Loneliness can feel heavy. I\'ll suggest comforting options to support you.' };
  }
  if (/\b(angry|frustrated|irritated|furious|enraged|livid|seething|aggravated)\b/.test(lower)) {
    return { mood: 'angry', reply: 'Anger can be intense. I\'ll offer cooling, calming suggestions.' };
  }
  if (/\b(overthinking|mind race|too much|racing thoughts|can\'t stop thinking|spiral|overanalyz|ruminating)\b/.test(lower)) {
    return { mood: 'overthinking', reply: 'Your mind is busy. I\'ll recommend calm, grounding choices.' };
  }
  return { mood: 'calm', reply: 'Let\'s choose something that helps you feel grounded and peaceful.' };
}

function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function parseAIResponse(responseText: string, originalText: string): AIResponse | null {
  const jsonText = extractJsonBlock(responseText);
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText);
    const fallback = localSentimentClassify(originalText);
    const mood = (parsed.mood || parsed.sentiment || fallback.mood || 'calm').toLowerCase().trim();
    const reply = parsed.reply || fallback.reply || 'Here are mood-based recommendations for you.';

    const normalizeFoods = (items: any[]): FoodSuggestion[] => {
      return items.map(item => {
        if (typeof item === 'string') {
          return { name: item, benefit: '' };
        }
        return {
          name: item.name || item.food || item.title || '',
          benefit: item.benefit || item.reason || item.description || ''
        };
      }).filter(item => item.name);
    };

    const normalizeSongs = (items: any[]): MusicSuggestion[] => {
      return items.map(item => {
        if (typeof item === 'string') {
          return { title: item, reason: '' };
        }
        return {
          title: item.title || item.song || item.name || '',
          reason: item.reason || item.description || ''
        };
      }).filter(item => item.title);
    };

    const wellness: WellnessItem[] = Array.isArray(parsed.wellness)
      ? parsed.wellness
      : typeof parsed.wellness_tip === 'string'
        ? [{
            title: 'Wellness Advice',
            why: parsed.wellness_tip,
            effect: 'Supports emotional balance.',
            bestTime: 'Anytime',
            wellnessScore: 82,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'
          }]
        : [];

    const foods = Array.isArray(parsed.foods) ? normalizeFoods(parsed.foods) : [];
    const music = Array.isArray(parsed.songs) ? normalizeSongs(parsed.songs) : Array.isArray(parsed.music) ? normalizeSongs(parsed.music) : [];
    const activities = Array.isArray(parsed.activities) ? parsed.activities : [];

    if (foods.length || music.length || wellness.length || activities.length) {
      return {
        sentiment: parsed.sentiment || mood,
        mood,
        reply,
        wellness,
        foods,
        music,
        activities,
        recommended_foods: [],
        recommended_songs: [],
        item_preference: parsed.item_preference || 'both',
      };
    }
  } catch (err) {
    console.warn('Unable to parse AI response JSON:', err);
  }

  return null;
}

async function fetchGeminiText(text: string, foodNames: string[], songNames: string[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_key' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  
  console.log('[LOG] Gemini API request started');

  const foodsContext = foodNames.length > 0 ? `I have already selected these exact foods/drinks from our database for them: [${foodNames.join(', ')}].` : '';
  const songsContext = songNames.length > 0 ? `I have already selected these exact songs from our database for them: [${songNames.join(', ')}].` : '';

  const prompt = `
You are a highly intelligent, empathetic conversational AI chatbot specializing in mood, food, and music.
The user is talking to you in Tamil, Tanglish, or English.
Your job is to talk to them naturally, understand their feelings, and give them a detailed, comforting conversational response, and THEN recommend the perfect foods and songs for their mood.

${foodsContext}
${songsContext}

Step 1: Write a detailed, engaging conversational reply directly responding to what the user said. Match their language (Tamil/Tanglish/English).
Step 2: Classify their exact mood into ONE of these categories:
"happy", "sad", "angry", "relaxed", "romantic", "stressed", "tired", "lonely", "energetic", "anxious", "overthinking", "wellness", "nostalgic"
Step 3: Recommend 5 Tamil songs and 5 foods/drinks that perfectly match this mood.

User Input: "${text}"

Return format:
{
  "reply": "Your detailed conversational chatbot response here...",
  "mood": "one of the categories above",
  "item_preference": "drinks_only" | "food_only" | "both",
  "songs": [{"title": "song name", "reason": "why"}],
  "foods": [{"name": "food name", "benefit": "why"}],
  "wellness_tip": "short advice"
}
`;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    let modelName = 'gemini-2.5-flash';
    let model = client.getGenerativeModel({ model: modelName });
    
    // Add 4-second timeout race to prevent network hangs
    const fetchPromise = (async () => {
      try {
        const res = await model.generateContent(prompt);
        return res.response.text();
      } catch (err: any) {
        // Fallback to gemini-1.5-flash if 2.5 flash is unsupported
        const fallbackModel = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fallbackRes = await fallbackModel.generateContent(prompt);
        return fallbackRes.response.text();
      }
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result) {
      console.log('[LOG] Gemini API response received');
    } else {
      console.log('[LOG] Gemini API request timed out (4000ms limit)');
    }
    return result;
  } catch (error: any) {
    console.warn('⚠️ Gemini AI request failed or timed out, using rule-based engine:', error?.message || error);
    return null;
  }
}

function classifyIntent(text: string): 'MUSIC' | 'FOOD' | 'BOTH' | 'GENERAL_CHAT' {
  const lower = text.toLowerCase().trim();
  const musicRegex = /\b(song|music|tamil song|melody|kuthu|bgm|playlist|singer|album|listen|romantic song|sad song|happy song|recommendation song)\b/;
  const foodRegex = /\b(food|eat|hungry|snack|breakfast|lunch|dinner|dessert|biryani|dosa|chicken|veg food|recommend food)\b/;

  const hasMusic = musicRegex.test(lower);
  const hasFood = foodRegex.test(lower);

  if (hasMusic && hasFood) return 'BOTH';
  if (hasMusic) return 'MUSIC';
  if (hasFood) return 'FOOD';
  
  return 'BOTH';
}

async function getSupabaseRecommendations(normalizedMood: string, itemPreference: 'drinks_only' | 'food_only' | 'both', intent: string) {
  const recommended_foods: number[] = [];
  const recommended_food_names: string[] = [];
  const recommended_songs: number[] = [];
  const recommended_song_names: string[] = [];

  console.log('[LOG] Database query started');

  try {
    const promises = [];
    
    // 1. Fetch Foods
    if (intent === 'FOOD' || intent === 'BOTH') {
      promises.push(withTimeout(supabase.from('foods').select('id, food_name, mood, mood_tags, category'), 2500, { data: [], error: null } as any));
    } else {
      promises.push(Promise.resolve({ data: [], error: null } as any));
    }

    // 2. Fetch Songs
    if (intent === 'MUSIC' || intent === 'BOTH') {
      promises.push(withTimeout(supabase.from('songs').select('id, song_name, mood, mood_tags'), 2500, { data: [], error: null } as any));
    } else {
      promises.push(Promise.resolve({ data: [], error: null } as any));
    }

    // 3. Fetch Drinks (New Table)
    if (intent === 'FOOD' || intent === 'BOTH') {
      promises.push(withTimeout(supabase.from('drinks').select('id, drink_name, mood, mood_tags, category'), 2500, { data: [], error: null } as any));
    } else {
      promises.push(Promise.resolve({ data: [], error: null } as any));
    }

    const [foodsResult, songsResult, drinksResult] = await Promise.all(promises);

    console.log(`[LOG] Database query completed (Foods: ${foodsResult.data?.length || 0}, Songs: ${songsResult.data?.length || 0}, Drinks: ${drinksResult.data?.length || 0})`);

    // Filter Helper
    const matchesMood = (item: any) => {
      const moodMatch = item.mood && item.mood.toLowerCase() === normalizedMood;
      const tagsMatch = item.mood_tags && Array.isArray(item.mood_tags) && 
                       item.mood_tags.map((t: string) => t.toLowerCase()).includes(normalizedMood);
      return moodMatch || tagsMatch;
    };

    // Process Foods and Drinks
    if (intent === 'FOOD' || intent === 'BOTH') {
      let combinedItems: any[] = [];
      
      if (itemPreference !== 'drinks_only' && !foodsResult.error && Array.isArray(foodsResult.data)) {
        combinedItems = [...combinedItems, ...foodsResult.data.map((f: any) => ({ ...f, type: 'food' }))];
      }
      
      if (itemPreference !== 'food_only' && !drinksResult.error && Array.isArray(drinksResult.data)) {
        combinedItems = [...combinedItems, ...drinksResult.data.map((d: any) => ({ ...d, type: 'drink', food_name: (d as any).drink_name }))];
      }

      const matched = combinedItems.filter(matchesMood);

      const selected = matched
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      selected.forEach((item: any) => {
        recommended_foods.push(item.id);
        recommended_food_names.push(item.food_name);
      });
    }
    
    // Process Songs
    if ((intent === 'MUSIC' || intent === 'BOTH') && !songsResult.error && Array.isArray(songsResult.data)) {
      const matched = songsResult.data.filter(matchesMood);
      
      const selected = matched
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      selected.forEach((item: any) => {
        recommended_songs.push(item.id);
        recommended_song_names.push(item.song_name || item.title);
      });
    }
  } catch (error: any) {
    console.warn('Supabase query failed:', error?.message || error);
  }

  return { recommended_foods, recommended_food_names, recommended_songs, recommended_song_names };
}

router.get('/test', (_req: Request, res: Response) => {
  res.json({ message: 'API working' });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { text, userId } = req.body;
  console.log(`[LOG] Request received: POST /api/recommend (Input: "${text}")`);
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Text input is required for mood analysis.' });
    return;
  }

  const normalizedText = text.toLowerCase().trim();
  const intent = classifyIntent(text);
  
  // Upgraded NLP Sentiment and Intent Detection
  const analysis = analyzeIntent(text);
  const normalizedMood = analysis.mood;
  console.log(`[LOG] Mood detected: "${normalizedMood}" (Intent: ${analysis.detectedIntent})`);

  const sentimentResult = {
    mood: normalizedMood,
    reply: `I detected intent "${analysis.detectedIntent}" (${analysis.confidence}% confidence). Reason: ${analysis.reason}`
  };
  
  // Fallback preference detection
  let itemPref: 'drinks_only' | 'food_only' | 'both' = 'both';
  if (/\b(drink|kudi|kudikka|beverage|juice|tea|coffee|milk|smoothie)\b/.test(normalizedText) && /\b(vendam|kutathu|no food|without food)\b/.test(normalizedText)) {
     itemPref = 'drinks_only';
  } else if (/\b(drink|kudi|kudikka|beverage|juice|tea|coffee|milk|smoothie)\b/.test(normalizedText) && !/\b(food|eat|saapadu|sapdu|sapida|saapida|meal)\b/.test(normalizedText)) {
     itemPref = 'drinks_only';
  } else if (/\b(food|eat|saapadu|sapdu|sapida|saapida|meal)\b/.test(normalizedText) && !/\b(drink|kudi|kudikka|beverage|juice|tea|coffee|milk|smoothie)\b/.test(normalizedText)) {
     itemPref = 'food_only';
  }

  const supabaseResult = await getSupabaseRecommendations(normalizedMood, itemPref, intent);

  let aiResponse: AIResponse | null = null;
  const geminiText = await fetchGeminiText(text, supabaseResult.recommended_food_names, supabaseResult.recommended_song_names);
  
  if (geminiText) {
    aiResponse = parseAIResponse(geminiText, text);
  }

  if (!aiResponse) {
    const timeOfDay = getTimeOfDay();
    let recommendations = buildLocalRecommendations(normalizedMood, timeOfDay);
    
    if (itemPref === 'drinks_only') {
      recommendations = recommendations.filter(r => r.type === 'drink' || r.category.toLowerCase().includes('beverage'));
    } else if (itemPref === 'food_only') {
      recommendations = recommendations.filter(r => r.type !== 'drink' && !r.category.toLowerCase().includes('beverage'));
    }

    aiResponse = {
      sentiment: normalizedMood,
      mood: normalizedMood,
      reply: sentimentResult.reply,
      wellness: mapRecommendationsToWellness(normalizeRecommendationImage(recommendations)),
      foods: buildFoodSuggestionsFromRecommendations(normalizeRecommendationImage(recommendations)),
      music: buildMusicSuggestions(normalizedMood),
      activities: buildActivitySuggestions(normalizedMood),
      recommended_foods: [],
      recommended_songs: [],
      item_preference: itemPref,
    };
  }

  const finalPref = aiResponse.item_preference || itemPref;
  
  let fallbackMockFoods = mockFoods;
  if (finalPref === 'drinks_only') {
    fallbackMockFoods = fallbackMockFoods.filter(f => f.category && f.category.toLowerCase().includes('beverage'));
  } else if (finalPref === 'food_only') {
    fallbackMockFoods = fallbackMockFoods.filter(f => !f.category || !f.category.toLowerCase().includes('beverage'));
  }

  let recommended_foods: number[] = [];
  if (intent === 'FOOD' || intent === 'BOTH') {
    recommended_foods = supabaseResult.recommended_foods.length > 0 ? supabaseResult.recommended_foods : fallbackMockFoods.slice(0, 3).map((food) => food.id);
  }

  let recommended_songs: number[] = [];
  if (intent === 'MUSIC' || intent === 'BOTH') {
    recommended_songs = supabaseResult.recommended_songs.length > 0 ? supabaseResult.recommended_songs : mockSongs.slice(0, 3).map((song) => song.id);
  }

  console.log('[LOG] Recommendation generated');

  // Record in history non-blockingly with 1500ms timeout
  if (userId && recommended_foods.length > 0 && recommended_songs.length > 0) {
    const mainFoodId = recommended_foods[0];
    const mainSongId = recommended_songs[0];
    const matchedFood = mockFoods.find(f => f.id === mainFoodId) || { id: mainFoodId, food_name: 'Chettinad Biriyani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800' };
    const matchedSong = mockSongs.find(s => s.id === mainSongId) || { id: mainSongId, song_name: 'Munbe Vaa', artist: 'A.R. Rahman', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800' };

    if (typeof mainFoodId === 'number' && typeof mainSongId === 'number') {
      withTimeout(
        supabase.from('recommendation_history').insert({
          user_id: userId,
          mood: normalizedMood,
          food_id: mainFoodId,
          song_id: mainSongId
        }),
        1500,
        { error: null } as any
      ).catch(e => console.warn('Non-blocking chatbot history insert err:', e));

      // Always save to memory store for fallback history
      memoryStore.addHistory({
        user_id: userId,
        mood: normalizedMood,
        food_id: mainFoodId,
        song_id: mainSongId,
        created_at: new Date().toISOString(),
        foods: matchedFood,
        songs: matchedSong
      });
    }
  }

  console.log('[LOG] Response sent');

  res.json({
    ...aiResponse,
    recommended_foods,
    recommended_songs,
    aiAnalysis: analysis
  });
});

// POST /api/recommend/mood-analysis or /mood-analysis
router.post('/mood-analysis', (req: Request, res: Response): void => {
  const { text = '' } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Text input is required for mood analysis.' });
    return;
  }

  const analysis = analyzeIntent(text);
  res.json({
    text: text.trim(),
    mood: analysis.mood,
    detectedIntent: analysis.detectedIntent,
    confidence: analysis.confidence,
    reason: analysis.reason,
    timestamp: new Date().toISOString()
  });
});

export default router;
