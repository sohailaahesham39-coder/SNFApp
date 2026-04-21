// ============================================================
// Health Engine — Smart Nutrition & Fitness Chatbot
// Complete integrated health system in English
// ============================================================

// ── 1. Chronic Conditions (comprehensive) ────────────────────
export const CHRONIC_CONDITIONS = [
  { id: 'hypertension',   name: 'High Blood Pressure',    icon: '🩸', category: 'cardio'    },
  { id: 'heart_disease',  name: 'Heart Disease',          icon: '🫀', category: 'cardio'    },
  { id: 'arrhythmia',     name: 'Irregular Heartbeat',    icon: '💓', category: 'cardio'    },
  { id: 'cholesterol',    name: 'High Cholesterol',       icon: '🧈', category: 'cardio'    },
  { id: 'diabetes_t1',    name: 'Diabetes Type 1',        icon: '💉', category: 'metabolic' },
  { id: 'diabetes_t2',    name: 'Diabetes Type 2',        icon: '🩸', category: 'metabolic' },
  { id: 'prediabetes',    name: 'Prediabetes',            icon: '⚠️', category: 'metabolic' },
  { id: 'hypothyroid',    name: 'Hypothyroidism',         icon: '🐢', category: 'metabolic' },
  { id: 'hyperthyroid',   name: 'Hyperthyroidism',        icon: '⚡', category: 'metabolic' },
  { id: 'pcos',           name: 'PCOS',                   icon: '🌸', category: 'metabolic' },
  { id: 'obesity',        name: 'Obesity',                icon: '⚖️', category: 'metabolic' },
  { id: 'asthma',         name: 'Asthma',                 icon: '💨', category: 'respiratory' },
  { id: 'sleep_apnea',    name: 'Sleep Apnea',            icon: '😴', category: 'respiratory' },
  { id: 'ibs',            name: 'Irritable Bowel (IBS)',  icon: '🌀', category: 'digestive' },
  { id: 'gerd',           name: 'Acid Reflux / GERD',     icon: '🔥', category: 'digestive' },
  { id: 'ulcer',          name: 'Stomach Ulcer',          icon: '💢', category: 'digestive' },
  { id: 'fatty_liver',    name: 'Fatty Liver',            icon: '🫘', category: 'digestive' },
  { id: 'ckd',            name: 'Chronic Kidney Disease', icon: '🫘', category: 'kidney'    },
  { id: 'kidney_stones',  name: 'Kidney Stones',          icon: '💎', category: 'kidney'    },
  { id: 'anxiety',        name: 'Anxiety Disorder',       icon: '😰', category: 'mental'    },
  { id: 'depression',     name: 'Depression',             icon: '😔', category: 'mental'    },
  { id: 'insomnia',       name: 'Insomnia',               icon: '🌙', category: 'mental'    },
  { id: 'migraine',       name: 'Chronic Migraine',       icon: '💥', category: 'mental'    },
  { id: 'osteoporosis',   name: 'Osteoporosis',           icon: '🦴', category: 'bones'     },
  { id: 'arthritis',      name: 'Arthritis',              icon: '🦴', category: 'bones'     },
  { id: 'back_pain',      name: 'Chronic Back Pain',      icon: '⚠️', category: 'bones'     },
  { id: 'anemia',         name: 'Iron Deficiency Anemia', icon: '🩸', category: 'blood'     },
  { id: 'anemia_b12',     name: 'B12 Anemia',             icon: '🔴', category: 'blood'     },
  { id: 'autoimmune',     name: 'Autoimmune Disorder',    icon: '🛡',  category: 'blood'     },
];

// ── 2. Symptoms (how they feel) ──────────────────────────────
export const SYMPTOMS_LIST = [
  { id: 'sym_fatigue',    name: 'Chronic fatigue all day',       icon: '😴' },
  { id: 'sym_dizzy',      name: 'Dizziness or vertigo',          icon: '💫' },
  { id: 'sym_headache',   name: 'Frequent headaches',            icon: '🤕' },
  { id: 'sym_focus',      name: 'Poor concentration',            icon: '🧠' },
  { id: 'sym_memory',     name: 'Memory issues',                 icon: '💭' },
  { id: 'sym_hairloss',   name: 'Severe hair loss',              icon: '💇' },
  { id: 'sym_dryskin',    name: 'Dry flaky skin',                icon: '🧴' },
  { id: 'sym_nails',      name: 'Brittle nails',                 icon: '💅' },
  { id: 'sym_palecolor',  name: 'Pale skin',                     icon: '🩹' },
  { id: 'sym_cramps',     name: 'Muscle cramps',                 icon: '🦵' },
  { id: 'sym_jointpain',  name: 'Joint pain',                    icon: '🦴' },
  { id: 'sym_weakness',   name: 'Muscle weakness',               icon: '💪' },
  { id: 'sym_bloating',   name: 'Frequent bloating',             icon: '🫁' },
  { id: 'sym_constipat',  name: 'Constipation',                  icon: '⏸' },
  { id: 'sym_mood',       name: 'Mood swings',                   icon: '🎭' },
  { id: 'sym_anxious',    name: 'Feeling anxious',               icon: '😰' },
  { id: 'sym_sadness',    name: 'Persistent sadness',            icon: '😔' },
  { id: 'sym_sleepy',     name: 'Waking up tired',               icon: '🛌' },
  { id: 'sym_sugar',      name: 'Sugar cravings',                icon: '🍬' },
  { id: 'sym_thirst',     name: 'Excessive thirst',              icon: '💧' },
];

