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
