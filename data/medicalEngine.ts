// ============================================================
// Medical Engine — Smart Nutrition & Fitness Chatbot
// Comprehensive medical history, lab recommendations,
// and 10-day safe plan system
// ============================================================

// ── Comprehensive Medical Conditions ─────────────────────────
export const MEDICAL_CONDITIONS = {
  cardiovascular: {
    label: '❤️ Cardiovascular',
    color: '#FF6B6B',
    conditions: [
      { id: 'hypertension',       name: 'High Blood Pressure',       emoji: '🩸' },
      { id: 'hypotension',        name: 'Low Blood Pressure',        emoji: '📉' },
      { id: 'arrhythmia',         name: 'Irregular Heartbeat',       emoji: '💓' },
      { id: 'heart_disease',      name: 'Coronary Heart Disease',    emoji: '🫀' },
      { id: 'cholesterol',        name: 'High Cholesterol',          emoji: '🧈' },
      { id: 'heart_failure',      name: 'Heart Failure',             emoji: '⚠️' },
    ],
  },
  metabolic: {
    label: '🍬 Metabolic & Endocrine',
    color: '#E8FF4D',
    conditions: [
      { id: 'diabetes_t1',        name: 'Diabetes Type 1',           emoji: '💉' },
      { id: 'diabetes_t2',        name: 'Diabetes Type 2',           emoji: '🩸' },
      { id: 'prediabetes',        name: 'Prediabetes',               emoji: '⚠️' },
      { id: 'insulin_resistance', name: 'Insulin Resistance',        emoji: '🔄' },
      { id: 'hypothyroid',        name: 'Hypothyroidism',            emoji: '🐢' },
      { id: 'hyperthyroid',       name: 'Hyperthyroidism',           emoji: '⚡' },
      { id: 'pcos',               name: 'PCOS',                      emoji: '🌸' },
      { id: 'obesity',            name: 'Obesity',                   emoji: '⚖️' },
    ],
  },
  digestive: {
    label: '🫁 Digestive',
    color: '#4DFF9E',
    conditions: [
      { id: 'ibs',                name: 'IBS (Irritable Bowel)',     emoji: '🌀' },
      { id: 'gerd',               name: 'Acid Reflux / GERD',        emoji: '🔥' },
      { id: 'ulcer',              name: 'Stomach Ulcer',             emoji: '💢' },
      { id: 'celiac',             name: 'Celiac Disease',            emoji: '🌾' },
      { id: 'crohns',             name: "Crohn's / Colitis",         emoji: '⚠️' },
      { id: 'constipation',       name: 'Chronic Constipation',      emoji: '⏸' },
      { id: 'fatty_liver',        name: 'Fatty Liver',               emoji: '🫘' },
    ],
  },
  kidney: {
    label: '🫘 Kidney & Urinary',
    color: '#9D8FFF',
    conditions: [
      { id: 'ckd',                name: 'Chronic Kidney Disease',    emoji: '🫘' },
      { id: 'kidney_stones',      name: 'Kidney Stones',             emoji: '💎' },
      { id: 'uti_frequent',       name: 'Frequent UTIs',             emoji: '🔄' },
    ],
  },
  respiratory: {
    label: '🌬 Respiratory',
    color: '#9DD4FF',
    conditions: [
      { id: 'asthma',             name: 'Asthma',                    emoji: '💨' },
      { id: 'allergies',          name: 'Seasonal Allergies',        emoji: '🤧' },
      { id: 'sleep_apnea',        name: 'Sleep Apnea',               emoji: '😴' },
    ],
  },
  mental: {
    label: '🧠 Mental Health',
    color: '#FF9DE0',
    conditions: [
      { id: 'anxiety',            name: 'Anxiety',                   emoji: '😰' },
      { id: 'depression',         name: 'Depression',                emoji: '😔' },
      { id: 'insomnia',           name: 'Insomnia',                  emoji: '🌙' },
      { id: 'adhd',               name: 'ADHD',                      emoji: '⚡' },
      { id: 'migraine',           name: 'Chronic Migraine',          emoji: '💥' },
    ],
  },
  musculoskeletal: {
    label: '🦴 Bones & Joints',
    color: '#FFB84D',
    conditions: [
      { id: 'arthritis',          name: 'Arthritis',                 emoji: '🦴' },
      { id: 'osteoporosis',       name: 'Osteoporosis',              emoji: '🦴' },
      { id: 'back_pain',          name: 'Chronic Back Pain',         emoji: '⚠️' },
      { id: 'fibromyalgia',       name: 'Fibromyalgia',              emoji: '😖' },
    ],
  },
  blood: {
    label: '🩸 Blood & Immunity',
    color: '#FF6B8B',
    conditions: [
      { id: 'anemia',             name: 'Iron Deficiency Anemia',    emoji: '🩸' },
      { id: 'anemia_b12',         name: 'B12 Deficiency Anemia',     emoji: '🔴' },
      { id: 'low_immunity',       name: 'Weak Immune System',        emoji: '🛡' },
      { id: 'autoimmune',         name: 'Autoimmune Disorder',        emoji: '⚠️' },
    ],
  },
  womens: {
    label: "👩 Women's Health",
    color: '#FF9DE0',
    conditions: [
      { id: 'pregnancy',          name: 'Pregnant',                  emoji: '🤰' },
      { id: 'breastfeeding',      name: 'Breastfeeding',             emoji: '🍼' },
      { id: 'menopause',          name: 'Menopause',                 emoji: '🌸' },
      { id: 'pms_severe',         name: 'Severe PMS',                emoji: '📅' },
    ],
  },
};