// ── 3. Acute Episodes (attacks/crises) ────────────────────────
export const ACUTE_EPISODES = [
  { id: 'ep_asthma',      name: 'Asthma attacks',                icon: '💨', severity: 'high'   },
  { id: 'ep_chestpain',   name: 'Chest pain episodes',           icon: '💔', severity: 'urgent' },
  { id: 'ep_palpitat',    name: 'Heart palpitations',            icon: '💓', severity: 'high'   },
  { id: 'ep_hypo',        name: 'Hypoglycemia (low sugar)',      icon: '📉', severity: 'high'   },
  { id: 'ep_panic',       name: 'Panic attacks',                 icon: '😨', severity: 'high'   },
  { id: 'ep_migrainea',   name: 'Migraine attacks',              icon: '⚡', severity: 'medium' },
  { id: 'ep_seizure',     name: 'Seizures',                      icon: '⚠️', severity: 'urgent' },
  { id: 'ep_allergic',    name: 'Allergic reactions',            icon: '🤧', severity: 'high'   },
];

// ── 4. Drinking Habits (what they drink daily) ───────────────
export const DRINKING_HABITS = [
  { id: 'drink_coffee',   name: 'Coffee',          icon: '☕', defaultAmount: '2 cups/day',     goodLimit: '1-2 cups', risky: '5+ cups' },
  { id: 'drink_tea',      name: 'Heavy Tea',       icon: '🍵', defaultAmount: '3 cups/day',     goodLimit: '2-3 cups', risky: '6+ cups' },
  { id: 'drink_soda',     name: 'Soft Drinks',     icon: '🥤', defaultAmount: '1 can/day',      goodLimit: '0 cans',   risky: '2+ cans' },
  { id: 'drink_energy',   name: 'Energy Drinks',   icon: '⚡', defaultAmount: '1 can/day',      goodLimit: '0 cans',   risky: '1+ cans' },
  { id: 'drink_juice',    name: 'Sugary Juice',    icon: '🧃', defaultAmount: '1 glass/day',    goodLimit: '0-1 glass',risky: '3+ glasses' },
  { id: 'drink_alcohol',  name: 'Alcohol',         icon: '🍺', defaultAmount: '2 times/week',   goodLimit: '0 times',  risky: '3+ times/week' },
  { id: 'drink_water',    name: 'Water',           icon: '💧', defaultAmount: '1L/day',         goodLimit: '2-3L',     risky: 'Less than 1L' },
];

// ── 5. Lifestyle Habits ──────────────────────────────────────
export const LIFESTYLE_HABITS = [
  { id: 'hab_smoke',      name: 'Smoking',                icon: '🚬', risk: 'very-high' },
  { id: 'hab_latesleep',  name: 'Late sleep (after 2am)', icon: '🦉', risk: 'medium' },
  { id: 'hab_noexercise', name: 'No exercise',            icon: '🛋',  risk: 'high' },
  { id: 'hab_fastfood',   name: 'Daily fast food',        icon: '🍔', risk: 'high' },
  { id: 'hab_sugar',      name: 'High sugar diet',        icon: '🍩', risk: 'high' },
  { id: 'hab_stress',     name: 'Chronic stress',         icon: '😤', risk: 'medium' },
  { id: 'hab_noveggies',  name: 'No vegetables',          icon: '🥦', risk: 'medium' },
  { id: 'hab_skipmeal',   name: 'Skipping meals',         icon: '⏭',  risk: 'medium' },
];

// ── 6. Lab Tests Database ────────────────────────────────────
export interface LabTest {
  code: string;
  name: string;
  reason: string;
  priority: 'urgent' | 'high' | 'medium';
  cost: string;
  fastingRequired: boolean;
}

