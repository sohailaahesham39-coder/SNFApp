import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
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

const projectRoot = process.cwd();
const mlEnginePath = path.join(projectRoot, 'data', 'mlEngine.ts');
const outPath = path.join(projectRoot, 'scripts', 'data-engine-migration.sql');

function sqlText(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

function sqlJson(v: unknown): string {
  const s = JSON.stringify(v).replace(/'/g, "''");
  return `'${s}'::jsonb`;
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
  const mlSrc = fs.readFileSync(mlEnginePath, 'utf8');
  const trainingData = extractArrayFromSource(mlSrc, 'TRAINING_DATA');
  const mealScores = extractArrayFromSource(mlSrc, 'MEAL_SCORES');

  const userStoreConfig = {
    bmi_categories: [
      { min: -Infinity, max: 18.5, label: 'Underweight', color: '#4DFF9E' },
      { min: 18.5, max: 25, label: 'Normal', color: '#E8FF4D' },
      { min: 25, max: 30, label: 'Overweight', color: '#FF9D4D' },
      { min: 30, max: Infinity, label: 'Obese', color: '#FF6B6B' },
    ],
    activity_multipliers: { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 },
    goal_adjustments: { 'Weight Loss': -500, 'Muscle Gain': 300, Maintain: 0 },
  };

  const rows = {
    health_engine: {
      chronic_conditions: CHRONIC_CONDITIONS,
      symptoms_list: SYMPTOMS_LIST,
      acute_episodes: ACUTE_EPISODES,
      drinking_habits: DRINKING_HABITS,
      lifestyle_habits: LIFESTYLE_HABITS,
      lab_tests: LAB_TESTS,
      safe_supplements: SAFE_SUPPLEMENTS,
      feedback_questions: HEALTH_FEEDBACK_QUESTIONS,
    },
    habit_plan: {
      habit_questions: HABIT_QUESTIONS,
    },
    ml_engine: {
      training_data: trainingData,
      meal_scores: mealScores,
    },
    user_store: userStoreConfig,
  } as const;

  const sql = `
create table if not exists public.local_health_engine_data (
  key text primary key,
  payload jsonb not null
);
create table if not exists public.local_habit_plan_data (
  key text primary key,
  payload jsonb not null
);
create table if not exists public.local_ml_engine_data (
  key text primary key,
  payload jsonb not null
);
create table if not exists public.local_user_store_data (
  key text primary key,
  payload jsonb not null
);

alter table public.local_health_engine_data enable row level security;
alter table public.local_habit_plan_data enable row level security;
alter table public.local_ml_engine_data enable row level security;
alter table public.local_user_store_data enable row level security;

drop policy if exists "local_health_engine_data_public_read" on public.local_health_engine_data;
create policy "local_health_engine_data_public_read" on public.local_health_engine_data for select using (true);
drop policy if exists "local_habit_plan_data_public_read" on public.local_habit_plan_data;
create policy "local_habit_plan_data_public_read" on public.local_habit_plan_data for select using (true);
drop policy if exists "local_ml_engine_data_public_read" on public.local_ml_engine_data;
create policy "local_ml_engine_data_public_read" on public.local_ml_engine_data for select using (true);
drop policy if exists "local_user_store_data_public_read" on public.local_user_store_data;
create policy "local_user_store_data_public_read" on public.local_user_store_data for select using (true);

delete from public.local_health_engine_data;
delete from public.local_habit_plan_data;
delete from public.local_ml_engine_data;
delete from public.local_user_store_data;

insert into public.local_health_engine_data (key,payload) values
(${sqlText('chronic_conditions')}, ${sqlJson(rows.health_engine.chronic_conditions)}),
(${sqlText('symptoms_list')}, ${sqlJson(rows.health_engine.symptoms_list)}),
(${sqlText('acute_episodes')}, ${sqlJson(rows.health_engine.acute_episodes)}),
(${sqlText('drinking_habits')}, ${sqlJson(rows.health_engine.drinking_habits)}),
(${sqlText('lifestyle_habits')}, ${sqlJson(rows.health_engine.lifestyle_habits)}),
(${sqlText('lab_tests')}, ${sqlJson(rows.health_engine.lab_tests)}),
(${sqlText('safe_supplements')}, ${sqlJson(rows.health_engine.safe_supplements)}),
(${sqlText('feedback_questions')}, ${sqlJson(rows.health_engine.feedback_questions)});

insert into public.local_habit_plan_data (key,payload) values
(${sqlText('habit_questions')}, ${sqlJson(rows.habit_plan.habit_questions)});

insert into public.local_ml_engine_data (key,payload) values
(${sqlText('training_data')}, ${sqlJson(rows.ml_engine.training_data)}),
(${sqlText('meal_scores')}, ${sqlJson(rows.ml_engine.meal_scores)});

insert into public.local_user_store_data (key,payload) values
(${sqlText('config')}, ${sqlJson(rows.user_store)});
`.trim();

  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

