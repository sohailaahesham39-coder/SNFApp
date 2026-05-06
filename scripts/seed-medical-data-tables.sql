-- Seed medical reference data for SNF app.
-- Usage (example): run this SQL in Supabase SQL editor.
-- Safe to re-run: it deletes rows in the reference tables before inserting.

begin;

delete from public.vitamins_guide;
delete from public.lab_tests_catalog;
delete from public.habit_reduction_plans;
delete from public.water_reminders;

-- ============================================================
-- vitamins_guide (from vitamins_guide.xlsx)
-- ============================================================
insert into public.vitamins_guide
  (condition_id, symptom_id, nutrient, dose_range, timing, duration, contraindications, egyptian_foods, cost_egp, priority)
values
('diabetes_t2', NULL, 'Vitamin D3', '1000–2000 IU/day', 'With largest meal', NULL, NULL, 'Fish, egg yolks, liver, fortified laban', '50–100 EGP/month', 'high'),
('diabetes_t2', NULL, 'Magnesium (glycinate)', '200–400 mg/day', 'Evening or split with meals', NULL, NULL, 'Molokhiya, seeds, baladi bread, ful', '80–150 EGP/month', 'high'),
('diabetes_t1', NULL, 'Vitamin D3', '1000–2000 IU/day', 'With largest meal', NULL, NULL, 'Sardines, eggs, fortified milk', '50–120 EGP/month', 'high'),
('diabetes_t1', NULL, 'Omega-3 (EPA/DHA)', '1–2 g/day combined', 'With dinner (fatty meal)', NULL, NULL, 'Fish, walnuts, flaxseed', '120–250 EGP/month', 'high'),
('prediabetes', NULL, 'Vitamin D3', '1000 IU/day start', 'With lunch', NULL, NULL, 'Eggs, tuna, dairy', '40–80 EGP/month', 'high'),
('prediabetes', NULL, 'Inositol (myo)', '2–4 g/day (split)', 'Morning + evening', NULL, NULL, 'Whole grains, citrus, baladi bread', '100–200 EGP/month', 'medium'),
('hypertension', NULL, 'Potassium (diet first)', 'Consult doctor if supplementing', 'Not with ACE-I without MD', NULL, NULL, 'Potatoes, bananas, molokhiya, loubia', '0 (food)–60 EGP/month', 'high'),
('hypertension', NULL, 'Magnesium', '300–400 mg/day', 'Evening', NULL, NULL, 'Seeds, leafy greens, hummus', '70–130 EGP/month', 'high'),
('heart_disease', NULL, 'Omega-3 EPA/DHA', '1 g/day minimum (cardio)', 'With dinner', NULL, NULL, 'Blue fish, sardines', '120–280 EGP/month', 'high'),
('heart_disease', NULL, 'Vitamin D3', '1000–2000 IU/day', 'With meal', NULL, NULL, 'Eggs, liver, fish', '50–100 EGP/month', 'high'),
('anemia', NULL, 'Iron (ferrous sulfate/glycinate)', 'Per hemoglobin—typ. 30–65 mg elemental', 'Empty stomach + vit C or with MD plan', NULL, NULL, 'Liver, kofta, foul, molokhiya', '30–80 EGP/month', 'high'),
('anemia', NULL, 'Vitamin C', '75–100 mg with iron', 'With iron dose', NULL, NULL, 'Orange, guava, peppers', '20–50 EGP/month', 'high'),
('anemia_b12', NULL, 'Vitamin B12 (methylcobalamin)', '1000 mcg/day oral or per MD', 'Morning on empty stomach', NULL, NULL, 'Eggs, cheese, fish, liver', '60–140 EGP/month', 'high'),
('anemia_b12', NULL, 'Folate (5-MTHF)', '400–800 mcg/day', 'Morning', NULL, NULL, 'Baladi bread, molokhiya, legumes', '40–90 EGP/month', 'high'),
('hypothyroid', NULL, 'Selenium', '55–100 mcg/day food; supplement only if deficient', 'With meal', NULL, NULL, 'Brazil nuts (sparing), eggs, fish', '30–70 EGP/month', 'medium'),
('hypothyroid', NULL, 'Vitamin D3', '1000–2000 IU/day', 'With largest meal', NULL, NULL, 'Fish, eggs, dairy', '50–100 EGP/month', 'high'),
('hyperthyroid', NULL, 'Vitamin D3', '1000 IU/day monitor', 'With meal', NULL, NULL, 'Fish, eggs', '45–90 EGP/month', 'medium'),
('anxiety', NULL, 'Magnesium glycinate', '200–350 mg/day evening', '1–2 hrs before bed', NULL, NULL, 'Molokhiya, seeds', '70–130 EGP/month', 'high'),
('depression', NULL, 'Vitamin D3', '1000–4000 IU/day per level', 'With lunch', NULL, NULL, 'Eggs, fish', '50–120 EGP/month', 'high'),
('depression', NULL, 'B-complex (methylated)', 'Per label B1-B12', 'Morning with food', NULL, NULL, 'Whole grains, eggs, legumes', '60–150 EGP/month', 'medium'),
('insomnia', NULL, 'Magnesium', '200–400 mg glycinate', 'Night', NULL, NULL, 'Pumpkin seeds, dark chocolate (small)', '70–140 EGP/month', 'high'),
('osteoporosis', NULL, 'Calcium citrate', '500–600 mg elemental x2 if diet low', 'With meals split', NULL, NULL, 'Laban, cheese, sardines', '80–180 EGP/month', 'high'),
('osteoporosis', NULL, 'Vitamin D3', '800–2000 IU/day', 'With largest meal', NULL, NULL, 'Eggs, fish', '50–100 EGP/month', 'high'),
('arthritis', NULL, 'Omega-3', '2–3 g EPA+DHA (MD for high dose)', 'Split with meals', NULL, NULL, 'Fish, walnuts', '120–260 EGP/month', 'high'),
('ibs', NULL, 'Vitamin D3', '1000 IU/day', 'With meal', NULL, NULL, 'Eggs', '45–85 EGP/month', 'medium'),
('gerd', NULL, 'Vitamin B12', '250–500 mcg/day if PPI long-term risk', 'Morning', NULL, NULL, 'Eggs, fish', '35–75 EGP/month', 'medium'),
('fatty_liver', NULL, 'Vitamin E (mixed tocopherols)', 'Only if prescribed by physician', 'With largest meal', NULL, NULL, 'Nuts, spinach, olive oil (moderate)', '90–180 EGP/month', 'low'),
('pcos', NULL, 'Inositol myo+D-chiro blend', '2–4 g myo + split chiro common protocols', 'Morning + evening', NULL, NULL, 'Whole citrus, pulses', '150–280 EGP/month', 'high'),
('pcos', NULL, 'Vitamin D3', '2000 IU/day if deficient', 'With meal', NULL, NULL, 'Fish, dairy', '55–105 EGP/month', 'high'),
('obesity', NULL, 'Vitamin D3', '2000 IU/day typical repletion guidance', 'With fatty meal', NULL, NULL, 'Eggs, fish', '50–100 EGP/month', 'medium')
;