export const LAB_TESTS: Record<string, LabTest[]> = {
  hypertension: [
    { code: 'BP24',    name: '24-Hour Blood Pressure Monitor', reason: 'Track BP pattern through the day',     priority: 'high',   cost: '150-300 EGP', fastingRequired: false },
    { code: 'LIPID',   name: 'Lipid Profile',                  reason: 'Check cholesterol levels',              priority: 'high',   cost: '80-150 EGP',  fastingRequired: true  },
    { code: 'CREAT',   name: 'Creatinine + eGFR',              reason: 'Check kidney function',                 priority: 'medium', cost: '30-60 EGP',   fastingRequired: false },
    { code: 'ECG',     name: 'Electrocardiogram',              reason: 'Check heart electrical activity',       priority: 'high',   cost: '50-100 EGP',  fastingRequired: false },
  ],
  heart_disease: [
    { code: 'ECHO',    name: 'Echocardiogram',                 reason: 'Check heart chambers and valves',       priority: 'urgent', cost: '400-700 EGP', fastingRequired: false },
    { code: 'STRESS',  name: 'Cardiac Stress Test',            reason: 'Test heart under exertion',             priority: 'urgent', cost: '500-800 EGP', fastingRequired: false },
    { code: 'TROPO',   name: 'Troponin',                       reason: 'Rule out recent heart attack',          priority: 'urgent', cost: '100-200 EGP', fastingRequired: false },
    { code: 'LIPID',   name: 'Full Lipid Profile',             reason: 'Assess cardiovascular risk',            priority: 'high',   cost: '80-150 EGP',  fastingRequired: true  },
  ],
  arrhythmia: [
    { code: 'HOLTER',  name: '24-Hour Holter Monitor',         reason: 'Record heartbeats all day',             priority: 'urgent', cost: '300-500 EGP', fastingRequired: false },
    { code: 'ECHO',    name: 'Echocardiogram',                 reason: 'Check heart structure',                 priority: 'urgent', cost: '400-700 EGP', fastingRequired: false },
    { code: 'TSH',     name: 'Thyroid Function',               reason: 'Hyperthyroid can cause arrhythmia',     priority: 'high',   cost: '80-150 EGP',  fastingRequired: false },
  ],
  cholesterol: [
    { code: 'LIPID',   name: 'Full Lipid Profile',             reason: 'LDL, HDL, Triglycerides',               priority: 'high',   cost: '80-150 EGP',  fastingRequired: true  },
    { code: 'APOB',    name: 'Apolipoprotein B',               reason: 'Accurate cardiac risk marker',          priority: 'medium', cost: '150-250 EGP', fastingRequired: true  },
  ],
  diabetes_t2: [
    { code: 'HBA1C',   name: 'HbA1c (Glycated Hemoglobin)',    reason: 'Average sugar over 3 months',           priority: 'urgent', cost: '100-200 EGP', fastingRequired: false },
    { code: 'FBS',     name: 'Fasting Blood Sugar',            reason: 'Sugar after 8h fasting',                priority: 'urgent', cost: '30-60 EGP',   fastingRequired: true  },
    { code: 'INSULIN', name: 'Fasting Insulin',                reason: 'Check insulin resistance',              priority: 'high',   cost: '150-250 EGP', fastingRequired: true  },
    { code: 'UACR',    name: 'Urine Albumin/Creatinine',       reason: 'Early kidney damage detection',         priority: 'medium', cost: '80-150 EGP',  fastingRequired: false },
  ],
  prediabetes: [
    { code: 'HBA1C',   name: 'HbA1c',                          reason: 'Confirm prediabetes',                   priority: 'high',   cost: '100-200 EGP', fastingRequired: false },
    { code: 'OGTT',    name: 'Oral Glucose Tolerance Test',    reason: 'Response to sugar load',                priority: 'high',   cost: '150-250 EGP', fastingRequired: true  },
  ],
  hypothyroid: [
    { code: 'TSH',     name: 'TSH',                            reason: 'Main thyroid test',                     priority: 'urgent', cost: '80-150 EGP',  fastingRequired: false },
    { code: 'FT4',     name: 'Free T4',                        reason: 'Active thyroid hormone',                priority: 'high',   cost: '80-150 EGP',  fastingRequired: false },
    { code: 'FT3',     name: 'Free T3',                        reason: 'Complete thyroid screening',            priority: 'medium', cost: '80-150 EGP',  fastingRequired: false },
    { code: 'ATPO',    name: 'Anti-TPO Antibodies',            reason: 'Rule out Hashimoto disease',            priority: 'medium', cost: '150-250 EGP', fastingRequired: false },
  ],
  pcos: [
    { code: 'TESTO',   name: 'Total Testosterone',             reason: 'Usually elevated in PCOS',              priority: 'urgent', cost: '100-200 EGP', fastingRequired: false },
    { code: 'LHFSH',   name: 'LH & FSH Ratio',                 reason: 'Indicates PCOS',                        priority: 'urgent', cost: '150-250 EGP', fastingRequired: false },
    { code: 'INSULIN', name: 'Fasting Insulin',                reason: 'Insulin resistance in PCOS',            priority: 'high',   cost: '150-250 EGP', fastingRequired: true  },
    { code: 'USOV',    name: 'Pelvic Ultrasound',              reason: 'Check ovaries',                         priority: 'high',   cost: '200-400 EGP', fastingRequired: false },
  ],
  ibs: [
    { code: 'STOOL',   name: 'Stool Analysis',                 reason: 'Rule out infections',                   priority: 'high',   cost: '40-80 EGP',   fastingRequired: false },
    { code: 'CALPRO',  name: 'Calprotectin',                   reason: 'Differentiate IBS from IBD',            priority: 'medium', cost: '300-500 EGP', fastingRequired: false },
  ],
  gerd: [
    { code: 'ENDO',    name: 'Upper Endoscopy',                reason: 'Check stomach and esophagus',           priority: 'high',   cost: '500-1000 EGP',fastingRequired: true  },
    { code: 'HPYLORI', name: 'H. Pylori Test',                 reason: 'Common cause of ulcers',                priority: 'high',   cost: '80-150 EGP',  fastingRequired: false },
  ],
  fatty_liver: [
    { code: 'LFT',     name: 'Liver Function Tests',           reason: 'ALT, AST enzymes',                      priority: 'urgent', cost: '80-150 EGP',  fastingRequired: true  },
    { code: 'USLIV',   name: 'Liver Ultrasound',               reason: 'Determine fatty liver grade',           priority: 'high',   cost: '200-400 EGP', fastingRequired: true  },
  ],
  ckd: [
    { code: 'CREAT',   name: 'Creatinine + eGFR',              reason: 'Main kidney function',                  priority: 'urgent', cost: '30-60 EGP',   fastingRequired: false },
    { code: 'UREA',    name: 'Blood Urea Nitrogen',            reason: 'Kidney function marker',                priority: 'urgent', cost: '30-60 EGP',   fastingRequired: false },
    { code: 'UACR',    name: 'Urine Albumin/Creatinine',       reason: 'Early damage detection',                priority: 'high',   cost: '80-150 EGP',  fastingRequired: false },
  ],
  depression: [
    { code: 'VITD',    name: 'Vitamin D (25-OH)',              reason: 'Deficiency linked to depression',       priority: 'high',   cost: '150-250 EGP', fastingRequired: false },
    { code: 'B12',     name: 'Vitamin B12',                    reason: 'Deficiency mimics depression',          priority: 'high',   cost: '100-200 EGP', fastingRequired: false },
    { code: 'TSH',     name: 'TSH',                            reason: 'Hypothyroid causes depression',         priority: 'medium', cost: '80-150 EGP',  fastingRequired: false },
  ],
  anxiety: [
    { code: 'TSH',     name: 'TSH',                            reason: 'Hyperthyroid causes anxiety',           priority: 'high',   cost: '80-150 EGP',  fastingRequired: false },
    { code: 'MAG',     name: 'Magnesium',                      reason: 'Deficiency common with anxiety',        priority: 'medium', cost: '80-150 EGP',  fastingRequired: false },
  ],
  osteoporosis: [
    { code: 'DEXA',    name: 'DEXA Bone Density Scan',         reason: 'Main osteoporosis test',                priority: 'urgent', cost: '500-1000 EGP',fastingRequired: false },
    { code: 'VITD',    name: 'Vitamin D',                      reason: 'Needed for calcium absorption',         priority: 'high',   cost: '150-250 EGP', fastingRequired: false },
    { code: 'CA',      name: 'Calcium Level',                  reason: 'Verify calcium',                        priority: 'medium', cost: '30-60 EGP',   fastingRequired: false },
  ],
  anemia: [
    { code: 'CBC',     name: 'Complete Blood Count',           reason: 'Main anemia test',                      priority: 'urgent', cost: '50-100 EGP',  fastingRequired: false },
    { code: 'FERR',    name: 'Ferritin',                       reason: 'Iron storage',                          priority: 'urgent', cost: '100-200 EGP', fastingRequired: false },
    { code: 'IRON',    name: 'Serum Iron + TIBC',              reason: 'Complete iron panel',                   priority: 'high',   cost: '100-200 EGP', fastingRequired: false },
  ],
  anemia_b12: [
    { code: 'B12',     name: 'Vitamin B12',                    reason: 'B12 level',                             priority: 'urgent', cost: '100-200 EGP', fastingRequired: false },
    { code: 'FOL',     name: 'Folate (B9)',                    reason: 'Often deficient with B12',              priority: 'high',   cost: '100-200 EGP', fastingRequired: false },
  ],
  general: [
    { code: 'CBC',     name: 'Complete Blood Count',           reason: 'General health check',                  priority: 'medium', cost: '50-100 EGP',  fastingRequired: false },
    { code: 'VITD',    name: 'Vitamin D',                      reason: 'Common deficiency in Egypt',            priority: 'high',   cost: '150-250 EGP', fastingRequired: false },
    { code: 'B12',     name: 'Vitamin B12',                    reason: 'General screening',                     priority: 'medium', cost: '100-200 EGP', fastingRequired: false },
    { code: 'FERR',    name: 'Ferritin',                       reason: 'Iron storage check',                    priority: 'medium', cost: '100-200 EGP', fastingRequired: false },
    { code: 'TSH',     name: 'TSH',                            reason: 'Thyroid screening',                     priority: 'medium', cost: '80-150 EGP',  fastingRequired: false },
  ],
};

