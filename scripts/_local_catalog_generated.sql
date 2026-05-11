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


-- Meals (40 rows)
insert into public.local_meals (
  id, name, meal_type, calories, protein, carbs, fat, fiber, emoji, foods,
  difficulty, prep_time, conditions_suitable, conditions_avoid,
  weight_loss_score, muscle_gain_score, heart_health_score, diabetes_score,
  is_vegetarian, is_gluten_free, updated_at
) values
(
  'MEAL001', 'Egyptian Healthy Breakfast', 'Breakfast',
  380, 22, 45, 12, 6,
  '🫘', 'Foul + boiled eggs + brown bread + salad', 'Easy', 15,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Blood pressure (no salt)']::text[],
  8, 7, 9, 8,
  false, true, now()
),
(
  'MEAL002', 'Light Breakfast', 'Breakfast',
  250, 15, 30, 8, 5,
  '🥣', 'Greek yogurt + oats + fruits', 'Easy', 10,
  ARRAY['Diabetes', 'Obesity', 'Colon']::text[], ARRAY['Lactose intolerance']::text[],
  9, 5, 8, 9,
  true, true, now()
),
(
  'MEAL004', 'Healthy Koshari', 'Lunch',
  380, 14, 58, 12, 8,
  '🍲', 'Basmati koshari + green salad', 'Medium', 30,
  ARRAY['Diabetes', 'Heart']::text[], ARRAY['Gout']::text[],
  7, 6, 7, 8,
  true, false, now()
),
(
  'MEAL005', 'Low Sodium Koshari', 'Lunch',
  350, 12, 55, 10, 7,
  '🍲', 'Salt-free koshari + lemon', 'Medium', 30,
  ARRAY['Blood pressure']::text[], ARRAY['Gout']::text[],
  8, 5, 10, 7,
  true, false, now()
),
(
  'MEAL006', 'Grilled Chicken + Vegetables', 'Lunch',
  420, 38, 25, 14, 6,
  '🍗', 'Grilled chicken breast + steamed vegetables + brown rice', 'Medium', 35,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 10, 9, 8,
  false, true, now()
),
(
  'MEAL007', 'Baked Fish + Salad', 'Dinner',
  340, 32, 18, 12, 5,
  '🐟', 'Baked fish fillet + green salad + lemon', 'Medium', 30,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Fish allergy']::text[],
  9, 8, 10, 9,
  false, true, now()
),
(
  'MEAL008', 'Lentil Soup', 'Dinner',
  220, 14, 30, 5, 9,
  '🍵', 'Red lentil soup + lemon + cumin + whole bread', 'Easy', 25,
  ARRAY['Diabetes', 'Heart', 'Obesity', 'Colon']::text[], ARRAY[]::text[],
  9, 6, 9, 9,
  true, false, now()
),
(
  'MEAL009', 'Molokhia + Chicken', 'Lunch',
  380, 30, 35, 12, 7,
  '🥬', 'Molokhia + grilled chicken + brown rice + lemon', 'Hard', 45,
  ARRAY['Heart', 'General', 'Anemia']::text[], ARRAY[]::text[],
  7, 8, 9, 7,
  false, true, now()
),
(
  'MEAL010', 'Protein Snack Box', 'Snack',
  180, 15, 12, 8, 3,
  '🥜', 'Hard boiled eggs + almonds + cucumber slices', 'Easy', 5,
  ARRAY['Diabetes', 'Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY['Nut allergy']::text[],
  8, 8, 8, 9,
  true, true, now()
),
(
  'MEAL011', 'Tuna Salad', 'Lunch',
  290, 28, 15, 12, 4,
  '🥗', 'Tuna + lettuce + tomato + cucumber + olive oil + lemon', 'Easy', 10,
  ARRAY['Diabetes', 'Heart', 'Obesity']::text[], ARRAY['Fish allergy']::text[],
  9, 8, 9, 9,
  false, true, now()
),
(
  'MEAL012', 'Oatmeal + Fruits', 'Breakfast',
  280, 10, 48, 6, 8,
  '🥣', 'Oatmeal + banana + berries + honey + skim milk', 'Easy', 10,
  ARRAY['Diabetes', 'Heart', 'Colon', 'Obesity']::text[], ARRAY['Gluten intolerance']::text[],
  8, 6, 9, 7,
  true, false, now()
),
(
  'MEAL013', 'Ful Medames Plate', 'Breakfast',
  340, 16, 48, 10, 10,
  '🫘', 'Foul + olive oil + lemon + green onion + baladi bread', 'Easy', 12,
  ARRAY['Diabetes', 'Colon', 'Heart']::text[], ARRAY[]::text[],
  8, 6, 8, 8,
  true, false, now()
),
(
  'MEAL014', 'Shakshuka', 'Breakfast',
  320, 18, 22, 18, 4,
  '🍳', 'Eggs in tomato sauce + herbs + whole bread', 'Easy', 20,
  ARRAY['Obesity', 'Heart']::text[], ARRAY[]::text[],
  8, 7, 8, 7,
  true, false, now()
),
(
  'MEAL015', 'Baladi Cheese Sandwich', 'Breakfast',
  290, 14, 32, 12, 3,
  '🥪', 'Light white cheese + tomato + cucumber + brown bread', 'Easy', 8,
  ARRAY['Heart', 'Obesity']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 7,
  true, false, now()
),
(
  'MEAL016', 'Dates & Milk Porridge', 'Breakfast',
  310, 10, 52, 7, 5,
  '🌴', 'Warm milk + oats + chopped dates + cinnamon', 'Easy', 12,
  ARRAY['Anemia', 'Colon']::text[], ARRAY['Dairy/Milk', 'Diabetes Type 2']::text[],
  6, 6, 7, 5,
  true, false, now()
),
(
  'MEAL017', 'Egg White Omelette', 'Breakfast',
  220, 22, 8, 10, 2,
  '🍳', 'Egg whites + spinach + mushrooms + olive oil spray', 'Easy', 12,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 8, 9, 8,
  true, true, now()
),
(
  'MEAL018', 'Stuffed Vine Leaves (Light)', 'Lunch',
  280, 8, 38, 10, 6,
  '🍃', 'Rice-stuffed vine leaves + yogurt side + salad', 'Medium', 40,
  ARRAY['Heart', 'Colon']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 7,
  true, true, now()
),
(
  'MEAL019', 'Sayadeya Fish', 'Dinner',
  420, 34, 45, 12, 4,
  '🐟', 'Baked fish + cumin rice + onion + salad', 'Hard', 50,
  ARRAY['Heart', 'Diabetes Type 2']::text[], ARRAY['Fish allergy']::text[],
  7, 8, 9, 7,
  false, true, now()
),
(
  'MEAL020', 'Kofta Grill Plate', 'Lunch',
  480, 35, 35, 22, 4,
  '🍢', 'Grilled kofta + tahini dip + parsley salad + rice', 'Medium', 35,
  ARRAY['Muscle Gain', 'Anemia']::text[], ARRAY['Kidney Disease']::text[],
  5, 9, 6, 5,
  false, true, now()
),
(
  'MEAL021', 'Mahshi Zucchini', 'Lunch',
  260, 10, 38, 8, 7,
  '🥒', 'Stuffed zucchini + tomato sauce + side salad', 'Hard', 55,
  ARRAY['Diabetes Type 2', 'Heart', 'Obesity']::text[], ARRAY[]::text[],
  9, 5, 9, 8,
  true, true, now()
),
(
  'MEAL022', 'Koshari Light Bowl', 'Lunch',
  320, 12, 52, 8, 8,
  '🍲', 'Less oil koshari + spicy tomato + lentils', 'Medium', 25,
  ARRAY['Colon', 'Obesity']::text[], ARRAY['Gout']::text[],
  8, 5, 7, 8,
  true, false, now()
),
(
  'MEAL023', 'Grilled Halloumi Salad', 'Lunch',
  340, 18, 16, 24, 5,
  '🧀', 'Halloumi + mixed greens + olives + lemon', 'Easy', 15,
  ARRAY['Muscle Gain', 'Maintain']::text[], ARRAY['Dairy/Milk']::text[],
  7, 7, 7, 6,
  true, true, now()
),
(
  'MEAL024', 'Chicken Shawarma Bowl', 'Dinner',
  450, 40, 38, 16, 5,
  '🌯', 'Grilled chicken strips + hummus + pickles + veg', 'Medium', 30,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY[]::text[],
  6, 9, 7, 6,
  false, false, now()
),
(
  'MEAL025', 'Vegetable Tagine', 'Dinner',
  300, 9, 48, 9, 10,
  '🥘', 'Slow cooked vegetables + chickpeas + spices + couscous side', 'Hard', 60,
  ARRAY['Heart', 'Colon', 'Diabetes Type 2']::text[], ARRAY[]::text[],
  9, 5, 9, 8,
  true, false, now()
),
(
  'MEAL026', 'Beef Liver (Small Portion)', 'Lunch',
  280, 28, 10, 14, 2,
  '🫀', 'Pan-seared liver + onion + lemon + greens', 'Medium', 20,
  ARRAY['Anemia']::text[], ARRAY['High cholesterol — ask MD']::text[],
  7, 8, 5, 6,
  false, true, now()
),
(
  'MEAL027', 'Yogurt Cucumber Dip Lunch', 'Lunch',
  240, 14, 28, 8, 4,
  '🥒', 'Greek yogurt dip + whole pita + grilled veg', 'Easy', 12,
  ARRAY['Obesity', 'Colon']::text[], ARRAY['Dairy/Milk']::text[],
  8, 5, 8, 8,
  true, false, now()
),
(
  'MEAL028', 'Salmon Quinoa Bowl', 'Dinner',
  460, 36, 38, 18, 6,
  '🐟', 'Baked salmon + quinoa + roasted vegetables', 'Medium', 35,
  ARRAY['Heart', 'Muscle Gain']::text[], ARRAY['Fish allergy']::text[],
  6, 9, 10, 7,
  false, true, now()
),
(
  'MEAL029', 'Stuffed Bell Peppers', 'Dinner',
  310, 22, 30, 12, 6,
  '🫑', 'Peppers + lean beef + rice + herbs', 'Medium', 45,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY[]::text[],
  8, 8, 8, 7,
  false, true, now()
),
(
  'MEAL030', 'Cottage Cheese & Berries', 'Snack',
  190, 18, 18, 5, 3,
  '🫐', 'Low-fat cottage cheese + berries + chia', 'Easy', 5,
  ARRAY['Obesity', 'Muscle Gain', 'Diabetes Type 2']::text[], ARRAY['Dairy/Milk']::text[],
  9, 7, 8, 9,
  true, true, now()
),
(
  'MEAL031', 'Hummus & Veg Sticks', 'Snack',
  210, 8, 22, 10, 8,
  '🥕', 'Hummus + carrot + cucumber + bell pepper sticks', 'Easy', 8,
  ARRAY['Diabetes Type 2', 'Heart', 'Colon']::text[], ARRAY[]::text[],
  9, 5, 9, 9,
  true, true, now()
),
(
  'MEAL032', 'Grilled Paneer Tikka', 'Lunch',
  360, 24, 18, 22, 3,
  '🧈', 'Paneer + peppers + yogurt marinade + lettuce wrap', 'Medium', 25,
  ARRAY['Muscle Gain', 'Maintain']::text[], ARRAY['Dairy/Milk']::text[],
  6, 8, 6, 6,
  true, true, now()
),
(
  'MEAL033', 'Chicken Soup + Greens', 'Dinner',
  240, 26, 16, 8, 4,
  '🍲', 'Clear chicken broth + spinach + zucchini + herbs', 'Easy', 35,
  ARRAY['Heart', 'Obesity', 'Hypertension']::text[], ARRAY[]::text[],
  9, 6, 10, 8,
  false, true, now()
),
(
  'MEAL034', 'Pasta Primavera Light', 'Lunch',
  370, 14, 58, 10, 8,
  '🍝', 'Whole-grain pasta + seasonal vegetables + olive oil', 'Easy', 22,
  ARRAY['Colon', 'Heart']::text[], ARRAY['Gluten/Wheat']::text[],
  7, 5, 8, 6,
  true, false, now()
),
(
  'MEAL035', 'Quinoa Salad Bowl', 'Lunch',
  350, 14, 42, 14, 9,
  '🥗', 'Quinoa + chickpeas + herbs + citrus dressing', 'Easy', 20,
  ARRAY['Diabetes Type 2', 'Colon', 'Obesity']::text[], ARRAY[]::text[],
  9, 6, 9, 8,
  true, true, now()
),
(
  'MEAL036', 'Beef Kebab Skewers', 'Dinner',
  440, 38, 22, 22, 4,
  '🍖', 'Lean beef skewers + grilled vegetables + bulgur side', 'Medium', 35,
  ARRAY['Muscle Gain', 'Anemia']::text[], ARRAY['Kidney Disease']::text[],
  5, 9, 6, 5,
  false, false, now()
),
(
  'MEAL037', 'Spinach Fatteh', 'Lunch',
  330, 14, 38, 14, 7,
  '🥬', 'Toasted pita + yogurt + garlic spinach + chickpeas', 'Medium', 28,
  ARRAY['Colon', 'Muscle Gain']::text[], ARRAY['Dairy/Milk', 'Gluten/Wheat']::text[],
  7, 6, 7, 6,
  true, false, now()
),
(
  'MEAL038', 'Turkey Meatballs + Zoodles', 'Dinner',
  310, 32, 18, 12, 6,
  '🦃', 'Baked turkey meatballs + zucchini noodles + marinara', 'Medium', 30,
  ARRAY['Obesity', 'Heart', 'Muscle Gain']::text[], ARRAY[]::text[],
  9, 8, 9, 8,
  false, true, now()
),
(
  'MEAL039', 'Baladi Breakfast Tray', 'Breakfast',
  360, 16, 42, 14, 5,
  '🧺', 'Feta + cucumber + tomato + olives + egg + half baladi', 'Easy', 10,
  ARRAY['Maintain', 'Heart']::text[], ARRAY['Dairy/Milk']::text[],
  7, 6, 8, 6,
  false, false, now()
),
(
  'MEAL040', 'Roasted Veg + Lentil Bowl', 'Dinner',
  340, 18, 52, 8, 14,
  '🥣', 'Roasted veg + brown lentils + tahini lemon dressing', 'Easy', 35,
  ARRAY['Diabetes Type 2', 'Heart', 'Colon', 'Obesity']::text[], ARRAY[]::text[],
  9, 6, 9, 9,
  true, true, now()
),
(
  'MEAL041', 'Protein Smoothie', 'Snack',
  260, 28, 28, 6, 4,
  '🥤', 'Whey or soy protein + banana + oat milk + flax', 'Easy', 5,
  ARRAY['Muscle Gain', 'Obesity']::text[], ARRAY['Dairy/Milk']::text[],
  7, 9, 7, 6,
  true, true, now()
)
on conflict (id) do update set
  name = excluded.name,
  meal_type = excluded.meal_type,
  calories = excluded.calories,
  protein = excluded.protein,
  carbs = excluded.carbs,
  fat = excluded.fat,
  fiber = excluded.fiber,
  emoji = excluded.emoji,
  foods = excluded.foods,
  difficulty = excluded.difficulty,
  prep_time = excluded.prep_time,
  conditions_suitable = excluded.conditions_suitable,
  conditions_avoid = excluded.conditions_avoid,
  weight_loss_score = excluded.weight_loss_score,
  muscle_gain_score = excluded.muscle_gain_score,
  heart_health_score = excluded.heart_health_score,
  diabetes_score = excluded.diabetes_score,
  is_vegetarian = excluded.is_vegetarian,
  is_gluten_free = excluded.is_gluten_free,
  updated_at = now();


-- Workouts (30 rows)
insert into public.local_workouts (
  id, name, muscle_group, difficulty, equipment, calories_burned, duration,
  sets, reps, emoji, goal, instructions, rest_seconds, updated_at
) values
(
  'WRK001', 'Squats', 'Quads',
  'Beginner', 'Barbell', 175,
  '20 min', 3, '12-15', '🏋️',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair. Keep chest up and knees behind toes. Push through heels to return to start.', 60,
  now()
),
(
  'WRK002', 'Squats Intermediate', 'Quads',
  'Intermediate', 'Barbell', 250,
  '25 min', 4, '10-12', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Add weight to barbell. Keep core tight throughout movement. Full depth squat recommended. Control the descent.', 90,
  now()
),
(
  'WRK003', 'Push-ups', 'Chest',
  'Beginner', 'Bodyweight', 120,
  '15 min', 3, '10-12', '💪',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Start in plank position. Lower chest to ground keeping elbows at 45°. Push back up. Keep core engaged throughout.', 45,
  now()
),
(
  'WRK004', 'Running', 'Full Body',
  'Beginner', 'None', 300,
  '30 min', 1, '30 min', '🏃',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Warm up 5 min walking. Run at moderate pace keeping breathing steady. Cool down 5 min walking. Stay hydrated.', 0,
  now()
),
(
  'WRK005', 'Plank', 'Core',
  'Beginner', 'Bodyweight', 80,
  '10 min', 3, '45 sec', '🧘',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Forearms on ground, elbows under shoulders. Keep body in straight line. Engage core and glutes. Do not let hips drop.', 30,
  now()
),
(
  'WRK006', 'HIIT Cardio', 'Full Body',
  'Intermediate', 'None', 400,
  '25 min', 5, '30s work/15s rest', '⚡',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Alternate between high-intensity exercises: jumping jacks, burpees, mountain climbers. Give maximum effort during work periods.', 15,
  now()
),
(
  'WRK007', 'Deadlift', 'Back',
  'Intermediate', 'Barbell', 250,
  '20 min', 4, '8-10', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Feet hip-width apart, bar over mid-foot. Hinge at hips, grip bar. Keep back flat, drive through heels. Lock out at top.', 120,
  now()
),
(
  'WRK008', 'Yoga Flow', 'Full Body',
  'Beginner', 'Mat', 150,
  '40 min', 1, '40 min', '🧘',
  ARRAY['Maintain', 'Flexibility']::text[], 'Follow sun salutation sequence. Hold each pose 5 breaths. Focus on breathing and alignment. Great for stress relief.', 0,
  now()
),
(
  'WRK009', 'Jump Rope', 'Full Body',
  'Beginner', 'Jump Rope', 350,
  '20 min', 3, '3 min', '🪢',
  ARRAY['Weight Loss', 'Cardio']::text[], 'Keep elbows close to body. Jump just high enough for rope to pass. Land softly on balls of feet. Start slow and build speed.', 60,
  now()
),
(
  'WRK010', 'Pull-ups', 'Back',
  'Intermediate', 'Pull-up Bar', 180,
  '15 min', 4, '6-10', '💪',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Grip bar slightly wider than shoulders. Pull chest to bar, keeping core tight. Lower slowly with control. Full range of motion.', 90,
  now()
),
(
  'WRK011', 'Walking Brisk', 'Full Body',
  'Beginner', 'None', 180,
  '35 min', 1, '35 min', '🚶',
  ARRAY['Weight Loss', 'Maintain', 'Cardio']::text[], 'Brisk walk, swing arms, steady breathing. Flat route preferred.', 0,
  now()
),
(
  'WRK012', 'Wall Sit', 'Quads',
  'Beginner', 'Bodyweight', 90,
  '10 min', 4, '30 sec', '🧱',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Back flat on wall, thighs parallel. Build time gradually.', 45,
  now()
),
(
  'WRK013', 'Dumbbell Rows', 'Back',
  'Beginner', 'Dumbbells', 140,
  '20 min', 3, '12', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Hinge at hips, pull dumbbells to ribcage, squeeze shoulder blades.', 60,
  now()
),
(
  'WRK014', 'Lunges', 'Quads',
  'Beginner', 'Bodyweight', 160,
  '15 min', 3, '12 each', '🦵',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Step forward, knee tracks over ankle, back knee near floor.', 45,
  now()
),
(
  'WRK015', 'Cycling Easy', 'Legs',
  'Beginner', 'None', 220,
  '30 min', 1, '30 min', '🚴',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Outdoor or stationary. Moderate resistance, consistent cadence.', 0,
  now()
),
(
  'WRK016', 'Tricep Dips Bench', 'Arms',
  'Beginner', 'Bodyweight', 100,
  '12 min', 3, '10-15', '💪',
  ARRAY['Muscle Gain', 'Maintain']::text[], 'Hands behind on bench, lower hips, elbows bend to 90°.', 45,
  now()
),
(
  'WRK017', 'Seated Rows Band', 'Back',
  'Beginner', 'None', 110,
  '15 min', 3, '15', '🎯',
  ARRAY['Muscle Gain', 'Maintain']::text[], 'Use resistance band anchored. Pull elbows back, posture tall.', 45,
  now()
),
(
  'WRK018', 'Mountain Climber Slow', 'Core',
  'Beginner', 'Bodyweight', 130,
  '12 min', 3, '20 slow', '⛰️',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Plank position, slow alternate knee drives, hips stable.', 30,
  now()
),
(
  'WRK019', 'Side Plank', 'Core',
  'Beginner', 'Bodyweight', 70,
  '10 min', 3, '30 sec side', '📐',
  ARRAY['Maintain', 'Muscle Gain']::text[], 'Elbow under shoulder, body straight, switch sides.', 30,
  now()
),
(
  'WRK020', 'Romanian Deadlift DB', 'Hamstrings',
  'Intermediate', 'Dumbbells', 180,
  '20 min', 3, '10', '🏋️',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Soft knee hinge, dumbbells close to legs, feel hamstring stretch.', 75,
  now()
),
(
  'WRK021', 'Chest Press DB', 'Chest',
  'Intermediate', 'Dumbbells', 160,
  '18 min', 3, '10', '💪',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Bench or floor, press up with control, elbows ~45°.', 60,
  now()
),
(
  'WRK022', 'Step-ups', 'Quads',
  'Beginner', 'Bodyweight', 150,
  '15 min', 3, '12 each', '🪜',
  ARRAY['Weight Loss', 'Muscle Gain']::text[], 'Use stable step or low bench, full foot on step, drive through heel.', 45,
  now()
),
(
  'WRK023', 'Swimming Light', 'Full Body',
  'Beginner', 'None', 280,
  '30 min', 1, '30 min', '🏊',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Easy pace, mix strokes, focus on breathing rhythm.', 0,
  now()
),
(
  'WRK024', 'Stretching Routine', 'Full Body',
  'Beginner', 'Mat', 60,
  '20 min', 1, '20 min', '🤸',
  ARRAY['Maintain', 'Flexibility']::text[], 'Hold stretches 20–30s, no bouncing, breathe steady.', 0,
  now()
),
(
  'WRK025', 'Kettlebell Swing Light', 'Glutes',
  'Intermediate', 'Dumbbells', 200,
  '15 min', 4, '15', '🔔',
  ARRAY['Weight Loss', 'Muscle Gain', 'Cardio']::text[], 'Hip hinge power, arms relaxed, stop if back rounds.', 60,
  now()
),
(
  'WRK026', 'Elliptical Steady', 'Full Body',
  'Beginner', 'None', 240,
  '25 min', 1, '25 min', '⚙️',
  ARRAY['Weight Loss', 'Cardio', 'Maintain']::text[], 'Low impact, upright posture, moderate resistance.', 0,
  now()
),
(
  'WRK027', 'Farmer Carry', 'Full Body',
  'Intermediate', 'Dumbbells', 170,
  '15 min', 4, '40m', '🧑‍🌾',
  ARRAY['Muscle Gain', 'Strength']::text[], 'Heavy dumbbells at sides, tall posture, short controlled steps.', 90,
  now()
),
(
  'WRK028', 'Superman Back', 'Back',
  'Beginner', 'Bodyweight', 55,
  '10 min', 3, '12', '🦸',
  ARRAY['Maintain', 'Muscle Gain']::text[], 'Lie prone, lift chest and thighs, pause, lower slowly.', 30,
  now()
),
(
  'WRK029', 'Box Breathing Walk', 'Full Body',
  'Beginner', 'None', 100,
  '15 min', 1, '15 min', '🌬️',
  ARRAY['Maintain', 'Cardio']::text[], 'Slow walk with 4-4-4-4 breathing pattern. Low stress recovery.', 0,
  now()
),
(
  'WRK030', 'Hamstring Bridge', 'Hamstrings',
  'Beginner', 'Bodyweight', 85,
  '12 min', 3, '15', '🌉',
  ARRAY['Weight Loss', 'Maintain']::text[], 'Shoulders on ground, lift hips, press through heels, squeeze glutes.', 45,
  now()
)
on conflict (id) do update set
  name = excluded.name,
  muscle_group = excluded.muscle_group,
  difficulty = excluded.difficulty,
  equipment = excluded.equipment,
  calories_burned = excluded.calories_burned,
  duration = excluded.duration,
  sets = excluded.sets,
  reps = excluded.reps,
  emoji = excluded.emoji,
  goal = excluded.goal,
  instructions = excluded.instructions,
  rest_seconds = excluded.rest_seconds,
  updated_at = now();
