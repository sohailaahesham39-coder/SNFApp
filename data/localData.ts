import { EXTRA_MEALS, EXTRA_WORKOUTS } from './catalogExpansion';

export const MEALS = [
  { id: 'MEAL001', name: 'Egyptian Healthy Breakfast', meal_type: 'Breakfast', calories: 380, protein: 22, carbs: 45, fat: 12, fiber: 6, emoji: '🫘', foods: 'Foul + boiled eggs + brown bread + salad', difficulty: 'Easy', prep_time: 15, conditions_suitable: ['Diabetes', 'Heart', 'Obesity'], conditions_avoid: ['Blood pressure (no salt)'], weight_loss_score: 8, muscle_gain_score: 7, heart_health_score: 9, diabetes_score: 8, is_vegetarian: false, is_gluten_free: true },
  { id: 'MEAL002', name: 'Light Breakfast', meal_type: 'Breakfast', calories: 250, protein: 15, carbs: 30, fat: 8, fiber: 5, emoji: '🥣', foods: 'Greek yogurt + oats + fruits', difficulty: 'Easy', prep_time: 10, conditions_suitable: ['Diabetes', 'Obesity', 'Colon'], conditions_avoid: ['Lactose intolerance'], weight_loss_score: 9, muscle_gain_score: 5, heart_health_score: 8, diabetes_score: 9, is_vegetarian: true, is_gluten_free: true },
  { id: 'MEAL004', name: 'Healthy Koshari', meal_type: 'Lunch', calories: 380, protein: 14, carbs: 58, fat: 12, fiber: 8, emoji: '🍲', foods: 'Basmati koshari + green salad', difficulty: 'Medium', prep_time: 30, conditions_suitable: ['Diabetes', 'Heart'], conditions_avoid: ['Gout'], weight_loss_score: 7, muscle_gain_score: 6, heart_health_score: 7, diabetes_score: 8, is_vegetarian: true, is_gluten_free: false },
  { id: 'MEAL005', name: 'Low Sodium Koshari', meal_type: 'Lunch', calories: 350, protein: 12, carbs: 55, fat: 10, fiber: 7, emoji: '🍲', foods: 'Salt-free koshari + lemon', difficulty: 'Medium', prep_time: 30, conditions_suitable: ['Blood pressure'], conditions_avoid: ['Gout'], weight_loss_score: 8, muscle_gain_score: 5, heart_health_score: 10, diabetes_score: 7, is_vegetarian: true, is_gluten_free: false },
  { id: 'MEAL006', name: 'Grilled Chicken + Vegetables', meal_type: 'Lunch', calories: 420, protein: 38, carbs: 25, fat: 14, fiber: 6, emoji: '🍗', foods: 'Grilled chicken breast + steamed vegetables + brown rice', difficulty: 'Medium', prep_time: 35, conditions_suitable: ['Obesity', 'Heart', 'Muscle Gain'], conditions_avoid: [], weight_loss_score: 9, muscle_gain_score: 10, heart_health_score: 9, diabetes_score: 8, is_vegetarian: false, is_gluten_free: true },
  { id: 'MEAL007', name: 'Baked Fish + Salad', meal_type: 'Dinner', calories: 340, protein: 32, carbs: 18, fat: 12, fiber: 5, emoji: '🐟', foods: 'Baked fish fillet + green salad + lemon', difficulty: 'Medium', prep_time: 30, conditions_suitable: ['Diabetes', 'Heart', 'Obesity'], conditions_avoid: ['Fish allergy'], weight_loss_score: 9, muscle_gain_score: 8, heart_health_score: 10, diabetes_score: 9, is_vegetarian: false, is_gluten_free: true },
  { id: 'MEAL008', name: 'Lentil Soup', meal_type: 'Dinner', calories: 220, protein: 14, carbs: 30, fat: 5, fiber: 9, emoji: '🍵', foods: 'Red lentil soup + lemon + cumin + whole bread', difficulty: 'Easy', prep_time: 25, conditions_suitable: ['Diabetes', 'Heart', 'Obesity', 'Colon'], conditions_avoid: [], weight_loss_score: 9, muscle_gain_score: 6, heart_health_score: 9, diabetes_score: 9, is_vegetarian: true, is_gluten_free: false },
  { id: 'MEAL009', name: 'Molokhia + Chicken', meal_type: 'Lunch', calories: 380, protein: 30, carbs: 35, fat: 12, fiber: 7, emoji: '🥬', foods: 'Molokhia + grilled chicken + brown rice + lemon', difficulty: 'Hard', prep_time: 45, conditions_suitable: ['Heart', 'General', 'Anemia'], conditions_avoid: [], weight_loss_score: 7, muscle_gain_score: 8, heart_health_score: 9, diabetes_score: 7, is_vegetarian: false, is_gluten_free: true },
  { id: 'MEAL010', name: 'Protein Snack Box', meal_type: 'Snack', calories: 180, protein: 15, carbs: 12, fat: 8, fiber: 3, emoji: '🥜', foods: 'Hard boiled eggs + almonds + cucumber slices', difficulty: 'Easy', prep_time: 5, conditions_suitable: ['Diabetes', 'Obesity', 'Heart', 'Muscle Gain'], conditions_avoid: ['Nut allergy'], weight_loss_score: 8, muscle_gain_score: 8, heart_health_score: 8, diabetes_score: 9, is_vegetarian: true, is_gluten_free: true },
  { id: 'MEAL011', name: 'Tuna Salad', meal_type: 'Lunch', calories: 290, protein: 28, carbs: 15, fat: 12, fiber: 4, emoji: '🥗', foods: 'Tuna + lettuce + tomato + cucumber + olive oil + lemon', difficulty: 'Easy', prep_time: 10, conditions_suitable: ['Diabetes', 'Heart', 'Obesity'], conditions_avoid: ['Fish allergy'], weight_loss_score: 9, muscle_gain_score: 8, heart_health_score: 9, diabetes_score: 9, is_vegetarian: false, is_gluten_free: true },
  { id: 'MEAL012', name: 'Oatmeal + Fruits', meal_type: 'Breakfast', calories: 280, protein: 10, carbs: 48, fat: 6, fiber: 8, emoji: '🥣', foods: 'Oatmeal + banana + berries + honey + skim milk', difficulty: 'Easy', prep_time: 10, conditions_suitable: ['Diabetes', 'Heart', 'Colon', 'Obesity'], conditions_avoid: ['Gluten intolerance'], weight_loss_score: 8, muscle_gain_score: 6, heart_health_score: 9, diabetes_score: 7, is_vegetarian: true, is_gluten_free: false },
  ...EXTRA_MEALS,
];

