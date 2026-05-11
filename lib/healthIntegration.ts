import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { UserProfile } from '../data/userStore';
import { getTodayDailyLog, upsertTodayDailyLog } from './dailyLogs';
import { getUserActivePlans } from './healthPlans';
import { getHabitCompletionMap, getHabitStats, listHabits } from './habits';
import { generatePersonalizedMealPlan, runMealSafetyCheck } from './mealPlanner';
import { ensurePersonalizedPlans } from './personalization';
import { loadProfileSupabaseFirst } from './supabaseUserData';

type DashboardPayload = {
  calories: { consumed: number; goal: number };
  macros: { protein: number; carbs: number; fat: number };
  meals: Record<string, unknown>;
  supplements: Record<string, unknown>;
  workout: Record<string, unknown>;
  habits: Record<string, unknown>;
  water: { cups: number; goalMl: number };
  tips: string[];
  upcomingLabTests: number;
  weeklyProgress: { habitsCompletedToday: number; avgHabitAdherence: number };
  activeMealPlan: Record<string, unknown> | null;
  activeWorkoutPlan: Record<string, unknown> | null;
  activeSupplementProtocol: Record<string, unknown> | null;
  alerts: string[];
  refreshed_at: string;
};

const DASHBOARD_CACHE_KEY = 'sn_dashboard_cache_';

async function getUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

async function sendRealtimeUpdate(userId: string, dashboard: DashboardPayload) {
  try {
    await supabase.channel(`user_${userId}_health_updates`).send({
      type: 'broadcast',
      event: 'dashboard_refresh',
      payload: dashboard,
    });
  } catch {
    // non-blocking
  }
}

async function sendNotification(
  userId: string,
  input: { title: string; message: string; action?: string }
) {
  try {
    await supabase.from('user_alerts').insert({
      user_id: userId,
      title: input.title,
      message: input.message,
      action: input.action ?? null,
    });
  } catch {
    // non-blocking
  }
}

function interpretLabResultValue(testCode: string, value: number) {
  const code = testCode.toLowerCase();
  if (code.includes('vitamin_d')) {
    if (value < 20) {
      return {
        message: 'Vitamin D appears low. Consider deficiency-focused meal/supplement update.',
        supplement_recommendations: ['vitamin_d3'],
        dietary_recommendations: ['increase_omega3_fatty_fish', 'increase_eggs'],
        follow_up_days: 60,
      };
    }
  }
  if (code.includes('ferritin') || code.includes('iron')) {
    if (value < 30) {
      return {
        message: 'Iron marker is low. Increasing iron-rich foods is recommended.',
        supplement_recommendations: ['iron'],
        dietary_recommendations: ['increase_liver', 'increase_lentils', 'add_vitamin_c_with_meals'],
        follow_up_days: 45,
      };
    }
  }
  if (code.includes('hba1c')) {
    if (value >= 6.5) {
      return {
        message: 'HbA1c is elevated. Tighten low-glycemic meal planning.',
        supplement_recommendations: [],
        dietary_recommendations: ['low_glycemic_distribution', 'reduce_added_sugar'],
        follow_up_days: 90,
      };
    }
  }
  return {
    message: 'Lab result recorded successfully.',
    supplement_recommendations: [] as string[],
    dietary_recommendations: [] as string[],
    follow_up_days: 0,
  };
}

async function scheduleLabFollowUp(userId: string, testCode: string, days: number) {
  if (days <= 0) return;
  try {
    const dueAt = new Date(Date.now() + days * 86400000).toISOString();
    await supabase.from('user_alerts').insert({
      user_id: userId,
      title: 'Follow-up lab test scheduled',
      message: `Plan to repeat ${testCode} around ${dueAt.slice(0, 10)}.`,
      action: 'View recommendations',
    });
  } catch {
    // non-blocking
  }
}

