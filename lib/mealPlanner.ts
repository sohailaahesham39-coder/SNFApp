import { getMeals } from './database';
import { supabase } from './supabase';
import type { UserProfile } from '../data/userStore';

export type PlannedMealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type PlannedMeal = {
  id: string;
  meal_type: PlannedMealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string;
  difficulty: string;
  prep_time: number;
  emoji?: string;
  conditions_suitable?: string[];
  conditions_avoid?: string[];
  safetyReasons: string[];
  medicationNotes: string[];
  safetyPassed: boolean;
  score: number;
};

export type DailyMealPlan = {
  date: string;
  meals: Record<PlannedMealType, PlannedMeal | null>;
  alternatives: Record<PlannedMealType, PlannedMeal[]>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  shoppingList: Array<{ item: string; qty: number }>;
};

type UserMedicalPrefs = {
  medications: string[];
  dietary_preferences: string[];
  cultural_preferences: string[];
  budget_level: 'budget' | 'moderate' | 'expensive';
  cooking_skill: 'easy' | 'medium' | 'hard';
  max_prep_time_minutes: number;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function includesAnyKey(text: string, keys: string[]) {
  const lower = text.toLowerCase();
  return keys.some((k) => lower.includes(k.toLowerCase()));
}

function getConditionKeys(profile: UserProfile) {
  return (profile.healthConditions ?? profile.conditions ?? []).map(normalizeKey);
}

function getAllergyKeys(profile: UserProfile) {
  return (profile.allergens ?? []).map(normalizeKey);
}

function isContraindicatedByCondition(meal: any, conditionKeys: string[]) {
  const avoid = (meal.conditions_avoid ?? []).map((v: string) => normalizeKey(v));
  const unsafeByTag = conditionKeys.some((c) => avoid.some((a: string) => a.includes(c) || c.includes(a)));
  if (unsafeByTag) return true;

  const foodsText = String(meal.foods ?? '').toLowerCase();
  if (conditionKeys.includes('diabetes_type_2') && includesAnyKey(foodsText, ['sugar', 'dessert', 'cola'])) return true;
  if (conditionKeys.includes('hypertension') && includesAnyKey(foodsText, ['pickles', 'processed meat'])) return true;
  if (conditionKeys.includes('kidney_disease') && includesAnyKey(foodsText, ['processed cheese'])) return true;
  return false;
}

function isContraindicatedByAllergy(meal: any, allergyKeys: string[]) {
  const text = String(meal.foods ?? '').toLowerCase();
  return allergyKeys.some((allergy) => {
    if (allergy.includes('fish') && text.includes('fish')) return true;
    if (allergy.includes('egg') && text.includes('egg')) return true;
    if (allergy.includes('dairy') && (text.includes('milk') || text.includes('yogurt') || text.includes('cheese'))) return true;
    if ((allergy.includes('gluten') || allergy.includes('wheat')) && !meal.is_gluten_free) return true;
    if ((allergy.includes('nuts') || allergy.includes('peanuts')) && includesAnyKey(text, ['almond', 'nuts', 'peanut'])) return true;
    return false;
  });
}

function medicationNotesForMeal(meal: any, meds: string[]): string[] {
  const notes: string[] = [];
  const foodText = String(meal.foods ?? '').toLowerCase();
  const medKeys = meds.map(normalizeKey);
  if (medKeys.some((m) => m.includes('warfarin')) && includesAnyKey(foodText, ['spinach', 'molokhia', 'kale'])) {
    notes.push('Contains high vitamin K foods. Keep intake consistent if using warfarin.');
  }
  if (medKeys.some((m) => m.includes('metformin')) && includesAnyKey(foodText, ['high sugar', 'dessert'])) {
    notes.push('Prefer this meal with extra fiber to reduce glucose spikes while on metformin.');
  }
  if (medKeys.some((m) => m.includes('statin')) && includesAnyKey(foodText, ['grapefruit'])) {
    notes.push('Avoid grapefruit-like citrus with statins.');
  }
  return notes;
}

export function runMealSafetyCheck(
  meal: any,
  profile: UserProfile,
  medications: string[] = []
): { passed: boolean; reasons: string[]; notes: string[] } {
  const conditionKeys = getConditionKeys(profile);
  const allergyKeys = getAllergyKeys(profile);
  const byCondition = isContraindicatedByCondition(meal, conditionKeys);
  const byAllergy = isContraindicatedByAllergy(meal, allergyKeys);
  const notes = medicationNotesForMeal(meal, medications);
  const reasons: string[] = [];
  if (!byCondition) reasons.push('No condition contraindication');
  if (!byAllergy) reasons.push('No allergy conflict');
  if (notes.length === 0) reasons.push('No medication-food conflict detected');
  return { passed: !byCondition && !byAllergy, reasons, notes };
}

function macroTargets(profile: UserProfile) {
  const calories = profile.targetCalories;
  if (profile.goal === 'Weight Loss') {
    return { calories, protein: Math.round((calories * 0.35) / 4), carbs: Math.round((calories * 0.30) / 4), fat: Math.round((calories * 0.35) / 9) };
  }
  if (profile.goal === 'Muscle Gain') {
    return { calories, protein: Math.round((calories * 0.30) / 4), carbs: Math.round((calories * 0.45) / 4), fat: Math.round((calories * 0.25) / 9) };
  }
  return { calories, protein: Math.round((calories * 0.30) / 4), carbs: Math.round((calories * 0.40) / 4), fat: Math.round((calories * 0.30) / 9) };
}

function mealCaloriesTarget(total: number, mealType: PlannedMealType) {
  if (mealType === 'Breakfast') return total * 0.25;
  if (mealType === 'Lunch') return total * 0.35;
  if (mealType === 'Dinner') return total * 0.30;
  return total * 0.10;
}

function computeMealScore(meal: any, profile: UserProfile, prefs: UserMedicalPrefs, mealType: PlannedMealType) {
  let score = 0;
  const conditionKeys = getConditionKeys(profile);
  const target = mealCaloriesTarget(profile.targetCalories, mealType);
  const delta = Math.abs(Number(meal.calories ?? 0) - target);
  score += Math.max(0, 30 - delta / 10);

  if (profile.goal === 'Weight Loss') score += Number(meal.weight_loss_score ?? 0) * 3;
  if (profile.goal === 'Muscle Gain') score += Number(meal.muscle_gain_score ?? 0) * 3;
  if (profile.goal === 'Maintain') score += Number(meal.heart_health_score ?? 0) * 2;

  if (conditionKeys.includes('diabetes_type_2')) {
    score += Number(meal.diabetes_score ?? 0) * 3;
    if (Number(meal.fiber ?? 0) >= 5) score += 8;
  }
  if (conditionKeys.includes('hypertension') || conditionKeys.includes('heart_disease')) {
    if (includesAnyKey(String(meal.foods ?? ''), ['grilled', 'salad', 'lentil'])) score += 6;
  }

  if (prefs.budget_level === 'budget' && Number(meal.prep_time ?? 0) <= 30) score += 4;
  if (Number(meal.prep_time ?? 0) <= prefs.max_prep_time_minutes) score += 4;
  if (prefs.cooking_skill === 'easy' && String(meal.difficulty ?? '').toLowerCase() === 'easy') score += 4;
  if (prefs.cultural_preferences.includes('egyptian') && includesAnyKey(String(meal.name ?? ''), ['egyptian', 'koshari', 'molokhia', 'foul'])) score += 4;
  return score;
}

function toShoppingList(meals: PlannedMeal[]) {
  const tally = new Map<string, number>();
  meals.forEach((m) => {
    String(m.foods ?? '')
      .split('+')
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((item) => {
        tally.set(item, (tally.get(item) ?? 0) + 1);
      });
  });
  return Array.from(tally.entries()).map(([item, qty]) => ({ item, qty }));
}

async function getUserMedicalPreferences(userId: string): Promise<UserMedicalPrefs> {
  const { data } = await supabase
    .from('user_medical_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return {
      medications: [],
      dietary_preferences: [],
      cultural_preferences: ['egyptian'],
      budget_level: 'moderate',
      cooking_skill: 'easy',
      max_prep_time_minutes: 45,
    };
  }
  return {
    medications: Array.isArray((data as any).medications) ? (data as any).medications : [],
    dietary_preferences: Array.isArray((data as any).dietary_preferences) ? (data as any).dietary_preferences : [],
    cultural_preferences: Array.isArray((data as any).cultural_preferences) ? (data as any).cultural_preferences : ['egyptian'],
    budget_level: ((data as any).budget_level ?? 'moderate') as UserMedicalPrefs['budget_level'],
    cooking_skill: ((data as any).cooking_skill ?? 'easy') as UserMedicalPrefs['cooking_skill'],
    max_prep_time_minutes: Number((data as any).max_prep_time_minutes ?? 45),
  };
}

