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