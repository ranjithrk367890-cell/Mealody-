import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder_key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY missing from environment variables. Using resilient fallback memory store.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utility helper to wrap any Promise (such as Supabase DB queries) in a strict timeout.
 * Prevents network DNS/socket hangs from blocking Express routes.
 */
export async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`⏱️ [TIMEOUT] Database/API operation exceeded ${timeoutMs}ms limit. Falling back to local store.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([Promise.resolve(promise), timeoutPromise]);
    return result;
  } catch (err: any) {
    console.warn(`⚠️ [ERROR] Database/API operation failed: ${err?.message || err}. Falling back to local store.`);
    return fallbackValue;
  } finally {
    clearTimeout(timer!);
  }
}

// ============================================================
// RESILIENT IN-MEMORY BACKUP STORE
// Operates automatically when Supabase is offline or fails
// ============================================================

export interface MemoryUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  password_hash: string;
  favorite_mood?: string;
  language?: string;
  created_at: string;
}

export interface MemoryHistoryItem {
  id: number;
  user_id: string;
  mood: string;
  food_id?: number;
  song_id?: number;
  created_at: string;
  foods?: any;
  songs?: any;
}

export interface MemoryPreference {
  user_id: string;
  food_id?: number;
  song_id?: number;
  likes: boolean;
  dislikes: boolean;
  interaction_count: number;
  last_interaction: string;
  foods?: any;
  songs?: any;
}

class MemoryStore {
  public users: Map<string, MemoryUser> = new Map(); // key: email
  public history: MemoryHistoryItem[] = [];
  public foodPreferences: Map<string, MemoryPreference> = new Map(); // key: `${userId}_${foodId}`
  public musicPreferences: Map<string, MemoryPreference> = new Map(); // key: `${userId}_${songId}`
  private nextHistoryId = 1;

  constructor() {
    // Seed default demo user for instant offline login/testing
    const demoId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    this.users.set('demo@mealody.ai', {
      id: demoId,
      name: 'Mealody User',
      email: 'demo@mealody.ai',
      password_hash: '$2a$10$e7mGZ8y1Q.eKx5uJ3K8mYeL8O8W8x8w8', // dummy
      language: 'English',
      created_at: new Date().toISOString()
    });
  }

  public addUser(user: MemoryUser) {
    this.users.set(user.email.toLowerCase().trim(), user);
  }

  public getUserByEmail(email: string): MemoryUser | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  public getUserById(id: string): MemoryUser | undefined {
    return Array.from(this.users.values()).find(u => u.id === id);
  }

  public addHistory(item: Omit<MemoryHistoryItem, 'id'>): MemoryHistoryItem {
    const fullItem: MemoryHistoryItem = {
      ...item,
      id: this.nextHistoryId++
    };
    this.history.unshift(fullItem);
    return fullItem;
  }

  public getUserHistory(userId: string): MemoryHistoryItem[] {
    return this.history.filter(h => h.user_id === userId);
  }

  public setFoodPref(userId: string, foodId: number, isLike: boolean, isDislike: boolean, foodObj?: any) {
    const key = `${userId}_${foodId}`;
    const existing = this.foodPreferences.get(key);
    if (existing) {
      existing.likes = isLike;
      existing.dislikes = isDislike;
      existing.interaction_count += 1;
      existing.last_interaction = new Date().toISOString();
      if (foodObj) existing.foods = foodObj;
    } else {
      this.foodPreferences.set(key, {
        user_id: userId,
        food_id: foodId,
        likes: isLike,
        dislikes: isDislike,
        interaction_count: 1,
        last_interaction: new Date().toISOString(),
        foods: foodObj
      });
    }
  }

  public getFoodPrefs(userId: string): MemoryPreference[] {
    return Array.from(this.foodPreferences.values()).filter(p => p.user_id === userId);
  }

  public setMusicPref(userId: string, songId: number, isLike: boolean, isDislike: boolean, songObj?: any) {
    const key = `${userId}_${songId}`;
    const existing = this.musicPreferences.get(key);
    if (existing) {
      existing.likes = isLike;
      existing.dislikes = isDislike;
      existing.interaction_count += 1;
      existing.last_interaction = new Date().toISOString();
      if (songObj) existing.songs = songObj;
    } else {
      this.musicPreferences.set(key, {
        user_id: userId,
        song_id: songId,
        likes: isLike,
        dislikes: isDislike,
        interaction_count: 1,
        last_interaction: new Date().toISOString(),
        songs: songObj
      });
    }
  }

  public getMusicPrefs(userId: string): MemoryPreference[] {
    return Array.from(this.musicPreferences.values()).filter(p => p.user_id === userId);
  }
}

export const memoryStore = new MemoryStore();
