/*
================================================================================
SNFAPP — MASTER Supabase setup (single paste)
================================================================================
HOW TO RUN:
  1. Supabase Dashboard → SQL Editor → New query.
  2. Paste this ENTIRE file → Run.

If CREATE UNIQUE INDEX ux_user_daily_logs_user_date fails (duplicates):
  - Run scripts/dedupe-user-daily-logs.sql first, then re-run the index from
    create-user-data-tables.sql (or paste just that statement).

ORDER BAKED IN:
  profiles → user core logs → medical catalogs + health plans → chat → habits
  → notification settings → sync RPC layer → meal planning schema

Optional after schema:
  npm run seed:medical   (from project root, needs service role / env configured)
  npm run seed:catalog   (upserts public.local_meals + public.local_workouts; needs SUPABASE_SERVICE_ROLE_KEY
                          + EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env)
  To regenerate the embedded catalog block from TypeScript: npm run emit:catalog-sql
  (then replace the SNF catalog section in this file with scripts/_local_catalog_generated.sql, or run the
   node splice documented in scripts/emit-local-catalog-sql.ts header).

Catalog seed in this file: 40 rows in public.local_meals (MEAL001–MEAL041 except MEAL003) + 30 rows in public.local_workouts (WRK001–WRK030), idempotent ON CONFLICT (id) DO UPDATE.
================================================================================
*/

-- Remote user profile mirror (single JSON document per authenticated user).
-- Run in Supabase SQL Editor AFTER Auth is enabled.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles (updated_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- User-owned data tables for SNF app (Supabase / Postgres)
-- Includes: RLS + indexes

create extension if not exists pgcrypto;

-- 1) user_onboarding_data
create table if not exists public.user_onboarding_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  age integer,
  gender text,
  weight_kg numeric,
  height_cm numeric,
  activity_level text,
  health_conditions text[] not null default '{}',
  symptoms text[] not null default '{}',
  habits jsonb not null default '{}'::jsonb,
  goals text[] not null default '{}',
  dietary_restrictions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_onboarding_data_user_id
  on public.user_onboarding_data (user_id);

-- 2) user_daily_logs
create table if not exists public.user_daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  meals jsonb not null default '{}'::jsonb,
  water_cups integer not null default 0,
  vitamins_taken text[] not null default '{}',
  calories_consumed numeric,
  calories_goal numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_daily_logs_user_id_log_date
  on public.user_daily_logs (user_id, log_date);

-- Needed for RPC update_daily_progress_batch (on conflict) in create-health-sync-layer.sql
create unique index if not exists ux_user_daily_logs_user_date
  on public.user_daily_logs (user_id, log_date);

-- 3) user_health_progress
create table if not exists public.user_health_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_number integer not null,
  habit_progress jsonb not null default '{}'::jsonb,
  lab_tests_done text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_health_progress_user_id_week
  on public.user_health_progress (user_id, week_number);

-- RLS
alter table public.user_onboarding_data enable row level security;
alter table public.user_daily_logs enable row level security;
alter table public.user_health_progress enable row level security;

-- Policies: owner only
drop policy if exists "Users can read own onboarding" on public.user_onboarding_data;
create policy "Users can read own onboarding"
on public.user_onboarding_data
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding" on public.user_onboarding_data;
create policy "Users can insert own onboarding"
on public.user_onboarding_data
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own onboarding" on public.user_onboarding_data;
create policy "Users can update own onboarding"
on public.user_onboarding_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own onboarding" on public.user_onboarding_data;
create policy "Users can delete own onboarding"
on public.user_onboarding_data
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own daily logs" on public.user_daily_logs;
create policy "Users can read own daily logs"
on public.user_daily_logs
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own daily logs" on public.user_daily_logs;
create policy "Users can insert own daily logs"
on public.user_daily_logs
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own daily logs" on public.user_daily_logs;
create policy "Users can update own daily logs"
on public.user_daily_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own daily logs" on public.user_daily_logs;
create policy "Users can delete own daily logs"
on public.user_daily_logs
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own health progress" on public.user_health_progress;
create policy "Users can read own health progress"
on public.user_health_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own health progress" on public.user_health_progress;
create policy "Users can insert own health progress"
on public.user_health_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own health progress" on public.user_health_progress;
create policy "Users can update own health progress"
on public.user_health_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own health progress" on public.user_health_progress;
create policy "Users can delete own health progress"
on public.user_health_progress
for delete
using (auth.uid() = user_id);

-- Upgrade path (older DBs created before this column / index):
alter table public.user_daily_logs add column if not exists updated_at timestamptz not null default now();

-- Medical data tables for SNF app (Supabase / Postgres)
-- Safe to run multiple times where possible.

create extension if not exists pgcrypto;

-- 1) vitamins_guide
create table if not exists public.vitamins_guide (
  id uuid primary key default gen_random_uuid(),
  condition_id text,
  symptom_id text,
  nutrient text,
  dose_range text,
  timing text,
  duration text,
  contraindications text,
  egyptian_foods text,
  cost_egp text,
  priority text,
  created_at timestamptz not null default now()
);

-- 2) lab_tests_catalog
create table if not exists public.lab_tests_catalog (
  id uuid primary key default gen_random_uuid(),
  test_code text not null unique,
  test_name text not null,
  condition_id text not null,
  priority text not null,
  cost_min_egp integer not null,
  cost_max_egp integer not null,
  fasting_hours integer not null,
  best_time text,
  why_needed text not null,
  preparation text,
  frequency text not null,
  created_at timestamptz not null default now()
);

