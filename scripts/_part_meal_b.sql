-- Meals (40 rows)
insert into public.local_meals (
  id, name, meal_type, calories, protein, carbs, fat, fiber, emoji, foods,
  difficulty, prep_time, conditions_suitable, conditions_avoid,
  weight_loss_score, muscle_gain_score, heart_health_score, diabetes_score,
  is_vegetarian, is_gluten_free, updated_at
) values
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