// ── 7. Safe Supplements (before lab results) ─────────────────
export interface Supplement {
  name: string;
  dose: string;
  timing: string;
  duration: string;
  foodSources: string[];
  foodEmojis: string[];
  warning: string;
}

export const SAFE_SUPPLEMENTS: Record<string, Supplement> = {
  vitamin_d: {
    name: 'Vitamin D3',
    dose: '1000-2000 IU/day (safe starting dose)',
    timing: 'With largest meal',
    duration: 'Until lab results',
    foodSources: ['Fatty fish', 'Egg yolks', 'Liver', 'Fortified dairy'],
    foodEmojis: ['🐟','🥚','🫀','🥛'],
    warning: 'Do not exceed 4000 IU without lab test. Get tested within 1 month.',
  },
  vitamin_b12: {
    name: 'Vitamin B12',
    dose: '500-1000 mcg/day (sublingual)',
    timing: 'Morning, empty stomach',
    duration: 'Until lab results',
    foodSources: ['Liver', 'Red meat', 'Eggs', 'Dairy', 'Fish'],
    foodEmojis: ['🫀','🥩','🥚','🥛','🐟'],
    warning: 'Severe deficiency needs injections - lab test required first.',
  },
  iron: {
    name: 'Iron (Ferrous Bisglycinate)',
    dose: '18 mg/day (women), 8 mg/day (men)',
    timing: 'With Vitamin C, before meals',
    duration: 'Max 3 months without test',
    foodSources: ['Liver', 'Red meat', 'Fava beans', 'Lentils', 'Spinach'],
    foodEmojis: ['🫀','🥩','🫘','🌿','🥬'],
    warning: 'DO NOT take without ferritin test - excess iron is dangerous.',
  },
  magnesium: {
    name: 'Magnesium Glycinate',
    dose: '200-300 mg/day',
    timing: 'Before bed',
    duration: 'Long-term safe',
    foodSources: ['Almonds', 'Tahini', 'Lentils', 'Fava beans', 'Bananas', 'Spinach'],
    foodEmojis: ['🌰','🫙','🌿','🫘','🍌','🥬'],
    warning: 'Start with 150 mg - may cause loose stools at high doses.',
  },
  omega3: {
    name: 'Omega-3 (Fish Oil)',
    dose: '1000 mg EPA+DHA/day',
    timing: 'With fatty meal',
    duration: 'Long-term safe',
    foodSources: ['Salmon', 'Sardines', 'Tuna', 'Walnuts', 'Flaxseed'],
    foodEmojis: ['🐟','🐟','🥫','🌰','🌿'],
    warning: 'Consult doctor if on blood thinners.',
  },
  zinc: {
    name: 'Zinc Picolinate',
    dose: '15-25 mg/day',
    timing: 'With food',
    duration: 'Max 3 months',
    foodSources: ['Red meat', 'Liver', 'Pumpkin seeds', 'Eggs', 'Chickpeas'],
    foodEmojis: ['🥩','🫀','🌻','🥚','🫘'],
    warning: 'Do not exceed 40 mg/day - can cause copper deficiency.',
  },
  vitamin_c: {
    name: 'Vitamin C',
    dose: '500-1000 mg/day',
    timing: 'With meals',
    duration: 'Long-term safe',
    foodSources: ['Guava', 'Orange', 'Bell pepper', 'Lemon', 'Strawberry', 'Kiwi'],
    foodEmojis: ['🍐','🍊','🫑','🍋','🍓','🥝'],
    warning: 'High doses may cause diarrhea and kidney stones.',
  },
};

