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