import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serializeForArchive } from '../lib/serializeForArchive';
import { ALLERGENS, CHATBOT_RESPONSES, HEALTH_CONDITIONS, MEALS, WORKOUTS } from '../data/localData';
import { MEDICAL_CONDITIONS, LAB_TESTS_DATABASE, FEEDBACK_QUESTIONS } from '../data/medicalEngine';
import { HABIT_QUESTIONS } from '../data/habitPlan';

type ArchiveSource = {
  sourceFile: string;
  exportName: string;
  value: unknown;
};

function estimateCount(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value as Record<string, unknown>).length;
  return null;
}

function getSupabaseEnv() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing env vars: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  return { supabaseUrl, supabaseServiceRoleKey };
}

function buildArchiveSources(): ArchiveSource[] {
  return [
    { sourceFile: 'data/localData.ts', exportName: 'MEALS', value: MEALS },
    { sourceFile: 'data/localData.ts', exportName: 'WORKOUTS', value: WORKOUTS },
    { sourceFile: 'data/localData.ts', exportName: 'HEALTH_CONDITIONS', value: HEALTH_CONDITIONS },
    { sourceFile: 'data/localData.ts', exportName: 'ALLERGENS', value: ALLERGENS },
    { sourceFile: 'data/localData.ts', exportName: 'CHATBOT_RESPONSES', value: CHATBOT_RESPONSES },
    { sourceFile: 'data/medicalEngine.ts', exportName: 'MEDICAL_CONDITIONS', value: MEDICAL_CONDITIONS },
    { sourceFile: 'data/medicalEngine.ts', exportName: 'LAB_TESTS_DATABASE', value: LAB_TESTS_DATABASE },
    { sourceFile: 'data/medicalEngine.ts', exportName: 'FEEDBACK_QUESTIONS', value: FEEDBACK_QUESTIONS },
    { sourceFile: 'data/habitPlan.ts', exportName: 'HABIT_QUESTIONS', value: HABIT_QUESTIONS },
  ];
}

async function upsertRowsInChunks(
  supabase: SupabaseClient,
  rows: Array<Record<string, unknown>>,
  chunkSize = 50,
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('local_data_archive').upsert(chunk, { onConflict: 'id' });
    if (error) throw error;
  }
}

async function syncExportsStreaming(supabase: SupabaseClient): Promise<number> {
  let synced = 0;
  const chunk: Array<Record<string, unknown>> = [];
  const chunkSize = 50;

  for (const source of buildArchiveSources()) {
    const payload = serializeForArchive(source.value);
    if (payload === undefined) continue;

    chunk.push({
      id: `${source.sourceFile}:${source.exportName}`,
      source_file: source.sourceFile,
      export_name: source.exportName,
      payload,
      records_count: estimateCount(payload),
      synced_at: new Date().toISOString(),
    });
    synced += 1;

    if (chunk.length >= chunkSize) {
      await upsertRowsInChunks(supabase, chunk, chunkSize);
      chunk.length = 0;
    }
  }

  if (chunk.length > 0) {
    await upsertRowsInChunks(supabase, chunk, chunkSize);
  }

  return synced;
}

async function run() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const synced = await syncExportsStreaming(supabase);
  console.log(`Synced ${synced} exports into local_data_archive.`);
}

run().catch((e) => {
  console.error('Sync failed:', e);
  process.exit(1);
});
