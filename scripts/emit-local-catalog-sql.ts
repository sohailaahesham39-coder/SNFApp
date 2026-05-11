/**
 * Writes DDL + idempotent UPSERT for local_meals / local_workouts (UTF-8).
 * Output: scripts/_local_catalog_generated.sql (commit contents into MASTER-supabase-setup.sql as needed).
 */
import fs from 'fs';
import path from 'path';
import { MEALS, WORKOUTS } from '../data/localData';

function q(s: unknown): string {
  if (s == null || s === undefined) return 'null';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function arr(a: unknown): string {
  const list = Array.isArray(a) ? (a as string[]) : [];
  if (!list.length) return 'ARRAY[]::text[]';
  return 'ARRAY[' + list.map((x) => q(x)).join(', ') + ']::text[]';
}

function num(n: unknown, fallback = 0): string {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return String(fallback);
  return Number.isInteger(x) ? String(Math.trunc(x)) : String(x);
}

const lines: string[] = [];

lines.push(`-- -----------------------------------------------------------------------------
-- SNF catalog: bundled meals/workouts (sync with data/localData + catalogExpansion)
-- -----------------------------------------------------------------------------

create table if not exists public.local_meals (
  id text primary key,
  name text not null,
  meal_type text not null,
  calories integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  emoji text null,
  foods text not null default '',
  difficulty text not null default 'Easy',
  prep_time integer not null default 15,
  conditions_suitable text[] not null default '{}',
  conditions_avoid text[] not null default '{}',
  weight_loss_score integer not null default 0,
  muscle_gain_score integer not null default 0,
  heart_health_score integer not null default 0,
  diabetes_score integer not null default 0,
  is_vegetarian boolean not null default false,
  is_gluten_free boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.local_workouts (
  id text primary key,
  name text not null,
  muscle_group text not null default 'Full Body',
  difficulty text not null default 'Beginner',
  equipment text not null default '',
  calories_burned integer not null default 0,
  duration text not null default '',
  sets integer not null default 3,
  reps text not null default '',
  emoji text null,
  goal text[] not null default '{}',
  instructions text not null default '',
  rest_seconds integer not null default 60,
  updated_at timestamptz not null default now()
);

alter table public.local_meals enable row level security;
alter table public.local_workouts enable row level security;

drop policy if exists snf_catalog_local_meals_read on public.local_meals;
create policy snf_catalog_local_meals_read on public.local_meals for select using (true);

drop policy if exists snf_catalog_local_workouts_read on public.local_workouts;
create policy snf_catalog_local_workouts_read on public.local_workouts for select using (true);

grant select on public.local_meals to anon, authenticated;
grant select on public.local_workouts to anon, authenticated;


-- Meals (${MEALS.length} rows)
insert into public.local_meals (
  id, name, meal_type, calories, protein, carbs, fat, fiber, emoji, foods,
  difficulty, prep_time, conditions_suitable, conditions_avoid,
  weight_loss_score, muscle_gain_score, heart_health_score, diabetes_score,
  is_vegetarian, is_gluten_free, updated_at
) values`);

lines.push(
  MEALS.map((m: any, i: number) => {
    const tail = i < MEALS.length - 1 ? ',' : '';
    return `(
  ${q(m.id)}, ${q(m.name)}, ${q(m.meal_type)},
  ${num(m.calories)}, ${num(m.protein)}, ${num(m.carbs)}, ${num(m.fat)}, ${num(m.fiber, 0)},
  ${q(m.emoji)}, ${q(m.foods ?? '')}, ${q(m.difficulty ?? 'Easy')}, ${num(m.prep_time ?? 15, 15)},
  ${arr(m.conditions_suitable)}, ${arr(m.conditions_avoid)},
  ${num(m.weight_loss_score)}, ${num(m.muscle_gain_score)}, ${num(m.heart_health_score)}, ${num(m.diabetes_score)},
  ${m.is_vegetarian ? 'true' : 'false'}, ${m.is_gluten_free ? 'true' : 'false'}, now()
)${tail}`;
  }).join('\n')
);

lines.push(`on conflict (id) do update set
  name = excluded.name,
  meal_type = excluded.meal_type,
  calories = excluded.calories,
  protein = excluded.protein,
  carbs = excluded.carbs,
  fat = excluded.fat,
  fiber = excluded.fiber,
  emoji = excluded.emoji,
  foods = excluded.foods,
  difficulty = excluded.difficulty,
  prep_time = excluded.prep_time,
  conditions_suitable = excluded.conditions_suitable,
  conditions_avoid = excluded.conditions_avoid,
  weight_loss_score = excluded.weight_loss_score,
  muscle_gain_score = excluded.muscle_gain_score,
  heart_health_score = excluded.heart_health_score,
  diabetes_score = excluded.diabetes_score,
  is_vegetarian = excluded.is_vegetarian,
  is_gluten_free = excluded.is_gluten_free,
  updated_at = now();
`);

lines.push(`
-- Workouts (${WORKOUTS.length} rows)
insert into public.local_workouts (
  id, name, muscle_group, difficulty, equipment, calories_burned, duration,
  sets, reps, emoji, goal, instructions, rest_seconds, updated_at
) values`);

lines.push(
  WORKOUTS.map((w: any, i: number) => {
    const tail = i < WORKOUTS.length - 1 ? ',' : '';
    return `(
  ${q(w.id)}, ${q(w.name)}, ${q(w.muscle_group)},
  ${q(w.difficulty)}, ${q(w.equipment)}, ${num(w.calories_burned)},
  ${q(w.duration)}, ${num(w.sets ?? 3, 3)}, ${q(w.reps ?? '')}, ${q(w.emoji)},
  ${arr(w.goal)}, ${q(w.instructions ?? '')}, ${num(w.rest_seconds ?? 60, 60)},
  now()
)${tail}`;
  }).join('\n')
);

lines.push(`on conflict (id) do update set
  name = excluded.name,
  muscle_group = excluded.muscle_group,
  difficulty = excluded.difficulty,
  equipment = excluded.equipment,
  calories_burned = excluded.calories_burned,
  duration = excluded.duration,
  sets = excluded.sets,
  reps = excluded.reps,
  emoji = excluded.emoji,
  goal = excluded.goal,
  instructions = excluded.instructions,
  rest_seconds = excluded.rest_seconds,
  updated_at = now();
`);

const outPath = path.resolve(process.cwd(), 'scripts/_local_catalog_generated.sql');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
// eslint-disable-next-line no-console
console.error('Wrote', outPath, `(${MEALS.length} meals, ${WORKOUTS.length} workouts)`);
