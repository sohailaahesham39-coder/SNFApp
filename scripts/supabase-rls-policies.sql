-- Run in Supabase Dashboard → SQL Editor after `meals`, `workouts`, and `user_progress` exist.
-- Adjust `user_id` type if your column is uuid (e.g. compare with auth.uid()::text = user_id::text).

-- Enable RLS
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workouts ENABLE ROW LEVEL SECURITY;

-- user_progress: own rows only
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own progress"
ON user_progress FOR DELETE
USING (auth.uid()::text = user_id);

-- Public read for reference tables (anon + authenticated)
DROP POLICY IF EXISTS "Anyone can view meals" ON meals;
DROP POLICY IF EXISTS "Anyone can view workouts" ON workouts;

CREATE POLICY "Anyone can view meals"
ON meals FOR SELECT
USING (true);

CREATE POLICY "Anyone can view workouts"
ON workouts FOR SELECT
USING (true);