-- 3) habit_reduction_plans
create table if not exists public.habit_reduction_plans (
  id uuid primary key default gen_random_uuid(),
  habit_id text not null unique,
  habit_name text not null,
  current_min integer,
  current_max integer not null,
  safe_limit text not null,
  risk_level text,
  week_1_target text not null,
  week_1_how text,
  week_1_replace text,
  week_2_target text not null,
  week_2_how text,
  week_2_replace text,
  week_3_target text not null,
  week_3_how text,
  week_3_replace text,
  week_4_target text not null,
  week_4_how text,
  week_4_replace text,
  health_risks text not null,
  withdrawal_symptoms text not null,
  expected_benefits text not null,
  created_at timestamptz not null default now()
);

-- 4) water_reminders
create table if not exists public.water_reminders (
  id uuid primary key default gen_random_uuid(),
  age_min integer not null,
  age_max integer not null,
  gender text not null,
  activity_level text not null,
  weight_min_kg integer not null,
  weight_max_kg integer not null,
  water_goal_ml integer not null,
  cups_per_day integer not null,
  reminder_times text[] not null default '{}',
  benefits text,
  created_at timestamptz not null default now()
);

-- 5) user_health_plans (personalization)
-- NOTE: auth.users.id is uuid in Supabase, so user_id is uuid for valid FK.
create table if not exists public.user_health_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null,
  plan_data jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_health_plans_plan_type_check check (plan_type in ('vitamin', 'lab', 'habit', 'water')),
  constraint user_health_plans_status_check check (status in ('active', 'completed', 'paused'))
);

-- If these tables already exist from a previous run, ensure columns that are
-- not present in the Excel seeds are allowed to be NULL.
do $$
begin
  begin
    alter table public.vitamins_guide alter column condition_id drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column nutrient drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column dose_range drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column timing drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column duration drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column contraindications drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column egyptian_foods drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column cost_egp drop not null;
  exception when others then null; end;
  begin
    alter table public.vitamins_guide alter column priority drop not null;
  exception when others then null; end;

  begin
    alter table public.lab_tests_catalog alter column best_time drop not null;
  exception when others then null; end;
  begin
    alter table public.lab_tests_catalog alter column preparation drop not null;
  exception when others then null; end;

  begin
    alter table public.habit_reduction_plans alter column current_min drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column risk_level drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_1_how drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_1_replace drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_2_how drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_2_replace drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_3_how drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_3_replace drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_4_how drop not null;
  exception when others then null; end;
  begin
    alter table public.habit_reduction_plans alter column week_4_replace drop not null;
  exception when others then null; end;

  begin
    alter table public.water_reminders alter column benefits drop not null;
  exception when others then null; end;
end $$;

-- Basic sanity checks (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lab_tests_catalog_cost_check'
  ) then
    alter table public.lab_tests_catalog
      add constraint lab_tests_catalog_cost_check
      check (cost_min_egp <= cost_max_egp);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'habit_reduction_plans_current_check'
  ) then
    alter table public.habit_reduction_plans
      add constraint habit_reduction_plans_current_check
      check (current_min <= current_max);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'water_reminders_age_check'
  ) then
    alter table public.water_reminders
      add constraint water_reminders_age_check
      check (age_min <= age_max);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'water_reminders_weight_check'
  ) then
    alter table public.water_reminders
      add constraint water_reminders_weight_check
      check (weight_min_kg <= weight_max_kg);
  end if;
end $$;

-- Enable RLS
alter table public.vitamins_guide enable row level security;
alter table public.lab_tests_catalog enable row level security;
alter table public.habit_reduction_plans enable row level security;
alter table public.water_reminders enable row level security;
alter table public.user_health_plans enable row level security;

-- Public read policies for catalog/reference tables
drop policy if exists "Public read vitamins_guide" on public.vitamins_guide;
create policy "Public read vitamins_guide"
on public.vitamins_guide
for select
using (true);

drop policy if exists "Public read lab_tests_catalog" on public.lab_tests_catalog;
create policy "Public read lab_tests_catalog"
on public.lab_tests_catalog
for select
using (true);

drop policy if exists "Public read habit_reduction_plans" on public.habit_reduction_plans;
create policy "Public read habit_reduction_plans"
on public.habit_reduction_plans
for select
using (true);

drop policy if exists "Public read water_reminders" on public.water_reminders;
create policy "Public read water_reminders"
on public.water_reminders
for select
using (true);

-- user_health_plans: only owner can read/write
drop policy if exists "Users can read own health plans" on public.user_health_plans;
create policy "Users can read own health plans"
on public.user_health_plans
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own health plans" on public.user_health_plans;
create policy "Users can insert own health plans"
on public.user_health_plans
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own health plans" on public.user_health_plans;
create policy "Users can update own health plans"
on public.user_health_plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own health plans" on public.user_health_plans;
create policy "Users can delete own health plans"
on public.user_health_plans
for delete
using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_vitamins_guide_condition_id
  on public.vitamins_guide (condition_id);
create index if not exists idx_vitamins_guide_priority
  on public.vitamins_guide (priority);

create index if not exists idx_lab_tests_catalog_condition_id
  on public.lab_tests_catalog (condition_id);
create index if not exists idx_lab_tests_catalog_priority
  on public.lab_tests_catalog (priority);
create index if not exists idx_lab_tests_catalog_fasting_hours
  on public.lab_tests_catalog (fasting_hours);

create index if not exists idx_habit_reduction_plans_risk_level
  on public.habit_reduction_plans (risk_level);

