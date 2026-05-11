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
