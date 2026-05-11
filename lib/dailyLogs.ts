import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const CACHE_KEY_PREFIX = 'sn_daily_log_';

export type UserDailyLog = {
  id?: string;
  user_id: string;
  log_date: string;
  meals: Record<string, unknown>;
  water_cups: number;
  vitamins_taken: string[];
  calories_consumed: number;
  calories_goal: number;
  updated_at?: string;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function clampNonNegativeInt(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function normalizeDailyLog(input: Partial<UserDailyLog>, userId: string): UserDailyLog {
  return {
    user_id: userId,
    log_date: input.log_date ?? todayIsoDate(),
    meals: input.meals && typeof input.meals === 'object' ? input.meals : {},
    water_cups: clampNonNegativeInt(input.water_cups),
    vitamins_taken: Array.isArray(input.vitamins_taken)
      ? input.vitamins_taken.filter((x) => typeof x === 'string')
      : [],
    calories_consumed: clampNonNegativeInt(input.calories_consumed),
    calories_goal: clampNonNegativeInt(input.calories_goal),
    updated_at: new Date().toISOString(),
  };
}

async function cacheDailyLog(userId: string, log: UserDailyLog): Promise<void> {
  await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(log));
}

async function readCachedDailyLog(userId: string): Promise<UserDailyLog | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDailyLog;
  } catch {
    return null;
  }
}

export async function getTodayDailyLog(userId: string): Promise<UserDailyLog | null> {
  if (!userId) return null;
  const date = todayIsoDate();
  const { data, error } = await supabase
    .from('user_daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();

  if (error || !data) {
    return readCachedDailyLog(userId);
  }

  const normalized = normalizeDailyLog(data as Partial<UserDailyLog>, userId);
  await cacheDailyLog(userId, normalized);
  return normalized;
}

export async function upsertTodayDailyLog(
  userId: string,
  patch: Partial<UserDailyLog>
): Promise<UserDailyLog | null> {
  if (!userId) return null;
  const current = (await getTodayDailyLog(userId)) ?? normalizeDailyLog({}, userId);
  const merged = normalizeDailyLog(
    {
      ...current,
      ...patch,
      meals: {
        ...(current.meals ?? {}),
        ...(patch.meals ?? {}),
      },
      vitamins_taken: patch.vitamins_taken ?? current.vitamins_taken,
    },
    userId
  );

  const payload = {
    user_id: userId,
    log_date: merged.log_date,
    meals: merged.meals,
    water_cups: merged.water_cups,
    vitamins_taken: merged.vitamins_taken,
    calories_consumed: merged.calories_consumed,
    calories_goal: merged.calories_goal,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_daily_logs')
    .upsert(payload, { onConflict: 'user_id,log_date' })
    .select('*')
    .maybeSingle();

  if (error) {
    // Fallback for projects without unique constraint on (user_id, log_date).
    const { data: existing } = await supabase
      .from('user_daily_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('log_date', merged.log_date)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from('user_daily_logs').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('user_daily_logs').insert(payload);
    }
    await cacheDailyLog(userId, merged);
    return merged;
  }

  const normalized = normalizeDailyLog((data as Partial<UserDailyLog>) ?? merged, userId);
  await cacheDailyLog(userId, normalized);
  return normalized;
}

export function subscribeToDailyLogs(userId: string, onChange: () => void): () => void {
  if (!userId) return () => undefined;
  const channel = supabase
    .channel(`user_daily_logs_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_daily_logs',
        filter: `user_id=eq.${userId}`,
      },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getRecentDailyLogs(userId: string, days = 14): Promise<UserDailyLog[]> {
  if (!userId) return [];
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('user_daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', since)
    .order('log_date', { ascending: true });

  if (error) {
    const cached = await readCachedDailyLog(userId);
    return cached ? [cached] : [];
  }

  return ((data ?? []) as Partial<UserDailyLog>[]).map((row) => normalizeDailyLog(row, userId));
}

