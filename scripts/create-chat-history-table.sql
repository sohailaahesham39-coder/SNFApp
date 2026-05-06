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
