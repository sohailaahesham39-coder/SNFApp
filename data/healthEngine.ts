// ============================================================
// Health Engine — Smart Nutrition & Fitness Chatbot
// Complete integrated health system in English
// ============================================================
import { supabase } from '../lib/supabase';

// ── 1. Chronic Conditions (comprehensive) ────────────────────
export let CHRONIC_CONDITIONS = [
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
export let SYMPTOMS_LIST = [
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
export let ACUTE_EPISODES = [
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
export let DRINKING_HABITS = [
  { id: 'drink_coffee',   name: 'Coffee',          icon: '☕', defaultAmount: '2 cups/day',     goodLimit: '1-2 cups', risky: '5+ cups' },
  { id: 'drink_tea',      name: 'Heavy Tea',       icon: '🍵', defaultAmount: '3 cups/day',     goodLimit: '2-3 cups', risky: '6+ cups' },
  { id: 'drink_soda',     name: 'Soft Drinks',     icon: '🥤', defaultAmount: '1 can/day',      goodLimit: '0 cans',   risky: '2+ cans' },
  { id: 'drink_energy',   name: 'Energy Drinks',   icon: '⚡', defaultAmount: '1 can/day',      goodLimit: '0 cans',   risky: '1+ cans' },
  { id: 'drink_juice',    name: 'Sugary Juice',    icon: '🧃', defaultAmount: '1 glass/day',    goodLimit: '0-1 glass',risky: '3+ glasses' },
  { id: 'drink_alcohol',  name: 'Alcohol',         icon: '🍺', defaultAmount: '2 times/week',   goodLimit: '0 times',  risky: '3+ times/week' },
  { id: 'drink_water',    name: 'Water',           icon: '💧', defaultAmount: '1L/day',         goodLimit: '2-3L',     risky: 'Less than 1L' },
];

// ── 5. Lifestyle Habits ──────────────────────────────────────
export let LIFESTYLE_HABITS = [
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

export let LAB_TESTS: Record<string, LabTest[]> = {
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

export let SAFE_SUPPLEMENTS: Record<string, Supplement> = {
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

export let FEEDBACK_QUESTIONS = [
  {
    id: 'energy',
    question: 'How is your energy compared to the start?',
    icon: '⚡',
    options: [
      { label: 'Much better',    value: 5, color: '#4DFF9E' },
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
      { label: 'Deep and restful',   value: 5, color: '#4DFF9E' },
      { label: 'Better than before', value: 4, color: '#E8FF4D' },
      { label: 'Same',               value: 3, color: '#FFB84D' },
      { label: 'Worse',              value: 2, color: '#FF6B6B' },
    ],
  },
  {
    id: 'mood',
    question: 'How is your overall mood?',
    icon: '😊',
    options: [
      { label: 'Very good', value: 5, color: '#4DFF9E' },
      { label: 'Better',    value: 4, color: '#E8FF4D' },
      { label: 'Normal',    value: 3, color: '#FFB84D' },
      { label: 'Not good',  value: 2, color: '#FF6B6B' },
    ],
  },
  {
    id: 'symptoms',
    question: 'Have your symptoms decreased?',
    icon: '🔬',
    options: [
      { label: 'Much less', value: 5, color: '#4DFF9E' },
      { label: 'A bit less', value: 4, color: '#E8FF4D' },
      { label: 'Same',       value: 3, color: '#FFB84D' },
      { label: 'Increased',  value: 2, color: '#FF6B6B' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// DEFICIENCY ANALYSIS SHEET GENERATOR (Scientific)
// ══════════════════════════════════════════════════════════════

export interface DeficiencyAnalysis {
  nutrient: string;
  emoji: string;
  confidence: number;
  matchedSymptoms: { id: string; name: string }[];
  scientificBasis: string;

  // Risk Level
  riskLevel: 'safe_to_start' | 'caution' | 'lab_required_first';

  // If safe to start
  supplement?: {
    name: string;
    dose: string;
    timing: string;
    duration: string;
    cost: string;
    with: string;
  };

  // Lab tests (always included)
  labTests: {
    code: string;
    name: string;
    cost: string;
    when: string;
    why: string;
    fasting: boolean;
  }[];

  // Egyptian foods
  egyptianFoods: {
    name: string;
    emoji: string;
    amount: string;
    nutrientContent: string;
  }[];

  // Warnings
  warnings: string[];

  // Monitoring
  monitoring?: {
    what: string;
    when: string;
    action: string;
  };
}

export function generateDeficiencyAnalysisSheet(
  conditions: string[],
  symptoms: string[],
  habits: string[],
  age: number,
  gender: 'male' | 'female'
): DeficiencyAnalysis[] {
  const results: DeficiencyAnalysis[] = [];

  // ── IRON DEFICIENCY ────────────────────────────────────────
  const ironSymptoms = ['sym_fatigue', 'sym_dizzy', 'sym_hairloss', 'sym_palecolor', 'sym_weakness', 'sym_headache'];
  const ironMatched = ironSymptoms.filter(s => symptoms.includes(s));
  const hasAnemia = conditions.includes('anemia');

  if (ironMatched.length >= 2 || hasAnemia) {
    const confidence = hasAnemia
      ? 95
      : Math.min(95, Math.round((ironMatched.length / ironSymptoms.length) * 100) + 20);

    results.push({
      nutrient: 'Iron',
      emoji: '🩸',
      confidence,
      matchedSymptoms: ironMatched.map(id => {
        const sym = SYMPTOMS_LIST.find(s => s.id === id);
        return { id, name: sym?.name || id };
      }),
      scientificBasis: hasAnemia
        ? 'Diagnosed anemia - iron deficiency confirmed'
        : `${ironMatched.length}/${ironSymptoms.length} symptoms match (${Math.round(ironMatched.length / ironSymptoms.length * 100)}%) - strong indicator`,

      riskLevel: 'lab_required_first',

      labTests: [
        {
          code: 'CBC',
          name: 'Complete Blood Count',
          cost: '50-100 EGP',
          when: 'Within 1 week (URGENT)',
          why: 'Check hemoglobin and red blood cell count',
          fasting: false,
        },
        {
          code: 'FERR',
          name: 'Ferritin (Iron Storage)',
          cost: '100-200 EGP',
          when: 'Same time as CBC',
          why: 'Measure iron stores in body - most accurate test',
          fasting: false,
        },
        {
          code: 'IRON',
          name: 'Serum Iron + TIBC',
          cost: '100-200 EGP',
          when: 'If ferritin is low',
          why: 'Complete iron panel for accurate diagnosis',
          fasting: true,
        },
      ],

      egyptianFoods: [
        { name: 'Liver (beef/chicken)', emoji: '🫀', amount: '100g', nutrientContent: '6-8mg iron' },
        { name: 'Red meat', emoji: '🥩', amount: '100g', nutrientContent: '2-3mg iron' },
        { name: 'Fava beans (foul)', emoji: '🫘', amount: '1 cup cooked', nutrientContent: '2-3mg iron' },
        { name: 'Lentils', emoji: '🌿', amount: '1 cup cooked', nutrientContent: '3-4mg iron' },
        { name: 'Spinach (cooked)', emoji: '🥬', amount: '1 cup', nutrientContent: '3-6mg iron' },
        { name: 'Molokheya', emoji: '🥬', amount: '1 cup cooked', nutrientContent: '2-3mg iron' },
      ],

      warnings: [
        '⚠️ DO NOT SUPPLEMENT WITHOUT LAB TEST',
        '⚠️ Excess iron is toxic and can damage organs',
        '⚠️ Iron overload is dangerous - must verify deficiency first',
        '⚠️ If ferritin >200 (men) or >150 (women) = DO NOT take iron',
        '💡 Eat iron-rich foods + Vitamin C (orange, lemon) for better absorption',
        '💡 Avoid tea/coffee with meals - blocks iron absorption',
      ],

      monitoring: {
        what: 'Watch for improvement in fatigue and pale skin',
        when: 'After 2 weeks of iron-rich foods',
        action: 'If no improvement → GET LAB TEST IMMEDIATELY',
      },
    });
  }

  // ── VITAMIN D DEFICIENCY ───────────────────────────────────
  const vitdSymptoms = ['sym_fatigue', 'sym_sleepy', 'sym_jointpain', 'sym_sadness', 'sym_cramps', 'sym_weakness'];
  const vitdMatched = vitdSymptoms.filter(s => symptoms.includes(s));
  const hasDepression = conditions.includes('depression');
  const hasBones = conditions.some(c => ['osteoporosis', 'arthritis'].includes(c));

  // In Egypt, 80%+ have Vitamin D deficiency - very safe assumption
  if (vitdMatched.length >= 1 || hasDepression || hasBones) {
    const confidence = Math.min(
      95,
      Math.round((vitdMatched.length / vitdSymptoms.length) * 100) +
        (hasDepression ? 20 : 0) +
        (hasBones ? 20 : 0) +
        30
    );

    results.push({
      nutrient: 'Vitamin D3',
      emoji: '☀️',
      confidence,
      matchedSymptoms: vitdMatched.map(id => {
        const sym = SYMPTOMS_LIST.find(s => s.id === id);
        return { id, name: sym?.name || id };
      }),
      scientificBasis: `${vitdMatched.length}/${vitdSymptoms.length} symptoms match. PLUS: 80%+ of Egyptians are deficient (limited sun exposure + indoor lifestyle)`,

      riskLevel: 'safe_to_start',

      supplement: {
        name: 'Vitamin D3 (Cholecalciferol)',
        dose: '1000-2000 IU/day',
        timing: 'With largest meal (needs fat for absorption)',
        duration: 'Until lab test (max 30 days)',
        cost: '50-100 EGP/month',
        with: 'Fatty meal (eggs, cheese, olive oil, tahini)',
      },

      labTests: [
        {
          code: 'VITD',
          name: '25-OH Vitamin D',
          cost: '150-250 EGP',
          when: 'Within 1 month',
          why: 'Confirm deficiency level and adjust dose',
          fasting: false,
        },
      ],

      egyptianFoods: [
        { name: 'Fatty fish (salmon, tuna)', emoji: '🐟', amount: '100g', nutrientContent: '400-600 IU' },
        { name: 'Egg yolks', emoji: '🥚', amount: '2 eggs', nutrientContent: '80-100 IU' },
        { name: 'Liver', emoji: '🫀', amount: '100g', nutrientContent: '40-50 IU' },
        { name: 'Fortified milk', emoji: '🥛', amount: '1 cup', nutrientContent: '100-120 IU' },
        { name: 'Sunlight exposure', emoji: '☀️', amount: '15-20 min/day', nutrientContent: '1000-2000 IU (arms/legs exposed)' },
      ],

      warnings: [
        '✅ Safe to start at 1000-2000 IU/day',
        '⚠️ Do not exceed 4000 IU/day without lab test',
        '💡 Take with fatty meal (absorption increases 50%)',
        '💡 Best taken in morning/afternoon (not at night)',
        '💡 Get lab test within 1 month to adjust dose',
        '💡 Spend 15-20 min in sun daily (arms/legs exposed)',
      ],

      monitoring: {
        what: 'Watch for improved energy and mood',
        when: 'After 2-3 weeks',
        action: 'If improvement → continue. If not → get lab test to check levels',
      },
    });
  }

  // ── VITAMIN B12 DEFICIENCY ─────────────────────────────────
  const b12Symptoms = ['sym_fatigue', 'sym_dizzy', 'sym_focus', 'sym_memory', 'sym_palecolor', 'sym_weakness', 'sym_mood'];
  const b12Matched = b12Symptoms.filter(s => symptoms.includes(s));
  const hasB12Anemia = conditions.includes('anemia_b12');
  const isVegetarian = habits.includes('hab_noveggies');

  if (b12Matched.length >= 2 || hasB12Anemia || isVegetarian) {
    const confidence = hasB12Anemia
      ? 95
      : Math.min(90, Math.round((b12Matched.length / b12Symptoms.length) * 100) + (isVegetarian ? 20 : 0));

    results.push({
      nutrient: 'Vitamin B12',
      emoji: '🔴',
      confidence,
      matchedSymptoms: b12Matched.map(id => {
        const sym = SYMPTOMS_LIST.find(s => s.id === id);
        return { id, name: sym?.name || id };
      }),
      scientificBasis: hasB12Anemia
        ? 'Diagnosed B12 deficiency anemia'
        : `${b12Matched.length}/${b12Symptoms.length} neurological symptoms match - characteristic of B12 deficiency`,

      riskLevel: 'caution',

      supplement: {
        name: 'Vitamin B12 (Methylcobalamin) - Sublingual',
        dose: '500-1000 mcg/day',
        timing: 'Morning, empty stomach (sublingual = under tongue)',
        duration: '2 weeks trial',
        cost: '50-120 EGP/month',
        with: 'Nothing - absorbs under tongue',
      },

      labTests: [
        {
          code: 'B12',
          name: 'Vitamin B12 (Serum)',
          cost: '100-200 EGP',
          when: 'If no improvement after 2 weeks',
          why: 'Check B12 level - severe deficiency needs injections',
          fasting: false,
        },
        {
          code: 'MMA',
          name: 'Methylmalonic Acid',
          cost: '250-400 EGP',
          when: 'If B12 borderline (200-400 pg/mL)',
          why: 'More accurate than serum B12 - confirms true deficiency',
          fasting: false,
        },
      ],

      egyptianFoods: [
        { name: 'Liver (beef/chicken)', emoji: '🫀', amount: '100g', nutrientContent: '60-80 mcg' },
        { name: 'Red meat', emoji: '🥩', amount: '100g', nutrientContent: '2-3 mcg' },
        { name: 'Fish (salmon, tuna)', emoji: '🐟', amount: '100g', nutrientContent: '3-5 mcg' },
        { name: 'Eggs', emoji: '🥚', amount: '2 eggs', nutrientContent: '1-2 mcg' },
        { name: 'Dairy (milk, cheese)', emoji: '🥛', amount: '1 cup milk', nutrientContent: '1 mcg' },
        { name: 'Cottage cheese (gebna areesh)', emoji: '🧀', amount: '100g', nutrientContent: '0.5-1 mcg' },
      ],

      warnings: [
        '⚠️ If severe symptoms (numbness, balance issues) → SEE DOCTOR for injections',
        '⚠️ Pills may not work if absorption issues - injections needed',
        '💡 Try sublingual for 2 weeks first',
        '💡 If no improvement → get lab test immediately',
        '💡 Vegetarians/vegans at high risk - supplement essential',
        '⚠️ Deficiency can cause permanent nerve damage if untreated',
      ],

      monitoring: {
        what: 'Watch for improved energy, focus, and memory',
        when: 'After 10-14 days',
        action: 'If NO improvement → GET LAB TEST + consider injections',
      },
    });
  }

  // ── MAGNESIUM DEFICIENCY ───────────────────────────────────
  const mgSymptoms = ['sym_anxious', 'sym_cramps', 'sym_sleepy', 'sym_headache', 'sym_mood'];
  const mgMatched = mgSymptoms.filter(s => symptoms.includes(s));
  const hasCaffeine = habits.some(h => h.includes('coffee') || h.includes('energy'));
  const hasStress = habits.includes('hab_stress');

  if (mgMatched.length >= 2 || hasCaffeine || hasStress) {
    const confidence = Math.min(
      90,
      Math.round((mgMatched.length / mgSymptoms.length) * 100) +
        (hasCaffeine ? 15 : 0) +
        (hasStress ? 15 : 0)
    );

    results.push({
      nutrient: 'Magnesium',
      emoji: '⚡',
      confidence,
      matchedSymptoms: mgMatched.map(id => {
        const sym = SYMPTOMS_LIST.find(s => s.id === id);
        return { id, name: sym?.name || id };
      }),
      scientificBasis: hasCaffeine || hasStress
        ? `${mgMatched.length}/${mgSymptoms.length} symptoms + caffeine/stress depletes magnesium rapidly`
        : `${mgMatched.length}/${mgSymptoms.length} symptoms match magnesium deficiency pattern`,

      riskLevel: 'safe_to_start',

      supplement: {
        name: 'Magnesium Glycinate',
        dose: '200-300 mg/day (start with 150mg)',
        timing: 'Before bed (helps sleep)',
        duration: 'Long-term safe',
        cost: '80-150 EGP/month',
        with: 'Small snack (better absorption)',
      },

      labTests: [
        {
          code: 'MG',
          name: 'Magnesium (Serum)',
          cost: '80-150 EGP',
          when: 'Optional - not very accurate',
          why: 'Blood test misses tissue deficiency (most Mg is in cells, not blood)',
          fasting: false,
        },
      ],

      egyptianFoods: [
        { name: 'Almonds', emoji: '🌰', amount: '30g (1 handful)', nutrientContent: '80 mg' },
        { name: 'Tahini', emoji: '🫙', amount: '2 tbsp', nutrientContent: '60-70 mg' },
        { name: 'Lentils', emoji: '🌿', amount: '1 cup cooked', nutrientContent: '70-80 mg' },
        { name: 'Fava beans', emoji: '🫘', amount: '1 cup cooked', nutrientContent: '60-70 mg' },
        { name: 'Spinach (cooked)', emoji: '🥬', amount: '1 cup', nutrientContent: '150 mg' },
        { name: 'Bananas', emoji: '🍌', amount: '1 medium', nutrientContent: '30 mg' },
        { name: 'Dark chocolate (70%+)', emoji: '🍫', amount: '30g', nutrientContent: '65 mg' },
      ],

      warnings: [
        '✅ Very safe to supplement',
        '⚠️ Start with 150mg - may cause loose stools if too high',
        '💡 Magnesium Glycinate is best form (no laxative effect)',
        '💡 Take before bed - improves sleep quality',
        '💡 Caffeine depletes magnesium - supplement essential if high coffee intake',
        '⚠️ If diarrhea occurs → reduce dose by half',
      ],

      monitoring: {
        what: 'Watch for better sleep, less muscle cramps, calmer mood',
        when: 'After 1-2 weeks',
        action: 'If works well → continue long-term (very safe)',
      },
    });
  }

  // ── OMEGA-3 DEFICIENCY ─────────────────────────────────────
  const o3Symptoms = ['sym_focus', 'sym_memory', 'sym_jointpain', 'sym_mood', 'sym_dryskin', 'sym_sadness'];
  const o3Matched = o3Symptoms.filter(s => symptoms.includes(s));
  const hasDepression2 = conditions.includes('depression');
  const hasHeart = conditions.some(c => ['heart_disease', 'cholesterol'].includes(c));

  if (o3Matched.length >= 2 || hasDepression2 || hasHeart) {
    const confidence = Math.min(
      85,
      Math.round((o3Matched.length / o3Symptoms.length) * 100) +
        (hasDepression2 ? 15 : 0) +
        (hasHeart ? 15 : 0)
    );

    results.push({
      nutrient: 'Omega-3 (Fish Oil)',
      emoji: '🐟',
      confidence,
      matchedSymptoms: o3Matched.map(id => {
        const sym = SYMPTOMS_LIST.find(s => s.id === id);
        return { id, name: sym?.name || id };
      }),
      scientificBasis: `${o3Matched.length}/${o3Symptoms.length} symptoms + strong evidence for brain/heart health`,

      riskLevel: 'safe_to_start',

      supplement: {
        name: 'Omega-3 (EPA + DHA Fish Oil)',
        dose: '1000mg EPA+DHA combined/day',
        timing: 'With fatty meal (breakfast/lunch)',
        duration: 'Long-term safe',
        cost: '100-200 EGP/month',
        with: 'Fatty meal (better absorption)',
      },

      labTests: [
        {
          code: 'OMEGA3',
          name: 'Omega-3 Index',
          cost: '500-800 EGP (expensive)',
          when: 'Optional - not essential',
          why: 'Measures red blood cell Omega-3 levels',
          fasting: false,
        },
      ],

      egyptianFoods: [
        { name: 'Salmon', emoji: '🐟', amount: '100g', nutrientContent: '1500-2000mg EPA+DHA' },
        { name: 'Sardines', emoji: '🐟', amount: '100g', nutrientContent: '1000-1500mg' },
        { name: 'Tuna', emoji: '🥫', amount: '100g', nutrientContent: '500-1000mg' },
        { name: 'Mackerel (eskombri)', emoji: '🐟', amount: '100g', nutrientContent: '2000-2500mg' },
        { name: 'Walnuts', emoji: '🌰', amount: '30g', nutrientContent: '2500mg ALA (plant omega-3)' },
        { name: 'Flaxseeds (ketan)', emoji: '🌿', amount: '1 tbsp ground', nutrientContent: '2400mg ALA' },
      ],

      warnings: [
        '✅ Very safe to supplement',
        '⚠️ If on blood thinners (aspirin, warfarin) → consult doctor first',
        '💡 Take with food to avoid fishy burps',
        '💡 High EPA (>500mg) = better for mood/depression',
        '💡 High DHA (>500mg) = better for brain/memory',
        '💡 Store in fridge to prevent oxidation',
      ],

      monitoring: {
        what: 'Watch for improved mood, focus, and joint pain',
        when: 'After 4-6 weeks (takes time)',
        action: 'If works → continue long-term',
      },
    });
  }

  // Sort by confidence (highest first)
  return results.sort((a, b) => b.confidence - a.confidence);
}

// ══════════════════════════════════════════════════════════════
// LAB TEST PLAN GENERATOR (Personalized & Prioritized)
// ══════════════════════════════════════════════════════════════

export interface LabTestPlan {
  totalTests: number;
  totalCostMin: number;
  totalCostMax: number;

  urgent: LabTestPlanItem[];      // Do within 1 week
  high: LabTestPlanItem[];        // Do within 1 month
  medium: LabTestPlanItem[];      // Do within 3 months

  fastingRequired: boolean;
  fastingTests: string[];

  packageSuggestions: {
    name: string;
    tests: string[];
    estimatedCost: string;
    savings: string;
  }[];

  tips: string[];
}

export interface LabTestPlanItem {
  code: string;
  name: string;
  why: string;
  cost: string;
  costMin: number;
  costMax: number;
  fasting: boolean;
  fastingHours?: number;
  bestTime?: string;
  where: string;
  prepare: string[];
  relatedTo: string[];  // conditions/symptoms
}

export function generateLabTestPlan(
  conditions: string[],
  symptoms: string[],
  habits: string[],
  age: number,
  gender: 'male' | 'female',
  lastLabDate?: string
): LabTestPlan {
  const urgent: LabTestPlanItem[] = [];
  const high: LabTestPlanItem[] = [];
  const medium: LabTestPlanItem[] = [];

  const addedTests = new Set<string>();

  function addTest(test: LabTestPlanItem, priority: 'urgent' | 'high' | 'medium') {
    if (addedTests.has(test.code)) return;
    addedTests.add(test.code);

    if (priority === 'urgent') urgent.push(test);
    else if (priority === 'high') high.push(test);
    else medium.push(test);
  }

  // ── DIABETES TESTS ─────────────────────────────────────────
  if (conditions.some(c => c.includes('diabetes') || c === 'prediabetes')) {
    addTest({
      code: 'HBA1C',
      name: 'HbA1c (Glycated Hemoglobin)',
      why: 'Monitor blood sugar control over last 3 months - most important diabetes test',
      cost: '100-200 EGP',
      costMin: 100,
      costMax: 200,
      fasting: false,
      where: 'Any lab (Al-Borg, Al-Mokhtabar, Alpha)',
      prepare: [
        'No fasting required - can eat normally',
        'Take morning medications as usual',
        'Best done every 3 months',
      ],
      relatedTo: ['Diabetes Type 1', 'Diabetes Type 2', 'Prediabetes'],
    }, 'urgent');

    addTest({
      code: 'FBS',
      name: 'Fasting Blood Sugar',
      why: 'Check current sugar level after overnight fast',
      cost: '30-60 EGP',
      costMin: 30,
      costMax: 60,
      fasting: true,
      fastingHours: 8,
      bestTime: '8-10am (after 8-10 hours fasting)',
      where: 'Any lab',
      prepare: [
        'Fast 8-10 hours (water only)',
        'Take morning medications AFTER test',
        'Schedule morning appointment',
      ],
      relatedTo: ['Diabetes', 'Prediabetes'],
    }, 'urgent');

    addTest({
      code: 'INSULIN',
      name: 'Fasting Insulin',
      why: 'Check insulin resistance - helps adjust treatment',
      cost: '150-250 EGP',
      costMin: 150,
      costMax: 250,
      fasting: true,
      fastingHours: 8,
      bestTime: 'Same time as FBS',
      where: 'Specialized labs (Al-Borg, Al-Mokhtabar)',
      prepare: [
        'Fast 8-10 hours',
        'Do together with FBS (same blood draw)',
        'Tells if you have insulin resistance',
      ],
      relatedTo: ['Diabetes Type 2', 'Prediabetes', 'PCOS', 'Obesity'],
    }, 'high');
  }

  // ── HEART & BLOOD PRESSURE TESTS ───────────────────────────
  if (conditions.some(c => ['hypertension', 'heart_disease', 'cholesterol'].includes(c))) {
    if (conditions.includes('hypertension')) {
      addTest({
        code: 'BP24',
        name: '24-Hour Blood Pressure Monitor',
        why: 'Track blood pressure pattern throughout day and night - confirms diagnosis',
        cost: '150-300 EGP',
        costMin: 150,
        costMax: 300,
        fasting: false,
        where: 'Cardiology centers, major hospitals',
        prepare: [
          'Wear device for 24 hours',
          'Keep normal daily routine',
          'Log activities (eating, exercise, sleep)',
          'Device takes BP every 15-30 minutes',
        ],
        relatedTo: ['High Blood Pressure'],
      }, 'urgent');
    }

    addTest({
      code: 'LIPID',
      name: 'Full Lipid Profile (Cholesterol Panel)',
      why: 'Check LDL (bad), HDL (good), triglycerides - heart disease risk',
      cost: '80-150 EGP',
      costMin: 80,
      costMax: 150,
      fasting: true,
      fastingHours: 12,
      bestTime: 'Morning after 12-hour fast',
      where: 'Any lab',
      prepare: [
        'Fast 12 hours (water only)',
        'No alcohol 48 hours before',
        'Take medications AFTER test',
        'Essential if diabetes + heart issues',
      ],
      relatedTo: ['High Cholesterol', 'Heart Disease', 'Diabetes'],
    }, 'urgent');

    if (conditions.includes('heart_disease')) {
      addTest({
        code: 'ECHO',
        name: 'Echocardiogram (Heart Ultrasound)',
        why: 'Check heart chambers, valves, and pumping function',
        cost: '400-700 EGP',
        costMin: 400,
        costMax: 700,
        fasting: false,
        where: 'Cardiology centers, hospitals',
        prepare: [
          'No fasting needed',
          'Wear comfortable clothing',
          'Takes 30-45 minutes',
          'Painless ultrasound',
        ],
        relatedTo: ['Heart Disease', 'Heart Failure', 'Irregular Heartbeat'],
      }, 'urgent');

      addTest({
        code: 'ECG',
        name: 'Electrocardiogram (ECG/EKG)',
        why: 'Check heart electrical activity and rhythm',
        cost: '50-100 EGP',
        costMin: 50,
        costMax: 100,
        fasting: false,
        where: 'Any clinic or lab',
        prepare: [
          'No fasting needed',
          'Quick test (5 minutes)',
          'Remove jewelry, metal objects',
        ],
        relatedTo: ['Heart Disease', 'Irregular Heartbeat', 'Chest Pain'],
      }, 'high');
    }
  }

  // ── KIDNEY TESTS ───────────────────────────────────────────
  if (conditions.some(c => c.includes('ckd') || c.includes('kidney'))) {
    addTest({
      code: 'CREAT',
      name: 'Creatinine + eGFR',
      why: 'Main kidney function test - must monitor regularly',
      cost: '30-60 EGP',
      costMin: 30,
      costMax: 60,
      fasting: false,
      where: 'Any lab',
      prepare: [
        'No fasting needed',
        'Avoid heavy protein meal before test',
        'eGFR calculated automatically from creatinine',
      ],
      relatedTo: ['Chronic Kidney Disease', 'Diabetes', 'High Blood Pressure'],
    }, 'urgent');

    addTest({
      code: 'UREA',
      name: 'Blood Urea Nitrogen (BUN)',
      why: 'Another kidney function marker - do with creatinine',
      cost: '30-60 EGP',
      costMin: 30,
      costMax: 60,
      fasting: false,
      where: 'Any lab',
      prepare: [
        'No fasting needed',
        'Usually done with creatinine (same tube)',
      ],
      relatedTo: ['Chronic Kidney Disease'],
    }, 'urgent');

    addTest({
      code: 'UACR',
      name: 'Urine Albumin/Creatinine Ratio',
      why: 'Early detection of kidney damage before creatinine rises',
      cost: '80-150 EGP',
      costMin: 80,
      costMax: 150,
      fasting: false,
      where: 'Any lab (urine sample)',
      prepare: [
        'First morning urine is best',
        'Clean catch (midstream)',
        'Detects kidney damage early',
      ],
      relatedTo: ['Chronic Kidney Disease', 'Diabetes', 'High Blood Pressure'],
    }, 'high');
  }

  // ── THYROID TESTS ──────────────────────────────────────────
  if (conditions.some(c => c.includes('thyroid')) ||
      symptoms.some(s => ['sym_fatigue', 'sym_anxious', 'sym_sadness', 'sym_hairloss'].includes(s))) {
    addTest({
      code: 'TSH',
      name: 'TSH (Thyroid Stimulating Hormone)',
      why: 'Main thyroid test - screens for hypo/hyperthyroidism',
      cost: '80-150 EGP',
      costMin: 80,
      costMax: 150,
      fasting: false,
      bestTime: 'Morning (TSH highest in morning)',
      where: 'Any lab',
      prepare: [
        'Best done in morning',
        'No fasting needed',
        'If on thyroid medication, take AFTER test',
      ],
      relatedTo: ['Hypothyroidism', 'Hyperthyroidism', 'Fatigue', 'Anxiety', 'Depression'],
    }, 'high');

    if (conditions.some(c => c.includes('thyroid'))) {
      addTest({
        code: 'FT4',
        name: 'Free T4',
        why: 'Active thyroid hormone - needed if TSH abnormal',
        cost: '80-150 EGP',
        costMin: 80,
        costMax: 150,
        fasting: false,
        where: 'Any lab',
        prepare: [
          'Usually done with TSH',
          'Confirms thyroid diagnosis',
        ],
        relatedTo: ['Hypothyroidism', 'Hyperthyroidism'],
      }, 'high');
    }
  }

  // ── ANEMIA TESTS (FATIGUE SYMPTOMS) ────────────────────────
  if (symptoms.some(s => ['sym_fatigue', 'sym_dizzy', 'sym_palecolor', 'sym_weakness'].includes(s))) {
    addTest({
      code: 'CBC',
      name: 'Complete Blood Count',
      why: 'Check for anemia (low hemoglobin, red blood cells)',
      cost: '50-100 EGP',
      costMin: 50,
      costMax: 100,
      fasting: false,
      where: 'Any lab',
      prepare: [
        'No fasting needed',
        'Quick blood draw',
        'Checks hemoglobin, WBC, platelets',
      ],
      relatedTo: ['Anemia', 'Fatigue', 'Pale Skin', 'Weakness'],
    }, 'urgent');

    addTest({
      code: 'FERR',
      name: 'Ferritin (Iron Storage)',
      why: 'Most accurate test for iron deficiency',
      cost: '100-200 EGP',
      costMin: 100,
      costMax: 200,
      fasting: false,
      where: 'Any lab',
      prepare: [
        'No fasting needed',
        'Do with CBC',
        'Shows iron stores even before anemia develops',
      ],
      relatedTo: ['Anemia', 'Fatigue', 'Hair Loss'],
    }, 'urgent');
  }

  // ── VITAMIN D (ALMOST EVERYONE IN EGYPT) ────────────────────
  if (symptoms.length > 0 || age > 30) {
    addTest({
      code: 'VITD',
      name: 'Vitamin D (25-OH)',
      why: '80%+ of Egyptians are deficient - very common cause of fatigue',
      cost: '150-250 EGP',
      costMin: 150,
      costMax: 250,
      fasting: false,
      where: 'Any lab',
      prepare: [
        'No fasting needed',
        'Very common deficiency in Egypt',
        'Safe to supplement while waiting for results',
      ],
      relatedTo: ['Fatigue', 'Joint Pain', 'Depression', 'Osteoporosis'],
    }, 'high');
  }

  // ── LIVER TESTS (IF FATTY LIVER OR OBESITY) ────────────────
  if (conditions.includes('fatty_liver') || conditions.includes('obesity')) {
    addTest({
      code: 'LFT',
      name: 'Liver Function Tests (ALT, AST)',
      why: 'Check liver health - elevated in fatty liver',
      cost: '80-150 EGP',
      costMin: 80,
      costMax: 150,
      fasting: true,
      fastingHours: 8,
      where: 'Any lab',
      prepare: [
        'Fast 8 hours',
        'Do with other fasting tests',
      ],
      relatedTo: ['Fatty Liver', 'Obesity'],
    }, 'high');
  }

  // ── PCOS TESTS ─────────────────────────────────────────────
  if (conditions.includes('pcos') && gender === 'female') {
    addTest({
      code: 'TESTO',
      name: 'Total Testosterone',
      why: 'Usually elevated in PCOS',
      cost: '100-200 EGP',
      costMin: 100,
      costMax: 200,
      fasting: false,
      bestTime: 'Morning (highest in morning)',
      where: 'Specialized labs',
      prepare: [
        'Best done in morning',
        'Day 2-5 of menstrual cycle if regular',
      ],
      relatedTo: ['PCOS'],
    }, 'urgent');

    addTest({
      code: 'LHFSH',
      name: 'LH & FSH',
      why: 'LH/FSH ratio >2 indicates PCOS',
      cost: '150-250 EGP',
      costMin: 150,
      costMax: 250,
      fasting: false,
      bestTime: 'Day 2-5 of cycle',
      where: 'Specialized labs',
      prepare: [
        'Day 2-5 of menstrual cycle',
        'Ratio more important than individual values',
      ],
      relatedTo: ['PCOS'],
    }, 'urgent');
  }

  // ── GENERAL SCREENING (IF NO SPECIFIC CONDITIONS) ──────────
  if (conditions.length === 0 && symptoms.length > 0) {
    addTest({
      code: 'CBC',
      name: 'Complete Blood Count',
      why: 'General health screening',
      cost: '50-100 EGP',
      costMin: 50,
      costMax: 100,
      fasting: false,
      where: 'Any lab',
      prepare: ['No fasting needed'],
      relatedTo: ['General Screening'],
    }, 'medium');

    addTest({
      code: 'VITD',
      name: 'Vitamin D',
      why: 'Very common deficiency in Egypt',
      cost: '150-250 EGP',
      costMin: 150,
      costMax: 250,
      fasting: false,
      where: 'Any lab',
      prepare: ['No fasting needed'],
      relatedTo: ['General Screening'],
    }, 'high');
  }

  // ── CALCULATE TOTALS ───────────────────────────────────────
  const allTests = [...urgent, ...high, ...medium];
  const totalCostMin = allTests.reduce((sum, t) => sum + t.costMin, 0);
  const totalCostMax = allTests.reduce((sum, t) => sum + t.costMax, 0);

  const fastingTests = allTests.filter(t => t.fasting).map(t => t.name);
  const fastingRequired = fastingTests.length > 0;

  // ── PACKAGE SUGGESTIONS ────────────────────────────────────
  const packages: LabTestPlan['packageSuggestions'] = [];

  if (addedTests.has('HBA1C') && addedTests.has('FBS') && addedTests.has('LIPID')) {
    packages.push({
      name: 'Diabetes Management Package',
      tests: ['HbA1c', 'Fasting Blood Sugar', 'Lipid Profile', 'Kidney Function'],
      estimatedCost: '350-500 EGP',
      savings: 'Save 20-30% vs individual tests',
    });
  }

  if (addedTests.has('LIPID') && addedTests.has('ECG')) {
    packages.push({
      name: 'Heart Health Package',
      tests: ['Lipid Profile', 'ECG', 'Blood Pressure Monitoring'],
      estimatedCost: '300-450 EGP',
      savings: 'Save 15-25%',
    });
  }

  if (allTests.length >= 5) {
    packages.push({
      name: 'Comprehensive Health Check',
      tests: ['CBC', 'Kidney', 'Liver', 'Thyroid', 'Vitamin D', 'Lipid Profile'],
      estimatedCost: '600-900 EGP',
      savings: 'Save 25-35% - best value if doing many tests',
    });
  }

  // ── TIPS ───────────────────────────────────────────────────
  const tips: string[] = [
    '💡 Many labs offer packages - ask about discounts for multiple tests',
    '💡 Compare prices between labs (Al-Borg, Al-Mokhtabar, Alpha, etc.)',
  ];

  if (fastingRequired) {
    tips.push('⏰ Schedule fasting tests in morning (8-10am) after overnight fast');
    tips.push('💧 Water is allowed during fasting - stay hydrated');
    tips.push('💊 Take morning medications AFTER the test (or ask doctor)');
  }

  if (urgent.length > 0) {
    tips.push('🚨 Urgent tests should be done within 1 week');
  }

  if (allTests.length >= 5) {
    tips.push('📅 Can split tests into 2 visits to manage cost');
    tips.push('📋 Some tests can be done together (same blood draw)');
  }

  tips.push('📱 Call labs to confirm prices - they vary');
  tips.push('🏥 Government hospitals cheaper but longer wait times');
  tips.push('💳 Some labs accept insurance - check with your provider');

  return {
    totalTests: allTests.length,
    totalCostMin,
    totalCostMax,
    urgent,
    high,
    medium,
    fastingRequired,
    fastingTests,
    packageSuggestions: packages,
    tips,
  };
}

// ══════════════════════════════════════════════════════════════
// HABIT REDUCTION CALCULATOR (Detailed with Scientific Reasons)
// ══════════════════════════════════════════════════════════════

export interface HabitReductionPlan {
  habitName: string;
  emoji: string;
  currentAmount: number;
  unit: string;
  safeLimit: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  riskColor: string;
  
  // Health risks
  healthRisks: {
    risk: string;
    severity: 'mild' | 'moderate' | 'severe';
    explanation: string;
  }[];
  
  // Personalized risks (based on user conditions)
  personalizedRisks: {
    condition: string;
    impact: string;
    urgency: 'low' | 'medium' | 'high';
  }[];
  
  // 4-week plan
  weeks: {
    week: number;
    target: number;
    reduction: number;
    reductionPercent: number;
    howTo: string;
    replaceWith: string;
    tip: string;
    whyThisMatters: string;
  }[];
  
  // Expected benefits
  expectedBenefits: {
    benefit: string;
    timeline: string;
    emoji: string;
  }[];
  
  // Withdrawal symptoms
  withdrawalSymptoms: {
    symptom: string;
    when: string;
    howToManage: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  
  // When to speed up/slow down
  adjustmentGuidance: {
    speedUp: string[];
    slowDown: string[];
    restart: string[];
  };
  
  // Success tips
  successTips: string[];
}

export function generateHabitReductionPlan(
  habitId: string,
  currentAmount: number,
  conditions: string[],
  symptoms: string[]
): HabitReductionPlan {
  
  // ── COFFEE REDUCTION ───────────────────────────────────────
  if (habitId === 'drink_coffee') {
    const hasDiabetes = conditions.some(c => c.includes('diabetes'));
    const hasHeart = conditions.some(c => ['hypertension', 'heart_disease', 'arrhythmia'].includes(c));
    const hasAnxiety = conditions.includes('anxiety') || symptoms.includes('sym_anxious');
    const hasSleep = symptoms.includes('sym_sleepy') || conditions.includes('insomnia');
    
    const riskLevel = currentAmount >= 5 ? 'high' : currentAmount >= 3 ? 'medium' : 'low';
    
    const healthRisks = [
      {
        risk: 'Anxiety and jitteriness',
        severity: 'moderate' as const,
        explanation: 'Caffeine stimulates stress hormones (cortisol, adrenaline) causing nervous feeling',
      },
      {
        risk: 'Sleep disruption',
        severity: 'severe' as const,
        explanation: 'Caffeine half-life is 5-6 hours - coffee at 2pm still affects sleep at 10pm',
      },
      {
        risk: 'Blood pressure increase',
        severity: 'moderate' as const,
        explanation: 'Temporary BP spike of 5-10 mmHg for 1-3 hours after each cup',
      },
      {
        risk: 'Magnesium depletion',
        severity: 'moderate' as const,
        explanation: 'Caffeine increases magnesium excretion in urine → deficiency → cramps, fatigue',
      },
      {
        risk: 'Stomach acid issues',
        severity: 'mild' as const,
        explanation: 'Coffee stimulates acid production → heartburn, gastritis (especially on empty stomach)',
      },
    ];
    
    const personalizedRisks = [];
    if (hasDiabetes) {
      personalizedRisks.push({
        condition: 'Diabetes',
        impact: 'Coffee can cause blood sugar spikes and crashes - makes control harder',
        urgency: 'high' as const,
      });
    }
    if (hasHeart) {
      personalizedRisks.push({
        condition: 'Heart/Blood Pressure',
        impact: 'Each cup raises BP by 5-10 mmHg temporarily - adds to medication workload',
        urgency: 'high' as const,
      });
    }
    if (hasAnxiety) {
      personalizedRisks.push({
        condition: 'Anxiety',
        impact: 'Caffeine worsens anxiety by triggering stress hormone release',
        urgency: 'high' as const,
      });
    }
    if (hasSleep) {
      personalizedRisks.push({
        condition: 'Sleep Issues',
        impact: 'Poor sleep worsens everything: blood sugar, BP, mood, weight',
        urgency: 'high' as const,
      });
    }
    
    const weeks = [
      {
        week: 1,
        target: Math.max(1, Math.round(currentAmount * 0.8)),
        reduction: Math.round(currentAmount * 0.2),
        reductionPercent: 20,
        howTo: 'Skip the last cup of the day',
        replaceWith: 'Green tea (half the caffeine, antioxidants)',
        tip: 'No coffee after 2pm - protects sleep quality',
        whyThisMatters: hasSleep 
          ? 'Better sleep → better blood sugar control, lower stress, easier weight loss'
          : 'Gradual reduction prevents severe withdrawal headaches',
      },
      {
        week: 2,
        target: Math.max(1, Math.round(currentAmount * 0.6)),
        reduction: Math.round(currentAmount * 0.4),
        reductionPercent: 40,
        howTo: 'Skip mid-afternoon cup',
        replaceWith: 'Herbal tea (chamomile, mint) - zero caffeine',
        tip: 'Drink coffee AFTER meals (not on empty stomach)',
        whyThisMatters: hasDiabetes
          ? 'Coffee on empty stomach spikes cortisol → raises blood sugar'
          : 'Reduces stomach acid issues and crashes',
      },
      {
        week: 3,
        target: Math.max(1, Math.round(currentAmount * 0.4)),
        reduction: Math.round(currentAmount * 0.6),
        reductionPercent: 60,
        howTo: 'Only morning + early afternoon (before 12pm)',
        replaceWith: 'Warm lemon water (energizing, no caffeine)',
        tip: 'Start magnesium supplement (200mg before bed)',
        whyThisMatters: 'High coffee intake depletes magnesium → you need to replenish it',
      },
      {
        week: 4,
        target: Math.max(1, 2),
        reduction: Math.round(currentAmount - 2),
        reductionPercent: Math.round(((currentAmount - 2) / currentAmount) * 100),
        howTo: 'Morning coffee only OR morning + lunch',
        replaceWith: 'Decaf coffee (tastes same, no withdrawal)',
        tip: '1-2 cups = SAFE ZONE - maintain this long-term',
        whyThisMatters: 'You reduced by 60-80%! Celebrate this achievement 🎉',
      },
    ];
    
    const expectedBenefits = [
      { benefit: 'Better sleep quality (fall asleep faster, sleep deeper)', timeline: 'Week 1-2', emoji: '😴' },
      { benefit: 'More stable energy (no 3pm crash)', timeline: 'Week 2-3', emoji: '⚡' },
      { benefit: 'Lower anxiety and jitteriness', timeline: 'Week 2-4', emoji: '😌' },
      { benefit: 'Better blood sugar control', timeline: 'Week 3-4', emoji: '🩸' },
      { benefit: 'Lower blood pressure (5-10 mmHg drop)', timeline: 'Week 3-4', emoji: '🫀' },
      { benefit: 'Less stomach acid/heartburn', timeline: 'Week 1-2', emoji: '🔥' },
    ];
    
    const withdrawalSymptoms = [
      {
        symptom: 'Headache (most common)',
        when: 'Days 1-5 (peaks day 2-3)',
        howToManage: 'Drink 2-3L water, take painkiller if severe, drink green tea (small caffeine)',
        severity: 'moderate' as const,
      },
      {
        symptom: 'Fatigue and low energy',
        when: 'Days 1-7',
        howToManage: 'Temporary - will pass. Get 8 hours sleep, eat protein, go for walk',
        severity: 'moderate' as const,
      },
      {
        symptom: 'Irritability and mood changes',
        when: 'Days 1-5',
        howToManage: 'Be patient with yourself. Warn family. Exercise helps.',
        severity: 'mild' as const,
      },
      {
        symptom: 'Difficulty concentrating',
        when: 'Days 1-4',
        howToManage: 'Schedule important work for later. Temporary brain fog.',
        severity: 'mild' as const,
      },
    ];
    
    const adjustmentGuidance = {
      speedUp: [
        'If feeling great with no symptoms → reduce faster',
        'If headaches mild → continue as planned',
      ],
      slowDown: [
        'If headaches SEVERE (can\'t function) → reduce by 0.5 cups instead',
        'If extreme fatigue → slow down, maybe stay at current level 1 more week',
      ],
      restart: [
        'If you relapse (drink 5 cups again) → don\'t quit! Restart from current level',
        'Progress is not linear - setbacks are normal',
      ],
    };
    
    const successTips = [
      '☕ Switch to smaller cup size (makes reduction easier)',
      '🌡 Drink water first when craving (often thirst, not caffeine need)',
      '⏰ Have a schedule (e.g., 8am + 11am only)',
      '🚫 Remove coffee maker from bedroom (out of sight)',
      '👥 Tell family/friends for accountability',
      '📝 Track daily intake (makes you aware)',
      '🎯 Focus on benefits (better sleep) not deprivation',
      '💪 Replace habit: coffee break → 5-min walk break',
    ];
    
    return {
      habitName: 'Coffee',
      emoji: '☕',
      currentAmount,
      unit: 'cups/day',
      safeLimit: 2,
      riskLevel,
      riskColor: riskLevel === 'high' ? '#FF6B6B' : riskLevel === 'medium' ? '#FF9D4D' : '#4DFF9E',
      healthRisks,
      personalizedRisks,
      weeks,
      expectedBenefits,
      withdrawalSymptoms,
      adjustmentGuidance,
      successTips,
    };
  }
  
  // ── SODA REDUCTION ─────────────────────────────────────────
  if (habitId === 'drink_soda') {
    const hasDiabetes = conditions.some(c => c.includes('diabetes'));
    const hasObesity = conditions.includes('obesity');
    const hasFattyLiver = conditions.includes('fatty_liver');
    
    const healthRisks = [
      {
        risk: 'Massive blood sugar spikes',
        severity: 'severe' as const,
        explanation: '1 can = 10 teaspoons sugar → blood sugar shoots up in 20 minutes',
      },
      {
        risk: 'Weight gain and belly fat',
        severity: 'severe' as const,
        explanation: 'Liquid sugar bypasses satiety signals → body stores as fat',
      },
      {
        risk: 'Fatty liver disease',
        severity: 'severe' as const,
        explanation: 'Fructose (in soda) is processed in liver → fat buildup',
      },
      {
        risk: 'Tooth decay',
        severity: 'moderate' as const,
        explanation: 'Acid + sugar erodes enamel rapidly',
      },
      {
        risk: 'Insulin resistance',
        severity: 'severe' as const,
        explanation: 'Repeated sugar spikes → body stops responding to insulin → diabetes',
      },
    ];
    
    const personalizedRisks = [];
    if (hasDiabetes) {
      personalizedRisks.push({
        condition: 'Diabetes',
        impact: '1 can of soda can raise blood sugar by 50-100 mg/dL - extremely dangerous',
        urgency: 'high' as const,
      });
    }
    if (hasObesity || hasFattyLiver) {
      personalizedRisks.push({
        condition: 'Obesity/Fatty Liver',
        impact: 'Soda is the #1 cause of fatty liver - must eliminate completely',
        urgency: 'high' as const,
      });
    }
    
    const weeks = [
      {
        week: 1,
        target: Math.max(0, Math.ceil(currentAmount / 2)),
        reduction: Math.floor(currentAmount / 2),
        reductionPercent: 50,
        howTo: 'Cut in HALF immediately',
        replaceWith: 'Sparkling water + fresh lemon/mint',
        tip: 'Carbonation satisfies the fizz craving without sugar',
        whyThisMatters: hasDiabetes ? 'Your blood sugar will improve immediately' : 'Fast results motivate you',
      },
      {
        week: 2,
        target: 0,
        reduction: currentAmount,
        reductionPercent: 100,
        howTo: 'ZERO soda - complete stop',
        replaceWith: 'Iced herbal tea (karkadeh) - naturally sweet, zero sugar',
        tip: 'Remove all soda from house - out of sight, out of mind',
        whyThisMatters: 'Soda has ZERO nutritional value - only harm',
      },
      {
        week: 3,
        target: 0,
        reduction: currentAmount,
        reductionPercent: 100,
        howTo: 'Stay at ZERO',
        replaceWith: 'Fresh pomegranate juice (dilute 50/50 with water)',
        tip: 'If craving sweetness, eat whole fruit (fiber slows sugar)',
        whyThisMatters: 'Your liver is healing now',
      },
      {
        week: 4,
        target: 0,
        reduction: currentAmount,
        reductionPercent: 100,
        howTo: 'Maintain ZERO soda',
        replaceWith: 'Infused water (cucumber, mint, lemon)',
        tip: 'Celebrate 1 month soda-free! 🎉',
        whyThisMatters: 'You broke the addiction - maintain it',
      },
    ];
    
    const expectedBenefits = [
      { benefit: 'Weight loss (2-4 kg in 1 month)', timeline: 'Week 2-4', emoji: '⚖️' },
      { benefit: 'Stable blood sugar (no spikes/crashes)', timeline: 'Week 1-2', emoji: '🩸' },
      { benefit: 'More sustained energy', timeline: 'Week 1-3', emoji: '⚡' },
      { benefit: 'Better skin (less acne)', timeline: 'Week 3-4', emoji: '✨' },
      { benefit: 'Reduced fatty liver', timeline: 'Week 4+', emoji: '🫘' },
      { benefit: 'Less sugar cravings', timeline: 'Week 2-3', emoji: '🍬' },
    ];
    
    const withdrawalSymptoms = [
      {
        symptom: 'Strong sugar cravings',
        when: 'Days 1-10',
        howToManage: 'Eat whole fruit, drink flavored sparkling water',
        severity: 'moderate' as const,
      },
      {
        symptom: 'Headache (sugar withdrawal)',
        when: 'Days 1-3',
        howToManage: 'Drink water, eat protein, takes 3 days to pass',
        severity: 'mild' as const,
      },
    ];
    
    return {
      habitName: 'Soft Drinks (Soda)',
      emoji: '🥤',
      currentAmount,
      unit: 'cans/day',
      safeLimit: 0,
      riskLevel: 'very-high',
      riskColor: '#FF6B6B',
      healthRisks,
      personalizedRisks,
      weeks,
      expectedBenefits,
      withdrawalSymptoms,
      adjustmentGuidance: {
        speedUp: ['Soda must be eliminated - no "moderation" option'],
        slowDown: ['If struggling, Week 1 can be 2 weeks (slower cut)'],
        restart: ['If relapse, start over - don\'t give up'],
      },
      successTips: [
        '🚫 Remove ALL soda from house immediately',
        '🛒 Don\'t buy it - if it\'s not home, you won\'t drink it',
        '💧 Drink water BEFORE meals (reduces cravings)',
        '🍊 Keep fresh fruit visible (healthy sweet option)',
        '📝 Track your blood sugar - see the improvement!',
        '💰 Calculate money saved (150 EGP/month → 1800 EGP/year!)',
      ],
    };
  }
  
  // ── SMOKING REDUCTION ──────────────────────────────────────
  if (habitId === 'hab_smoke') {
    const healthRisks = [
      {
        risk: 'Lung cancer and COPD',
        severity: 'severe' as const,
        explanation: '#1 cause of preventable death - 1 in 2 smokers die from smoking',
      },
      {
        risk: 'Heart disease and stroke',
        severity: 'severe' as const,
        explanation: 'Damages blood vessels, raises BP, increases clot risk',
      },
      {
        risk: 'Worsens all chronic conditions',
        severity: 'severe' as const,
        explanation: 'Makes diabetes, asthma, heart disease 10x worse',
      },
    ];
    
    const weeks = [
      {
        week: 1,
        target: Math.max(0, Math.round(currentAmount * 0.75)),
        reduction: Math.round(currentAmount * 0.25),
        reductionPercent: 25,
        howTo: 'Identify triggers (after coffee, stress) - skip those cigarettes first',
        replaceWith: 'Nicotine gum or patches (consult pharmacist)',
        tip: 'Delay each cigarette by 10 minutes (often craving passes)',
        whyThisMatters: 'Gradual reduction + nicotine replacement prevents severe withdrawal',
      },
      {
        week: 2,
        target: Math.max(0, Math.round(currentAmount * 0.5)),
        reduction: Math.round(currentAmount * 0.5),
        reductionPercent: 50,
        howTo: 'Set no-smoking zones (car, bedroom)',
        replaceWith: 'Deep breathing exercises when craving hits',
        tip: 'Tell friends/family - ask for support',
        whyThisMatters: 'Social support doubles quit success rate',
      },
      {
        week: 3,
        target: Math.max(0, Math.round(currentAmount * 0.25)),
        reduction: Math.round(currentAmount * 0.75),
        reductionPercent: 75,
        howTo: 'Pick a quit date this week',
        replaceWith: 'Nicotine replacement + behavioral support',
        tip: 'Remove all cigarettes, lighters, ashtrays from house',
        whyThisMatters: 'Environment change is critical',
      },
      {
        week: 4,
        target: 0,
        reduction: currentAmount,
        reductionPercent: 100,
        howTo: 'QUIT completely - no "just one"',
        replaceWith: 'Nicotine replacement for 8-12 weeks',
        tip: 'Consider professional help (hotline 16023 in Egypt)',
        whyThisMatters: 'Within hours: heart rate and BP drop. Within days: lung function improves.',
      },
    ];
    
    return {
      habitName: 'Smoking',
      emoji: '🚬',
      currentAmount,
      unit: 'cigarettes/day',
      safeLimit: 0,
      riskLevel: 'very-high',
      riskColor: '#FF0000',
      healthRisks,
      personalizedRisks: [
        {
          condition: 'All conditions',
          impact: 'Smoking worsens EVERY health condition you have',
          urgency: 'high' as const,
        },
      ],
      weeks,
      expectedBenefits: [
        { benefit: 'Heart rate and BP drop', timeline: '20 minutes after quitting', emoji: '🫀' },
        { benefit: 'Oxygen levels normalize', timeline: '12 hours', emoji: '💨' },
        { benefit: 'Lung function improves 30%', timeline: '2 weeks - 3 months', emoji: '🫁' },
        { benefit: 'Heart attack risk drops 50%', timeline: '1 year', emoji: '❤️' },
        { benefit: 'Lung cancer risk drops 50%', timeline: '10 years', emoji: '🎗' },
      ],
      withdrawalSymptoms: [
        {
          symptom: 'Intense nicotine cravings',
          when: 'Days 1-14 (peaks day 3)',
          howToManage: 'Nicotine replacement therapy (gum, patches) - consult pharmacist',
          severity: 'severe' as const,
        },
        {
          symptom: 'Irritability, anxiety, anger',
          when: 'Days 1-30',
          howToManage: 'Exercise, deep breathing, support groups',
          severity: 'severe' as const,
        },
      ],
      adjustmentGuidance: {
        speedUp: ['If ready to quit sooner - DO IT! No need to wait'],
        slowDown: ['Quitting is hard - use nicotine replacement, don\'t go cold turkey'],
        restart: ['Most smokers try 5-7 times before succeeding - don\'t give up'],
      },
      successTips: [
        '☎️ Call quitline: 16023 (Egypt Ministry of Health)',
        '💊 Nicotine patches + gum (doubles success rate)',
        '👥 Join support group or online community',
        '💰 Track money saved (pack = 50 EGP → 1500 EGP/month!)',
        '📝 Write list of reasons to quit - read when craving',
        '🏃 Exercise when craving hits (releases endorphins)',
        '🚫 Avoid alcohol first month (triggers relapse)',
        '🩺 See doctor - prescription medications (Champix) help',
      ],
    };
  }
  
  // ── DEFAULT (FALLBACK) ─────────────────────────────────────
  return {
    habitName: 'Habit',
    emoji: '❓',
    currentAmount,
    unit: 'units',
    safeLimit: 0,
    riskLevel: 'medium',
    riskColor: '#FF9D4D',
    healthRisks: [],
    personalizedRisks: [],
    weeks: [],
    expectedBenefits: [],
    withdrawalSymptoms: [],
    adjustmentGuidance: { speedUp: [], slowDown: [], restart: [] },
    successTips: [],
  };
}

let healthEngineRemoteLoaded = false;

export async function preloadHealthEngineData(): Promise<void> {
  if (healthEngineRemoteLoaded) return;
  try {
    const { data, error } = await supabase.from('local_health_engine_data').select('key,payload');
    if (error || !data || data.length === 0) return;
    const map = new Map<string, unknown>(data.map((row: any) => [String(row.key), row.payload]));

    if (Array.isArray(map.get('chronic_conditions'))) CHRONIC_CONDITIONS = map.get('chronic_conditions') as typeof CHRONIC_CONDITIONS;
    if (Array.isArray(map.get('symptoms_list'))) SYMPTOMS_LIST = map.get('symptoms_list') as typeof SYMPTOMS_LIST;
    if (Array.isArray(map.get('acute_episodes'))) ACUTE_EPISODES = map.get('acute_episodes') as typeof ACUTE_EPISODES;
    if (Array.isArray(map.get('drinking_habits'))) DRINKING_HABITS = map.get('drinking_habits') as typeof DRINKING_HABITS;
    if (Array.isArray(map.get('lifestyle_habits'))) LIFESTYLE_HABITS = map.get('lifestyle_habits') as typeof LIFESTYLE_HABITS;
    if (map.get('lab_tests') && typeof map.get('lab_tests') === 'object') LAB_TESTS = map.get('lab_tests') as Record<string, LabTest[]>;
    if (map.get('safe_supplements') && typeof map.get('safe_supplements') === 'object') SAFE_SUPPLEMENTS = map.get('safe_supplements') as Record<string, Supplement>;
    if (Array.isArray(map.get('feedback_questions'))) FEEDBACK_QUESTIONS = map.get('feedback_questions') as typeof FEEDBACK_QUESTIONS;
    healthEngineRemoteLoaded = true;
  } catch {
    // fallback to local constants when remote fetch fails/offline
  }
}
