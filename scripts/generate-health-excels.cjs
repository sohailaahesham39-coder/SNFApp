/**
 * One-off generator: writes 4 xlsx files in project root.
 * Run: node scripts/generate-health-excels.cjs
 */
const XLSX = require('xlsx');
const path = require('path');

const root = path.resolve(__dirname, '..');

const vitamins_guide = [
  { condition_id: 'diabetes_t2', nutrient: 'Vitamin D3', dose_range: '1000–2000 IU/day', timing: 'With largest meal', egyptian_foods: 'Fish, egg yolks, liver, fortified laban', cost_egp: '50–100 EGP/month', priority: 'high' },
  { condition_id: 'diabetes_t2', nutrient: 'Magnesium (glycinate)', dose_range: '200–400 mg/day', timing: 'Evening or split with meals', egyptian_foods: 'Molokhiya, seeds, baladi bread, ful', cost_egp: '80–150 EGP/month', priority: 'high' },
  { condition_id: 'diabetes_t1', nutrient: 'Vitamin D3', dose_range: '1000–2000 IU/day', timing: 'With largest meal', egyptian_foods: 'Sardines, eggs, fortified milk', cost_egp: '50–120 EGP/month', priority: 'high' },
  { condition_id: 'diabetes_t1', nutrient: 'Omega-3 (EPA/DHA)', dose_range: '1–2 g/day combined', timing: 'With dinner (fatty meal)', egyptian_foods: 'Fish, walnuts, flaxseed', cost_egp: '120–250 EGP/month', priority: 'high' },
  { condition_id: 'prediabetes', nutrient: 'Vitamin D3', dose_range: '1000 IU/day start', timing: 'With lunch', egyptian_foods: 'Eggs, tuna, dairy', cost_egp: '40–80 EGP/month', priority: 'high' },
  { condition_id: 'prediabetes', nutrient: 'Inositol (myo)', dose_range: '2–4 g/day (split)', timing: 'Morning + evening', egyptian_foods: 'Whole grains, citrus, baladi bread', cost_egp: '100–200 EGP/month', priority: 'medium' },
  { condition_id: 'hypertension', nutrient: 'Potassium (diet first)', dose_range: 'Consult doctor if supplementing', timing: 'Not with ACE-I without MD', egyptian_foods: 'Potatoes, bananas, molokhiya, loubia', cost_egp: '0 (food)–60 EGP/month', priority: 'high' },
  { condition_id: 'hypertension', nutrient: 'Magnesium', dose_range: '300–400 mg/day', timing: 'Evening', egyptian_foods: 'Seeds, leafy greens, hummus', cost_egp: '70–130 EGP/month', priority: 'high' },
  { condition_id: 'heart_disease', nutrient: 'Omega-3 EPA/DHA', dose_range: '1 g/day minimum (cardio)', timing: 'With dinner', egyptian_foods: 'Blue fish, sardines', cost_egp: '120–280 EGP/month', priority: 'high' },
  { condition_id: 'heart_disease', nutrient: 'Vitamin D3', dose_range: '1000–2000 IU/day', timing: 'With meal', egyptian_foods: 'Eggs, liver, fish', cost_egp: '50–100 EGP/month', priority: 'high' },
  { condition_id: 'anemia', nutrient: 'Iron (ferrous sulfate/glycinate)', dose_range: 'Per hemoglobin—typ. 30–65 mg elemental', timing: 'Empty stomach + vit C or with MD plan', egyptian_foods: 'Liver, kofta, foul, molokhiya', cost_egp: '30–80 EGP/month', priority: 'high' },
  { condition_id: 'anemia', nutrient: 'Vitamin C', dose_range: '75–100 mg with iron', timing: 'With iron dose', egyptian_foods: 'Orange, guava, peppers', cost_egp: '20–50 EGP/month', priority: 'high' },
  { condition_id: 'anemia_b12', nutrient: 'Vitamin B12 (methylcobalamin)', dose_range: '1000 mcg/day oral or per MD', timing: 'Morning on empty stomach', egyptian_foods: 'Eggs, cheese, fish, liver', cost_egp: '60–140 EGP/month', priority: 'high' },
  { condition_id: 'anemia_b12', nutrient: 'Folate (5-MTHF)', dose_range: '400–800 mcg/day', timing: 'Morning', egyptian_foods: 'Baladi bread, molokhiya, legumes', cost_egp: '40–90 EGP/month', priority: 'high' },
  { condition_id: 'hypothyroid', nutrient: 'Selenium', dose_range: '55–100 mcg/day food; supplement only if deficient', timing: 'With meal', egyptian_foods: 'Brazil nuts (sparing), eggs, fish', cost_egp: '30–70 EGP/month', priority: 'medium' },
  { condition_id: 'hypothyroid', nutrient: 'Vitamin D3', dose_range: '1000–2000 IU/day', timing: 'With largest meal', egyptian_foods: 'Fish, eggs, dairy', cost_egp: '50–100 EGP/month', priority: 'high' },
  { condition_id: 'hyperthyroid', nutrient: 'Vitamin D3', dose_range: '1000 IU/day monitor', timing: 'With meal', egyptian_foods: 'Fish, eggs', cost_egp: '45–90 EGP/month', priority: 'medium' },
  { condition_id: 'anxiety', nutrient: 'Magnesium glycinate', dose_range: '200–350 mg/day evening', timing: '1–2 hrs before bed', egyptian_foods: 'Molokhiya, seeds', cost_egp: '70–130 EGP/month', priority: 'high' },
  { condition_id: 'depression', nutrient: 'Vitamin D3', dose_range: '1000–4000 IU/day per level', timing: 'With lunch', egyptian_foods: 'Eggs, fish', cost_egp: '50–120 EGP/month', priority: 'high' },
  { condition_id: 'depression', nutrient: 'B-complex (methylated)', dose_range: 'Per label B1-B12', timing: 'Morning with food', egyptian_foods: 'Whole grains, eggs, legumes', cost_egp: '60–150 EGP/month', priority: 'medium' },
  { condition_id: 'insomnia', nutrient: 'Magnesium', dose_range: '200–400 mg glycinate', timing: 'Night', egyptian_foods: 'Pumpkin seeds, dark chocolate (small)', cost_egp: '70–140 EGP/month', priority: 'high' },
  { condition_id: 'osteoporosis', nutrient: 'Calcium citrate', dose_range: '500–600 mg elemental x2 if diet low', timing: 'With meals split', egyptian_foods: 'Laban, cheese, sardines', cost_egp: '80–180 EGP/month', priority: 'high' },
  { condition_id: 'osteoporosis', nutrient: 'Vitamin D3', dose_range: '800–2000 IU/day', timing: 'With largest meal', egyptian_foods: 'Eggs, fish', cost_egp: '50–100 EGP/month', priority: 'high' },
  { condition_id: 'arthritis', nutrient: 'Omega-3', dose_range: '2–3 g EPA+DHA (MD for high dose)', timing: 'Split with meals', egyptian_foods: 'Fish, walnuts', cost_egp: '120–260 EGP/month', priority: 'high' },
  { condition_id: 'ibs', nutrient: 'Vitamin D3', dose_range: '1000 IU/day', timing: 'With meal', egyptian_foods: 'Eggs', cost_egp: '45–85 EGP/month', priority: 'medium' },
  { condition_id: 'gerd', nutrient: 'Vitamin B12', dose_range: '250–500 mcg/day if PPI long-term risk', timing: 'Morning', egyptian_foods: 'Eggs, fish', cost_egp: '35–75 EGP/month', priority: 'medium' },
  { condition_id: 'fatty_liver', nutrient: 'Vitamin E (mixed tocopherols)', dose_range: 'Only if prescribed by physician', timing: 'With largest meal', egyptian_foods: 'Nuts, spinach, olive oil (moderate)', cost_egp: '90–180 EGP/month', priority: 'low' },
  { condition_id: 'pcos', nutrient: 'Inositol myo+D-chiro blend', dose_range: '2–4 g myo + split chiro common protocols', timing: 'Morning + evening', egyptian_foods: 'Whole citrus, pulses', cost_egp: '150–280 EGP/month', priority: 'high' },
  { condition_id: 'pcos', nutrient: 'Vitamin D3', dose_range: '2000 IU/day if deficient', timing: 'With meal', egyptian_foods: 'Fish, dairy', cost_egp: '55–105 EGP/month', priority: 'high' },
  { condition_id: 'obesity', nutrient: 'Vitamin D3', dose_range: '2000 IU/day typical repletion guidance', timing: 'With fatty meal', egyptian_foods: 'Eggs, fish', cost_egp: '50–100 EGP/month', priority: 'medium' },
];

