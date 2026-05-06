import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  MEDICAL_CONDITIONS,
  LAB_TESTS_DATABASE,
  FEEDBACK_QUESTIONS,
} from '../data/medicalEngine';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

function need(key: string): string {
  const v = process.env[key]?.trim();
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

async function main() {
  loadEnv();
  const url = need('EXPO_PUBLIC_SUPABASE_URL');
  const serviceKey = need('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const createSql = `
  create table if not exists public.local_medical_engine_data (
    key text primary key,
    payload jsonb not null
  );
  alter table public.local_medical_engine_data enable row level security;
  drop policy if exists "local_medical_engine_data_public_read" on public.local_medical_engine_data;
  create policy "local_medical_engine_data_public_read" on public.local_medical_engine_data for select using (true);
  `;
  const { error: ddlError } = await supabase.rpc('pgrest_exec_sql', { query: createSql } as any);
  if (ddlError && !String(ddlError.message || '').includes('pgrest_exec_sql')) {
    // Fallback if rpc helper is not available in this project.
  }

  await supabase.from('local_medical_engine_data').delete().neq('key', '__none__');
  const { error } = await supabase.from('local_medical_engine_data').upsert(
    [
      { key: 'medical_conditions', payload: MEDICAL_CONDITIONS },
      { key: 'lab_tests_database', payload: LAB_TESTS_DATABASE },
      { key: 'feedback_questions', payload: FEEDBACK_QUESTIONS },
    ],
    { onConflict: 'key' },
  );
  if (error) throw error;
  console.log('seeded local_medical_engine_data');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

