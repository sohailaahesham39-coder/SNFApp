/**
 * Upserts bundled MEALS / WORKOUTS into Supabase (requires service role).
 * Loads .env from repo root like seed-medical-data.ts.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { MEALS, WORKOUTS } from '../data/localData';

function loadDotEnvIfNeeded(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!key) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || String(process.env[key]).trim() === '') {
      process.env[key] = value;
    }
  }
}

function mapMealRow(m: any) {
  return {
    id: m.id,
    name: m.name,
    meal_type: m.meal_type,
    calories: Number(m.calories ?? 0),
    protein: Number(m.protein ?? 0),
    carbs: Number(m.carbs ?? 0),
    fat: Number(m.fat ?? 0),
    fiber: Number(m.fiber ?? 0),
    emoji: m.emoji ?? '',
    foods: m.foods ?? '',
    difficulty: m.difficulty ?? 'Easy',
    prep_time: Number(m.prep_time ?? 15),
    conditions_suitable: Array.isArray(m.conditions_suitable) ? m.conditions_suitable : [],
    conditions_avoid: Array.isArray(m.conditions_avoid) ? m.conditions_avoid : [],
    weight_loss_score: Number(m.weight_loss_score ?? 0),
    muscle_gain_score: Number(m.muscle_gain_score ?? 0),
    heart_health_score: Number(m.heart_health_score ?? 0),
    diabetes_score: Number(m.diabetes_score ?? 0),
    is_vegetarian: !!m.is_vegetarian,
    is_gluten_free: !!m.is_gluten_free,
  };
}

function mapWorkoutRow(w: any) {
  return {
    id: w.id,
    name: w.name,
    muscle_group: w.muscle_group,
    difficulty: w.difficulty,
    equipment: w.equipment,
    calories_burned: Number(w.calories_burned ?? 0),
    duration: w.duration ?? '',
    sets: Number(w.sets ?? 3),
    reps: w.reps ?? '',
    emoji: w.emoji ?? '',
    goal: Array.isArray(w.goal) ? w.goal : [],
    instructions: w.instructions ?? '',
    rest_seconds: Number(w.rest_seconds ?? 60),
  };
}

async function upsertChunks<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  chunkSize: number
): Promise<number> {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing project URL (EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in .env. ' +
        'Alternatively run the catalog block from scripts/MASTER-supabase-setup.sql in the Supabase SQL Editor.'
    );
  }
  const admin = createClient(supabaseUrl, serviceRoleKey);
  let n = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await admin.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) throw error;
    n += chunk.length;
  }
  return n;
}

async function main() {
  loadDotEnvIfNeeded();
  const mealRows = MEALS.map(mapMealRow);
  const workoutRows = WORKOUTS.map(mapWorkoutRow);
  const m = await upsertChunks('local_meals', mealRows, 40);
  const w = await upsertChunks('local_workouts', workoutRows, 30);
  // eslint-disable-next-line no-console
  console.log(`OK: upserted ${m} local_meals, ${w} local_workouts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