// ── 8. AI Diagnosis Engine ────────────────────────────────────
export interface DeficiencyScore {
  supplementKey: string;
  supplementName: string;
  confidence: number;
  matchedSymptoms: string[];
  reason: string;
}

export function diagnoseDeficiencies(
  conditions: string[],
  symptoms: string[],
  habits: string[]
): DeficiencyScore[] {
  const scores: DeficiencyScore[] = [];

  // Rule: Vitamin D
  const vdSymptoms = ['sym_fatigue','sym_sleepy','sym_jointpain','sym_sadness','sym_cramps'];
  const vdMatched = vdSymptoms.filter(s => symptoms.includes(s));
  const vdCondBoost = conditions.some(c => ['depression','osteoporosis','arthritis'].includes(c)) ? 20 : 0;
  if (vdMatched.length > 0) {
    scores.push({
      supplementKey: 'vitamin_d',
      supplementName: 'Vitamin D3',
      confidence: Math.min(95, Math.round((vdMatched.length / vdSymptoms.length) * 100) + vdCondBoost),
      matchedSymptoms: vdMatched,
      reason: 'Symptoms align with Vitamin D deficiency (very common in Egypt)',
    });
  }

  // Rule: Iron
  const ironSymptoms = ['sym_fatigue','sym_dizzy','sym_hairloss','sym_palecolor','sym_weakness','sym_headache'];
  const ironMatched = ironSymptoms.filter(s => symptoms.includes(s));
  const ironCondBoost = conditions.some(c => c === 'anemia') ? 30 : 0;
  if (ironMatched.length > 0) {
    scores.push({
      supplementKey: 'iron',
      supplementName: 'Iron',
      confidence: Math.min(95, Math.round((ironMatched.length / ironSymptoms.length) * 100) + ironCondBoost),
      matchedSymptoms: ironMatched,
      reason: 'Symptoms suggest iron deficiency anemia',
    });
  }

  // Rule: B12
  const b12Symptoms = ['sym_fatigue','sym_dizzy','sym_focus','sym_memory','sym_palecolor','sym_weakness'];
  const b12Matched = b12Symptoms.filter(s => symptoms.includes(s));
  if (b12Matched.length >= 2) {
    scores.push({
      supplementKey: 'vitamin_b12',
      supplementName: 'Vitamin B12',
      confidence: Math.min(90, Math.round((b12Matched.length / b12Symptoms.length) * 100)),
      matchedSymptoms: b12Matched,
      reason: 'Neurological symptoms suggest B12 deficiency',
    });
  }

  // Rule: Magnesium
  const mgSymptoms = ['sym_anxious','sym_cramps','sym_sleepy','sym_headache','sym_mood'];
  const mgMatched = mgSymptoms.filter(s => symptoms.includes(s));
  const mgHabitBoost = habits.some(h => ['drink_coffee','drink_energy','hab_stress'].includes(h)) ? 15 : 0;
  if (mgMatched.length > 0) {
    scores.push({
      supplementKey: 'magnesium',
      supplementName: 'Magnesium',
      confidence: Math.min(90, Math.round((mgMatched.length / mgSymptoms.length) * 100) + mgHabitBoost),
      matchedSymptoms: mgMatched,
      reason: 'Symptoms match magnesium deficiency - caffeine depletes it',
    });
  }

  // Rule: Omega-3
  const o3Symptoms = ['sym_focus','sym_memory','sym_jointpain','sym_mood','sym_dryskin','sym_sadness'];
  const o3Matched = o3Symptoms.filter(s => symptoms.includes(s));
  if (o3Matched.length >= 2) {
    scores.push({
      supplementKey: 'omega3',
      supplementName: 'Omega-3',
      confidence: Math.min(85, Math.round((o3Matched.length / o3Symptoms.length) * 100)),
      matchedSymptoms: o3Matched,
      reason: 'Supports brain health and reduces inflammation',
    });
  }

  // Rule: Vitamin C
  const vcSymptoms = ['sym_dryskin','sym_hairloss','sym_nails','sym_palecolor'];
  const vcHabitBoost = habits.some(h => h === 'hab_smoke') ? 30 : 0;
  const vcMatched = vcSymptoms.filter(s => symptoms.includes(s));
  if (vcMatched.length > 0 || vcHabitBoost > 0) {
    scores.push({
      supplementKey: 'vitamin_c',
      supplementName: 'Vitamin C',
      confidence: Math.min(80, Math.round((vcMatched.length / vcSymptoms.length) * 100) + vcHabitBoost),
      matchedSymptoms: vcMatched,
      reason: vcHabitBoost > 0 ? 'Smoking depletes Vitamin C significantly' : 'Skin and hair symptoms suggest Vitamin C need',
    });
  }

  return scores.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// ── 9. Lab Tests Aggregator ──────────────────────────────────
export function getLabsForUser(conditions: string[], symptoms: string[]): LabTest[] {
  const tests: LabTest[] = [];
  const codes = new Set<string>();

  // Add tests based on conditions
  conditions.forEach(c => {
    LAB_TESTS[c]?.forEach(t => {
      if (!codes.has(t.code)) { tests.push(t); codes.add(t.code); }
    });
  });

  // If symptoms but no specific condition - add general
  if (tests.length === 0 && symptoms.length > 0) {
    LAB_TESTS.general.forEach(t => {
      if (!codes.has(t.code)) { tests.push(t); codes.add(t.code); }
    });
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2 };
  return tests.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// ── 10. Exercise Recommendations Based on Condition ──────────
export interface ExerciseRecommendation {
  name: string;
  icon: string;
  duration: string;
  intensity: 'low' | 'moderate' | 'high';
  reason: string;
  warning?: string;
}

export function getExercisesForUser(conditions: string[], episodes: string[]): {
  recommended: ExerciseRecommendation[];
  avoid: string[];
} {
  const recommended: ExerciseRecommendation[] = [];
  const avoid: string[] = [];

  const hasAsthma   = conditions.includes('asthma') || episodes.includes('ep_asthma');
  const hasHeart    = conditions.some(c => ['heart_disease','arrhythmia','hypertension'].includes(c)) || episodes.includes('ep_chestpain');
  const hasDiabetes = conditions.some(c => c.includes('diabetes'));
  const hasJoints   = conditions.some(c => ['arthritis','osteoporosis','back_pain'].includes(c));
  const hasMental   = conditions.some(c => ['anxiety','depression','insomnia'].includes(c));

  // Safe for everyone
  recommended.push({
    name: 'Walking',
    icon: '🚶',
    duration: '30 min/day',
    intensity: 'low',
    reason: 'Safest cardio for all conditions',
  });

  if (hasAsthma) {
    recommended.push({
      name: 'Swimming',
      icon: '🏊',
      duration: '20-30 min',
      intensity: 'moderate',
      reason: 'Humid air is easier for asthmatic lungs',
      warning: 'Always carry inhaler. Warm up for 10 minutes.',
    });
    recommended.push({
      name: 'Yoga',
      icon: '🧘',
      duration: '20 min/day',
      intensity: 'low',
      reason: 'Breathing exercises strengthen lungs',
    });
    avoid.push('High-intensity interval training (HIIT)');
    avoid.push('Running in cold/dry air');
    avoid.push('Heavy weight lifting that strains breathing');
  }

  if (hasHeart) {
    recommended.push({
      name: 'Light Cycling',
      icon: '🚴',
      duration: '20 min',
      intensity: 'low',
      reason: 'Good for heart without overload',
      warning: 'Keep heart rate below 70% max',
    });
    avoid.push('Heavy weight lifting');
    avoid.push('Sprinting or HIIT');
    avoid.push('Hot yoga (high temperature strain)');
  }

  if (hasDiabetes) {
    recommended.push({
      name: 'Resistance Training',
      icon: '💪',
      duration: '3x/week, 30 min',
      intensity: 'moderate',
      reason: 'Builds muscle which improves insulin sensitivity',
      warning: 'Check sugar before and after exercise',
    });
    recommended.push({
      name: 'Post-meal walk',
      icon: '🚶',
      duration: '15 min after each meal',
      intensity: 'low',
      reason: 'Lowers blood sugar spike after eating',
    });
  }

  if (hasJoints) {
    recommended.push({
      name: 'Water Aerobics',
      icon: '🏊',
      duration: '30 min',
      intensity: 'low',
      reason: 'Zero joint impact',
    });
    recommended.push({
      name: 'Stretching',
      icon: '🧘',
      duration: '15 min daily',
      intensity: 'low',
      reason: 'Reduces joint stiffness',
    });
    avoid.push('Running on hard surfaces');
    avoid.push('Jumping exercises');
    avoid.push('High-impact aerobics');
  }

  if (hasMental) {
    recommended.push({
      name: 'Yoga + Meditation',
      icon: '🧘',
      duration: '20 min/day',
      intensity: 'low',
      reason: 'Reduces anxiety and improves mood',
    });
    recommended.push({
      name: 'Outdoor Walking',
      icon: '🌳',
      duration: '30 min in daylight',
      intensity: 'low',
      reason: 'Sunlight boosts serotonin and Vitamin D',
    });
  }

  return { recommended, avoid };
}

// ── 11. Habit Reduction Plans ────────────────────────────────
export function getDrinkReductionPlan(habitId: string, currentAmount: number): {
  weeks: { week: number; target: number; tip: string; replacement: string }[];
  finalGoal: number;
} {
  const plans: Record<string, { finalGoal: number; tips: string[]; replacements: string[] }> = {
    drink_coffee: {
      finalGoal: 1,
      tips: [
        'Replace the last cup with green tea',
        'Drink coffee after meals, not on empty stomach',
        'No coffee after 2pm - protects sleep',
        'Final week: morning cup only',
      ],
      replacements: ['Green tea', 'Herbal tea', 'Warm lemon water', 'Decaf coffee'],
    },
    drink_soda: {
      finalGoal: 0,
      tips: [
        'Replace with sparkling water + lemon',
        'Diluted fresh juice when craving sweetness',
        'Iced herbal tea without sugar',
        'Zero soda week - you can do it!',
      ],
      replacements: ['Sparkling water + mint', 'Iced karkadeh', 'Fresh pomegranate juice', 'Infused water'],
    },
    drink_energy: {
      finalGoal: 0,
      tips: [
        'Replace with black coffee (same caffeine, no additives)',
        'Banana + light coffee for sustained energy',
        'Coconut water + dark chocolate',
        'Focus on 7-8 hours sleep',
      ],
      replacements: ['Black coffee', 'Banana + almonds', 'Coconut water', 'Matcha tea'],
    },
    drink_tea: {
      finalGoal: 2,
      tips: [
        'Brew tea lighter (3 min max)',
        'Replace one cup with herbal tea',
        'Avoid tea with meals - blocks iron',
        'Stick to 2 cups only',
      ],
      replacements: ['Light green tea', 'Thyme tea', 'Karkadeh', 'Anise tea'],
    },
    drink_juice: {
      finalGoal: 0,
      tips: [
        'Replace with whole fruit',
        'Dilute juice 50/50 with water',
        'Fresh juice only, no bottled',
        'Stop juice - eat fruit instead',
      ],
      replacements: ['Whole fruit', 'Water + fruit slices', 'Diluted fresh juice', 'Smoothie with fiber'],
    },
    drink_alcohol: {
      finalGoal: 0,
      tips: [
        'Replace in social situations with non-alcoholic alternatives',
        'Identify triggers and avoid them',
        'Strong-flavored alternatives help',
        'Seek professional support if needed',
      ],
      replacements: ['Pomegranate juice', 'Cold karkadeh', 'Sparkling water + lemon', 'Herbal tea'],
    },
  };

  const plan = plans[habitId];
  if (!plan) return { weeks: [], finalGoal: 0 };

  const totalReduction = currentAmount - plan.finalGoal;
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const week = i + 1;
    const reduction = (totalReduction / 4) * week;
    const target = Math.max(plan.finalGoal, Math.round((currentAmount - reduction) * 10) / 10);
    return {
      week,
      target,
      tip: plan.tips[i] ?? 'Stay consistent',
      replacement: plan.replacements[i] ?? plan.replacements[0],
    };
  });

  return { weeks, finalGoal: plan.finalGoal };
}

