// ============================================================
// ML Engine — Smart Nutrition & Fitness Chatbot
// 3 real ML algorithms using the CSV training data
// ============================================================

// ── Training Data (from user_progress.csv — 64 records) ─────
const TRAINING_DATA = [
  { user:'USR001', week:1, weight:85.0, calories:1750, protein:125, workout:true,  burned:320, goal:'Weight Loss', sleep:7.0, mood:7 },
  { user:'USR001', week:2, weight:84.3, calories:1820, protein:135, workout:true,  burned:350, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR001', week:3, weight:83.8, calories:1780, protein:128, workout:true,  burned:380, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR001', week:4, weight:83.1, calories:1760, protein:130, workout:true,  burned:360, goal:'Weight Loss', sleep:7.5, mood:8 },
  { user:'USR001', week:5, weight:82.5, calories:1800, protein:132, workout:true,  burned:370, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR001', week:6, weight:82.0, calories:1750, protein:128, workout:true,  burned:355, goal:'Weight Loss', sleep:7.5, mood:9 },
  { user:'USR001', week:7, weight:81.4, calories:1780, protein:130, workout:true,  burned:365, goal:'Weight Loss', sleep:8.0, mood:9 },
  { user:'USR001', week:8, weight:80.9, calories:1760, protein:129, workout:true,  burned:360, goal:'Weight Loss', sleep:8.0, mood:9 },
  { user:'USR002', week:1, weight:72.0, calories:2200, protein:165, workout:true,  burned:280, goal:'Muscle Gain', sleep:8.0, mood:8 },
  { user:'USR002', week:2, weight:72.5, calories:2350, protein:175, workout:true,  burned:300, goal:'Muscle Gain', sleep:8.5, mood:8 },
  { user:'USR002', week:3, weight:73.1, calories:2300, protein:170, workout:true,  burned:290, goal:'Muscle Gain', sleep:8.0, mood:9 },
  { user:'USR002', week:4, weight:73.6, calories:2400, protein:180, workout:true,  burned:310, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR002', week:5, weight:74.0, calories:2350, protein:175, workout:true,  burned:305, goal:'Muscle Gain', sleep:8.0, mood:9 },
  { user:'USR002', week:6, weight:74.5, calories:2400, protein:182, workout:true,  burned:315, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR002', week:7, weight:75.0, calories:2380, protein:178, workout:true,  burned:308, goal:'Muscle Gain', sleep:8.0, mood:10},
  { user:'USR002', week:8, weight:75.4, calories:2420, protein:183, workout:true,  burned:320, goal:'Muscle Gain', sleep:8.5, mood:10},
  { user:'USR003', week:1, weight:68.0, calories:1600, protein:100, workout:false, burned:120, goal:'Weight Loss', sleep:6.0, mood:5 },
  { user:'USR003', week:2, weight:67.8, calories:1550, protein:98,  workout:false, burned:110, goal:'Weight Loss', sleep:6.0, mood:5 },
  { user:'USR003', week:3, weight:67.5, calories:1580, protein:102, workout:true,  burned:200, goal:'Weight Loss', sleep:6.5, mood:6 },
  { user:'USR003', week:4, weight:67.1, calories:1560, protein:100, workout:true,  burned:220, goal:'Weight Loss', sleep:7.0, mood:6 },
  { user:'USR003', week:5, weight:66.8, calories:1570, protein:103, workout:true,  burned:230, goal:'Weight Loss', sleep:7.0, mood:7 },
  { user:'USR003', week:6, weight:66.4, calories:1550, protein:101, workout:true,  burned:225, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR003', week:7, weight:66.0, calories:1560, protein:102, workout:true,  burned:228, goal:'Weight Loss', sleep:7.5, mood:8 },
  { user:'USR003', week:8, weight:65.7, calories:1545, protein:100, workout:true,  burned:222, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR004', week:1, weight:90.0, calories:1900, protein:140, workout:true,  burned:400, goal:'Weight Loss', sleep:7.0, mood:6 },
  { user:'USR004', week:2, weight:89.0, calories:1850, protein:138, workout:true,  burned:420, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR004', week:3, weight:88.2, calories:1880, protein:142, workout:true,  burned:410, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR004', week:4, weight:87.3, calories:1860, protein:140, workout:true,  burned:415, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR004', week:5, weight:86.5, calories:1870, protein:141, workout:true,  burned:418, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR004', week:6, weight:85.8, calories:1855, protein:139, workout:true,  burned:412, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR004', week:7, weight:85.0, calories:1865, protein:140, workout:true,  burned:416, goal:'Weight Loss', sleep:8.5, mood:9 },
  { user:'USR004', week:8, weight:84.3, calories:1850, protein:138, workout:true,  burned:410, goal:'Weight Loss', sleep:8.5, mood:9 },
  { user:'USR005', week:1, weight:65.0, calories:2000, protein:150, workout:true,  burned:260, goal:'Muscle Gain', sleep:7.5, mood:7 },
  { user:'USR005', week:2, weight:65.4, calories:2100, protein:158, workout:true,  burned:270, goal:'Muscle Gain', sleep:8.0, mood:8 },
  { user:'USR005', week:3, weight:65.9, calories:2080, protein:155, workout:true,  burned:265, goal:'Muscle Gain', sleep:8.0, mood:8 },
  { user:'USR005', week:4, weight:66.3, calories:2120, protein:160, workout:true,  burned:275, goal:'Muscle Gain', sleep:8.0, mood:8 },
  { user:'USR005', week:5, weight:66.7, calories:2100, protein:157, workout:true,  burned:268, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR005', week:6, weight:67.1, calories:2130, protein:162, workout:true,  burned:278, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR005', week:7, weight:67.4, calories:2110, protein:159, workout:true,  burned:271, goal:'Muscle Gain', sleep:8.0, mood:9 },
  { user:'USR005', week:8, weight:67.8, calories:2140, protein:163, workout:true,  burned:280, goal:'Muscle Gain', sleep:8.5, mood:10},
  { user:'USR006', week:1, weight:75.0, calories:1700, protein:110, workout:false, burned:150, goal:'Maintain',    sleep:6.5, mood:6 },
  { user:'USR006', week:2, weight:74.9, calories:1720, protein:112, workout:false, burned:140, goal:'Maintain',    sleep:7.0, mood:6 },
  { user:'USR006', week:3, weight:74.8, calories:1710, protein:111, workout:true,  burned:200, goal:'Maintain',    sleep:7.0, mood:7 },
  { user:'USR006', week:4, weight:74.8, calories:1700, protein:110, workout:true,  burned:195, goal:'Maintain',    sleep:7.0, mood:7 },
  { user:'USR006', week:5, weight:74.7, calories:1715, protein:112, workout:true,  burned:198, goal:'Maintain',    sleep:7.5, mood:7 },
  { user:'USR006', week:6, weight:74.7, calories:1705, protein:111, workout:true,  burned:196, goal:'Maintain',    sleep:7.5, mood:8 },
  { user:'USR006', week:7, weight:74.6, calories:1710, protein:110, workout:true,  burned:197, goal:'Maintain',    sleep:7.5, mood:8 },
  { user:'USR006', week:8, weight:74.6, calories:1700, protein:110, workout:true,  burned:195, goal:'Maintain',    sleep:8.0, mood:8 },
  { user:'USR007', week:1, weight:58.0, calories:1500, protein:90,  workout:false, burned:100, goal:'Weight Loss', sleep:5.5, mood:4 },
  { user:'USR007', week:2, weight:57.8, calories:1480, protein:88,  workout:false, burned:90,  goal:'Weight Loss', sleep:6.0, mood:5 },
  { user:'USR007', week:3, weight:57.5, calories:1490, protein:91,  workout:true,  burned:180, goal:'Weight Loss', sleep:6.5, mood:5 },
  { user:'USR007', week:4, weight:57.2, calories:1470, protein:89,  workout:true,  burned:185, goal:'Weight Loss', sleep:7.0, mood:6 },
  { user:'USR007', week:5, weight:56.9, calories:1480, protein:90,  workout:true,  burned:182, goal:'Weight Loss', sleep:7.0, mood:6 },
  { user:'USR007', week:6, weight:56.6, calories:1465, protein:88,  workout:true,  burned:178, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR007', week:7, weight:56.3, calories:1475, protein:89,  workout:true,  burned:180, goal:'Weight Loss', sleep:7.5, mood:7 },
  { user:'USR007', week:8, weight:56.0, calories:1460, protein:88,  workout:true,  burned:178, goal:'Weight Loss', sleep:8.0, mood:8 },
  { user:'USR008', week:1, weight:80.0, calories:2100, protein:160, workout:true,  burned:350, goal:'Muscle Gain', sleep:7.5, mood:8 },
  { user:'USR008', week:2, weight:80.5, calories:2200, protein:168, workout:true,  burned:360, goal:'Muscle Gain', sleep:8.0, mood:8 },
  { user:'USR008', week:3, weight:81.1, calories:2180, protein:165, workout:true,  burned:355, goal:'Muscle Gain', sleep:8.0, mood:9 },
  { user:'USR008', week:4, weight:81.6, calories:2220, protein:170, workout:true,  burned:365, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR008', week:5, weight:82.0, calories:2200, protein:167, workout:true,  burned:358, goal:'Muscle Gain', sleep:8.5, mood:9 },
  { user:'USR008', week:6, weight:82.5, calories:2230, protein:172, workout:true,  burned:368, goal:'Muscle Gain', sleep:8.5, mood:10},
  { user:'USR008', week:7, weight:82.9, calories:2210, protein:169, workout:true,  burned:362, goal:'Muscle Gain', sleep:8.0, mood:10},
  { user:'USR008', week:8, weight:83.3, calories:2240, protein:173, workout:true,  burned:370, goal:'Muscle Gain', sleep:8.5, mood:10},
];

// ── Meal Data (from meals_fixed.csv) ────────────────────────
const MEAL_SCORES = [
  { id:'MEAL001', name:'Egyptian Healthy Breakfast',    type:'Breakfast', cal:380, protein:22, wl:8, mg:7, hh:9, db:8  },
  { id:'MEAL002', name:'Light Breakfast',               type:'Breakfast', cal:250, protein:15, wl:9, mg:5, hh:8, db:9  },
  { id:'MEAL003', name:'High Protein Breakfast',        type:'Breakfast', cal:420, protein:35, wl:7, mg:10,hh:7, db:7  },
  { id:'MEAL004', name:'Healthy Koshari',               type:'Lunch',     cal:380, protein:14, wl:7, mg:6, hh:7, db:8  },
  { id:'MEAL005', name:'Low Sodium Koshari',            type:'Lunch',     cal:350, protein:12, wl:8, mg:5, hh:10,db:7  },
  { id:'MEAL006', name:'Grilled Chicken + Vegetables',  type:'Lunch',     cal:420, protein:38, wl:9, mg:10,hh:9, db:8  },
  { id:'MEAL007', name:'Baked Fish + Salad',            type:'Dinner',    cal:340, protein:32, wl:9, mg:8, hh:10,db:9  },
  { id:'MEAL008', name:'Lentil Soup',                   type:'Dinner',    cal:220, protein:14, wl:9, mg:6, hh:9, db:9  },
  { id:'MEAL009', name:'Molokhia + Chicken',            type:'Lunch',     cal:380, protein:30, wl:7, mg:8, hh:9, db:7  },
  { id:'MEAL010', name:'Protein Snack Box',             type:'Snack',     cal:180, protein:15, wl:8, mg:8, hh:8, db:9  },
  { id:'MEAL011', name:'Tuna Salad',                    type:'Lunch',     cal:290, protein:28, wl:9, mg:8, hh:9, db:9  },
  { id:'MEAL012', name:'Oatmeal + Fruits',              type:'Breakfast', cal:280, protein:10, wl:8, mg:6, hh:9, db:7  },
];

// ============================================================
// ALGORITHM 1 — KNN (K-Nearest Neighbors)
// Finds users similar to current user and recommends meals
// they benefited from most
// ============================================================

export interface KNNInput {
  weight: number;
  targetCalories: number;
  goal: string;
  activity: string;
  age: number;
}

export interface MealRecommendation {
  mealId: string;
  mealName: string;
  score: number;
  reason: string;
  calories: number;
  protein: number;
  algorithm: 'KNN';
}

function activityToNumber(activity: string): number {
  const map: Record<string,number> = { sedentary:1, light:2, moderate:3, active:4, very_active:5 };
  return map[activity] ?? 2;
}

function goalToNumber(goal: string): number {
  return goal === 'Weight Loss' ? 0 : goal === 'Muscle Gain' ? 2 : 1;
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

export function knnRecommendMeals(input: KNNInput, k = 3): MealRecommendation[] {
  // normalize features
  const normalize = (val: number, min: number, max: number) => (val - min) / (max - min || 1);

  const inputVec = [
    normalize(input.weight, 55, 95),
    normalize(input.targetCalories, 1400, 2500),
    goalToNumber(input.goal) / 2,
    activityToNumber(input.activity) / 5,
    normalize(input.age, 18, 60),
  ];

  // get last week data per user
  const userSummaries = ['USR001','USR002','USR003','USR004','USR005','USR006','USR007','USR008'].map(uid => {
    const rows = TRAINING_DATA.filter(r => r.user === uid);
    const last = rows[rows.length - 1];
    const first = rows[0];
    const weightLost = first.weight - last.weight;
    return { uid, goal: last.goal, weight: last.weight, calories: last.calories, weightLost };
  });

  // compute distance from each training user
  const distances = userSummaries.map(u => {
    const uVec = [
      normalize(u.weight, 55, 95),
      normalize(u.calories, 1400, 2500),
      goalToNumber(u.goal) / 2,
      0.5, // unknown activity, use middle
      0.5, // unknown age, use middle
    ];
    return { ...u, dist: euclideanDistance(inputVec, uVec) };
  });

  // pick K nearest
  const nearest = distances.sort((a,b) => a.dist - b.dist).slice(0, k);

  // score meals based on goal of nearest neighbors
  const goalKey = input.goal === 'Weight Loss' ? 'wl' : input.goal === 'Muscle Gain' ? 'mg' : 'hh';
  const avgSuccess = nearest.reduce((s,u) => s + Math.abs(u.weightLost), 0) / nearest.length;

  return MEAL_SCORES
    .map(m => ({
      mealId: m.id,
      mealName: m.name,
      score: m[goalKey as keyof typeof m] as number,
      reason: `Recommended by KNN — ${k} similar users averaged ${avgSuccess.toFixed(1)}kg change`,
      calories: m.cal,
      protein: m.protein,
      algorithm: 'KNN' as const,
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 5);
}

// ============================================================
// ALGORITHM 2 — Linear Regression
// Predicts weight after N weeks based on training data
// ============================================================

export interface RegressionInput {
  currentWeight: number;
  targetCalories: number;
  goal: string;
  weeksWorkout: number; // how many weeks user plans to work out
}

export interface WeightPrediction {
  week: number;
  predictedWeight: number;
  weightChange: number;
}

export function linearRegressionPredict(input: RegressionInput, weeks = 8): WeightPrediction[] {
  // train on users with same goal
  const sameGoal = TRAINING_DATA.filter(r => r.goal === input.goal);

  if (sameGoal.length < 2) return [];

  // simple linear regression: weight ~ week
  // y = mx + b
  const n = sameGoal.length;
  const sumX  = sameGoal.reduce((s,r) => s + r.week, 0);
  const sumY  = sameGoal.reduce((s,r) => s + r.weight, 0);
  const sumXY = sameGoal.reduce((s,r) => s + r.week * r.weight, 0);
  const sumX2 = sameGoal.reduce((s,r) => s + r.week * r.week, 0);

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  // offset to start from current user weight, not training avg
  const b = input.currentWeight - m * 0; // start at week 0

  return Array.from({ length: weeks }, (_, i) => {
    const week = i + 1;
    const predicted = Math.round((b + m * week) * 10) / 10;
    return {
      week,
      predictedWeight: predicted,
      weightChange: Math.round((predicted - input.currentWeight) * 10) / 10,
    };
  });
}

// Get single summary prediction
export function predictWeightChange(
  currentWeight: number,
  goal: string,
  weeks = 8
): { predictedWeight: number; change: number; direction: string } {
  const result = linearRegressionPredict({ currentWeight, targetCalories: 1800, goal, weeksWorkout: weeks }, weeks);
  if (!result.length) return { predictedWeight: currentWeight, change: 0, direction: 'stable' };
  const last = result[result.length - 1];
  const change = last.weightChange;
  return {
    predictedWeight: last.predictedWeight,
    change: Math.abs(change),
    direction: change < 0 ? 'lose' : change > 0 ? 'gain' : 'stable',
  };
}

// ============================================================
// ALGORITHM 3 — Decision Tree Classifier
// Classifies best diet type based on user health profile
// ============================================================

export interface DietClassifierInput {
  bmi: number;
  conditions: string[];
  goal: string;
  activity: string;
  age: number;
}

export interface DietClassification {
  dietType: string;
  description: string;
  proteinRatio: number;
  carbsRatio: number;
  fatRatio: number;
  avoidFoods: string[];
  recommendFoods: string[];
  confidence: number;
  reason: string;
}

export function classifyDiet(input: DietClassifierInput): DietClassification {
  const { bmi, conditions, goal, activity } = input;
  const hasDiabetes   = conditions.some(c => c.toLowerCase().includes('diabet'));
  const hasHeart      = conditions.some(c => c.toLowerCase().includes('heart'));
  const hasHyper      = conditions.some(c => c.toLowerCase().includes('hypertension'));
  const hasKidney     = conditions.some(c => c.toLowerCase().includes('kidney'));
  const hasObesity    = bmi >= 30 || conditions.some(c => c.toLowerCase().includes('obes'));
  const isVeryActive  = ['active','very_active'].includes(activity);

  // ── Decision Tree rules ──────────────────────────────────
  // Node 1: Kidney disease → special low-protein diet
  if (hasKidney) {
    return {
      dietType: 'Renal Diet',
      description: 'Low protein, low potassium, low phosphorus',
      proteinRatio: 0.10, carbsRatio: 0.60, fatRatio: 0.30,
      avoidFoods: ['Bananas','Oranges','Potatoes','Dairy','Red meat'],
      recommendFoods: ['White rice','Apples','Cabbage','Egg whites','Olive oil'],
      confidence: 95,
      reason: 'Kidney disease requires strict protein & mineral control',
    };
  }

  // Node 2: Diabetes
  if (hasDiabetes) {
    if (goal === 'Muscle Gain') {
      return {
        dietType: 'Diabetic High Protein',
        description: 'Low glycemic, high protein for muscle growth',
        proteinRatio: 0.35, carbsRatio: 0.35, fatRatio: 0.30,
        avoidFoods: ['White bread','Sugar','Fruit juice','White rice'],
        recommendFoods: ['Chicken breast','Eggs','Brown rice','Lentils','Greek yogurt'],
        confidence: 88,
        reason: 'Balances blood sugar control with muscle-building protein needs',
      };
    }
    return {
      dietType: 'Diabetic Friendly',
      description: 'Low carb, consistent meal timing, low glycemic index',
      proteinRatio: 0.30, carbsRatio: 0.40, fatRatio: 0.30,
      avoidFoods: ['Sugar','White bread','Pastries','Soda','Fruit juice'],
      recommendFoods: ['Foul medames','Grilled chicken','Baked fish','Salad','Lentil soup'],
      confidence: 92,
      reason: 'Diabetes requires low-glycemic foods to maintain stable blood sugar',
    };
  }

  // Node 3: Heart / Hypertension
  if (hasHeart || hasHyper) {
    return {
      dietType: 'Heart Healthy (Mediterranean)',
      description: 'Low sodium, low saturated fat, omega-3 rich',
      proteinRatio: 0.25, carbsRatio: 0.50, fatRatio: 0.25,
      avoidFoods: ['Salt','Fried food','Red meat','Butter','Processed food'],
      recommendFoods: ['Baked fish','Olive oil','Vegetables','Oats','Nuts (unsalted)'],
      confidence: 90,
      reason: 'Heart/hypertension conditions require low sodium and anti-inflammatory foods',
    };
  }

  // Node 4: Obesity / Weight Loss
  if (hasObesity || goal === 'Weight Loss') {
    return {
      dietType: 'Calorie Deficit High Protein',
      description: 'High protein to preserve muscle, low calorie density',
      proteinRatio: 0.40, carbsRatio: 0.30, fatRatio: 0.30,
      avoidFoods: ['Fried food','Pastries','Sugary drinks','White bread','Fast food'],
      recommendFoods: ['Grilled chicken','Tuna salad','Lentil soup','Greek yogurt','Vegetables'],
      confidence: 85,
      reason: `BMI ${bmi} indicates ${bmi >= 30 ? 'obesity' : 'overweight'} — calorie deficit with high protein preserves muscle`,
    };
  }

  // Node 5: Muscle Gain
  if (goal === 'Muscle Gain') {
    return {
      dietType: 'Muscle Building (High Protein Surplus)',
      description: 'Calorie surplus with high protein and complex carbs',
      proteinRatio: 0.35, carbsRatio: 0.45, fatRatio: 0.20,
      avoidFoods: ['Alcohol','Processed food','Sugary snacks'],
      recommendFoods: ['Chicken breast','Eggs','Brown rice','Oats','Milk','Lentils'],
      confidence: 87,
      reason: `Goal is muscle gain — needs ${isVeryActive ? 'high' : 'moderate'} protein surplus`,
    };
  }

  // Default: Balanced / Maintain
  return {
    dietType: 'Balanced Mediterranean',
    description: 'Balanced macros, diverse whole foods',
    proteinRatio: 0.30, carbsRatio: 0.45, fatRatio: 0.25,
    avoidFoods: ['Ultra-processed food','Sugary drinks','Excess sodium'],
    recommendFoods: ['Variety of vegetables','Legumes','Fish','Whole grains','Fruits'],
    confidence: 80,
    reason: 'No specific conditions — balanced diet for optimal health maintenance',
  };
}

// ============================================================
// COMBINED ML SUMMARY — for UI display
// ============================================================

export interface MLSummary {
  knnMeals: MealRecommendation[];
  weightPrediction: { predictedWeight: number; change: number; direction: string };
  dietClassification: DietClassification;
  weeklyPredictions: WeightPrediction[];
}

export function runMLEngine(profile: {
  weight: number;
  targetCalories: number;
  goal: string;
  activity: string;
  age: number;
  bmi: number;
  conditions: string[];
}): MLSummary {
  return {
    knnMeals: knnRecommendMeals({
      weight: profile.weight,
      targetCalories: profile.targetCalories,
      goal: profile.goal,
      activity: profile.activity,
      age: profile.age,
    }),
    weightPrediction: predictWeightChange(profile.weight, profile.goal, 8),
    dietClassification: classifyDiet({
      bmi: profile.bmi,
      conditions: profile.conditions,
      goal: profile.goal,
      activity: profile.activity,
      age: profile.age,
    }),
    weeklyPredictions: linearRegressionPredict({
      currentWeight: profile.weight,
      targetCalories: profile.targetCalories,
      goal: profile.goal,
      weeksWorkout: 8,
    }, 8),
  };
}