create index if not exists idx_water_reminders_profile_lookup
  on public.water_reminders (age_min, age_max, gender, activity_level);

create index if not exists idx_user_health_plans_user_id
  on public.user_health_plans (user_id);
create index if not exists idx_user_health_plans_plan_type
  on public.user_health_plans (plan_type);
create index if not exists idx_user_health_plans_status
  on public.user_health_plans (status);
create index if not exists idx_user_health_plans_user_status
  on public.user_health_plans (user_id, status);
create index if not exists idx_user_health_plans_plan_data_gin
  on public.user_health_plans using gin (plan_data);
-- Chat history table for AI conversation persistence
create extension if not exists pgcrypto;

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null default 'default',
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.chat_history enable row level security;

drop policy if exists "Users can read own chat history" on public.chat_history;
create policy "Users can read own chat history"
on public.chat_history
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat history" on public.chat_history;
create policy "Users can insert own chat history"
on public.chat_history
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own chat history" on public.chat_history;
create policy "Users can delete own chat history"
on public.chat_history
for delete
using (auth.uid() = user_id);

create index if not exists idx_chat_history_user_created
  on public.chat_history (user_id, created_at desc);

create index if not exists idx_chat_history_user_session_created
  on public.chat_history (user_id, session_id, created_at desc);
-- Habits management tables for SNF app
-- Run in Supabase SQL editor.

create table if not exists public.user_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  frequency text not null check (frequency in ('daily','weekly')),
  time_of_day time null,
  reminders_enabled boolean not null default true,
  target_per_week integer not null default 7,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.user_habits(id) on delete cascade,
  log_date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

create index if not exists idx_user_habits_user_archived on public.user_habits(user_id, archived, created_at desc);
create index if not exists idx_user_habit_logs_user_date on public.user_habit_logs(user_id, log_date desc);

alter table public.user_habits enable row level security;
alter table public.user_habit_logs enable row level security;

drop policy if exists user_habits_owner_all on public.user_habits;
create policy user_habits_owner_all on public.user_habits
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_habit_logs_owner_all on public.user_habit_logs;
create policy user_habit_logs_owner_all on public.user_habit_logs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- Per-user notification preferences (cloud mirror for reinstall / new device).
--
-- Column names MUST stay aligned with:
--   lib/localNotifications.ts (DEFAULT_NOTIFICATION_SETTINGS + upsert fields)
--   lib/pushNotifications.ts (fcm_token, push_enabled)
-- Do not rename to alternate schemas without updating those modules.

create extension if not exists pgcrypto;

create table if not exists public.user_notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  water_reminders boolean not null default true,
  water_reminder_interval_hours integer not null default 2,
  vitamin_reminders boolean not null default true,
  vitamin_reminder_time time not null default '08:00',
  workout_reminders boolean not null default true,
  workout_reminder_time time not null default '07:00',
  meal_reminders boolean not null default true,
  meal_breakfast_time time not null default '08:30',
  meal_lunch_time time not null default '13:30',
  meal_dinner_time time not null default '20:00',
  habit_reminders boolean not null default true,
  habit_reminder_time time not null default '16:00',
  lab_reminders boolean not null default true,
  lab_reminder_day_of_week integer not null default 1,
  lab_reminder_time time not null default '10:00',
  push_enabled boolean not null default true,
  fcm_token text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_notification_settings enable row level security;

drop policy if exists user_notification_settings_owner_all on public.user_notification_settings;
create policy user_notification_settings_owner_all on public.user_notification_settings
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- Synchronization layer tables and helper RPC
-- Apply in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_or_meal_id text not null,
  meal_type text null,
  calories numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.user_lab_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_code text not null,
  value_numeric numeric(12,4) null,
  unit text null,
  measured_at timestamptz not null default now(),
  interpretation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  action text null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_meal_logs_user_time on public.meal_logs(user_id, eaten_at desc);
create index if not exists idx_lab_results_user_time on public.user_lab_results(user_id, measured_at desc);
create index if not exists idx_user_alerts_user_read on public.user_alerts(user_id, is_read, created_at desc);

alter table public.meal_logs enable row level security;
alter table public.user_lab_results enable row level security;
alter table public.user_alerts enable row level security;

