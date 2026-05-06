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
  created_at timestamptz not null default now()
);

create index if not exists idx_user_daily_logs_user_id_log_date
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