-- ============================================================
-- lab_tests_catalog (from lab_tests_catalog.xlsx)
-- ============================================================
insert into public.lab_tests_catalog
  (test_code, test_name, condition_id, priority, cost_min_egp, cost_max_egp, fasting_hours, best_time, why_needed, preparation, frequency)
values
('HBA1C', 'HbA1c', 'diabetes_t2', 'urgent', 100, 200, 0, NULL, '3-month glycemic average', NULL, 'Every 3 months stable; more if unstable'),
('FBS', 'Fasting Plasma Glucose', 'diabetes_t2', 'high', 30, 80, 10, NULL, 'Baseline glucose monitoring', NULL, 'As MD directs'),
('OGTT', 'Oral glucose tolerance test', 'prediabetes', 'high', 120, 250, 8, NULL, 'Confirm impaired glucose metabolism', NULL, 'Once diagnosis; periodic'),
('CPEP', 'C-peptide', 'diabetes_t1', 'high', 150, 300, 8, NULL, 'Residual insulin secretion', NULL, 'At diagnosis/adjust insulin'),
('TSH_FT4', 'TSH + Free T4', 'hypothyroid', 'urgent', 150, 300, 0, NULL, 'Dose thyroid medication', NULL, 'Every 6–12 weeks dose change; stable 6–12 mo'),
('ANTI_TPO', 'Anti-TPO antibodies', 'hypothyroid', 'medium', 200, 400, 0, NULL, 'Hashimoto context', NULL, 'Once or if symptoms change'),
('TRSAB', 'TRAb / TSI', 'hyperthyroid', 'high', 250, 500, 0, NULL, 'Graves activity', NULL, 'At diagnosis/remission check'),
('CBC_FERRITIN', 'CBC + Ferritin', 'anemia', 'urgent', 120, 250, 0, NULL, 'Iron deficiency workup', NULL, 'When symptomatic ; q3mo therapy'),
('B12_SERUM', 'Serum B12', 'anemia_b12', 'urgent', 100, 200, 0, NULL, 'B12 deficiency', NULL, 'Start therapy; periodic'),
('LIPID', 'Lipid profile', 'hypertension', 'high', 70, 150, 10, NULL, 'CV risk with HTN', NULL, 'Yearly minimum'),
('CREAT_UGFR', 'Creatinine + uGFR', 'hypertension', 'high', 35, 80, 0, NULL, 'Kidney impact of HTN/RAS blockers', NULL, '6–12 mo'),
('ECHO', 'Echocardiogram', 'heart_disease', 'urgent', 400, 800, 0, NULL, 'Cardiac structure/function', NULL, 'Per cardiologist'),
('HS_CRP', 'hs-CRP', 'heart_disease', 'medium', 120, 250, 0, NULL, 'Inflammation marker', NULL, 'Risk stratification'),
('TROP_I', 'High-sensitivity troponin', 'heart_disease', 'urgent', 150, 350, 0, NULL, 'Rule out ACS if chest pain', NULL, 'Acute symptom driven'),
('DEXA', 'DEXA bone density', 'osteoporosis', 'high', 300, 650, 0, NULL, 'Fracture risk', NULL, 'Every 2 years if stable'),
('VitD_250H', '25-OH Vitamin D', 'osteoporosis', 'high', 250, 450, 0, NULL, 'Bone/vitamin D therapy', NULL, 'Yearly / after dose change'),
('ANA_RF', 'ANA + RF', 'arthritis', 'medium', 200, 450, 0, NULL, 'Autoimmune screening', NULL, 'If inflammatory arthritis suspected'),
('CRP_ESR', 'CRP + ESR', 'arthritis', 'medium', 90, 200, 0, NULL, 'Inflammatory activity', NULL, 'Flare evaluation'),
('STOOL_CAL', 'Calprotectin fecal', 'ibs', 'medium', 400, 900, 0, NULL, 'Differentiate IBD vs IBS', NULL, 'If alarm features'),
('H_PYLORI', 'H. pylori stool Ag or urea breath', 'gerd', 'high', 200, 500, 4, NULL, 'Ulcer/reflux causation', NULL, 'If dyspepsia ulcers'),
('LFT', 'Liver enzymes (ALT/AST)', 'fatty_liver', 'high', 120, 250, 0, NULL, 'NAFLD monitoring', NULL, '3–12 mo lifestyle program'),
('US_ELAST', 'FibroScan / elastography', 'fatty_liver', 'medium', 500, 1200, 4, NULL, 'Fibrosis stage', NULL, 'If advanced NAFLD risk'),
('AMH_TEST', 'AMH + LH/FSH', 'pcos', 'medium', 350, 700, 2, NULL, 'Ovulatory/hormonal pattern', NULL, 'Diagnosis baseline'),
('US_OVARY', 'Pelvic ultrasound (ovaries)', 'pcos', 'high', 250, 500, 0, NULL, 'Polycystic morphology screening', NULL, 'Diagnosis/workup'),
('TSH_FAST', 'TSH', 'pcos', 'medium', 100, 220, 0, NULL, 'Exclude thyroid overlap', NULL, 'Initial PCOS labs'),
('BMI_SERUM', 'Fasting glucose + insulin + HOMA-IR', 'obesity', 'medium', 200, 450, 10, NULL, 'Insulin resistance', NULL, 'Metabolic baseline'),
('LIPID_OB', 'Lipid profile', 'obesity', 'high', 70, 150, 10, NULL, 'Cardiometabolic risk', NULL, '6–12 mo'),
('TSH_GENERAL', 'TSH screening', 'obesity', 'low', 90, 200, 0, NULL, 'Hypothyroid weight gain mimic', NULL, 'If symptoms'),
('TSH_DM1', 'TSH annual', 'diabetes_t1', 'medium', 100, 220, 0, NULL, 'Autoimmune thyroid overlap', NULL, 'Annually screening'),
('MICROALB', 'Urine microalbumin', 'diabetes_t2', 'high', 120, 250, 0, NULL, 'Early nephropathy', NULL, 'Yearly stable DM'),
('EGFR_PAIR', 'Creatinine/eGFR', 'diabetes_t2', 'high', 35, 90, 0, NULL, 'Kidney function', NULL, 'Yearly+'),
('ECG_STD', '12-lead ECG', 'heart_disease', 'high', 50, 120, 0, NULL, 'Rhythm/ischemia screen', NULL, 'Symptoms or pre-op'),
('Hb_ELECTRO', 'Hemoglobin electrophoresis', 'anemia', 'medium', 250, 500, 0, NULL, 'Thalassemia trait vs IDA', NULL, 'If microcytic not improving'),
('IRON_PANEL', 'Iron + TIBC + transferrin sat', 'anemia', 'high', 140, 280, 8, NULL, 'Iron deficiency quantify', NULL, 'Start/review therapy'),
('PTH_CA', 'PTH + ionized calcium', 'osteoporosis', 'medium', 220, 450, 8, NULL, 'Secondary hyperparathyroid exclusion', NULL, 'If low vit D refractory'),
('HBA1C_PCOS', 'HbA1c or OGTT PCOS screen', 'pcos', 'high', 100, 250, 0, NULL, 'Screen diabetes in PCOS', NULL, 'Yearly adolescence onward'),
('LIVER_US', 'Abdominal ultrasound', 'obesity', 'medium', 200, 450, 6, NULL, 'NAFLD screen', NULL, 'If metabolic syndrome'),
('TSH_DEP', 'TSH + B12/Folate optional', 'depression', 'medium', 150, 350, 8, NULL, 'Organic causes mood', NULL, 'First presentation workup'),
('HBA1C_DM1', 'HbA1c', 'diabetes_t1', 'urgent', 100, 200, 0, NULL, 'Long-term glucose control', NULL, 'Every 3 months'),
('TSH_INS', 'TSH', 'insomnia', 'low', 90, 200, 0, NULL, 'Exclude hyperthyroid sleep disruption', NULL, 'If palpitations/unexplained insomnia')
;

