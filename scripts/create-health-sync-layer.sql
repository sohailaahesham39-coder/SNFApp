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