async function updateMealPlanPreferences(userId: string, dietaryRecommendations: string[]) {
  if (dietaryRecommendations.length === 0) return;
  try {
    const { data: existing } = await supabase
      .from('user_medical_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    const current = Array.isArray((existing as any)?.dietary_preferences)
      ? ((existing as any).dietary_preferences as string[])
      : [];
    const merged = Array.from(new Set([...current, ...dietaryRecommendations]));
    await supabase.from('user_medical_preferences').upsert(
      {
        user_id: userId,
        dietary_preferences: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // non-blocking
  }
}

async function updateWorkoutAdaptation(
  userId: string,
  adaptation: { reduceIntensity?: boolean; increaseIntensity?: boolean; painLocation?: string | null }
) {
  try {
    const { data: existing } = await supabase
      .from('user_health_progress')
      .select('id,habit_progress')
      .eq('user_id', userId)
      .eq('week_number', 0)
      .maybeSingle();
    const current = ((existing as any)?.habit_progress ?? {}) as Record<string, unknown>;
    const next = {
      ...current,
      workout_adaptation: {
        reduceIntensity: !!adaptation.reduceIntensity,
        increaseIntensity: !!adaptation.increaseIntensity,
        painLocation: adaptation.painLocation ?? null,
        updatedAt: new Date().toISOString(),
      },
    };

    if ((existing as any)?.id) {
      await supabase.from('user_health_progress').update({ habit_progress: next, updated_at: new Date().toISOString() }).eq('id', (existing as any).id);
      return;
    }

    await supabase.from('user_health_progress').insert({
      user_id: userId,
      week_number: 0,
      habit_progress: next,
      lab_tests_done: [],
      notes: 'sync_state',
    });
  } catch {
    // non-blocking
  }
}

async function cacheUserDashboard(userId: string, dashboard: DashboardPayload) {
  await AsyncStorage.setItem(`${DASHBOARD_CACHE_KEY}${userId}`, JSON.stringify(dashboard));
}

export async function getCachedDashboard(userId: string): Promise<DashboardPayload | null> {
  const raw = await AsyncStorage.getItem(`${DASHBOARD_CACHE_KEY}${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DashboardPayload;
  } catch {
    return null;
  }
}

export async function refreshHomeDashboard(userId?: string): Promise<DashboardPayload | null> {
  const resolvedUserId = userId ?? (await getUserId());
  if (!resolvedUserId) return null;

  const [profile, dailyLog, activePlans, habits, habitsTodayMap] = await Promise.all([
    loadProfileSupabaseFirst(),
    getTodayDailyLog(resolvedUserId),
    getUserActivePlans(resolvedUserId).catch(() => ({ vitamin: [], lab: [], habit: [], water: [] })),
    listHabits().catch(() => []),
    getHabitCompletionMap().catch(() => ({})),
  ]);

  const caloriesConsumed = Number(dailyLog?.calories_consumed ?? 0);
  const caloriesGoal = Number(dailyLog?.calories_goal ?? profile?.targetCalories ?? 0);
  const waterGoalMl = Number(activePlans.water[0]?.plan_data?.goalMl ?? Math.max(1800, Math.round((profile?.weight ?? 70) * 35)));
  const activeMealPlan = profile ? await generatePersonalizedMealPlan(profile).catch(() => null) : null;
  const habitStats = await Promise.all(habits.slice(0, 5).map((h) => getHabitStats(h.id)));
  const avgHabitAdherence = habitStats.length
    ? Math.round(habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) / habitStats.length)
    : 0;

  const alerts: string[] = [];
  if (activePlans.lab.length > 0) {
    const pending = Array.isArray(activePlans.lab[0].plan_data?.tests) ? activePlans.lab[0].plan_data.tests.length : 0;
    if (pending > 0) alerts.push(`You have ${pending} pending lab tests.`);
  }
  if (avgHabitAdherence < 40 && habits.length > 0) alerts.push('Habit adherence is low this week.');

  const tips = [
    caloriesGoal > 0 ? `Calorie progress: ${caloriesConsumed}/${caloriesGoal} kcal` : 'Set calorie target in profile.',
    `Water today: ${Number(dailyLog?.water_cups ?? 0)} cups`,
  ];

  const dashboard: DashboardPayload = {
    calories: { consumed: caloriesConsumed, goal: caloriesGoal },
    macros: { protein: 0, carbs: 0, fat: 0 },
    meals: activeMealPlan?.meals ?? {},
    supplements: { active: activePlans.vitamin.length > 0 },
    workout: { active: true },
    habits: habitsTodayMap,
    water: { cups: Number(dailyLog?.water_cups ?? 0), goalMl: waterGoalMl },
    tips,
    upcomingLabTests: Array.isArray(activePlans.lab[0]?.plan_data?.tests) ? activePlans.lab[0].plan_data.tests.length : 0,
    weeklyProgress: {
      habitsCompletedToday: Object.values(habitsTodayMap).filter(Boolean).length,
      avgHabitAdherence,
    },
    activeMealPlan,
    activeWorkoutPlan: null,
    activeSupplementProtocol: (activePlans.vitamin[0] as unknown as Record<string, unknown>) ?? null,
    alerts,
    refreshed_at: new Date().toISOString(),
  };

  await cacheUserDashboard(resolvedUserId, dashboard);
  await sendRealtimeUpdate(resolvedUserId, dashboard);
  return dashboard;
}

export async function revalidateEntirePlan(userId?: string): Promise<Array<{ type: string; reason: string; action: string }>> {
  const resolvedUserId = userId ?? (await getUserId());
  const profile = await loadProfileSupabaseFirst();
  if (!resolvedUserId || !profile) return [];

  const issues: Array<{ type: string; reason: string; action: string }> = [];
  const activeMealPlan = await generatePersonalizedMealPlan(profile).catch(() => null);
  if (activeMealPlan) {
    for (const meal of Object.values(activeMealPlan.meals)) {
      if (!meal) continue;
      const safety = runMealSafetyCheck(meal, profile, []);
      if (!safety.passed) {
        issues.push({ type: 'unsafe_meal', reason: 'Contraindicated by profile constraints.', action: 'remove_and_replace' });
      }
    }
  }
  return issues;
}

export const healthDataEvents = {
  async onLabResultAdded(userId: string, testId: string, value: number) {
    const interpretation = interpretLabResultValue(testId, value);
    await updateMealPlanPreferences(userId, interpretation.dietary_recommendations);
    await scheduleLabFollowUp(userId, testId, interpretation.follow_up_days);
    await refreshHomeDashboard(userId);
    await sendNotification(userId, {
      title: 'Lab result interpreted',
      message: interpretation.message,
      action: 'View recommendations',
    });
  },

  async onMealLogged(userId: string, meal: { calories?: number; protein?: number; carbs?: number; fat?: number; name?: string }) {
    const current = await getTodayDailyLog(userId);
    const updatedMeals = {
      ...(current?.meals ?? {}),
      [`meal_${Date.now()}`]: {
        name: meal.name ?? 'Meal',
        calories: Number(meal.calories ?? 0),
        protein: Number(meal.protein ?? 0),
        carbs: Number(meal.carbs ?? 0),
        fat: Number(meal.fat ?? 0),
      },
    };
    await upsertTodayDailyLog(userId, {
      meals: updatedMeals,
      calories_consumed: Number(current?.calories_consumed ?? 0) + Number(meal.calories ?? 0),
    });
    await refreshHomeDashboard(userId);
  },

  async onWorkoutCompleted(userId: string, _workoutLog: { calories_burned?: number; pain_experienced?: boolean }) {
    const exertion = Number((_workoutLog as any)?.perceived_exertion ?? 5);
    const pain = !!_workoutLog.pain_experienced;
    const painLocation = ((_workoutLog as any)?.pain_location as string | undefined) ?? null;
    const reduce = exertion > 8 || pain;
    const increase = exertion < 4 && !pain;
    await updateWorkoutAdaptation(userId, {
      reduceIntensity: reduce,
      increaseIntensity: increase,
      painLocation,
    });
    await refreshHomeDashboard(userId);
    if (reduce || increase) {
      await sendNotification(userId, {
        title: 'Workout plan adjusted',
        message: reduce
          ? 'Workout intensity has been reduced for safety and recovery.'
          : 'Workout intensity has been increased to keep progression.',
        action: 'View changes',
      });
    }
  },

  async onHealthProfileUpdated(userId: string, _changes: Record<string, unknown>, profile?: UserProfile) {
    if (profile) await ensurePersonalizedPlans(profile);
    await revalidateEntirePlan(userId);
    await refreshHomeDashboard(userId);
    await sendNotification(userId, {
      title: 'Health plan updated',
      message: 'Your personalized plan was revalidated and synchronized to your latest profile.',
      action: 'View changes',
    });
  },

  async onSupplementTaken(userId: string) {
    await refreshHomeDashboard(userId);
  },

  async onHabitCompleted(userId: string, _habitId: string) {
    await refreshHomeDashboard(userId);
  },
};

export function subscribeToHealthDataRealtime(userId: string, onAnyChange: () => void): () => void {
  if (!userId) return () => undefined;
  const channel = supabase
    .channel(`user_${userId}_health_data`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_lab_results', filter: `user_id=eq.${userId}` },
      () => onAnyChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'meal_logs', filter: `user_id=eq.${userId}` },
      () => onAnyChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_daily_logs', filter: `user_id=eq.${userId}` },
      () => onAnyChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_habit_logs', filter: `user_id=eq.${userId}` },
      () => onAnyChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
