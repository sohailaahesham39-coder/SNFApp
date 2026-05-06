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