export const WORKOUTS = [
  { id: 'WRK001', name: 'Squats', muscle_group: 'Quads', difficulty: 'Beginner', equipment: 'Barbell', calories_burned: 175, duration: '20 min', sets: 3, reps: '12-15', emoji: '🏋️', goal: ['Weight Loss', 'Muscle Gain'], instructions: 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair. Keep chest up and knees behind toes. Push through heels to return to start.', rest_seconds: 60 },
  { id: 'WRK002', name: 'Squats Intermediate', muscle_group: 'Quads', difficulty: 'Intermediate', equipment: 'Barbell', calories_burned: 250, duration: '25 min', sets: 4, reps: '10-12', emoji: '🏋️', goal: ['Muscle Gain', 'Strength'], instructions: 'Add weight to barbell. Keep core tight throughout movement. Full depth squat recommended. Control the descent.', rest_seconds: 90 },
  { id: 'WRK003', name: 'Push-ups', muscle_group: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', calories_burned: 120, duration: '15 min', sets: 3, reps: '10-12', emoji: '💪', goal: ['Weight Loss', 'Muscle Gain'], instructions: 'Start in plank position. Lower chest to ground keeping elbows at 45°. Push back up. Keep core engaged throughout.', rest_seconds: 45 },
  { id: 'WRK004', name: 'Running', muscle_group: 'Full Body', difficulty: 'Beginner', equipment: 'None', calories_burned: 300, duration: '30 min', sets: 1, reps: '30 min', emoji: '🏃', goal: ['Weight Loss', 'Cardio'], instructions: 'Warm up 5 min walking. Run at moderate pace keeping breathing steady. Cool down 5 min walking. Stay hydrated.', rest_seconds: 0 },
  { id: 'WRK005', name: 'Plank', muscle_group: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', calories_burned: 80, duration: '10 min', sets: 3, reps: '45 sec', emoji: '🧘', goal: ['Weight Loss', 'Maintain'], instructions: 'Forearms on ground, elbows under shoulders. Keep body in straight line. Engage core and glutes. Do not let hips drop.', rest_seconds: 30 },
  { id: 'WRK006', name: 'HIIT Cardio', muscle_group: 'Full Body', difficulty: 'Intermediate', equipment: 'None', calories_burned: 400, duration: '25 min', sets: 5, reps: '30s work/15s rest', emoji: '⚡', goal: ['Weight Loss', 'Cardio'], instructions: 'Alternate between high-intensity exercises: jumping jacks, burpees, mountain climbers. Give maximum effort during work periods.', rest_seconds: 15 },
  { id: 'WRK007', name: 'Deadlift', muscle_group: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', calories_burned: 250, duration: '20 min', sets: 4, reps: '8-10', emoji: '🏋️', goal: ['Muscle Gain', 'Strength'], instructions: 'Feet hip-width apart, bar over mid-foot. Hinge at hips, grip bar. Keep back flat, drive through heels. Lock out at top.', rest_seconds: 120 },
  { id: 'WRK008', name: 'Yoga Flow', muscle_group: 'Full Body', difficulty: 'Beginner', equipment: 'Mat', calories_burned: 150, duration: '40 min', sets: 1, reps: '40 min', emoji: '🧘', goal: ['Maintain', 'Flexibility'], instructions: 'Follow sun salutation sequence. Hold each pose 5 breaths. Focus on breathing and alignment. Great for stress relief.', rest_seconds: 0 },
  { id: 'WRK009', name: 'Jump Rope', muscle_group: 'Full Body', difficulty: 'Beginner', equipment: 'Jump Rope', calories_burned: 350, duration: '20 min', sets: 3, reps: '3 min', emoji: '🪢', goal: ['Weight Loss', 'Cardio'], instructions: 'Keep elbows close to body. Jump just high enough for rope to pass. Land softly on balls of feet. Start slow and build speed.', rest_seconds: 60 },
  { id: 'WRK010', name: 'Pull-ups', muscle_group: 'Back', difficulty: 'Intermediate', equipment: 'Pull-up Bar', calories_burned: 180, duration: '15 min', sets: 4, reps: '6-10', emoji: '💪', goal: ['Muscle Gain', 'Strength'], instructions: 'Grip bar slightly wider than shoulders. Pull chest to bar, keeping core tight. Lower slowly with control. Full range of motion.', rest_seconds: 90 },
  ...EXTRA_WORKOUTS,
];

export const HEALTH_CONDITIONS = [
  { id: 1, name: 'Diabetes Type 2', icon: '💉' },
  { id: 2, name: 'Hypertension', icon: '❤️' },
  { id: 3, name: 'Heart Disease', icon: '🫀' },
  { id: 4, name: 'Obesity', icon: '⚖️' },
  { id: 5, name: 'Colon Issues', icon: '🩺' },
  { id: 6, name: 'Kidney Disease', icon: '🫘' },
  { id: 7, name: 'Anemia', icon: '🩸' },
  { id: 8, name: 'Thyroid Issues', icon: '🦋' },
  { id: 9, name: 'None', icon: '✅' },
];

export const ALLERGENS = [
  { id: 1, name: 'Gluten/Wheat', icon: '🌾' },
  { id: 2, name: 'Dairy/Milk', icon: '🥛' },
  { id: 3, name: 'Eggs', icon: '🥚' },
  { id: 4, name: 'Peanuts', icon: '🥜' },
  { id: 5, name: 'Tree Nuts', icon: '🌰' },
  { id: 6, name: 'Fish', icon: '🐟' },
  { id: 7, name: 'Shellfish', icon: '🦐' },
  { id: 8, name: 'Soy', icon: '🫘' },
  { id: 9, name: 'None', icon: '✅' },
];

export const CHATBOT_RESPONSES: Record<string, string> = {
  'hello': "Welcome! I'm your Smart Nutrition Assistant. How can I help you today? 😊",
  'hi': "Welcome! I'm your Smart Nutrition Assistant. How can I help you today? 😊",
  'who are you': "I'm your Smart Nutrition & Fitness Assistant! I can help you with:\n• Building a healthy diet plan\n• Tracking allergies\n• Suggesting meals for your health condition\n• Monitoring your progress 💪",
  'bmi': "BMI = weight(kg) / height(m)². Normal range: 18.5–24.9. Want me to calculate yours from your profile?",
  'calories': "Your daily calorie needs depend on your weight, height, age, gender and activity level. I calculated your TDEE based on your profile!",
  'protein': "Aim for 1.6–2.2g of protein per kg of body weight daily. Great sources: chicken, fish, eggs, legumes, dairy!",
  'breakfast': "For breakfast I recommend: Foul medames with eggs and brown bread — high protein, slow carbs, perfect energy! 🫘",
  'lunch': "For lunch: Grilled chicken with rice and salad — balanced macros and keeps you full! 🍗",
  'dinner': "For dinner: Baked fish with steamed vegetables — light, high protein, great for recovery! 🐟",
  'weight loss': "To lose weight:\n• Eat in a 500 calorie deficit\n• Focus on protein (keeps you full)\n• Do cardio 3-4x/week\n• Drink 2.5L water daily 💧",
  'muscle': "To build muscle:\n• Eat in a 300 calorie surplus\n• Aim for 2g protein/kg\n• Resistance training 4-5x/week\n• Sleep 7-9 hours 💪",
  'water': "Aim for 8-10 glasses (2-2.5 liters) daily. More if you exercise or smoke! Staying hydrated boosts metabolism 💧",
  'diabetes': "For diabetes management:\n• Choose low glycemic foods\n• Control portion sizes\n• Avoid sugary drinks\n• Eat at regular times\n• Focus on fiber-rich foods 💉",
  'heart': "For heart health:\n• Reduce sodium intake\n• Eat omega-3 rich fish\n• Avoid saturated fats\n• Exercise regularly\n• Eat more vegetables 🫀",
  'coffee': "Coffee in moderation (1-2 cups/day) is fine for most people. If you have hypertension or anxiety, limit to 1 cup. Avoid after 2pm to protect sleep quality ☕",
  'smoking': "Smoking increases oxidative stress and reduces nutrient absorption. Increase Vitamin C (citrus, peppers), omega-3 (fish, flaxseed), and antioxidants (berries, green tea) to help counteract effects 🚬",
  'sugar': "Reduce added sugar by:\n• Choosing fruits over sweets\n• Reading food labels\n• Drinking water instead of juice\n• Using natural sweeteners like dates 🍬",
  'default': "Great question! Based on your profile and goals, I recommend focusing on whole foods, staying hydrated, and being consistent with your workouts. Want more specific advice? 💪",
};