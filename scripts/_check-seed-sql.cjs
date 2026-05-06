const fs = require('fs');
const XLSX = require('xlsx');

function loadExcelRowCount(fileName) {
  const wb = XLSX.readFile(fileName);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows.length;
}

function extractSection(lines, startNeedle, endNeedle) {
  const start = lines.findIndex((l) => l.includes(startNeedle));
  if (start < 0) throw new Error(`Missing start: ${startNeedle}`);
  let end = lines.slice(start + 1).findIndex((l) => l.includes(endNeedle));
  end = end < 0 ? lines.length : start + 1 + end;
  return lines.slice(start, end);
}

function countValueTuplesVarchar(sectionLines) {
  // vitamins/lab/habit value tuples start with: ('something'
  return sectionLines.filter((l) => l.trim().startsWith("('")).length;
}

function countValueTuplesWater(sectionLines) {
  // water value tuples start with: (18, ...
  return sectionLines.filter((l) => /^\s*\(\s*\d/.test(l)).length;
}

const seedPath = 'scripts/seed-medical-data-tables.sql';
const seed = fs.readFileSync(seedPath, 'utf8');
const lines = seed.split(/\r?\n/);

const checks = [
  {
    table: 'vitamins_guide',
    excel: 'vitamins_guide.xlsx',
    start: 'insert into public.vitamins_guide',
    end: 'insert into public.lab_tests_catalog',
    countFn: countValueTuplesVarchar,
  },
  {
    table: 'lab_tests_catalog',
    excel: 'lab_tests_catalog.xlsx',
    start: 'insert into public.lab_tests_catalog',
    end: 'insert into public.habit_reduction_plans',
    countFn: countValueTuplesVarchar,
  },
  {
    table: 'habit_reduction_plans',
    excel: 'habit_reduction_plans.xlsx',
    start: 'insert into public.habit_reduction_plans',
    end: 'insert into public.water_reminders',
    countFn: countValueTuplesVarchar,
  },
  {
    table: 'water_reminders',
    excel: 'water_reminders.xlsx',
    start: 'insert into public.water_reminders',
    end: 'commit;',
    countFn: countValueTuplesWater,
  },
];

console.log('Seed SQL vs Excel row count:');
for (const c of checks) {
  const excelCount = loadExcelRowCount(c.excel);
  const section = extractSection(lines, c.start, c.end);
  const seedCount = c.countFn(section);
  console.log(`- ${c.table}: excel=${excelCount}, seed=${seedCount}`);
  if (excelCount !== seedCount) process.exitCode = 1;
}