drop policy if exists meal_logs_owner_all on public.meal_logs;
create policy meal_logs_owner_all on public.meal_logs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_lab_results_owner_all on public.user_lab_results;
create policy user_lab_results_owner_all on public.user_lab_results
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_alerts_owner_all on public.user_alerts;
create policy user_alerts_owner_all on public.user_alerts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_daily_progress_batch(
  p_user_id uuid,
  p_updates jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  calories_delta numeric := coalesce((p_updates ->> 'calories_delta')::numeric, 0);
  water_cups_delta integer := coalesce((p_updates ->> 'water_cups_delta')::integer, 0);
  new_vitamin text := nullif((p_updates ->> 'vitamin_id'), '');
begin
  insert into public.user_daily_logs (
    user_id, log_date, meals, water_cups, vitamins_taken, calories_consumed, calories_goal, updated_at
  )
  values (
    p_user_id, current_date, '{}'::jsonb, greatest(0, water_cups_delta),
    case when new_vitamin is null then '{}'::text[] else array[new_vitamin] end,
    greatest(0, calories_delta), 0, now()
  )
  on conflict (user_id, log_date) do update
  set
    water_cups = greatest(0, user_daily_logs.water_cups + water_cups_delta),
    calories_consumed = greatest(0, user_daily_logs.calories_consumed + calories_delta),
    vitamins_taken = case
      when new_vitamin is null then user_daily_logs.vitamins_taken
      else array_append(user_daily_logs.vitamins_taken, new_vitamin)
    end,
    updated_at = now();
end;
$$;

grant execute on function public.update_daily_progress_batch(uuid, jsonb) to authenticated;
-- Personalized meal planning engine schema (Supabase/Postgres)
-- Apply in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text null,
  category text not null,
  calories numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  fiber_g numeric(8,2) not null default 0,
  sugar_g numeric(8,2) not null default 0,
  sodium_mg numeric(8,2) not null default 0,
  vitamin_c_mg numeric(8,2) not null default 0,
  vitamin_d_mcg numeric(8,2) not null default 0,
  vitamin_b12_mcg numeric(8,2) not null default 0,
  iron_mg numeric(8,2) not null default 0,
  calcium_mg numeric(8,2) not null default 0,
  potassium_mg numeric(8,2) not null default 0,
  glycemic_index integer null,
  glycemic_load numeric(8,2) null,
  avoid_if_conditions text[] not null default '{}',
  avoid_with_medications text[] not null default '{}',
  is_vegetarian boolean not null default false,
  is_vegan boolean not null default false,
  is_gluten_free boolean not null default false,
  is_dairy_free boolean not null default false,
  is_halal boolean not null default true,
  allergens text[] not null default '{}',
  cuisine_type text[] not null default '{}',
  common_in_egypt boolean not null default false,
  cost_level text not null default 'moderate',
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text null,
  description text null,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text[] not null default '{}',
  prep_time_minutes integer not null default 10,
  cooking_time_minutes integer not null default 15,
  servings integer not null default 1,
  difficulty text not null default 'easy',
  calories_per_serving numeric(8,2) not null default 0,
  macros_per_serving jsonb not null default '{}'::jsonb,
  micronutrients jsonb not null default '{}'::jsonb,
  safe_for_conditions text[] not null default '{}',
  unsafe_for_conditions text[] not null default '{}',
  avoid_with_medications text[] not null default '{}',
  tags text[] not null default '{}',
  cuisine text not null default 'egyptian',
  meal_type text[] not null default '{}',
  budget_level text not null default 'moderate',
  created_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  meal_type text not null,
  recipe_id uuid null references public.recipes(id) on delete set null,
  total_calories numeric(8,2) not null default 0,
  total_protein_g numeric(8,2) not null default 0,
  total_carbs_g numeric(8,2) not null default 0,
  total_fat_g numeric(8,2) not null default 0,
  is_completed boolean not null default false,
  user_rating integer null,
  created_at timestamptz not null default now(),
  unique(user_id, plan_date, meal_type)
);

create table if not exists public.user_medical_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  medications text[] not null default '{}',
  dietary_preferences text[] not null default '{}',
  cultural_preferences text[] not null default '{egyptian}',
  budget_level text not null default 'moderate',
  cooking_skill text not null default 'easy',
  max_prep_time_minutes integer not null default 40,
  updated_at timestamptz not null default now()
);

create index if not exists idx_recipes_meal_type on public.recipes using gin(meal_type);
create index if not exists idx_recipes_unsafe_conditions on public.recipes using gin(unsafe_for_conditions);
create index if not exists idx_foods_avoid_conditions on public.foods using gin(avoid_if_conditions);
create index if not exists idx_foods_allergens on public.foods using gin(allergens);
create index if not exists idx_meal_plans_user_date on public.meal_plans(user_id, plan_date);

alter table public.foods enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.user_medical_preferences enable row level security;

drop policy if exists foods_read_all on public.foods;
create policy foods_read_all on public.foods for select to authenticated using (true);

drop policy if exists recipes_read_all on public.recipes;
create policy recipes_read_all on public.recipes for select to authenticated using (true);

drop policy if exists meal_plans_owner_all on public.meal_plans;
create policy meal_plans_owner_all on public.meal_plans
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_medical_prefs_owner_all on public.user_medical_preferences;
create policy user_medical_prefs_owner_all on public.user_medical_preferences
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
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


