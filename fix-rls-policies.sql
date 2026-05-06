-- Enable RLS on tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- user_progress: Users can only see/insert their own data
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

-- meals & workouts: Everyone can read
CREATE POLICY "Anyone can view meals"
ON meals FOR SELECT
USING (true);

CREATE POLICY "Anyone can view workouts"
ON workouts FOR SELECT
USING (true);
