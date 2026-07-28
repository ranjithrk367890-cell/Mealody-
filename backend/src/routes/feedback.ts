import { Router, Request, Response } from 'express';
import { supabase, memoryStore } from '../config/supabase.js';

const router = Router();

// POST /api/feedback/food
router.post('/food', async (req: Request, res: Response): Promise<void> => {
  const { userId, foodId, action, foodObj } = req.body;
  if (!userId || !foodId || !action) {
    res.status(400).json({ error: 'userId, foodId, and action are required.' });
    return;
  }

  const isLike = action === 'like';
  const isDislike = action === 'dislike';

  try {
    const { data: existing } = await supabase
      .from('food_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('food_id', foodId)
      .single();

    if (existing) {
      await supabase
        .from('food_preferences')
        .update({
          likes: isLike ? true : existing.likes,
          dislikes: isDislike ? true : existing.dislikes,
          interaction_count: (existing.interaction_count || 1) + 1,
          last_interaction: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('food_id', foodId);
    } else {
      await supabase
        .from('food_preferences')
        .insert({
          user_id: userId,
          food_id: foodId,
          likes: isLike,
          dislikes: isDislike,
          interaction_count: 1
        });
    }
  } catch (error: any) {
    console.warn('⚠️ Supabase food feedback update failed, storing in memory:', error.message || error);
  }

  // Always update in-memory store for fallback guarantee
  memoryStore.setFoodPref(userId, foodId, isLike, isDislike, foodObj);

  res.json({ success: true, message: `Food ${action}d successfully.` });
});

// POST /api/feedback/music
router.post('/music', async (req: Request, res: Response): Promise<void> => {
  const { userId, songId, action, songObj } = req.body;
  if (!userId || !songId || !action) {
    res.status(400).json({ error: 'userId, songId, and action are required.' });
    return;
  }

  const isLike = action === 'like';
  const isDislike = action === 'dislike';

  try {
    const { data: existing } = await supabase
      .from('music_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single();

    if (existing) {
      await supabase
        .from('music_preferences')
        .update({
          likes: isLike ? true : existing.likes,
          dislikes: isDislike ? true : existing.dislikes,
          interaction_count: (existing.interaction_count || 1) + 1,
          last_interaction: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('song_id', songId);
    } else {
      await supabase
        .from('music_preferences')
        .insert({
          user_id: userId,
          song_id: songId,
          likes: isLike,
          dislikes: isDislike,
          interaction_count: 1
        });
    }
  } catch (error: any) {
    console.warn('⚠️ Supabase music feedback update failed, storing in memory:', error.message || error);
  }

  // Always update in-memory store for fallback guarantee
  memoryStore.setMusicPref(userId, songId, isLike, isDislike, songObj);

  res.json({ success: true, message: `Music ${action}d successfully.` });
});

export default router;
