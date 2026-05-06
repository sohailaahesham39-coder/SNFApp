import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

type AnyRow = Record<string, unknown>;

function loadDotEnvIfNeeded(): { envPath: string; loadedKeys: Set<string>; exists: boolean } {
  // `tsx` may not preserve a useful `__dirname`. Use cwd (repo root) instead.
  const envPath = path.resolve(process.cwd(), '.env');
  const exists = fs.existsSync(envPath);
  const loadedKeys = new Set<string>();
  if (!exists) return { envPath, loadedKeys, exists };

  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!key) continue;

    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    const current = process.env[key];
    if (current === undefined || String(current).trim() === '') {
      process.env[key] = value;
      loadedKeys.add(key);
    }
  }

  return { envPath, loadedKeys, exists };
}

function getEnv() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing env vars: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. ' +
        'Note: `npm run seed:medical` does not automatically load `.env` unless the script loads it.',
    );
  }
  return { supabaseUrl, serviceRoleKey };
}

function toInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function splitCommaList(value: unknown): string[] {
  const s = String(value ?? '').trim();
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function loadExcelRows<T extends AnyRow>(filePath: string): T[] {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  // defval:'' keeps empty cells as '' instead of undefined.
  return XLSX.utils.sheet_to_json(ws, { defval: '' }) as T[];
}

async function resetTableAllRows(supabase: SupabaseClient, table: string) {
  // Service Role key bypasses RLS, but Supabase REST still requires a filter.
  // This "neq" hack effectively deletes all rows for deterministic seeding.
  const SAFE_UUID = '00000000-0000-0000-0000-000000000000';
  const { error } = await supabase.from(table).delete().neq('id', SAFE_UUID);
  if (error) throw error;
}

async function insertInBatches<T extends AnyRow>(
  supabase: SupabaseClient,
  table: string,
  rows: T[],
  opts?: { upsert?: boolean; onConflict?: string },
  batchSize = 100,
) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const result = opts?.upsert
      ? supabase.from(table).upsert(chunk, { onConflict: opts.onConflict })
      : supabase.from(table).insert(chunk);

    const { error } = await result;
    if (error) throw error;
  }
}

