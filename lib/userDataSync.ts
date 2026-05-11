import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const REMOTE_CACHE_KEY = 'sn_remote_user_data';

export async function fetchAllUserDataFromSupabase(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return;

  const [onboarding, dailyLogs, healthProgress, healthPlans, profile] = await Promise.all([
    supabase.from('user_onboarding_data').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_daily_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }),
    supabase.from('user_health_progress').select('*').eq('user_id', userId).order('week_number', { ascending: false }),
    supabase.from('user_health_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('profiles').select('data,updated_at').eq('id', userId).maybeSingle(),
  ]);

  const payload = {
    onboarding: onboarding.data ?? null,
    daily_logs: dailyLogs.data ?? [],
    health_progress: healthProgress.data ?? [],
    health_plans: healthPlans.data ?? [],
    profile: profile.data ?? null,
    synced_at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(payload));
}