-- Meals (40 rows)
insert into public.local_meals (
  id, name, meal_type, calories, protein, carbs, fat, fiber, emoji, foods,
  difficulty, prep_time, conditions_suitable, conditions_avoid,
  weight_loss_score, muscle_gain_score, heart_health_score, diabetes_score,
  is_vegetarian, is_gluten_free, updated_at
) values
(
  'MEAL001', 'Egyptian Healthy Breakfast', 'Breakfast',
  380, 22, 45, 12, 6,
  '🫘', 'Foul + boiled eggs + brown bread + salad', 'Easy', 15,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Blood pressure (no salt)']::text[],
  8, 7, 9, 8,
  false, true, now()
),
(
  'MEAL002', 'Light Breakfast', 'Breakfast',
  250, 15, 30, 8, 5,
  '🥣', 'Greek yogurt + oats + fruits', 'Easy', 10,
  ARRAY['Diabetes', 'Obesity', 'Colon']::text[], ARRAY['Lactose intolerance']::text[],
  9, 5, 8, 9,
  true, true, now()
),
(
  'MEAL004', 'Healthy Koshari', 'Lunch',
  380, 14, 58, 12, 8,
  '🍲', 'Basmati koshari + green salad', 'Medium', 30,
  ARRAY['Diabetes', 'Heart']::text[], ARRAY['Gout']::text[],
  7, 6, 7, 8,
  true, false, now()
),
(
  'MEAL005', 'Low Sodium Koshari', 'Lunch',
  350, 12, 55, 10, 7,
  '🍲', 'Salt-free koshari + lemon', 'Medium', 30,
  ARRAY['Blood pressure']::text[], ARRAY['Gout']::text[],
  8, 5, 10, 7,
  true, false, now()
),
(
  'MEAL006', 'Grilled Chicken + Vegetables', 'Lunch',
  420, 38, 25, 14, 6,
  '🍗', 'Grilled chicken breast + steamed vegetables + brown rice', 'Medium', 35,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 10, 9, 8,
  false, true, now()
),
(
  'MEAL007', 'Baked Fish + Salad', 'Dinner',
  340, 32, 18, 12, 5,
  '🐟', 'Baked fish fillet + green salad + lemon', 'Medium', 30,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Fish allergy']::text[],
  9, 8, 10, 9,
  false, true, now()
),
(
  'MEAL008', 'Lentil Soup', 'Dinner',
  220, 14, 30, 5, 9,
  '🍵', 'Red lentil soup + lemon + cumin + whole bread', 'Easy', 25,
  ARRAY['Diabetes', 'Heart', 'Obesity', 'Colon']::text[], ARRAY[]::text[],
  9, 6, 9, 9,
  true, false, now()
),
(
  'MEAL009', 'Molokhia + Chicken', 'Lunch',
  380, 30, 35, 12, 7,
  '🥬', 'Molokhia + grilled chicken + brown rice + lemon', 'Hard', 45,
  ARRAY['Heart', 'General', 'Anemia']::text[], ARRAY[]::text[],
  7, 8, 9, 7,
  false, true, now()
),
(
  'MEAL010', 'Protein Snack Box', 'Snack',
  180, 15, 12, 8, 3,
  '🥜', 'Hard boiled eggs + almonds + cucumber slices', 'Easy', 5,
  ARRAY['Diabetes', 'Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY['Nut allergy']::text[],
  8, 8, 8, 9,
  true, true, now()
),
(
  'MEAL011', 'Tuna Salad', 'Lunch',
  290, 28, 15, 12, 4,
  '🥗', 'Tuna + lettuce + tomato + cucumber + olive oil + lemon', 'Easy', 10,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Fish allergy']::text[],
  9, 8, 9, 9,
  false, true, now()
),
(
  'MEAL012', 'Oatmeal + Fruits', 'Breakfast',
  280, 10, 48, 6, 8,
  '🥣', 'Oatmeal + banana + berries + honey + skim milk', 'Easy', 10,
  ARRAY['Diabetes', 'Heart', 'Colon', 'Obesity']::text[], ARRAY['Gluten intolerance']::text[],
  8, 6, 9, 7,
  true, false, now()
),
(
  'MEAL013', 'Ful Medames Plate', 'Breakfast',
  340, 16, 48, 10, 10,
  '🫘', 'Foul + olive oil + lemon + green onion + baladi bread', 'Easy', 12,
  ARRAY['Diabetes', 'Colon', 'Heart']::text[], ARRAY[]::text[],
  8, 6, 8, 8,
  true, false, now()
),
(
  'MEAL014', 'Shakshuka', 'Breakfast',
  320, 18, 22, 18, 4,
  '🍳', 'Eggs in tomato sauce + herbs + whole bread', 'Easy', 20,
  ARRAY['Obesity', 'Heart']::text[], ARRAY[]::text[],
  8, 7, 8, 7,
  true, false, now()
),
(
  'MEAL015', 'Baladi Cheese Sandwich', 'Breakfast',
  290, 14, 32, 12, 3,
  '🥪', 'Light white cheese + tomato + cucumber + brown bread', 'Easy', 8,
  ARRAY['Heart', 'Obesity']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 7,
  true, false, now()
),
(
  'MEAL016', 'Dates & Milk Porridge', 'Breakfast',
  310, 10, 52, 7, 5,
  '🌴', 'Warm milk + oats + chopped dates + cinnamon', 'Easy', 12,
  ARRAY['Anemia', 'Colon']::text[], ARRAY['Dairy/Milk', 'Diabetes Type 2']::text[],
  6, 6, 7, 5,
  true, false, now()
),
(
  'MEAL017', 'Egg White Omelette', 'Breakfast',
  220, 22, 8, 10, 2,
  '🍳', 'Egg whites + spinach + mushrooms + olive oil spray', 'Easy', 12,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 8, 9, 8,
  true, true, now()
),
(
  'MEAL018', 'Stuffed Vine Leaves (Light)', 'Lunch',
  280, 8, 38, 10, 6,
  '🍃', 'Rice-stuffed vine leaves + yogurt side + salad', 'Medium', 40,
  ARRAY['Heart', 'Colon']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 7,
  true, true, now()
),
(
  'MEAL019', 'Sayadeya Fish', 'Dinner',
  420, 34, 45, 12, 4,
  '🐟', 'Baked fish + cumin rice + onion + salad', 'Hard', 50,
  ARRAY['Heart', 'Diabetes Type 2']::text[], ARRAY['Fish allergy']::text[],
  7, 8, 9, 7,
  false, true, now()
),
(
  'MEAL020', 'Kofta Grill Plate', 'Lunch',
  480, 35, 35, 22, 4,
  '🍢', 'Grilled kofta + tahini dip + parsley salad + rice', 'Medium', 35,
  ARRAY['Muscle Gain', 'Anemia']::text[], ARRAY['Kidney Disease']::text[],
  5, 9, 6, 5,
  false, true, now()
),
(
  'MEAL021', 'Mahshi Zucchini', 'Lunch',
  260, 10, 38, 8, 7,
  '🥒', 'Stuffed zucchini + tomato sauce + side salad', 'Hard', 55,
  ARRAY['Diabetes Type 2', 'Heart', 'Obesity']::text[], ARRAY[]::text[],
  9, 5, 9, 8,
  true, true, now()
),
(
  'MEAL022', 'Koshari Light Bowl', 'Lunch',
  320, 12, 52, 8, 8,
  '🍲', 'Less oil koshari + spicy tomato + lentils', 'Medium', 25,
  ARRAY['Colon', 'Obesity']::text[], ARRAY['Gout']::text[],
  8, 5, 7, 8,
  true, false, now()
),
(
  'MEAL023', 'Grilled Halloumi Salad', 'Lunch',
  340, 18, 16, 24, 5,
  '🧀', 'Halloumi + mixed greens + olives + lemon', 'Easy', 15,
  ARRAY['Muscle Gain', 'Maintain']::text[], ARRAY['Dairy/Milk']::text[],
  7, 7, 7, 6,
  true, true, now()
),
(
  'MEAL024', 'Chicken Shawarma Bowl', 'Dinner',
  450, 40, 38, 16, 5,
  '🌯', 'Grilled chicken strips + hummus + pickles + veg', 'Medium', 30,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY[]::text[],
  6, 9, 7, 6,
  false, false, now()
),
(
  'MEAL025', 'Vegetable Tagine', 'Dinner',
  300, 9, 48, 9, 10,
  '🥘', 'Slow cooked vegetables + chickpeas + spices + couscous side', 'Hard', 60,
  ARRAY['Heart', 'Colon', 'Diabetes Type 2']::text[], ARRAY[]::text[],
  9, 5, 9, 8,
  true, false, now()
),
(
  'MEAL026', 'Beef Liver (Small Portion)', 'Lunch',
  280, 28, 10, 14, 2,
  '🫀', 'Pan-seared liver + onion + lemon + greens', 'Medium', 20,
  ARRAY['Anemia']::text[], ARRAY['High cholesterol — ask MD']::text[],
  7, 8, 5, 6,
  false, true, now()
),
(
  'MEAL027', 'Yogurt Cucumber Dip Lunch', 'Lunch',
  240, 14, 28, 8, 4,
  '🥒', 'Greek yogurt dip + whole pita + grilled veg', 'Easy', 12,
  ARRAY['Obesity', 'Colon']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 8,
  true, false, now()
),
(
  'MEAL028', 'Salmon Quinoa Bowl', 'Dinner',
  460, 36, 38, 18, 6,
  '🐟', 'Baked salmon + quinoa + roasted vegetables', 'Medium', 35,
  ARRAY['Heart', 'Muscle Gain']::text[], ARRAY['Fish allergy']::text[],
  6, 9, 10, 7,
  false, true, now()
),
(
  'MEAL029', 'Stuffed Bell Peppers', 'Dinner',
  310, 22, 30, 12, 6,
  '🫑', 'Peppers + lean beef + rice + herbs', 'Medium', 45,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY[]::text[],
  8, 8, 8, 7,
  false, true, now()
),
(
  'MEAL030', 'Cottage Cheese & Berries', 'Snack',
  190, 18, 18, 5, 3,
  '🫐', 'Low-fat cottage cheese + berries + chia', 'Easy', 5,
  ARRAY['Obesity', 'Muscle Gain', 'Diabetes Type 2']::text[], ARRAY['Dairy/Milk']::text[],
  9, 7, 8, 9,
  true, true, now()
),
(
  'MEAL031', 'Hummus & Veg Sticks', 'Snack',
  210, 8, 22, 10, 8,
  '🥕', 'Hummus + carrot + cucumber + bell pepper sticks', 'Easy', 8,
  ARRAY['Diabetes Type 2', 'Heart', 'Colon']::text[], ARRAY[]::text[],
  9, 5, 9, 9,
  true, true, now()
),
(
  'MEAL032', 'Grilled Paneer Tikka', 'Lunch',
  360, 24, 18, 22, 3,
  '🧈', 'Paneer + peppers + yogurt marinade + lettuce wrap', 'Medium', 25,
  ARRAY['Muscle Gain', 'Maintain']::text[], ARRAY['Dairy/Milk']::text[],
  6, 8, 6, 6,
  true, true, now()
),
(
  'MEAL033', 'Chicken Soup + Greens', 'Dinner',
  240, 26, 16, 8, 4,
  '🍲', 'Clear chicken broth + spinach + zucchini + herbs', 'Easy', 35,
  ARRAY['Heart', 'Obesity', 'Hypertension']::text[], ARRAY[]::text[],
  9, 6, 10, 8,
  false, true, now()
),
(
  'MEAL034', 'Pasta Primavera Light', 'Lunch',
  370, 14, 58, 10, 8,
  '🍝', 'Whole-grain pasta + seasonal vegetables + olive oil', 'Easy', 22,
  ARRAY['Colon', 'Heart']::text[], ARRAY['Gluten/Wheat']::text[],
  7, 5, 8, 6,
  true, false, now()
),
(
  'MEAL035', 'Quinoa Salad Bowl', 'Lunch',
  350, 14, 42, 14, 9,
  '🥗', 'Quinoa + chickpeas + herbs + citrus dressing', 'Easy', 20,
  ARRAY['Diabetes Type 2', 'Colon', 'Obesity']::text[], ARRAY[]::text[],
  9, 6, 9, 8,
  true, true, now()
),
(
  'MEAL036', 'Beef Kebab Skewers', 'Dinner',
  440, 38, 22, 22, 4,
  '🍖', 'Lean beef skewers + grilled vegetables + bulgur side', 'Medium', 35,
  ARRAY['Muscle Gain', 'Anemia']::text[], ARRAY['Kidney Disease']::text[],
  5, 9, 6, 5,
  false, false, now()
),
(
  'MEAL037', 'Spinach Fatteh', 'Lunch',
  330, 14, 38, 14, 7,
  '🥬', 'Toasted pita + yogurt + garlic spinach + chickpeas', 'Medium', 28,
  ARRAY['Colon', 'Muscle Gain']::text[], ARRAY['Dairy/Milk', 'Gluten/Wheat']::text[],
  7, 6, 7, 6,
  true, false, now()
),
(
  'MEAL038', 'Turkey Meatballs + Zoodles', 'Dinner',
  310, 32, 18, 12, 6,
  '🦃', 'Baked turkey meatballs + zucchini noodles + marinara', 'Medium', 30,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 8, 9, 8,
  false, true, now()
),
(
  'MEAL039', 'Baladi Breakfast Tray', 'Breakfast',
  360, 16, 42, 14, 5,
  '🧺', 'Feta + cucumber + tomato + olives + egg + half baladi', 'Easy', 10,
  ARRAY['Maintain', 'Heart']::text[], ARRAY['Dairy/Milk']::text[],
  7, 6, 8, 6,
  false, false, now()
),
(
  'MEAL040', 'Roasted Veg + Lentil Bowl', 'Dinner',
  340, 18, 52, 8, 14,
  '🥣', 'Roasted veg + brown lentils + tahini lemon dressing', 'Easy', 35,
  ARRAY['Diabetes Type 2', 'Heart', 'Colon', 'Obesity']::text[], ARRAY[]::text[],
  9, 6, 9, 9,
  true, true, now()
),
(
  'MEAL041', 'Protein Smoothie', 'Snack',
  260, 28, 28, 6, 4,
  '🥤', 'Whey or soy protein + banana + oat milk + flax', 'Easy', 5,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY['Dairy/Milk']::text[],
  7, 9, 7, 6,
  true, true, now()
)
on conflict (id) do update set
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


-- Workouts (30 rows)
insert into public.local_workouts (
  id, name, muscle_group, difficulty, equipment, calories_burned, duration,
  sets, reps, emoji, goal, instructions, rest_seconds, updated_at
) values
(
  'WRK001', 'Squats', 'Quads',
  'Beginner', 'Barbell', 175,
  '20 min', 3, '12-15', '🏋️',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair. Keep chest up and knees behind toes. Push through heels to return to start.', 60,
  now()
),
(
  'WRK002', 'Squats Intermediate', 'Quads',
  'Intermediate', 'Barbell', 250,
  '25 min', 4, '10-12', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Add weight to barbell. Keep core tight throughout movement. Full depth squat recommended. Control the descent.', 90,
  now()
),
(
  'WRK003', 'Push-ups', 'Chest',
  'Beginner', 'Bodyweight', 120,
  '15 min', 3, '10-12', '💪',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Start in plank position. Lower chest to ground keeping elbows at 45°. Push back up. Keep core engaged throughout.', 45,
  now()
),
(
  'WRK004', 'Running', 'Full Body',
  'Beginner', 'None', 300,
  '30 min', 1, '30 min', '🏃',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Warm up 5 min walking. Run at moderate pace keeping breathing steady. Cool down 5 min walking. Stay hydrated.', 0,
  now()
),
(
  'WRK005', 'Plank', 'Core',
  'Beginner', 'Bodyweight', 80,
  '10 min', 3, '45 sec', '🧘',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Forearms on ground, elbows under shoulders. Keep body in straight line. Engage core and glutes. Do not let hips drop.', 30,
  now()
),
(
  'WRK006', 'HIIT Cardio', 'Full Body',
  'Intermediate', 'None', 400,
  '25 min', 5, '30s work/15s rest', '⚡',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Alternate between high-intensity exercises: jumping jacks, burpees, mountain climbers. Give maximum effort during work periods.', 15,
  now()
),
(
  'WRK007', 'Deadlift', 'Back',
  'Intermediate', 'Barbell', 250,
  '20 min', 4, '8-10', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Feet hip-width apart, bar over mid-foot. Hinge at hips, grip bar. Keep back flat, drive through heels. Lock out at top.', 120,
  now()
),
(
  'WRK008', 'Yoga Flow', 'Full Body',
  'Beginner', 'Mat', 150,
  '40 min', 1, '40 min', '🧘',
  ARRAY['Maintain', 'Flexibility']::text[], 'Follow sun salutation sequence. Hold each pose 5 breaths. Focus on breathing and alignment. Great for stress relief.', 0,
  now()
),
(
  'WRK009', 'Jump Rope', 'Full Body',
  'Beginner', 'Jump Rope', 350,
  '20 min', 3, '3 min', '🪢',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Keep elbows close to body. Jump just high enough for rope to pass. Land softly on balls of feet. Start slow and build speed.', 60,
  now()
),
(
  'WRK010', 'Pull-ups', 'Back',
  'Intermediate', 'Pull-up Bar', 180,
  '15 min', 4, '6-10', '💪',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Grip bar slightly wider than shoulders. Pull chest to bar, keeping core tight. Lower slowly with control. Full range of motion.', 90,
  now()
),
(
  'WRK011', 'Walking Brisk', 'Full Body',
  'Beginner', 'None', 180,
  '35 min', 1, '35 min', '🚶',
  ARRAY['Weight Loss', 'Maintain', 'Cardio']::text[], 'Brisk walk, swing arms, steady breathing. Flat route preferred.', 0,
  now()
),
(
  'WRK012', 'Wall Sit', 'Quads',
  'Beginner', 'Bodyweight', 90,
  '10 min', 4, '30 sec', '🧱',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Back flat on wall, thighs parallel. Build time gradually.', 45,
  now()
),
(
  'WRK013', 'Dumbbell Rows', 'Back',
  'Beginner', 'Dumbbells', 140,
  '20 min', 3, '12', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Hinge at hips, pull dumbbells to ribcage, squeeze shoulder blades.', 60,
  now()
),
(
  'WRK014', 'Lunges', 'Quads',
  'Beginner', 'Bodyweight', 160,
  '15 min', 3, '12 each', '🦵',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Step forward, knee tracks over ankle, back knee near floor.', 45,
  now()
),
(
  'WRK015', 'Cycling Easy', 'Legs',
  'Beginner', 'None', 220,
  '30 min', 1, '30 min', '🚴',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Outdoor or stationary. Moderate resistance, consistent cadence.', 0,
  now()
),
(
  'WRK016', 'Tricep Dips Bench', 'Arms',
  'Beginner', 'Bodyweight', 100,
  '12 min', 3, '10-15', '💪',
  ARRAY['Muscle Gain', 'Maintain']::text[], 'Hands behind on bench, lower hips, elbows bend to 90°.', 45,
  now()
),
(
  'WRK017', 'Seated Rows Band', 'Back',
  'Beginner', 'None', 110,
  '15 min', 3, '15', '🎯',
  ARRAY['Muscle Gain', 'Maintain']::text[], 'Use resistance band anchored. Pull elbows back, posture tall.', 45,
  now()
),
(
  'WRK018', 'Mountain Climber Slow', 'Core',
  'Beginner', 'Bodyweight', 130,
  '12 min', 3, '20 slow', '⛰️',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Plank position, slow alternate knee drives, hips stable.', 30,
  now()
),
(
  'WRK019', 'Side Plank', 'Core',
  'Beginner', 'Bodyweight', 70,
  '10 min', 3, '30 sec side', '📐',
  ARRAY['Maintain', 'Muscle Gain']::text[], 'Elbow under shoulder, body straight, switch sides.', 30,
  now()
),
(
  'WRK020', 'Romanian Deadlift DB', 'Hamstrings',
  'Intermediate', 'Dumbbells', 180,
  '20 min', 3, '10', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Soft knee hinge, dumbbells close to legs, feel hamstring stretch.', 75,
  now()
),
(
  'WRK021', 'Chest Press DB', 'Chest',
  'Intermediate', 'Dumbbells', 160,
  '18 min', 3, '10', '💪',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Bench or floor, press up with control, elbows ~45°.', 60,
  now()
),
(
  'WRK022', 'Step-ups', 'Quads',
  'Beginner', 'Bodyweight', 150,
  '15 min', 3, '12 each', '🪜',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Use stable step or low bench, full foot on step, drive through heel.', 45,
  now()
),
(
  'WRK023', 'Swimming Light', 'Full Body',
  'Beginner', 'None', 280,
  '30 min', 1, '30 min', '🏊',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Easy pace, mix strokes, focus on breathing rhythm.', 0,
  now()
),
(
  'WRK024', 'Stretching Routine', 'Full Body',
  'Beginner', 'Mat', 60,
  '20 min', 1, '20 min', '🤸',
  ARRAY['Maintain', 'Flexibility']::text[], 'Hold stretches 20–30s, no bouncing, breathe steady.', 0,
  now()
),
(
  'WRK025', 'Kettlebell Swing Light', 'Glutes',
  'Intermediate', 'Dumbbells', 200,
  '15 min', 4, '15', '🔔',
  ARRAY['Weight Loss', 'Muscle Gain', 'Cardio']::text[], 'Hip hinge power, arms relaxed, stop if back rounds.', 60,
  now()
),
(
  'WRK026', 'Elliptical Steady', 'Full Body',
  'Beginner', 'None', 240,
  '25 min', 1, '25 min', '⚙️',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Low impact, upright posture, moderate resistance.', 0,
  now()
),
(
  'WRK027', 'Farmer Carry', 'Full Body',
  'Intermediate', 'Dumbbells', 170,
  '15 min', 4, '40m', '🧑‍🌾',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Heavy dumbbells at sides, tall posture, short controlled steps.', 90,
  now()
),
(
  'WRK028', 'Superman Back', 'Back',
  'Beginner', 'Bodyweight', 55,
  '10 min', 3, '12', '🦸',
  ARRAY['Maintain', 'Muscle Gain']::text[], 'Lie prone, lift chest and thighs, pause, lower slowly.', 30,
  now()
),
(
  'WRK029', 'Box Breathing Walk', 'Full Body',
  'Beginner', 'None', 100,
  '15 min', 1, '15 min', '🌬️',
  ARRAY['Maintain', 'Cardio']::text[], 'Slow walk with 4-4-4-4 breathing pattern. Low stress recovery.', 0,
  now()
),
(
  'WRK030', 'Hamstring Bridge', 'Hamstrings',
  'Beginner', 'Bodyweight', 85,
  '12 min', 3, '15', '🌉',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Shoulders on ground, lift hips, press through heels, squeeze glutes.', 45,
  now()
)
on conflict (id) do update set
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
