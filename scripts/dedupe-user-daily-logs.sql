-- Run BEFORE creating ux_user_daily_logs_user_date if duplicates exist.
-- Inspect duplicates:
--   SELECT user_id, log_date, COUNT(*) FROM public.user_daily_logs GROUP BY 1, 2 HAVING COUNT(*) > 1;

-- Keep newest row per (user_id, log_date) by id (lexicographic UUID order ≈ created order in many cases).
-- Adjust if you prefer max(created_at).
DELETE FROM public.user_daily_logs a
USING public.user_daily_logs b
WHERE a.user_id = b.user_id
  AND a.log_date = b.log_date
  AND a.id < b.id;