const lab_tests_catalog = [
  { test_code: 'HBA1C', test_name: 'HbA1c', condition_id: 'diabetes_t2', priority: 'urgent', cost_min_egp: 100, cost_max_egp: 200, fasting_hours: 0, why_needed: '3-month glycemic average', frequency: 'Every 3 months stable; more if unstable' },
  { test_code: 'FBS', test_name: 'Fasting Plasma Glucose', condition_id: 'diabetes_t2', priority: 'high', cost_min_egp: 30, cost_max_egp: 80, fasting_hours: 10, why_needed: 'Baseline glucose monitoring', frequency: 'As MD directs' },
  { test_code: 'OGTT', test_name: 'Oral glucose tolerance test', condition_id: 'prediabetes', priority: 'high', cost_min_egp: 120, cost_max_egp: 250, fasting_hours: 8, why_needed: 'Confirm impaired glucose metabolism', frequency: 'Once diagnosis; periodic' },
  { test_code: 'CPEP', test_name: 'C-peptide', condition_id: 'diabetes_t1', priority: 'high', cost_min_egp: 150, cost_max_egp: 300, fasting_hours: 8, why_needed: 'Residual insulin secretion', frequency: 'At diagnosis/adjust insulin' },
  { test_code: 'TSH_FT4', test_name: 'TSH + Free T4', condition_id: 'hypothyroid', priority: 'urgent', cost_min_egp: 150, cost_max_egp: 300, fasting_hours: 0, why_needed: 'Dose thyroid medication', frequency: 'Every 6–12 weeks dose change; stable 6–12 mo' },
  { test_code: 'ANTI_TPO', test_name: 'Anti-TPO antibodies', condition_id: 'hypothyroid', priority: 'medium', cost_min_egp: 200, cost_max_egp: 400, fasting_hours: 0, why_needed: 'Hashimoto context', frequency: 'Once or if symptoms change' },
  { test_code: 'TRSAB', test_name: 'TRAb / TSI', condition_id: 'hyperthyroid', priority: 'high', cost_min_egp: 250, cost_max_egp: 500, fasting_hours: 0, why_needed: 'Graves activity', frequency: 'At diagnosis/remission check' },
  { test_code: 'CBC_FERRITIN', test_name: 'CBC + Ferritin', condition_id: 'anemia', priority: 'urgent', cost_min_egp: 120, cost_max_egp: 250, fasting_hours: 0, why_needed: 'Iron deficiency workup', frequency: 'When symptomatic ; q3mo therapy' },
  { test_code: 'B12_SERUM', test_name: 'Serum B12', condition_id: 'anemia_b12', priority: 'urgent', cost_min_egp: 100, cost_max_egp: 200, fasting_hours: 0, why_needed: 'B12 deficiency', frequency: 'Start therapy; periodic' },
  { test_code: 'LIPID', test_name: 'Lipid profile', condition_id: 'hypertension', priority: 'high', cost_min_egp: 70, cost_max_egp: 150, fasting_hours: 10, why_needed: 'CV risk with HTN', frequency: 'Yearly minimum' },
  { test_code: 'CREAT_UGFR', test_name: 'Creatinine + uGFR', condition_id: 'hypertension', priority: 'high', cost_min_egp: 35, cost_max_egp: 80, fasting_hours: 0, why_needed: 'Kidney impact of HTN/RAS blockers', frequency: '6–12 mo' },
  { test_code: 'ECHO', test_name: 'Echocardiogram', condition_id: 'heart_disease', priority: 'urgent', cost_min_egp: 400, cost_max_egp: 800, fasting_hours: 0, why_needed: 'Cardiac structure/function', frequency: 'Per cardiologist' },
  { test_code: 'HS_CRP', test_name: 'hs-CRP', condition_id: 'heart_disease', priority: 'medium', cost_min_egp: 120, cost_max_egp: 250, fasting_hours: 0, why_needed: 'Inflammation marker', frequency: 'Risk stratification' },
  { test_code: 'TROP_I', test_name: 'High-sensitivity troponin', condition_id: 'heart_disease', priority: 'urgent', cost_min_egp: 150, cost_max_egp: 350, fasting_hours: 0, why_needed: 'Rule out ACS if chest pain', frequency: 'Acute symptom driven' },
  { test_code: 'DEXA', test_name: 'DEXA bone density', condition_id: 'osteoporosis', priority: 'high', cost_min_egp: 300, cost_max_egp: 650, fasting_hours: 0, why_needed: 'Fracture risk', frequency: 'Every 2 years if stable' },
  { test_code: 'VitD_250H', test_name: '25-OH Vitamin D', condition_id: 'osteoporosis', priority: 'high', cost_min_egp: 250, cost_max_egp: 450, fasting_hours: 0, why_needed: 'Bone/vitamin D therapy', frequency: 'Yearly / after dose change' },
  { test_code: 'ANA_RF', test_name: 'ANA + RF', condition_id: 'arthritis', priority: 'medium', cost_min_egp: 200, cost_max_egp: 450, fasting_hours: 0, why_needed: 'Autoimmune screening', frequency: 'If inflammatory arthritis suspected' },
  { test_code: 'CRP_ESR', test_name: 'CRP + ESR', condition_id: 'arthritis', priority: 'medium', cost_min_egp: 90, cost_max_egp: 200, fasting_hours: 0, why_needed: 'Inflammatory activity', frequency: 'Flare evaluation' },
  { test_code: 'STOOL_CAL', test_name: 'Calprotectin fecal', condition_id: 'ibs', priority: 'medium', cost_min_egp: 400, cost_max_egp: 900, fasting_hours: 0, why_needed: 'Differentiate IBD vs IBS', frequency: 'If alarm features' },
  { test_code: 'H_PYLORI', test_name: 'H. pylori stool Ag or urea breath', condition_id: 'gerd', priority: 'high', cost_min_egp: 200, cost_max_egp: 500, fasting_hours: 4, why_needed: 'Ulcer/reflux causation', frequency: 'If dyspepsia ulcers' },
  { test_code: 'LFT', test_name: 'Liver enzymes (ALT/AST)', condition_id: 'fatty_liver', priority: 'high', cost_min_egp: 120, cost_max_egp: 250, fasting_hours: 0, why_needed: 'NAFLD monitoring', frequency: '3–12 mo lifestyle program' },
  { test_code: 'US_ELAST', test_name: 'FibroScan / elastography', condition_id: 'fatty_liver', priority: 'medium', cost_min_egp: 500, cost_max_egp: 1200, fasting_hours: 4, why_needed: 'Fibrosis stage', frequency: 'If advanced NAFLD risk' },
  { test_code: 'AMH_TEST', test_name: 'AMH + LH/FSH', condition_id: 'pcos', priority: 'medium', cost_min_egp: 350, cost_max_egp: 700, fasting_hours: 2, why_needed: 'Ovulatory/hormonal pattern', frequency: 'Diagnosis baseline' },
  { test_code: 'US_OVARY', test_name: 'Pelvic ultrasound (ovaries)', condition_id: 'pcos', priority: 'high', cost_min_egp: 250, cost_max_egp: 500, fasting_hours: 0, why_needed: 'Polycystic morphology screening', frequency: 'Diagnosis/workup' },
  { test_code: 'TSH_FAST', test_name: 'TSH', condition_id: 'pcos', priority: 'medium', cost_min_egp: 100, cost_max_egp: 220, fasting_hours: 0, why_needed: 'Exclude thyroid overlap', frequency: 'Initial PCOS labs' },
  { test_code: 'BMI_SERUM', test_name: 'Fasting glucose + insulin + HOMA-IR', condition_id: 'obesity', priority: 'medium', cost_min_egp: 200, cost_max_egp: 450, fasting_hours: 10, why_needed: 'Insulin resistance', frequency: 'Metabolic baseline' },
  { test_code: 'LIPID_OB', test_name: 'Lipid profile', condition_id: 'obesity', priority: 'high', cost_min_egp: 70, cost_max_egp: 150, fasting_hours: 10, why_needed: 'Cardiometabolic risk', frequency: '6–12 mo' },
  { test_code: 'TSH_GENERAL', test_name: 'TSH screening', condition_id: 'obesity', priority: 'low', cost_min_egp: 90, cost_max_egp: 200, fasting_hours: 0, why_needed: 'Hypothyroid weight gain mimic', frequency: 'If symptoms' },
  { test_code: 'TSH_DM1', test_name: 'TSH annual', condition_id: 'diabetes_t1', priority: 'medium', cost_min_egp: 100, cost_max_egp: 220, fasting_hours: 0, why_needed: 'Autoimmune thyroid overlap', frequency: 'Annually screening' },
  { test_code: 'MICROALB', test_name: 'Urine microalbumin', condition_id: 'diabetes_t2', priority: 'high', cost_min_egp: 120, cost_max_egp: 250, fasting_hours: 0, why_needed: 'Early nephropathy', frequency: 'Yearly stable DM' },
  { test_code: 'EGFR_PAIR', test_name: 'Creatinine/eGFR', condition_id: 'diabetes_t2', priority: 'high', cost_min_egp: 35, cost_max_egp: 90, fasting_hours: 0, why_needed: 'Kidney function', frequency: 'Yearly+' },
  { test_code: 'ECG_STD', test_name: '12-lead ECG', condition_id: 'heart_disease', priority: 'high', cost_min_egp: 50, cost_max_egp: 120, fasting_hours: 0, why_needed: 'Rhythm/ischemia screen', frequency: 'Symptoms or pre-op' },
  { test_code: 'Hb_ELECTRO', test_name: 'Hemoglobin electrophoresis', condition_id: 'anemia', priority: 'medium', cost_min_egp: 250, cost_max_egp: 500, fasting_hours: 0, why_needed: 'Thalassemia trait vs IDA', frequency: 'If microcytic not improving' },
  { test_code: 'IRON_PANEL', test_name: 'Iron + TIBC + transferrin sat', condition_id: 'anemia', priority: 'high', cost_min_egp: 140, cost_max_egp: 280, fasting_hours: 8, why_needed: 'Iron deficiency quantify', frequency: 'Start/review therapy' },
  { test_code: 'PTH_CA', test_name: 'PTH + ionized calcium', condition_id: 'osteoporosis', priority: 'medium', cost_min_egp: 220, cost_max_egp: 450, fasting_hours: 8, why_needed: 'Secondary hyperparathyroid exclusion', frequency: 'If low vit D refractory' },
  { test_code: 'HBA1C_PCOS', test_name: 'HbA1c or OGTT PCOS screen', condition_id: 'pcos', priority: 'high', cost_min_egp: 100, cost_max_egp: 250, fasting_hours: 0, why_needed: 'Screen diabetes in PCOS', frequency: 'Yearly adolescence onward' },
  { test_code: 'LIVER_US', test_name: 'Abdominal ultrasound', condition_id: 'obesity', priority: 'medium', cost_min_egp: 200, cost_max_egp: 450, fasting_hours: 6, why_needed: 'NAFLD screen', frequency: 'If metabolic syndrome' },
  { test_code: 'TSH_DEP', test_name: 'TSH + B12/Folate optional', condition_id: 'depression', priority: 'medium', cost_min_egp: 150, cost_max_egp: 350, fasting_hours: 8, why_needed: 'Organic causes mood', frequency: 'First presentation workup' },
  { test_code: 'HBA1C_DM1', test_name: 'HbA1c', condition_id: 'diabetes_t1', priority: 'urgent', cost_min_egp: 100, cost_max_egp: 200, fasting_hours: 0, why_needed: 'Long-term glucose control', frequency: 'Every 3 months' },
  { test_code: 'TSH_INS', test_name: 'TSH', condition_id: 'insomnia', priority: 'low', cost_min_egp: 90, cost_max_egp: 200, fasting_hours: 0, why_needed: 'Exclude hyperthyroid sleep disruption', frequency: 'If palpitations/unexplained insomnia' },
];

