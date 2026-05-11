import fs from 'fs';

const full = fs.readFileSync('scripts/_local_catalog_generated.sql', 'utf8');
const mStart = full.indexOf('-- Meals');
const wStart = full.indexOf('-- Workouts');
const mealBody = full.slice(mStart, wStart).trimEnd();
const wBody = full.slice(wStart).trimEnd();

const cut = mealBody.indexOf("(\n  'MEAL023'");
if (cut < 0) throw new Error('MEAL023 split point not found');

const header = mealBody.split(') values')[0] + ') values';
const tailFromMeal023 = mealBody.slice(cut).trimEnd();
const tailIdx = tailFromMeal023.search(/\n\)\s*\non conflict/i);
if (tailIdx < 0) throw new Error('meal tail on-conflict boundary not found');
const valuesOnlyB = tailFromMeal023.slice(0, tailIdx + 2).trimEnd(); // include closing ) of last tuple

const oc = `on conflict (id) do update set
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
  updated_at = now();`;

let partAprefix = mealBody.slice(0, cut).trimEnd();
partAprefix = partAprefix.replace(/,\s*$/, '');
const partA = `${partAprefix}\n${oc}`;

const partB = `${header}\n${valuesOnlyB}\n${oc}`;

fs.writeFileSync('scripts/_part_ddl.sql', full.split('-- Meals')[0].trimEnd(), 'utf8');
fs.writeFileSync('scripts/_part_meal_a.sql', partA, 'utf8');
fs.writeFileSync('scripts/_part_meal_b.sql', partB, 'utf8');
fs.writeFileSync('scripts/_part_work.sql', wBody, 'utf8');

for (const f of ['_part_ddl.sql', '_part_meal_a.sql', '_part_meal_b.sql', '_part_work.sql']) {
  console.log(f, fs.statSync('scripts/' + f).size);
}
