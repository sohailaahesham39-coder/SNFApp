import { supabase } from './supabase';
import type { UserProfile } from '../data/userStore';
import { loadProfile } from '../data/userStore';
import { pullRemoteProfileIntoCache } from './profileSupabase';

type AppStateRow = {
  id: string;
  user_id: string;
  week_number: number;
  habit_progress: Record<string, unknown>;
};

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function loadProfileSupabaseFirst(): Promise<UserProfile | null> {
  await pullRemoteProfileIntoCache();
  return loadProfile();
}

export async function upsertOnboardingDataFromProfile(profile: UserProfile): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('user_onboarding_data').upsert(
    {
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
    },
    { onConflict: 'user_id' },
  );
}

async function loadAppStateRow(userId: string): Promise<AppStateRow | null> {
  const { data } = await supabase
    .from('user_health_progress')
    .select('id,user_id,week_number,habit_progress')
    .eq('user_id', userId)
    .eq('week_number', 0)
    .maybeSingle();
  return (data as AppStateRow | null) ?? null;
}

async function upsertAppStateField(field: string, value: unknown): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const existing = await loadAppStateRow(userId);
  if (existing?.id) {
    const nextProgress = { ...(existing.habit_progress ?? {}), [field]: value };
    await supabase
      .from('user_health_progress')
      .update({ habit_progress: nextProgress, created_at: new Date().toISOString() })
      .eq('id', existing.id);
    return;
  }

  await supabase.from('user_health_progress').insert({
    user_id: userId,
    week_number: 0,
    habit_progress: { [field]: value },
    lab_tests_done: [],
    notes: 'app_state',
  });
}

export async function loadWorkoutWeekSupabaseFirst(): Promise<boolean[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const row = await loadAppStateRow(userId);
  const value = row?.habit_progress?.workout_week_done;
  if (!Array.isArray(value) || value.length !== 7) return null;
  return value.map((v) => Boolean(v));
}

export async function saveWorkoutWeekSupabaseFirst(days: boolean[]): Promise<void> {
  await upsertAppStateField('workout_week_done', days);
}

export async function loadChatHistorySupabaseFirst<T>(): Promise<T[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const row = await loadAppStateRow(userId);
  const value = row?.habit_progress?.chat_history;
  if (!Array.isArray(value)) return null;
  return value as T[];
}

export async function saveChatHistorySupabaseFirst<T>(messages: T[]): Promise<void> {
  await upsertAppStateField('chat_history', messages);
}

