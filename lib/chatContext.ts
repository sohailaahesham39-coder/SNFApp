import type { UserProfile } from '../data/userStore';
import { supabase } from './supabase';
import { getUserActivePlans, type UserHealthPlanRow } from './healthPlans';

export interface ChatContext {
  profile: UserProfile | null;
  caloriesEatenToday: number;
  caloriesGoalToday: number;
  waterCupsToday: number;
  waterGoalMl: number;
  activePlans: Record<'vitamin' | 'lab' | 'habit' | 'water', UserHealthPlanRow[]>;
  pendingLabTests: number;
  deficienciesCount: number;
  weeklyProgressText: string;
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function loadChatContext(profile: UserProfile | null): Promise<ChatContext> {
  const userId = await getUserId();
  const fallback: ChatContext = {
    profile,
    caloriesEatenToday: 0,
    caloriesGoalToday: profile?.targetCalories ?? 0,
    waterCupsToday: 0,
    waterGoalMl: Math.max(1800, Math.round((profile?.weight ?? 70) * 35)),
    activePlans: { vitamin: [], lab: [], habit: [], water: [] },
    pendingLabTests: 0,
    deficienciesCount: 0,
    weeklyProgressText: 'No weekly progress recorded yet.',
  };
  if (!userId) return fallback;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [logsResult, progressResult, plans] = await Promise.all([
      supabase
        .from('user_daily_logs')
        .select('calories_consumed, calories_goal, water_cups')
        .eq('user_id', userId)
        .eq('log_date', today)
        .maybeSingle(),
      supabase
        .from('user_health_progress')
        .select('week_number, habit_progress, notes')
        .eq('user_id', userId)
        .order('week_number', { ascending: false })
        .limit(1)
        .maybeSingle(),
      getUserActivePlans(userId),
    ]);

    const caloriesEatenToday = Number(logsResult.data?.calories_consumed ?? 0);
    const caloriesGoalToday = Number(logsResult.data?.calories_goal ?? profile?.targetCalories ?? 0);
    const waterCupsToday = Number(logsResult.data?.water_cups ?? 0);
    const waterPlanData = plans.water[0]?.plan_data ?? {};
    const vitaminPlanData = plans.vitamin[0]?.plan_data ?? {};
    const labPlanData = plans.lab[0]?.plan_data ?? {};
    const pendingLabTests = Array.isArray(labPlanData.tests) ? labPlanData.tests.length : 0;
    const deficienciesCount = Array.isArray(vitaminPlanData.vitamins) ? vitaminPlanData.vitamins.length : 0;
    const weeklyProgressText =
      progressResult.data?.notes ||
      `Week ${progressResult.data?.week_number ?? '-'} progress saved.`;

    return {
      profile,
      caloriesEatenToday,
      caloriesGoalToday,
      waterCupsToday,
      waterGoalMl: Number(waterPlanData.goalMl ?? fallback.waterGoalMl),
      activePlans: plans,
      pendingLabTests,
      deficienciesCount,
      weeklyProgressText,
    };
  } catch {
    return fallback;
  }
}

function includesAny(input: string, keys: string[]): boolean {
  const lower = input.toLowerCase();
  return keys.some((k) => lower.includes(k));
}

export function answerUserQuestionFromContext(question: string, context: ChatContext): string | null {
  const q = question.toLowerCase();
  const name = context.profile?.name || 'there';

  if (includesAny(q, ['what vitamins should i take', 'vitamins today'])) {
    const items = context.activePlans.vitamin[0]?.plan_data?.vitamins ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return `No active vitamin plan yet, ${name}. Generate one in Health tab and I will list today's vitamins.`;
    }
    const list = items.slice(0, 5).map((v: any) => v.nutrient ?? v.name ?? 'Vitamin').join(', ');
    return `Today's vitamin plan includes: ${list}.`;
  }

  if (includesAny(q, ['how many calories did i eat', 'calories did i eat'])) {
    return `You consumed ${context.caloriesEatenToday} kcal today out of ${context.caloriesGoalToday} kcal goal.`;
  }

  if (includesAny(q, ['water goal', 'how much water'])) {
    const cups = Math.max(1, Math.round(context.waterGoalMl / 240));
    return `Your water goal is about ${context.waterGoalMl} ml/day (~${cups} cups). You logged ${context.waterCupsToday} cups today.`;
  }

  if (includesAny(q, ['show me my health plan', 'health plan'])) {
    const activeCount = Object.values(context.activePlans).reduce((sum, arr) => sum + arr.length, 0);
    return `You currently have ${activeCount} active plans: ${context.activePlans.vitamin.length} vitamin, ${context.activePlans.lab.length} lab, ${context.activePlans.habit.length} habit, ${context.activePlans.water.length} water.`;
  }

  if (includesAny(q, ['when should i do my lab tests', 'lab tests'])) {
    return context.pendingLabTests > 0
      ? `You have ${context.pendingLabTests} pending lab tests in your active plan. Start urgent ones this week and high-priority ones this month.`
      : 'No pending lab tests in your active plans right now.';
  }

  if (includesAny(q, ['how am i doing this week', 'this week'])) {
    return context.weeklyProgressText;
  }

  if (includesAny(q, ['what habits should i reduce', 'reduce habits'])) {
    const habit = context.activePlans.habit[0];
    if (!habit) return 'No active habit reduction plan yet. Generate one from Health tab.';
    const details = habit.plan_data?.details?.habitName ?? habit.plan_data?.habit ?? 'your current habit';
    const progress = Number(habit.plan_data?.progress ?? 0);
    return `Focus on reducing ${details}. Current progress: ${progress}%. Keep following weekly targets.`;
  }

  return null;
}
