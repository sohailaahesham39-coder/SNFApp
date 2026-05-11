/*
================================================================================
SNFAPP — MASTER Supabase setup (single paste)
================================================================================
HOW TO RUN:
  1. Supabase Dashboard → SQL Editor → New query.
  2. Paste this ENTIRE file → Run.

If CREATE UNIQUE INDEX ux_user_daily_logs_user_date fails (duplicates):
  - Run scripts/dedupe-user-daily-logs.sql first, then re-run the index from
    create-user-data-tables.sql (or paste just that statement).

ORDER BAKED IN:
  profiles → user core logs → medical catalogs + health plans → chat → habits
  → notification settings → sync RPC layer → meal planning schema

Optional after schema:
  npm run seed:medical   (from project root, needs service role / env configured)
================================================================================
*/