async function seed() {
  const dotenv = loadDotEnvIfNeeded();
  const { supabaseUrl, serviceRoleKey } = getEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const root = process.cwd();
  const vitaminsPath = path.join(root, 'vitamins_guide.xlsx');
  const labsPath = path.join(root, 'lab_tests_catalog.xlsx');
  const habitsPath = path.join(root, 'habit_reduction_plans.xlsx');
  const waterPath = path.join(root, 'water_reminders.xlsx');

  console.log('Reading Excel files...');

  const vitaminsRows = loadExcelRows<{
    condition_id: string;
    nutrient: string;
    dose_range: string;
    timing: string;
    egyptian_foods: string;
    cost_egp: string;
    priority: string;
  }>(vitaminsPath);

  const labRows = loadExcelRows<{
    test_code: string;
    test_name: string;
    condition_id: string;
    priority: string;
    cost_min_egp: number;
    cost_max_egp: number;
    fasting_hours: number;
    why_needed: string;
    frequency: string;
  }>(labsPath);

  const habitRows = loadExcelRows<{
    habit_id: string;
    habit_name: string;
    current_max: number;
    safe_limit: string;
    week_1_target: string;
    week_2_target: string;
    week_3_target: string;
    week_4_target: string;
    health_risks: string;
    withdrawal_symptoms: string;
    expected_benefits: string;
  }>(habitsPath);

  const waterRows = loadExcelRows<{
    age_min: number;
    age_max: number;
    gender: string;
    activity_level: string;
    weight_min_kg: number;
    weight_max_kg: number;
    water_goal_ml: number;
    cups_per_day: number;
    reminder_times: string;
  }>(waterPath);

  const failures: string[] = [];

  // 1) vitamins_guide
  console.log(`\n[1/4] Seeding vitamins_guide (${vitaminsRows.length} rows)...`);
  try {
    await resetTableAllRows(supabase, 'vitamins_guide');
    const payload = vitaminsRows.map((r) => ({
      condition_id: r.condition_id,
      symptom_id: null,
      nutrient: r.nutrient,
      dose_range: r.dose_range,
      timing: r.timing,
      duration: null,
      contraindications: null,
      egyptian_foods: r.egyptian_foods,
      cost_egp: r.cost_egp,
      priority: r.priority,
    }));
    await insertInBatches(supabase, 'vitamins_guide', payload);
    console.log(`✅ vitamins_guide done.`);
  } catch (e) {
    failures.push('vitamins_guide');
    console.error('❌ vitamins_guide failed:', e);
  }

  // 2) lab_tests_catalog
  console.log(`\n[2/4] Seeding lab_tests_catalog (${labRows.length} rows)...`);
  try {
    await resetTableAllRows(supabase, 'lab_tests_catalog');
    const payload = labRows.map((r) => ({
      test_code: r.test_code,
      test_name: r.test_name,
      condition_id: r.condition_id,
      priority: r.priority,
      cost_min_egp: toInt(r.cost_min_egp),
      cost_max_egp: toInt(r.cost_max_egp),
      fasting_hours: toInt(r.fasting_hours),
      best_time: null,
      why_needed: r.why_needed,
      preparation: null,
      frequency: r.frequency,
    }));
    await insertInBatches(supabase, 'lab_tests_catalog', payload);
    console.log(`✅ lab_tests_catalog done.`);
  } catch (e) {
    failures.push('lab_tests_catalog');
    console.error('❌ lab_tests_catalog failed:', e);
  }

  // 3) habit_reduction_plans
  console.log(`\n[3/4] Seeding habit_reduction_plans (${habitRows.length} rows)...`);
  try {
    await resetTableAllRows(supabase, 'habit_reduction_plans');
    const payload = habitRows.map((r) => ({
      habit_id: r.habit_id,
      habit_name: r.habit_name,
      current_min: null,
      current_max: toInt(r.current_max),
      safe_limit: r.safe_limit,
      risk_level: null,
      week_1_target: r.week_1_target,
      week_1_how: null,
      week_1_replace: null,
      week_2_target: r.week_2_target,
      week_2_how: null,
      week_2_replace: null,
      week_3_target: r.week_3_target,
      week_3_how: null,
      week_3_replace: null,
      week_4_target: r.week_4_target,
      week_4_how: null,
      week_4_replace: null,
      health_risks: r.health_risks,
      withdrawal_symptoms: r.withdrawal_symptoms,
      expected_benefits: r.expected_benefits,
    }));
    // Unique constraint exists on habit_id, but we reset first anyway for determinism.
    await insertInBatches(supabase, 'habit_reduction_plans', payload);
    console.log(`✅ habit_reduction_plans done.`);
  } catch (e) {
    failures.push('habit_reduction_plans');
    console.error('❌ habit_reduction_plans failed:', e);
  }

  // 4) water_reminders
  console.log(`\n[4/4] Seeding water_reminders (${waterRows.length} rows)...`);
  try {
    await resetTableAllRows(supabase, 'water_reminders');
    const payload = waterRows.map((r) => ({
      age_min: toInt(r.age_min),
      age_max: toInt(r.age_max),
      gender: r.gender,
      activity_level: r.activity_level,
      weight_min_kg: toInt(r.weight_min_kg),
      weight_max_kg: toInt(r.weight_max_kg),
      water_goal_ml: toInt(r.water_goal_ml),
      cups_per_day: toInt(r.cups_per_day),
      reminder_times: splitCommaList(r.reminder_times),
      benefits: null,
    }));
    await insertInBatches(supabase, 'water_reminders', payload);
    console.log(`✅ water_reminders done.`);
  } catch (e) {
    failures.push('water_reminders');
    console.error('❌ water_reminders failed:', e);
  }

  if (failures.length > 0) {
    console.error(`\nSeed completed with failures: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log('\n🎉 Medical reference data seeded successfully.');
}

seed().catch((e) => {
  console.error('Seed script failed:', e);
  process.exit(1);
});

