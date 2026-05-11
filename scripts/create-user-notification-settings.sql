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
