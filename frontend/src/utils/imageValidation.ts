import { getFoodImage } from './foodImageMap';

const musicImages = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800',
  'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800',
  'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800',
  'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800',
];

// Known music/non-food image fragment IDs to detect crossover
const knownMusicImageIds = [
  '1470225620780', '1511671782779', '1493225457124',
  '1514525253161', '1619983081563', '1614680376573',
];

const foodFallback = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800';

/**
 * Returns a validated, category-correct image URL.
 * 
 * - For 'music': ensures no food images slip in; returns music images only.
 * - For 'food': uses keyword-based mapping to get the correct food image.
 * 
 * @param type         - 'food' or 'music'
 * @param originalUrl  - The URL from the database
 * @param foodName     - The food's name (used for accurate food image mapping)
 * @param category     - The food's category (used for fallback selection)
 */
export const getValidatedImage = (
  type: 'food' | 'music',
  originalUrl?: string,
  foodName?: string,
  category?: string
): string => {
  if (type === 'music') {
    if (!originalUrl) return musicImages[0];
    // If a music slot got a food image, replace it
    const isFood = !knownMusicImageIds.some(id => originalUrl.includes(id));
    if (isFood) {
      const hash = originalUrl.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return musicImages[hash % musicImages.length];
    }
    return originalUrl;
  }

  // For food: use the keyword-based mapping for accuracy
  if (foodName) {
    return getFoodImage(foodName, category || '', originalUrl);
  }

  // No food name provided — check if original is a music image
  if (originalUrl) {
    const isMusicImage = knownMusicImageIds.some(id => originalUrl.includes(id));
    if (isMusicImage) return foodFallback;
    return originalUrl;
  }

  return foodFallback;
};