-- ============================================================
-- habit_reduction_plans (from habit_reduction_plans.xlsx)
-- ============================================================
insert into public.habit_reduction_plans
  (habit_id, habit_name, current_min, current_max, safe_limit, risk_level,
   week_1_target, week_1_how, week_1_replace,
   week_2_target, week_2_how, week_2_replace,
   week_3_target, week_3_how, week_3_replace,
   week_4_target, week_4_how, week_4_replace,
   health_risks, withdrawal_symptoms, expected_benefits)
values
('drink_coffee', 'Coffee', NULL, 5, '1–2 cups/day', NULL, '4 cups', NULL, NULL, '3 cups', NULL, NULL, '2 cups', NULL, NULL, '1–2 cups', NULL, NULL, 'Jitters; sleep disruption; GERD/reflux spike; ↑HR if sensitive', 'Headache, fatigue', 'Better sleep depth; stabler afternoons'),
('drink_tea', 'Tea (heavy)', NULL, 6, '2–3 cups/day', NULL, '5 cups', NULL, NULL, '4 cups', NULL, NULL, '3 cups', NULL, NULL, '2–3 cups', NULL, NULL, 'Tea tannin ↓iron absorption if with meals', 'Mild irritability/caffeine cut', 'Hydration substitution with water rises'),
('drink_soda', 'Soft drinks', NULL, 3, '0 cans/day', NULL, '2 cans', NULL, NULL, '1 can', NULL, NULL, '0 cans', NULL, NULL, 'Occasional only', NULL, NULL, 'Dental erosion; visceral fat; triglycerides', 'Sugar cravings 3–5 days', 'Lower empty calories glycemic spikes'),
('drink_energy', 'Energy drinks', NULL, 2, '0 cans/day', NULL, '1 can', NULL, NULL, 'Alternate day', NULL, NULL, '0 cans', NULL, NULL, '0 cans', NULL, NULL, 'Hypertension; arrhythmia risk; insomnia', 'Fatigue rebound', 'Reduced stimulant stacking'),
('hab_smoke', 'Smoking', NULL, 20, '0 cigarettes/day', NULL, '−25% cigarettes', NULL, NULL, '−50%', NULL, NULL, '−75%', NULL, NULL, 'Quit + cessation support', NULL, NULL, 'CAD; stroke; COPD; cancer risk', 'Anxiety cravings poor sleep cueing', 'Lower BP RR within weeks'),
('hab_latesleep', 'Late sleep', NULL, 1, 'Sleep before 23:00', NULL, 'Lights out −30 min', NULL, NULL, 'Lights out −60 min vs baseline', NULL, NULL, 'Target 23:30', NULL, NULL, '≤23:00', NULL, NULL, 'Poor glucose control daytime fatigue', 'Early insomnia until rhythm shifts', 'Melatonin/cortisol regularity appetite control'),
('hab_fastfood', 'Fast food', NULL, 7, '≤1/week', NULL, '5 days/week fast food stops', NULL, NULL, '3 days/week', NULL, NULL, '2 days/week', NULL, NULL, '≤1 day/week', NULL, NULL, 'Salt trans fat visceral adiposity reflux', 'Convenience habit friction', 'Triglycerides weight trend improvement'),
('hab_sugar', 'High sugar snacks', NULL, 1, 'Moderate patterned treats', NULL, '−1 sweet serving/day vs baseline log', NULL, NULL, 'Swap 50% sweets for fruit/protein yogurt', NULL, NULL, 'No sugar drinks weekdays', NULL, NULL, 'Planned treat 2 slots/week max', NULL, NULL, 'Triglycerides dental caries energy crashes mood', 'Sugar craving waves 48–96h peak', 'Post-meal sleepy fewer glycemic dips')
;

