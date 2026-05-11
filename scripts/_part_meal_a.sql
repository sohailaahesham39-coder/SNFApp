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