export async function generatePersonalizedMealPlan(profile: UserProfile, date = new Date()): Promise<DailyMealPlan> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  const allMeals = await getMeals();
  const prefs = userId ? await getUserMedicalPreferences(userId) : {
    medications: [],
    dietary_preferences: [],
    cultural_preferences: ['egyptian'],
    budget_level: 'moderate' as const,
    cooking_skill: 'easy' as const,
    max_prep_time_minutes: 45,
  };

  const conditionKeys = getConditionKeys(profile);
  const allergyKeys = getAllergyKeys(profile);

  const safeMeals = allMeals
    .filter((meal) => !isContraindicatedByCondition(meal, conditionKeys))
    .filter((meal) => !isContraindicatedByAllergy(meal, allergyKeys))
    .map((meal) => {
      const notes = medicationNotesForMeal(meal, prefs.medications);
      const safetyReasons: string[] = [];
      if ((meal.conditions_suitable ?? []).length > 0) safetyReasons.push('Matched your health profile');
      if (String(meal.meal_type).toLowerCase() === 'breakfast') safetyReasons.push('Meal timing matched');
      if (notes.length === 0) safetyReasons.push('No medication-food contraindication found');
      return {
        ...meal,
        meal_type: meal.meal_type as PlannedMealType,
        safetyReasons,
        medicationNotes: notes,
        safetyPassed: true,
        score: 0,
      } as PlannedMeal;
    });

  const selectForType = (mealType: PlannedMealType) => {
    const ranked = safeMeals
      .filter((m) => String(m.meal_type).toLowerCase() === mealType.toLowerCase())
      .map((m) => ({ ...m, score: computeMealScore(m, profile, prefs, mealType) }))
      .sort((a, b) => b.score - a.score);
    return {
      selected: ranked[0] ?? null,
      alternatives: ranked.slice(1, 4),
    };
  };

  const breakfast = selectForType('Breakfast');
  const lunch = selectForType('Lunch');
  const dinner = selectForType('Dinner');
  const snack = selectForType('Snack');
  const selectedMeals = [breakfast.selected, lunch.selected, dinner.selected, snack.selected].filter(Boolean) as PlannedMeal[];

  const totals = selectedMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + Number(m.calories ?? 0),
      protein: acc.protein + Number(m.protein ?? 0),
      carbs: acc.carbs + Number(m.carbs ?? 0),
      fat: acc.fat + Number(m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const plan: DailyMealPlan = {
    date: date.toISOString().slice(0, 10),
    meals: {
      Breakfast: breakfast.selected,
      Lunch: lunch.selected,
      Dinner: dinner.selected,
      Snack: snack.selected,
    },
    alternatives: {
      Breakfast: breakfast.alternatives,
      Lunch: lunch.alternatives,
      Dinner: dinner.alternatives,
      Snack: snack.alternatives,
    },
    totals,
    shoppingList: toShoppingList(selectedMeals),
  };

  if (userId) {
    for (const [mealType, meal] of Object.entries(plan.meals) as Array<[PlannedMealType, PlannedMeal | null]>) {
      if (!meal) continue;
      await supabase.from('meal_plans').upsert(
        {
          user_id: userId,
          plan_date: plan.date,
          meal_type: mealType.toLowerCase(),
          recipe_id: null,
          total_calories: Number(meal.calories ?? 0),
          total_protein_g: Number(meal.protein ?? 0),
          total_carbs_g: Number(meal.carbs ?? 0),
          total_fat_g: Number(meal.fat ?? 0),
        },
        { onConflict: 'user_id,plan_date,meal_type' }
      );
    }
  }

  return plan;
}