// ── Lab Tests Recommendations per Condition ──────────────────
export interface LabTest {
  code: string;
  name: string;
  reason: string;
  priority: 'urgent' | 'high' | 'medium';
  estimatedCost?: string;
}

export const LAB_TESTS_DATABASE: Record<string, LabTest[]> = {
  hypertension: [
    { code: 'BP-24H',    name: '24-hour Blood Pressure Monitor', reason: 'Check blood pressure pattern throughout the day', priority: 'high',   estimatedCost: '150-300 EGP' },
    { code: 'LIPID',     name: 'Lipid Profile',                  reason: 'Check cholesterol levels',                       priority: 'high',   estimatedCost: '80-150 EGP'  },
    { code: 'CR',        name: 'Creatinine',                     reason: 'Check kidney function',                          priority: 'medium', estimatedCost: '30-60 EGP'   },
    { code: 'EKG',       name: 'Electrocardiogram (ECG)',        reason: 'Check heart electrical activity',                priority: 'high',   estimatedCost: '50-100 EGP'  },
  ],
  arrhythmia: [
    { code: 'HOLTER',    name: '24-hour Holter Monitor',         reason: 'Record heartbeats throughout the day',           priority: 'urgent', estimatedCost: '300-500 EGP' },
    { code: 'ECHO',      name: 'Echocardiogram',                 reason: 'Check heart chambers and valves',                priority: 'urgent', estimatedCost: '400-700 EGP' },
    { code: 'TSH',       name: 'Thyroid Function',               reason: 'Hyperthyroid can cause arrhythmia',              priority: 'high',   estimatedCost: '80-150 EGP'  },
  ],
  heart_disease: [
    { code: 'ECHO',      name: 'Echocardiogram',                 reason: 'Check heart function',                           priority: 'urgent', estimatedCost: '400-700 EGP' },
    { code: 'STRESS',    name: 'Stress Test',                    reason: 'Check heart under exertion',                     priority: 'urgent', estimatedCost: '500-800 EGP' },
    { code: 'TROPONIN',  name: 'Troponin Level',                  reason: 'Rule out heart attack',                          priority: 'urgent', estimatedCost: '100-200 EGP' },
  ],
  cholesterol: [
    { code: 'LIPID',     name: 'Full Lipid Profile',             reason: 'Measure LDL, HDL, Triglycerides',                priority: 'high',   estimatedCost: '80-150 EGP'  },
    { code: 'APOB',      name: 'Apolipoprotein B',               reason: 'More accurate cardiac risk marker',              priority: 'medium', estimatedCost: '150-250 EGP' },
  ],
  diabetes_t2: [
    { code: 'HBA1C',     name: 'HbA1c (Glycated Hemoglobin)',    reason: 'Average blood sugar over last 3 months',         priority: 'urgent', estimatedCost: '100-200 EGP' },
    { code: 'FBS',       name: 'Fasting Blood Sugar',            reason: 'Sugar level after 8 hours fasting',              priority: 'urgent', estimatedCost: '30-60 EGP'   },
    { code: 'INSULIN',   name: 'Fasting Insulin',                reason: 'Measure insulin resistance',                     priority: 'high',   estimatedCost: '150-250 EGP' },
    { code: 'CPEPTIDE',  name: 'C-Peptide',                      reason: 'Assess pancreas insulin production',             priority: 'medium', estimatedCost: '200-350 EGP' },
  ],
  prediabetes: [
    { code: 'HBA1C',     name: 'HbA1c',                          reason: 'Confirm prediabetes stage',                      priority: 'high',   estimatedCost: '100-200 EGP' },
    { code: 'OGTT',      name: 'Oral Glucose Tolerance Test',    reason: 'Check body response to sugar',                   priority: 'high',   estimatedCost: '150-250 EGP' },
  ],
  hypothyroid: [
    { code: 'TSH',       name: 'TSH',                            reason: 'Main thyroid test',                              priority: 'urgent', estimatedCost: '80-150 EGP'  },
    { code: 'FT4',       name: 'Free T4',                        reason: 'Active thyroid hormone',                         priority: 'high',   estimatedCost: '80-150 EGP'  },
    { code: 'FT3',       name: 'Free T3',                        reason: 'Complete thyroid screening',                     priority: 'medium', estimatedCost: '80-150 EGP'  },
    { code: 'ANTI-TPO',  name: 'Anti-TPO Antibodies',             reason: 'Rule out Hashimoto disease',                     priority: 'medium', estimatedCost: '150-250 EGP' },
  ],
  pcos: [
    { code: 'TESTO',     name: 'Testosterone',                   reason: 'Usually elevated in PCOS',                       priority: 'urgent', estimatedCost: '100-200 EGP' },
    { code: 'LH-FSH',    name: 'LH & FSH Ratio',                reason: 'Ratio indicates PCOS',                           priority: 'urgent', estimatedCost: '150-250 EGP' },
    { code: 'INSULIN',   name: 'Fasting Insulin',                reason: 'Insulin resistance common in PCOS',              priority: 'high',   estimatedCost: '150-250 EGP' },
    { code: 'US-OVARY',  name: 'Pelvic Ultrasound',              reason: 'Check ovaries',                                  priority: 'high',   estimatedCost: '200-400 EGP' },
  ],
  ibs: [
    { code: 'STOOL',     name: 'Stool Analysis',                reason: 'Rule out infections',                            priority: 'high',   estimatedCost: '40-80 EGP'   },
    { code: 'CALPRO',    name: 'Calprotectin',                  reason: 'Differentiate IBS from inflammation',            priority: 'medium', estimatedCost: '300-500 EGP' },
  ],
  gerd: [
    { code: 'ENDO',      name: 'Upper Endoscopy',               reason: 'Examine stomach and esophagus',                  priority: 'high',   estimatedCost: '500-1000 EGP'},
    { code: 'HPYLORI',   name: 'H. Pylori Test',                reason: 'Common cause of ulcers',                         priority: 'high',   estimatedCost: '80-150 EGP'  },
  ],
  fatty_liver: [
    { code: 'LFT',       name: 'Liver Function Tests',          reason: 'ALT, AST assessment',                            priority: 'urgent', estimatedCost: '80-150 EGP'  },
    { code: 'US-LIVER',  name: 'Liver Ultrasound',              reason: 'Determine fibrosis grade',                       priority: 'high',   estimatedCost: '200-400 EGP' },
  ],
  ckd: [
    { code: 'CR',        name: 'Creatinine & eGFR',             reason: 'Main kidney function test',                      priority: 'urgent', estimatedCost: '30-60 EGP'   },
    { code: 'UREA',      name: 'Blood Urea Nitrogen',           reason: 'Another kidney function marker',                 priority: 'urgent', estimatedCost: '30-60 EGP'   },
    { code: 'UACR',      name: 'Urine Albumin/Creatinine',      reason: 'Early detection of kidney damage',               priority: 'high',   estimatedCost: '80-150 EGP'  },
  ],
  depression: [
    { code: 'VITD',      name: 'Vitamin D',                     reason: 'Deficiency linked to depression',                priority: 'high',   estimatedCost: '150-250 EGP' },
    { code: 'B12',       name: 'Vitamin B12',                   reason: 'Deficiency causes depression symptoms',          priority: 'high',   estimatedCost: '100-200 EGP' },
    { code: 'TSH',       name: 'TSH',                            reason: 'Hypothyroid causes depression',                  priority: 'medium', estimatedCost: '80-150 EGP'  },
  ],
  anxiety: [
    { code: 'TSH',       name: 'TSH',                            reason: 'Hyperthyroid causes anxiety',                    priority: 'high',   estimatedCost: '80-150 EGP'  },
    { code: 'MG',        name: 'Magnesium Level',               reason: 'Deficiency common with anxiety',                 priority: 'medium', estimatedCost: '80-150 EGP'  },
  ],
  osteoporosis: [
    { code: 'DEXA',      name: 'DEXA Bone Density Scan',        reason: 'Main test for osteoporosis',                     priority: 'urgent', estimatedCost: '500-1000 EGP'},
    { code: 'VITD',      name: 'Vitamin D',                     reason: 'Essential for calcium absorption',               priority: 'high',   estimatedCost: '150-250 EGP' },
    { code: 'CA',        name: 'Calcium Level',                 reason: 'Verify calcium level',                           priority: 'medium', estimatedCost: '30-60 EGP'   },
  ],
  anemia: [
    { code: 'CBC',       name: 'Complete Blood Count',          reason: 'Main anemia test',                               priority: 'urgent', estimatedCost: '50-100 EGP'  },
    { code: 'FERRITIN',  name: 'Ferritin',                      reason: 'Iron storage in body',                           priority: 'urgent', estimatedCost: '100-200 EGP' },
    { code: 'IRON',      name: 'Serum Iron & TIBC',             reason: 'Complete iron panel',                            priority: 'high',   estimatedCost: '100-200 EGP' },
  ],
  anemia_b12: [
    { code: 'B12',       name: 'Vitamin B12',                   reason: 'Main B12 level',                                 priority: 'urgent', estimatedCost: '100-200 EGP' },
    { code: 'FOLATE',    name: 'Folate (B9)',                   reason: 'Often deficient with B12',                       priority: 'high',   estimatedCost: '100-200 EGP' },
    { code: 'MMA',       name: 'Methylmalonic Acid',            reason: 'Confirm B12 deficiency',                         priority: 'medium', estimatedCost: '250-400 EGP' },
  ],
  general: [
    { code: 'CBC',       name: 'Complete Blood Count',          reason: 'General health screening',                       priority: 'medium', estimatedCost: '50-100 EGP'  },
    { code: 'VITD',      name: 'Vitamin D',                     reason: 'Deficiency very common in Egypt',                priority: 'high',   estimatedCost: '150-250 EGP' },
    { code: 'B12',       name: 'Vitamin B12',                   reason: 'General screening',                              priority: 'medium', estimatedCost: '100-200 EGP' },
    { code: 'FERRITIN',  name: 'Ferritin',                      reason: 'Iron storage check',                             priority: 'medium', estimatedCost: '100-200 EGP' },
  ],
};