const habit_reduction_plans = [
  { habit_id: 'drink_coffee', habit_name: 'Coffee', current_max: 5, safe_limit: '1–2 cups/day', week_1_target: '4 cups', week_2_target: '3 cups', week_3_target: '2 cups', week_4_target: '1–2 cups', health_risks: 'Jitters; sleep disruption; GERD/reflux spike; ↑HR if sensitive', withdrawal_symptoms: 'Headache, fatigue', expected_benefits: 'Better sleep depth; stabler afternoons' },
  { habit_id: 'drink_tea', habit_name: 'Tea (heavy)', current_max: 6, safe_limit: '2–3 cups/day', week_1_target: '5 cups', week_2_target: '4 cups', week_3_target: '3 cups', week_4_target: '2–3 cups', health_risks: 'Tea tannin ↓iron absorption if with meals', withdrawal_symptoms: 'Mild irritability/caffeine cut', expected_benefits: 'Hydration substitution with water rises' },
  { habit_id: 'drink_soda', habit_name: 'Soft drinks', current_max: 3, safe_limit: '0 cans/day', week_1_target: '2 cans', week_2_target: '1 can', week_3_target: '0 cans', week_4_target: 'Occasional only', health_risks: 'Dental erosion; visceral fat; triglycerides', withdrawal_symptoms: 'Sugar cravings 3–5 days', expected_benefits: 'Lower empty calories glycemic spikes' },
  { habit_id: 'drink_energy', habit_name: 'Energy drinks', current_max: 2, safe_limit: '0 cans/day', week_1_target: '1 can', week_2_target: 'Alternate day', week_3_target: '0 cans', week_4_target: '0 cans', health_risks: 'Hypertension; arrhythmia risk; insomnia', withdrawal_symptoms: 'Fatigue rebound', expected_benefits: 'Reduced stimulant stacking' },
  { habit_id: 'hab_smoke', habit_name: 'Smoking', current_max: 20, safe_limit: '0 cigarettes/day', week_1_target: '−25% cigarettes', week_2_target: '−50%', week_3_target: '−75%', week_4_target: 'Quit + cessation support', health_risks: 'CAD; stroke; COPD; cancer risk', withdrawal_symptoms: 'Anxiety cravings poor sleep cueing', expected_benefits: 'Lower BP RR within weeks' },
  { habit_id: 'hab_latesleep', habit_name: 'Late sleep', current_max: 1, safe_limit: 'Sleep before 23:00', week_1_target: 'Lights out −30 min', week_2_target: 'Lights out −60 min vs baseline', week_3_target: 'Target 23:30', week_4_target: '≤23:00', health_risks: 'Poor glucose control daytime fatigue', withdrawal_symptoms: 'Early insomnia until rhythm shifts', expected_benefits: 'Melatonin/cortisol regularity appetite control' },
  { habit_id: 'hab_fastfood', habit_name: 'Fast food', current_max: 7, safe_limit: '≤1/week', week_1_target: '5 days/week fast food stops', week_2_target: '3 days/week', week_3_target: '2 days/week', week_4_target: '≤1 day/week', health_risks: 'Salt trans fat visceral adiposity reflux', withdrawal_symptoms: 'Convenience habit friction', expected_benefits: 'Triglycerides weight trend improvement' },
  { habit_id: 'hab_sugar', habit_name: 'High sugar snacks', current_max: 1, safe_limit: 'Moderate patterned treats', week_1_target: '−1 sweet serving/day vs baseline log', week_2_target: 'Swap 50% sweets for fruit/protein yogurt', week_3_target: 'No sugar drinks weekdays', week_4_target: 'Planned treat 2 slots/week max', health_risks: 'Triglycerides dental caries energy crashes mood', withdrawal_symptoms: 'Sugar craving waves 48–96h peak', expected_benefits: 'Post-meal sleepy fewer glycemic dips' },
];

