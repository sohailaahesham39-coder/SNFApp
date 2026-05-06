import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { loadProfile } from '../data/userStore';

const CHAT_HISTORY_KEY = 'sn_chat_history';
const WORKOUT_WEEK_KEY = 'sn_workout_week_done';
const TEMP_USER_KEY = 'sn_temp_user';
const PROFILE_KEY = 'sn_user_profile';
const SNAPSHOT_PREFIX = 'sn_progress_snapshot_';

export async function migrateLocalDataToSupabaseAndCleanup(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return;

  const allKeys = await AsyncStorage.getAllKeys();
  const hasLocalData = allKeys.some(
    (k) =>
      k === PROFILE_KEY ||
      k === CHAT_HISTORY_KEY ||
      k === WORKOUT_WEEK_KEY ||
      k === TEMP_USER_KEY ||
      k.startsWith(SNAPSHOT_PREFIX),
  );
  if (!hasLocalData) return;

  const profile = await loadProfile();
  if (profile) {
    await supabase.from('user_onboarding_data').delete().eq('user_id', userId);
    await supabase.from('user_onboarding_data').insert({
      user_id: userId,
      age: profile.age ?? null,
      gender: profile.gender ?? null,
      weight_kg: profile.weight ?? null,
      height_cm: profile.height ?? null,
      activity_level: profile.activity ?? null,
      health_conditions: profile.healthConditions ?? profile.conditions ?? [],
      symptoms: profile.healthSymptoms ?? [],
      habits: {
        selected: profile.habits ?? [],
        drinks: profile.healthDrinks ?? [],
        health_habits: profile.healthHabits ?? [],
      },
      goals: profile.goal ? [profile.goal] : [],
      dietary_restrictions: profile.allergens ?? [],
      updated_at: new Date().toISOString(),
    });

    await supabase.from('user_daily_logs').insert({
      user_id: userId,
      log_date: new Date().toISOString().slice(0, 10),
      meals: {},
      water_cups: 0,
      vitamins_taken: [],
      calories_consumed: null,
      calories_goal: profile.targetCalories ?? null,
    });
  }

  const rawWorkout = await AsyncStorage.getItem(WORKOUT_WEEK_KEY);
  if (rawWorkout) {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(rawWorkout);
    } catch {
      parsed = null;
    }
    await supabase.from('user_health_progress').insert({
      user_id: userId,
      week_number: 1,
      habit_progress: { workout_week_done: parsed ?? [] },
      lab_tests_done: [],
      notes: null,
    });
  }

  const keysToClear = allKeys.filter(
    (k) =>
      k === PROFILE_KEY ||
      k === CHAT_HISTORY_KEY ||
      k === WORKOUT_WEEK_KEY ||
      k === TEMP_USER_KEY ||
      k.startsWith(SNAPSHOT_PREFIX),
  );
  if (keysToClear.length > 0) {
    await AsyncStorage.multiRemove(keysToClear);
  }
}