export async function swapMealInPlan(
  current: DailyMealPlan,
  mealType: PlannedMealType
): Promise<DailyMealPlan> {
  const choices = current.alternatives[mealType] ?? [];
  if (choices.length === 0) return current;
  const next = choices[0];
  const nextAlternatives = [...choices.slice(1), current.meals[mealType]].filter(Boolean) as PlannedMeal[];
  const meals = { ...current.meals, [mealType]: next };
  const selectedMeals = Object.values(meals).filter(Boolean) as PlannedMeal[];
  const totals = selectedMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + Number(m.calories ?? 0),
      protein: acc.protein + Number(m.protein ?? 0),
      carbs: acc.carbs + Number(m.carbs ?? 0),
      fat: acc.fat + Number(m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    ...current,
    meals,
    alternatives: { ...current.alternatives, [mealType]: nextAlternatives },
    totals,
    shoppingList: toShoppingList(selectedMeals),
  };
}

export function buildMedicalMealTimingHints(profile: UserProfile, medications: string[]) {
  const conditionKeys = getConditionKeys(profile);
  const hints: string[] = [];
  if (conditionKeys.includes('diabetes_type_2')) hints.push('Distribute carbs evenly across meals and pair carbs with fiber/protein.');
  if (conditionKeys.includes('hypertension')) hints.push('Keep sodium intake low through the day; avoid adding table salt at dinner.');
  if (conditionKeys.includes('heart_disease')) hints.push('Prefer grilled/boiled meals; avoid trans fats and deep frying.');
  if (conditionKeys.includes('kidney_disease')) hints.push('Monitor potassium-rich foods and keep portions controlled.');
  if (medications.some((m) => normalizeKey(m).includes('warfarin'))) hints.push('Keep vitamin-K-rich greens intake consistent day to day.');
  if (medications.some((m) => normalizeKey(m).includes('metformin'))) hints.push('Take meals with moderate glycemic load and sufficient fiber.');
  return hints;
}

export function estimateMacroGap(plan: DailyMealPlan, profile: UserProfile) {
  const targets = macroTargets(profile);
  return {
    calories: targets.calories - plan.totals.calories,
    protein: targets.protein - plan.totals.protein,
    carbs: targets.carbs - plan.totals.carbs,
    fat: targets.fat - plan.totals.fat,
  };
}