// water_ml ≈ weight * 35 for moderate; scale low/high
const water_reminders = [];

function addRow(w) {
  water_reminders.push(w);
}

// age bands 18-30, 31-45, 46-60 × male female × activity
const combos = [
  [18, 30, 'male', 'low', 65, 90],
  [18, 30, 'male', 'moderate', 68, 88],
  [18, 30, 'male', 'high', 70, 85],
  [18, 30, 'female', 'low', 50, 75],
  [18, 30, 'female', 'moderate', 52, 72],
  [31, 45, 'male', 'moderate', 75, 95],
  [31, 45, 'female', 'moderate', 55, 78],
  [46, 60, 'male', 'low', 70, 100],
  [46, 60, 'male', 'moderate', 72, 98],
  [46, 60, 'female', 'moderate', 58, 82],
  [31, 45, 'male', 'high', 78, 95],
  [31, 45, 'female', 'high', 56, 75],
];

let mid = (a, b) => Math.round((a + b) / 2);
for (const [amin, amax, gender, activity, wmin, wmax] of combos) {
  let wkg = mid(wmin, wmax);
  let factor = activity === 'low' ? 30 : activity === 'high' ? 40 : 35;
  let water_ml = Math.round(wkg * factor / 50) * 50;
  let cups = Math.round(water_ml / 240);
  let times =
    activity === 'high'
      ? '07:30,11:00,15:30,18:30,21:30'
      : '08:00,12:30,17:00,20:30';
  addRow({
    age_min: amin,
    age_max: amax,
    gender,
    activity_level: activity,
    weight_min_kg: wmin,
    weight_max_kg: wmax,
    water_goal_ml: water_ml,
    cups_per_day: cups,
    reminder_times: times,
  });
}

function writeBook(filename, sheetName, rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, path.join(root, filename));
}

writeBook('vitamins_guide.xlsx', 'VitaminsGuide', vitamins_guide);
writeBook('lab_tests_catalog.xlsx', 'LabTests', lab_tests_catalog);
writeBook('habit_reduction_plans.xlsx', 'HabitPlans', habit_reduction_plans);
writeBook('water_reminders.xlsx', 'WaterGoals', water_reminders);

console.log('Wrote 4 xlsx files to', root);
