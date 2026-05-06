import { supabase } from './supabase';
import { MEALS, WORKOUTS, CHATBOT_RESPONSES } from '../data/localData';

export async function getMeals() {
  try {
    const { data, error } = await supabase
      .from('local_meals')
      .select('*')
      .limit(30);
    if (error || !data || data.length === 0) return MEALS;
    return data.map((m: any) => ({
      id: m.id,
      name: m.name,
      meal_type: m.meal_type,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      fiber: m.fiber ?? 0,
      emoji: m.emoji || getEmoji(m.meal_type),
      foods: m.foods || '',
      difficulty: m.difficulty || 'Easy',
      prep_time: m.prep_time || 15,
      conditions_suitable: Array.isArray(m.conditions_suitable) ? m.conditions_suitable : [],
      conditions_avoid: Array.isArray(m.conditions_avoid) ? m.conditions_avoid : [],
      weight_loss_score: m.weight_loss_score ?? 0,
      muscle_gain_score: m.muscle_gain_score ?? 0,
      heart_health_score: m.heart_health_score ?? 0,
      diabetes_score: m.diabetes_score ?? 0,
      is_vegetarian: Boolean(m.is_vegetarian),
      is_gluten_free: Boolean(m.is_gluten_free),
    }));
  } catch { return MEALS; }
}

export async function getWorkouts() {
  try {
    const { data, error } = await supabase
      .from('local_workouts')
      .select('*')
      .limit(30);
    if (error || !data || data.length === 0) return WORKOUTS;
    return data.map((w: any) => ({
      id: w.id,
      name: w.name,
      muscle_group: w.muscle_group,
      difficulty: w.difficulty,
      equipment: w.equipment,
      calories_burned: w.calories_burned,
      duration: w.duration,
      sets: w.sets ?? 3,
      reps: w.reps || '12-15',
      emoji: w.emoji || getWorkoutEmoji(w.muscle_group),
      goal: Array.isArray(w.goal) ? w.goal : ['Weight Loss', 'Muscle Gain'],
      instructions: w.instructions || '',
      rest_seconds: w.rest_seconds ?? 60,
    }));
  } catch { return WORKOUTS; }
}

export async function getMealsByCondition(condition: string) {
  try {
    const { data, error } = await supabase
      .from('local_meals')
      .select('*')
      .contains('conditions_suitable', [condition])
      .limit(10);
    if (error || !data) return MEALS.filter(m => m.conditions_suitable.includes(condition));
    return data;
  } catch { return MEALS; }
}

export async function getNutritionByCondition(condition: string) {
  try {
    const { data, error } = await supabase
      .from('nutrition_by_condition')
      .select('*')
      .eq('condition', condition)
      .single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function getHealthCondition(condition: string) {
  try {
    const { data, error } = await supabase
      .from('local_health_conditions')
      .select('*')
      .ilike('name', condition)
      .single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function getChatbotIntents() {
  try {
    const { data, error } = await supabase
      .from('local_chatbot_responses')
      .select('*');
    if (error || !data || data.length === 0) return CHATBOT_RESPONSES;
    return Object.fromEntries(data.map((row: any) => [row.key, row.response]));
  } catch {
    return CHATBOT_RESPONSES;
  }
}

export async function getHealthConditions() {
  try {
    const { data, error } = await supabase
      .from('local_health_conditions')
      .select('*')
      .order('id', { ascending: true });
    if (error || !data) return null;
    return data;
  } catch { return null; }
}

export async function getAllergens() {
  try {
    const { data, error } = await supabase
      .from('local_allergens')
      .select('*')
      .order('id', { ascending: true });
    if (error || !data) return null;
    return data;
  } catch { return null; }
}

export async function getSubstitutions(allergen: string) {
  try {
    const { data, error } = await supabase
      .from('substitutions')
      .select('*')
      .ilike('allergen_name', `%${allergen}%`)
      .limit(5);
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function saveUserProgress(data: {
  user_id: string;
  weight_kg: number;
  daily_calories_actual: number;
  goal: string;
  workout_completed: boolean;
  water_intake_liters?: number;
  mood_score?: number;
  energy_level?: number;
  sleep_hours?: number;
}) {
  try {
    const { error } = await supabase
      .from('user_progress')
      .insert({
        progress_id: `prog_${Date.now()}`,
        log_date: new Date().toISOString().split('T')[0],
        ...data,
      });
    if (error) console.error('saveUserProgress error:', error);
  } catch (e) { console.error(e); }
}

export async function getUserProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(30);
    if (error) return null;
    return data;
  } catch { return null; }
}

function getEmoji(mealType: string): string {
  const map: Record<string, string> = {
    'Breakfast': '🫘',
    'Lunch': '🍗',
    'Dinner': '🐟',
    'Snack': '🥜',
  };
  return map[mealType] || '🍽️';
}

function getWorkoutEmoji(muscleGroup: string): string {
  const map: Record<string, string> = {
    'Full Body': '🏃',
    'Chest': '💪',
    'Back': '🏋️',
    'Quads': '🦵',
    'Core': '🧘',
    'Cardio': '⚡',
  };
  return map[muscleGroup] || '💪';
}