// ── 10-Day Safe Plan Generator ────────────────────────────────
export interface SafePlanDay {
  day: number;
  date: string;
  tasks: SafeTask[];
  theme: string;
}

export interface SafeTask {
  id: string;
  category: 'nutrition' | 'hydration' | 'exercise' | 'sleep' | 'supplement' | 'mindfulness';
  icon: string;
  title: string;
  description: string;
  completed: boolean;
}

export function generate10DaySafePlan(conditions: string[]): SafePlanDay[] {
  const hasCardio   = conditions.some(c => ['hypertension','heart_disease','cholesterol','arrhythmia'].includes(c));
  const hasDiabetes = conditions.some(c => c.includes('diabetes') || c === 'prediabetes');
  const hasAnemia   = conditions.some(c => c.includes('anemia'));
  const hasMental   = conditions.some(c => ['anxiety','depression','insomnia'].includes(c));
  const hasKidney   = conditions.some(c => c.includes('ckd'));
  const hasBones    = conditions.some(c => ['osteoporosis','arthritis'].includes(c));

  const days: SafePlanDay[] = [];
  const themes = [
    'Introduction & Light Start',
    'Adding Simple Movement',
    'Organizing Meal Times',
    'Boosting Hydration',
    'Mid-Point Check',
    'Anti-Inflammatory Nutrition',
    'Sleep Improvement',
    'Stress Management',
    'Muscle Strengthening',
    'Final Evaluation',
  ];

  for (let d = 1; d <= 10; d++) {
    const date = new Date();
    date.setDate(date.getDate() + (d - 1));

    const tasks: SafeTask[] = [];

    tasks.push({
      id: `d${d}-water`,
      category: 'hydration',
      icon: '💧',
      title: hasKidney ? 'Drink 1.5L of water' : 'Drink 2L of water',
      description: hasKidney ? 'Limited amounts for kidneys - consult your doctor' : 'Distributed throughout the day',
      completed: false,
    });

    tasks.push({
      id: `d${d}-sleep`,
      category: 'sleep',
      icon: '😴',
      title: 'Sleep 7-8 hours',
      description: hasMental ? 'Consistent sleep greatly improves mood' : 'Adequate sleep is foundation of health',
      completed: false,
    });

    if (hasCardio) {
      tasks.push({
        id: `d${d}-sodium`,
        category: 'nutrition',
        icon: '🧂',
        title: 'Avoid salty foods',
        description: 'Keep sodium below 2000mg today',
        completed: false,
      });
    }

    if (hasDiabetes) {
      tasks.push({
        id: `d${d}-sugar`,
        category: 'nutrition',
        icon: '🩸',
        title: 'Measure sugar morning & before bed',
        description: 'Log the result in a notebook or app',
        completed: false,
      });
      tasks.push({
        id: `d${d}-carbs`,
        category: 'nutrition',
        icon: '🌾',
        title: 'Choose complex carbs',
        description: 'Oats, legumes, vegetables - not white',
        completed: false,
      });
    }

    if (hasAnemia) {
      tasks.push({
        id: `d${d}-iron`,
        category: 'nutrition',
        icon: '🥩',
        title: 'Eat iron source + Vitamin C',
        description: 'Liver/meat + fresh orange juice',
        completed: false,
      });
    }

    if (hasBones) {
      tasks.push({
        id: `d${d}-calcium`,
        category: 'nutrition',
        icon: '🥛',
        title: 'Eat calcium source',
        description: 'Milk/yogurt/cottage cheese/tahini',
        completed: false,
      });
    }

    if (hasMental) {
      tasks.push({
        id: `d${d}-mindful`,
        category: 'mindfulness',
        icon: '🧘',
        title: '10 min meditation or deep breathing',
        description: 'Deep breathing calms nervous system',
        completed: false,
      });
    }

    if (d <= 3) {
      tasks.push({
        id: `d${d}-walk`,
        category: 'exercise',
        icon: '🚶',
        title: 'Walk 15 minutes',
        description: 'No strain - get used to movement',
        completed: false,
      });
    } else if (d <= 7) {
      tasks.push({
        id: `d${d}-walk`,
        category: 'exercise',
        icon: '🚶',
        title: 'Walk 25-30 minutes',
        description: hasCardio ? 'Moderate pace - avoid heavy breathing' : 'Moderate pace',
        completed: false,
      });
    } else {
      tasks.push({
        id: `d${d}-walk`,
        category: 'exercise',
        icon: '🏃',
        title: 'Walk 35-45 minutes',
        description: 'Or light home exercises',
        completed: false,
      });
    }

    days.push({
      day: d,
      date: date.toLocaleDateString('en-GB'),
      tasks,
      theme: themes[d - 1],
    });
  }

  return days;
}

