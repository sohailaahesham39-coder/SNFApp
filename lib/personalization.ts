import type { UserProfile } from '../data/userStore';
import { supabase } from './supabase';
import { getUserActivePlans, saveUserHabitPlan, saveUserLabPlan, saveUserVitaminPlan, saveUserWaterPlan } from './healthPlans';
import { generateDeficiencyAnalysisSheet, generateHabitReductionPlan, generateLabTestPlan } from '../data/healthEngine';
import { normalizeHealthDrinks, normalizedHabitsList } from './healthDrinks';

export async function ensurePersonalizedPlans(profile: UserProfile): Promise<void> {
  const authUser = await supabase.auth.getUser();
  const userId = authUser.data.user?.id;
  if (!userId) return;

  const conditions = profile.healthConditions ?? profile.conditions ?? [];
  const symptoms = profile.healthSymptoms ?? [];
  const habits = normalizedHabitsList(profile.healthHabits ?? profile.habits ?? []);
  const drinks = normalizeHealthDrinks(profile.healthDrinks ?? []);

  const [existing, deficiencies, labs] = await Promise.all([
    getUserActivePlans(userId).catch(() => ({ vitamin: [], lab: [], habit: [], water: [] })),
    generateDeficiencyAnalysisSheet(conditions, symptoms, [...habits, ...Object.keys(drinks)], profile.age, profile.gender).catch(() => []),
    generateLabTestPlan(conditions, symptoms, habits, profile.age, profile.gender).catch(() => null),
  ]);

  if (existing.vitamin.length === 0 && deficiencies.length > 0) {
    await saveUserVitaminPlan(userId, deficiencies.slice(0, 4));
  }

  const totalTests = Number(labs?.totalTests ?? 0);
  if (existing.lab.length === 0 && totalTests > 0) {
    await saveUserLabPlan(userId, [...(labs?.urgent ?? []), ...(labs?.high ?? []), ...(labs?.medium ?? [])]);
  }

  if (existing.habit.length === 0) {
    const coffeeCups = drinks.coffee ?? 0;
    const primaryHabit = coffeeCups > 2 ? 'drink_coffee' : habits[0] || 'reduce_sugar';
    const currentAmount = coffeeCups > 2 ? coffeeCups : 3;
    const plan = await generateHabitReductionPlan(primaryHabit, currentAmount, conditions, symptoms).catch(() => null);
    if (plan) await saveUserHabitPlan(userId, primaryHabit, plan);
  }

  if (existing.water.length === 0) {
    const waterGoal = Math.max(1800, Math.round((profile.weight || 70) * 35));
    await saveUserWaterPlan(userId, waterGoal, ['08:00', '12:00', '16:00', '20:00']);
  }
}
