import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  CHRONIC_CONDITIONS,
  SYMPTOMS_LIST,
  ACUTE_EPISODES,
  DRINKING_HABITS,
  LIFESTYLE_HABITS,
  LAB_TESTS,
  SAFE_SUPPLEMENTS,
  FEEDBACK_QUESTIONS as HEALTH_FEEDBACK_QUESTIONS,
} from '../data/healthEngine';
import { HABIT_QUESTIONS } from '../data/habitPlan';

function readEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function loadEnvFromFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i <= 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    process.env[k] = v.replace(/^['"]|['"]$/g, '');
  }
}

function extractArrayFromSource(source: string, constName: string): unknown[] {
  const markerConst = `const ${constName} = [`;
  const markerLet = `let ${constName} = [`;
  const start = source.indexOf(markerConst) >= 0 ? source.indexOf(markerConst) : source.indexOf(markerLet);
  if (start < 0) throw new Error(`Could not find ${constName} in mlEngine.ts`);
  const arrStart = source.indexOf('[', start);
  let i = arrStart;
  let depth = 0;
  let inStr = false;
  let quote = '';
  while (i < source.length) {
    const ch = source[i];
    const prev = source[i - 1];
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true;
      quote = ch;
    } else if (inStr && ch === quote && prev !== '\\') {
      inStr = false;
      quote = '';
    } else if (!inStr) {
      if (ch === '[') depth += 1;
      if (ch === ']') {
        depth -= 1;
        if (depth === 0) {
          const raw = source.slice(arrStart, i + 1);
          // eslint-disable-next-line no-new-func
          return Function(`"use strict"; return (${raw});`)() as unknown[];
        }
      }
    }
    i += 1;
  }
  throw new Error(`Failed to parse ${constName} array`);
}

async function main() {
  loadEnvFromFile();
  const url = readEnv('EXPO_PUBLIC_SUPABASE_URL');
  const serviceRole = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  const mlSrc = fs.readFileSync(path.join(process.cwd(), 'data', 'mlEngine.ts'), 'utf8');
  const trainingData = extractArrayFromSource(mlSrc, 'TRAINING_DATA');
  const mealScores = extractArrayFromSource(mlSrc, 'MEAL_SCORES');

  const userStoreConfig = {
    bmi_categories: [
      { min: 0, max: 18.5, label: 'Underweight', color: '#4DFF9E' },
      { min: 18.5, max: 25, label: 'Normal', color: '#E8FF4D' },
      { min: 25, max: 30, label: 'Overweight', color: '#FF9D4D' },
      { min: 30, max: 1000, label: 'Obese', color: '#FF6B6B' },
    ],
    activity_multipliers: { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 },
    goal_adjustments: { 'Weight Loss': -500, 'Muscle Gain': 300, Maintain: 0 },
  };

  await supabase.from('local_health_engine_data').delete().neq('key', '__none__');
  await supabase.from('local_habit_plan_data').delete().neq('key', '__none__');
  await supabase.from('local_ml_engine_data').delete().neq('key', '__none__');
  await supabase.from('local_user_store_data').delete().neq('key', '__none__');

  const healthRows = [
    { key: 'chronic_conditions', payload: CHRONIC_CONDITIONS },
    { key: 'symptoms_list', payload: SYMPTOMS_LIST },
    { key: 'acute_episodes', payload: ACUTE_EPISODES },
    { key: 'drinking_habits', payload: DRINKING_HABITS },
    { key: 'lifestyle_habits', payload: LIFESTYLE_HABITS },
    { key: 'lab_tests', payload: LAB_TESTS },
    { key: 'safe_supplements', payload: SAFE_SUPPLEMENTS },
    { key: 'feedback_questions', payload: HEALTH_FEEDBACK_QUESTIONS },
  ];
  const { error: hErr } = await supabase.from('local_health_engine_data').upsert(healthRows, { onConflict: 'key' });
  if (hErr) throw hErr;

  const { error: hpErr } = await supabase
    .from('local_habit_plan_data')
    .upsert([{ key: 'habit_questions', payload: HABIT_QUESTIONS }], { onConflict: 'key' });
  if (hpErr) throw hpErr;

  const { error: mlErr } = await supabase
    .from('local_ml_engine_data')
    .upsert(
      [
        { key: 'training_data', payload: trainingData },
        { key: 'meal_scores', payload: mealScores },
      ],
      { onConflict: 'key' },
    );
  if (mlErr) throw mlErr;

  const { error: usErr } = await supabase
    .from('local_user_store_data')
    .upsert([{ key: 'config', payload: userStoreConfig }], { onConflict: 'key' });
  if (usErr) throw usErr;

  console.log('Seeded health/habit/ml/userStore data.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

