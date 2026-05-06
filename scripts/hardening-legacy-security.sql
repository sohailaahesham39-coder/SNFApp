-- Legacy Supabase security hardening pass
-- Applied to project: kslxfyanrpcbwfkvycsp

-- Remove permissive write policies that bypass RLS protections
drop policy if exists "service insert allergens" on public.allergens;
drop policy if exists "service update allergens" on public.allergens;
drop policy if exists "service insert chatbot" on public.chatbot_intents;
drop policy if exists "service update chatbot" on public.chatbot_intents;
drop policy if exists "service insert conditions" on public.health_conditions;
drop policy if exists "service update conditions" on public.health_conditions;
drop policy if exists "service insert meals" on public.meals;
drop policy if exists "service update meals" on public.meals;
drop policy if exists "service insert workouts" on public.workouts;
drop policy if exists "service update workouts" on public.workouts;
drop policy if exists "public_insert_user_progress" on public.user_progress;

-- Revoke execute for public/authenticated roles on privileged SECURITY DEFINER function
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- user_profiles policies
drop policy if exists "legacy_user_profiles_select_own" on public.user_profiles;
create policy "legacy_user_profiles_select_own" on public.user_profiles for select
using (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_profiles_insert_own" on public.user_profiles;
create policy "legacy_user_profiles_insert_own" on public.user_profiles for insert
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_profiles_update_own" on public.user_profiles;
create policy "legacy_user_profiles_update_own" on public.user_profiles for update
using (((select auth.uid())::text = user_id::text))
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_profiles_delete_own" on public.user_profiles;
create policy "legacy_user_profiles_delete_own" on public.user_profiles for delete
using (((select auth.uid())::text = user_id::text));

-- user_conditions policies
drop policy if exists "legacy_user_conditions_select_own" on public.user_conditions;
create policy "legacy_user_conditions_select_own" on public.user_conditions for select
using (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_conditions_insert_own" on public.user_conditions;
create policy "legacy_user_conditions_insert_own" on public.user_conditions for insert
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_conditions_update_own" on public.user_conditions;
create policy "legacy_user_conditions_update_own" on public.user_conditions for update
using (((select auth.uid())::text = user_id::text))
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_user_conditions_delete_own" on public.user_conditions;
create policy "legacy_user_conditions_delete_own" on public.user_conditions for delete
using (((select auth.uid())::text = user_id::text));

-- progress policies
drop policy if exists "legacy_progress_select_own" on public.progress;
create policy "legacy_progress_select_own" on public.progress for select
using (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_progress_insert_own" on public.progress;
create policy "legacy_progress_insert_own" on public.progress for insert
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_progress_update_own" on public.progress;
create policy "legacy_progress_update_own" on public.progress for update
using (((select auth.uid())::text = user_id::text))
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_progress_delete_own" on public.progress;
create policy "legacy_progress_delete_own" on public.progress for delete
using (((select auth.uid())::text = user_id::text));

-- meal_logs policies
drop policy if exists "legacy_meal_logs_select_own" on public.meal_logs;
create policy "legacy_meal_logs_select_own" on public.meal_logs for select
using (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_meal_logs_insert_own" on public.meal_logs;
create policy "legacy_meal_logs_insert_own" on public.meal_logs for insert
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_meal_logs_update_own" on public.meal_logs;
create policy "legacy_meal_logs_update_own" on public.meal_logs for update
using (((select auth.uid())::text = user_id::text))
with check (((select auth.uid())::text = user_id::text));
drop policy if exists "legacy_meal_logs_delete_own" on public.meal_logs;
create policy "legacy_meal_logs_delete_own" on public.meal_logs for delete
using (((select auth.uid())::text = user_id::text));

-- Reference tables: explicit public read
drop policy if exists "legacy_egyptian_foods_public_read" on public.egyptian_foods;
create policy "legacy_egyptian_foods_public_read" on public.egyptian_foods for select using (true);
drop policy if exists "legacy_food_substitutions_public_read" on public.food_substitutions;
create policy "legacy_food_substitutions_public_read" on public.food_substitutions for select using (true);

-- Import/sensitive tables: explicit deny-all policy
drop policy if exists "legacy_chatbot_intents_import_no_access" on public.chatbot_intents_import;
create policy "legacy_chatbot_intents_import_no_access" on public.chatbot_intents_import for all using (false) with check (false);
drop policy if exists "legacy_meals_import_no_access" on public.meals_import;
create policy "legacy_meals_import_no_access" on public.meals_import for all using (false) with check (false);
drop policy if exists "legacy_progress_import_no_access" on public.progress_import;
create policy "legacy_progress_import_no_access" on public.progress_import for all using (false) with check (false);
drop policy if exists "legacy_users_no_access" on public.users;
create policy "legacy_users_no_access" on public.users for all using (false) with check (false);
