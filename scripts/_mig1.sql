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

drop policy if exists "Public read local_meals" on public.local_meals;
create policy "Public read local_meals" on public.local_meals for select using (true);

drop policy if exists "Public read local_workouts" on public.local_workouts;
create policy "Public read local_workouts" on public.local_workouts for select using (true);

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