// ── Compliance Analyzer ───────────────────────────────────────
export interface ComplianceResult {
  percentage: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
  recommendation: string;
  continuePlan: boolean;
}

export function analyzeCompliance(tasks: SafeTask[]): ComplianceResult {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  if (percentage >= 80) return {
    percentage, level: 'excellent', color: '#4DFF9E',
    message: `Excellent! Completed ${completed} of ${total}`,
    recommendation: 'Keep the same pace - you are on the right track',
    continuePlan: true,
  };
  if (percentage >= 60) return {
    percentage, level: 'good', color: '#E8FF4D',
    message: `Good! Completed ${completed} of ${total}`,
    recommendation: 'Try to increase a bit - you can do more',
    continuePlan: true,
  };
  if (percentage >= 40) return {
    percentage, level: 'fair', color: '#FF9D4D',
    message: `Fair - completed only ${completed} of ${total}`,
    recommendation: 'If too hard - we can simplify. But keep going',
    continuePlan: true,
  };
  return {
    percentage, level: 'poor', color: '#FF6B6B',
    message: `Completed only ${completed} of ${total}`,
    recommendation: 'Plan is too much for now - we will simplify it',
    continuePlan: false,
  };
}

export function getLabRecommendations(conditions: string[]): LabTest[] {
  const allTests: LabTest[] = [];
  const addedCodes = new Set<string>();

  conditions.forEach(c => {
    const tests = LAB_TESTS_DATABASE[c];
    if (tests) {
      tests.forEach(t => {
        if (!addedCodes.has(t.code)) {
          allTests.push(t);
          addedCodes.add(t.code);
        }
      });
    }
  });

  if (allTests.length === 0) {
    LAB_TESTS_DATABASE.general.forEach(t => allTests.push(t));
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2 };
  return allTests.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export const FEEDBACK_QUESTIONS = [
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
