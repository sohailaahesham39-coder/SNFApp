import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type HabitFrequency = 'daily' | 'weekly';

export interface UserHabit {
  id: string;
  user_id: string;
  name: string;
  frequency: HabitFrequency;
  time_of_day: string | null;
  reminders_enabled: boolean;
  target_per_week: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserHabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

type LocalHabitStore = {
  habits: UserHabit[];
  logs: UserHabitLog[];
};

const LOCAL_KEY_PREFIX = 'sn_habits_store_';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

function isMissingTableError(error: any) {
  return error?.code === '42P01' || String(error?.message ?? '').toLowerCase().includes('does not exist');
}

async function readLocalStore(userId: string): Promise<LocalHabitStore> {
  const raw = await AsyncStorage.getItem(`${LOCAL_KEY_PREFIX}${userId}`);
  if (!raw) return { habits: [], logs: [] };
  try {
    const parsed = JSON.parse(raw) as LocalHabitStore;
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch {
    return { habits: [], logs: [] };
  }
}

async function writeLocalStore(userId: string, store: LocalHabitStore) {
  await AsyncStorage.setItem(`${LOCAL_KEY_PREFIX}${userId}`, JSON.stringify(store));
}

export async function listHabits(): Promise<UserHabit[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_habits')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (!error) return (data as UserHabit[]) ?? [];
  if (!isMissingTableError(error)) return [];

  const local = await readLocalStore(userId);
  return local.habits.filter((h) => !h.archived);
}

export async function createHabit(input: {
  name: string;
  frequency: HabitFrequency;
  time_of_day?: string | null;
  reminders_enabled?: boolean;
  target_per_week?: number;
}): Promise<UserHabit | null> {
  const userId = await getUserId();
  if (!userId || !input.name.trim()) return null;

  const payload = {
    user_id: userId,
    name: input.name.trim(),
    frequency: input.frequency,
    time_of_day: input.time_of_day ?? null,
    reminders_enabled: input.reminders_enabled ?? true,
    target_per_week: Math.max(1, Math.min(14, Math.round(input.target_per_week ?? (input.frequency === 'daily' ? 7 : 3)))),
    archived: false,
  };

  const { data, error } = await supabase.from('user_habits').insert(payload).select('*').single();
  if (!error) return (data as UserHabit) ?? null;
  if (!isMissingTableError(error)) return null;

  const local = await readLocalStore(userId);
  const now = new Date().toISOString();
  const row: UserHabit = {
    id: makeId('habit'),
    user_id: userId,
    name: payload.name,
    frequency: payload.frequency,
    time_of_day: payload.time_of_day,
    reminders_enabled: payload.reminders_enabled,
    target_per_week: payload.target_per_week,
    archived: false,
    created_at: now,
    updated_at: now,
  };
  await writeLocalStore(userId, { ...local, habits: [row, ...local.habits] });
  return row;
}

export async function updateHabit(
  habitId: string,
  patch: Partial<Pick<UserHabit, 'name' | 'frequency' | 'time_of_day' | 'reminders_enabled' | 'target_per_week'>>
): Promise<UserHabit | null> {
  const userId = await getUserId();
  if (!userId || !habitId) return null;

  const { data, error } = await supabase
    .from('user_habits')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (!error) return (data as UserHabit) ?? null;
  if (!isMissingTableError(error)) return null;

  const local = await readLocalStore(userId);
  const habits = local.habits.map((h) =>
    h.id === habitId ? { ...h, ...patch, updated_at: new Date().toISOString() } : h
  );
  await writeLocalStore(userId, { ...local, habits });
  return habits.find((h) => h.id === habitId) ?? null;
}

export async function archiveHabit(habitId: string): Promise<void> {
  const userId = await getUserId();
  if (!userId || !habitId) return;

  const { error } = await supabase
    .from('user_habits')
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', userId);
  if (!error) return;
  if (!isMissingTableError(error)) return;

  const local = await readLocalStore(userId);
  const habits = local.habits.map((h) => (h.id === habitId ? { ...h, archived: true } : h));
  await writeLocalStore(userId, { ...local, habits });
}

export async function setHabitCompletion(habitId: string, completed: boolean, date = todayIsoDate()): Promise<void> {
  const userId = await getUserId();
  if (!userId || !habitId) return;

  const payload = {
    user_id: userId,
    habit_id: habitId,
    log_date: date,
    completed,
  };

  const { error } = await supabase.from('user_habit_logs').upsert(payload, { onConflict: 'user_id,habit_id,log_date' });
  if (!error) return;
  if (!isMissingTableError(error)) return;

  const local = await readLocalStore(userId);
  const existingIdx = local.logs.findIndex((l) => l.habit_id === habitId && l.log_date === date);
  if (existingIdx >= 0) {
    local.logs[existingIdx] = { ...local.logs[existingIdx], completed };
  } else {
    local.logs.unshift({
      id: makeId('habit_log'),
      user_id: userId,
      habit_id: habitId,
      log_date: date,
      completed,
      created_at: new Date().toISOString(),
    });
  }
  await writeLocalStore(userId, local);
}

export async function getHabitCompletionMap(date = todayIsoDate()): Promise<Record<string, boolean>> {
  const userId = await getUserId();
  if (!userId) return {};

  const { data, error } = await supabase
    .from('user_habit_logs')
    .select('habit_id,completed')
    .eq('user_id', userId)
    .eq('log_date', date);

  if (!error) {
    return ((data ?? []) as Array<{ habit_id: string; completed: boolean }>).reduce<Record<string, boolean>>(
      (acc, row) => {
        acc[row.habit_id] = !!row.completed;
        return acc;
      },
      {}
    );
  }
  if (!isMissingTableError(error)) return {};

  const local = await readLocalStore(userId);
  return local.logs
    .filter((l) => l.log_date === date)
    .reduce<Record<string, boolean>>((acc, row) => {
      acc[row.habit_id] = row.completed;
      return acc;
    }, {});
}

export async function getHabitStats(habitId: string, days = 30): Promise<{ completionRate: number; streak: number }> {
  const userId = await getUserId();
  if (!userId || !habitId) return { completionRate: 0, streak: 0 };

  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('user_habit_logs')
    .select('log_date,completed')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .gte('log_date', since)
    .order('log_date', { ascending: false });

  let rows: Array<{ log_date: string; completed: boolean }> = [];
  if (!error) rows = (data ?? []) as Array<{ log_date: string; completed: boolean }>;
  else if (isMissingTableError(error)) {
    const local = await readLocalStore(userId);
    rows = local.logs
      .filter((l) => l.habit_id === habitId && l.log_date >= since)
      .map((l) => ({ log_date: l.log_date, completed: l.completed }))
      .sort((a, b) => (a.log_date > b.log_date ? -1 : 1));
  } else {
    return { completionRate: 0, streak: 0 };
  }

  const completedCount = rows.filter((r) => r.completed).length;
  const completionRate = rows.length > 0 ? Math.round((completedCount / rows.length) * 100) : 0;

  let streak = 0;
  for (const row of rows) {
    if (row.completed) streak += 1;
    else break;
  }

  return { completionRate, streak };
}

export function subscribeToHabits(onChange: () => void): () => void {
  let unsubscribed = false;
  let channels: any[] = [];
  void (async () => {
    const userId = await getUserId();
    if (!userId || unsubscribed) return;
    const habitsChannel = supabase
      .channel(`user_habits_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_habits', filter: `user_id=eq.${userId}` },
        () => onChange()
      )
      .subscribe();
    const logsChannel = supabase
      .channel(`user_habit_logs_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_habit_logs', filter: `user_id=eq.${userId}` },
        () => onChange()
      )
      .subscribe();
    channels = [habitsChannel, logsChannel];
  })();

  return () => {
    unsubscribed = true;
    channels.forEach((ch) => {
      void supabase.removeChannel(ch);
    });
  };
}
