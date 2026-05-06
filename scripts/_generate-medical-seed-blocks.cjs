const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const arg = process.argv[2]; // vitamins | lab | habit | water

function sqlQuote(value) {
  if (value === undefined || value === null) return 'NULL';
  const s = String(value);
  if (s.trim() === '') return 'NULL';
  return "'" + s.replace(/'/g, "''") + "'";
}

function sqlNullIfEmpty(value) {
  if (value === undefined || value === null) return 'NULL';
  const s = String(value);
  return s.trim() === '' ? 'NULL' : sqlQuote(s);
}

function loadSheet(fileName) {
  const filePath = path.join(root, fileName);
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

function vitamins() {
  const rows = loadSheet('vitamins_guide.xlsx');
  return rows.map(r => {
    return `(${sqlQuote(r.condition_id)}, NULL, ${sqlQuote(r.nutrient)}, ${sqlQuote(r.dose_range)}, ${sqlQuote(r.timing)}, NULL, NULL, ${sqlQuote(r.egyptian_foods)}, ${sqlQuote(r.cost_egp)}, ${sqlQuote(r.priority)})`;
  }).join(',\n');
}

function lab() {
  const rows = loadSheet('lab_tests_catalog.xlsx');
  return rows.map(r => {
    // best_time & preparation are not present in Excel => NULL
    return `(${sqlQuote(r.test_code)}, ${sqlQuote(r.test_name)}, ${sqlQuote(r.condition_id)}, ${sqlQuote(r.priority)}, ${Number(r.cost_min_egp || 0)}, ${Number(r.cost_max_egp || 0)}, ${Number(r.fasting_hours || 0)}, NULL, ${sqlQuote(r.why_needed)}, NULL, ${sqlQuote(r.frequency)})`;
  }).join(',\n');
}

function habit() {
  const rows = loadSheet('habit_reduction_plans.xlsx');
  return rows.map(r => {
    // current_min, risk_level, week_*_how, week_*_replace are not present in Excel => NULL
    return `(${sqlQuote(r.habit_id)}, ${sqlQuote(r.habit_name)}, NULL, ${Number(r.current_max || 0)}, ${sqlQuote(r.safe_limit)}, NULL, ${sqlQuote(r.week_1_target)}, NULL, NULL, ${sqlQuote(r.week_2_target)}, NULL, NULL, ${sqlQuote(r.week_3_target)}, NULL, NULL, ${sqlQuote(r.week_4_target)}, NULL, NULL, ${sqlQuote(r.health_risks)}, ${sqlQuote(r.withdrawal_symptoms)}, ${sqlQuote(r.expected_benefits)})`;
  }).join(',\n');
}

function water() {
  const rows = loadSheet('water_reminders.xlsx');
  return rows.map(r => {
    const timesRaw = r.reminder_times;
    const times = String(timesRaw || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const reminderTimesSql =
      times.length === 0
        ? 'ARRAY[]::text[]'
        : 'ARRAY[' + times.map(t => sqlQuote(t)).join(',') + ']::text[]';

    return `(${Number(r.age_min || 0)}, ${Number(r.age_max || 0)}, ${sqlQuote(r.gender)}, ${sqlQuote(r.activity_level)}, ${Number(r.weight_min_kg || 0)}, ${Number(r.weight_max_kg || 0)}, ${Number(r.water_goal_ml || 0)}, ${Number(r.cups_per_day || 0)}, ${reminderTimesSql}, NULL)`;
  }).join(',\n');
}

switch (arg) {
  case 'vitamins':
    process.stdout.write(vitamins());
    break;
  case 'lab':
    process.stdout.write(lab());
    break;
  case 'habit':
    process.stdout.write(habit());
    break;
  case 'water':
    process.stdout.write(water());
    break;
  default:
    console.error('Usage: node _generate-medical-seed-blocks.cjs [vitamins|lab|habit|water]');
    process.exit(1);
}

