import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFromFile(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvFromFile();
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const targets = [
    'profiles',
    'user_onboarding_data',
    'user_daily_logs',
    'user_health_progress',
    'user_health_plans',
    'chat_history',
    'vitamins_guide',
    'lab_tests_catalog',
    'habit_reduction_plans',
    'water_reminders',
    'user_notification_settings',
  ];

  console.log('== Data Verification Report ==');
  for (const table of targets) {
    const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`- ${table}: ERROR -> ${error.message}`);
    } else {
      console.log(`- ${table}: ${count ?? 0} rows`);
    }
  }

  const { data: profileCols, error: profileErr } = await sb.rpc('pg_get_cols', { _tbl: 'public.profiles' } as any);
  if (profileErr) {
    console.log('- profiles column check: skipped (rpc pg_get_cols not available)');
  } else {
    console.log('- profiles columns metadata available');
    console.log(profileCols);
  }
}

main().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});