// ── 12. 10-Day Safe Plan ──────────────────────────────────────
export interface SafePlanTask {
  id: string;
  category: 'nutrition' | 'hydration' | 'exercise' | 'sleep' | 'supplement' | 'mindfulness';
  icon: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface SafePlanDay {
  day: number;
  date: string;
  theme: string;
  tasks: SafePlanTask[];
}

export function generate10DayPlan(
  conditions: string[],
  supplements: string[]
): SafePlanDay[] {
  const hasCardio   = conditions.some(c => ['hypertension','heart_disease','cholesterol','arrhythmia'].includes(c));
  const hasDiabetes = conditions.some(c => c.includes('diabetes') || c === 'prediabetes');
  const hasAnemia   = conditions.some(c => c.includes('anemia'));
  const hasMental   = conditions.some(c => ['anxiety','depression','insomnia'].includes(c));
  const hasKidney   = conditions.some(c => c.includes('ckd'));
  const hasBones    = conditions.some(c => ['osteoporosis','arthritis'].includes(c));

  const themes = [
    'Introduction & Light Start',
    'Adding Simple Movement',
    'Organizing Meal Times',
    'Boosting Hydration',
    'Mid-Point Check-in',
    'Anti-Inflammatory Nutrition',
    'Sleep Improvement',
    'Stress Management',
    'Muscle Strengthening',
    'Final Evaluation',
  ];

  const days: SafePlanDay[] = [];

  for (let d = 1; d <= 10; d++) {
    const date = new Date();
    date.setDate(date.getDate() + (d - 1));
    const tasks: SafePlanTask[] = [];

    // Core daily tasks
    tasks.push({
      id: `d${d}-water`, category: 'hydration', icon: '💧',
      title: hasKidney ? 'Drink 1.5L water' : 'Drink 2L water',
      description: hasKidney ? 'Limited for kidneys' : 'Distributed through day',
      completed: false,
    });

    tasks.push({
      id: `d${d}-sleep`, category: 'sleep', icon: '😴',
      title: 'Sleep 7-8 hours',
      description: hasMental ? 'Consistent sleep improves mood' : 'Foundation of health',
      completed: false,
    });

    // Supplements (if recommended)
    supplements.slice(0, 2).forEach((supKey, idx) => {
      const sup = SAFE_SUPPLEMENTS[supKey];
      if (sup) {
        tasks.push({
          id: `d${d}-sup${idx}`,
          category: 'supplement',
          icon: '💊',
          title: `Take ${sup.name}`,
          description: `${sup.dose} - ${sup.timing}`,
          completed: false,
        });
      }
    });

    // Condition-specific
    if (hasCardio) {
      tasks.push({
        id: `d${d}-sodium`, category: 'nutrition', icon: '🧂',
        title: 'Low sodium today',
        description: 'Keep below 2000mg',
        completed: false,
      });
    }
    if (hasDiabetes) {
      tasks.push({
        id: `d${d}-sugar`, category: 'nutrition', icon: '🩸',
        title: 'Measure blood sugar',
        description: 'Morning and before bed',
        completed: false,
      });
    }
    if (hasAnemia) {
      tasks.push({
        id: `d${d}-iron`, category: 'nutrition', icon: '🥩',
        title: 'Iron-rich meal + Vitamin C',
        description: 'Liver/meat + orange juice',
        completed: false,
      });
    }
    if (hasBones) {
      tasks.push({
        id: `d${d}-calcium`, category: 'nutrition', icon: '🥛',
        title: 'Calcium source',
        description: 'Yogurt, cheese, or tahini',
        completed: false,
      });
    }
    if (hasMental) {
      tasks.push({
        id: `d${d}-mind`, category: 'mindfulness', icon: '🧘',
        title: '10 min meditation',
        description: 'Deep breathing calms nerves',
        completed: false,
      });
    }

    // Progressive exercise
    if (d <= 3) {
      tasks.push({
        id: `d${d}-walk`, category: 'exercise', icon: '🚶',
        title: 'Walk 15 minutes',
        description: 'Easy start - no strain',
        completed: false,
      });
    } else if (d <= 7) {
      tasks.push({
        id: `d${d}-walk`, category: 'exercise', icon: '🚶',
        title: 'Walk 25-30 minutes',
        description: hasCardio ? 'Moderate pace' : 'Pick up the pace',
        completed: false,
      });
    } else {
      tasks.push({
        id: `d${d}-walk`, category: 'exercise', icon: '🏃',
        title: 'Walk 35-45 minutes',
        description: 'Or light home workout',
        completed: false,
      });
    }

    days.push({
      day: d,
      date: date.toLocaleDateString('en-GB'),
      theme: themes[d - 1],
      tasks,
    });
  }

  return days;
}

// ── 13. Compliance & Feedback ────────────────────────────────
export function analyzeCompliance(tasks: SafePlanTask[]): {
  percentage: number;
  completed: number;
  total: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
  action: string;
} {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  if (percentage >= 80) return {
    percentage, completed, total,
    level: 'excellent', color: '#4DFF9E',
    message: `Excellent! ${completed}/${total} completed`,
    action: 'Keep going - you are on the right track',
  };
  if (percentage >= 60) return {
    percentage, completed, total,
    level: 'good', color: '#E8FF4D',
    message: `Good! ${completed}/${total} completed`,
    action: 'Try to push a bit more - you can do it',
  };
  if (percentage >= 40) return {
    percentage, completed, total,
    level: 'fair', color: '#FF9D4D',
    message: `Fair - ${completed}/${total} completed`,
    action: 'We can simplify the plan if needed',
  };
  return {
    percentage, completed, total,
    level: 'poor', color: '#FF6B6B',
    message: `Only ${completed}/${total} completed`,
    action: 'Plan is too much - simplifying now',
  };
}

export const FEEDBACK_QUESTIONS = [
  {
    id: 'energy',
    question: 'How is your energy compared to start?',
    icon: '⚡',
    options: [
      { label: 'Much better',     value: 5, color: '#4DFF9E' },
      { label: 'Slightly better', value: 4, color: '#E8FF4D' },
      { label: 'Same',            value: 3, color: '#FFB84D' },
      { label: 'Slightly worse',  value: 2, color: '#FF9D4D' },
      { label: 'Much worse',      value: 1, color: '#FF6B6B' },
    ],
  },
  {
    id: 'sleep',
    question: 'Is your sleep better?',
    icon: '😴',
    options: [
      { label: 'Much better',  value: 5, color: '#4DFF9E' },
      { label: 'Better',       value: 4, color: '#E8FF4D' },
      { label: 'Same',         value: 3, color: '#FFB84D' },
      { label: 'Worse',        value: 2, color: '#FF6B6B' },
    ],
  },
  {
    id: 'mood',
    question: 'How is your mood?',
    icon: '😊',
    options: [
      { label: 'Very good',    value: 5, color: '#4DFF9E' },
      { label: 'Better',       value: 4, color: '#E8FF4D' },
      { label: 'Normal',       value: 3, color: '#FFB84D' },
      { label: 'Not good',     value: 2, color: '#FF6B6B' },
    ],
  },
  {
    id: 'symptoms',
    question: 'Have symptoms decreased?',
    icon: '🔬',
    options: [
      { label: 'Much less',    value: 5, color: '#4DFF9E' },
      { label: 'A bit less',   value: 4, color: '#E8FF4D' },
      { label: 'Same',         value: 3, color: '#FFB84D' },
      { label: 'Increased',    value: 2, color: '#FF6B6B' },
    ],
  },
];
