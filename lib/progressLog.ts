import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { saveUserProgress } from './database';
import type { UserProfile } from '../data/userStore';

const KEY_PREFIX = 'sn_progress_snapshot_';

/** Writes at most one `user_progress` row per UTC day while the user has a Supabase session. */
export async function tryLogDailyProgressFromHome(profile: UserProfile): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return;

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${KEY_PREFIX}${uid}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { date?: string };
        if (parsed.date === today) return;
      } catch {
        /* continue */
      }
    }

    await saveUserProgress({
      user_id: uid,
      weight_kg: profile.weight,
      daily_calories_actual: profile.targetCalories,
      goal: profile.goal,
      workout_completed: false,
    });
    await AsyncStorage.setItem(storageKey, JSON.stringify({ date: today }));
  } catch {
    /* offline / table mismatch / RLS — non-blocking */
  }
}