-- ============================================================
-- water_reminders (from water_reminders.xlsx)
-- ============================================================
insert into public.water_reminders
  (age_min, age_max, gender, activity_level, weight_min_kg, weight_max_kg, water_goal_ml, cups_per_day, reminder_times, benefits)
values
 (18, 30, 'male', 'low', 65, 90, 2350, 10, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (18, 30, 'male', 'moderate', 68, 88, 2750, 11, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (18, 30, 'male', 'high', 70, 85, 3100, 13, ARRAY['07:30','11:00','15:30','18:30','21:30']::text[], NULL),
 (18, 30, 'female', 'low', 50, 75, 1900, 8, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (18, 30, 'female', 'moderate', 52, 72, 2150, 9, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (31, 45, 'male', 'moderate', 75, 95, 3000, 13, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (31, 45, 'female', 'moderate', 55, 78, 2350, 10, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (46, 60, 'male', 'low', 70, 100, 2550, 11, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (46, 60, 'male', 'moderate', 72, 98, 3000, 13, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (46, 60, 'female', 'moderate', 58, 82, 2450, 10, ARRAY['08:00','12:30','17:00','20:30']::text[], NULL),
 (31, 45, 'male', 'high', 78, 95, 3500, 15, ARRAY['07:30','11:00','15:30','18:30','21:30']::text[], NULL),
 (31, 45, 'female', 'high', 56, 75, 2650, 11, ARRAY['07:30','11:00','15:30','18:30','21:30']::text[], NULL)
;

commit;

