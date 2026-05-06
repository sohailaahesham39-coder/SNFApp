import { supabase } from './supabase';

type PlanType = 'vitamin' | 'lab' | 'habit' | 'water';
type PlanStatus = 'active' | 'completed' | 'paused';

export interface UserHealthPlanRow {
  id: string;
  user_id: string;
  plan_type: PlanType;
  plan_data: Record<string, any>;
  status: PlanStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

function buildRangeDuration(days = 30): { startDate: string; duration: string } {
  const startDate = new Date().toISOString();
  return { startDate, duration: `${days} days` };
}

async function savePlan(userId: string, planType: PlanType, planData: Record<string, any>): Promise<UserHealthPlanRow | null> {
  const payload = {
    user_id: userId,
    plan_type: planType,
    plan_data: planData,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('user_health_plans')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return (data as UserHealthPlanRow) ?? null;
}

export async function saveUserVitaminPlan(userId: string, vitamins: any[]): Promise<UserHealthPlanRow | null> {
  return savePlan(userId, 'vitamin', {
    vitamins,
    ...buildRangeDuration(30),
  });
}

export async function saveUserLabPlan(userId: string, tests: any[]): Promise<UserHealthPlanRow | null> {
  const priorities = tests.map((t: any) => t.priority ?? 'medium');
  const totalCost = tests.reduce(
    (sum: number, t: any) => sum + (typeof t.costMax === 'number' ? t.costMax : 0),
    0
  );

  return savePlan(userId, 'lab', {
    tests,
    priorities,
    totalCost,
  });
}

export async function saveUserHabitPlan(userId: string, habitId: string, plan: any): Promise<UserHealthPlanRow | null> {
  return savePlan(userId, 'habit', {
    habit: habitId,
    weeklyTargets: plan?.weeks ?? [],
    progress: 0,
    details: plan ?? {},
  });
}

export async function saveUserWaterPlan(
  userId: string,
  waterGoal: number,
  reminders: string[]
): Promise<UserHealthPlanRow | null> {
  const cupsPerDay = Math.max(1, Math.round(waterGoal / 240));
  return savePlan(userId, 'water', {
    goalMl: waterGoal,
    cupsPerDay,
    reminderTimes: reminders,
    consumedCupsToday: 0,
    progress: 0,
  });
}

export async function getUserActivePlans(userId: string): Promise<Record<PlanType, UserHealthPlanRow[]>> {
  const { data, error } = await supabase
    .from('user_health_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as UserHealthPlanRow[];

  return {
    vitamin: rows.filter((r) => r.plan_type === 'vitamin'),
    lab: rows.filter((r) => r.plan_type === 'lab'),
    habit: rows.filter((r) => r.plan_type === 'habit'),
    water: rows.filter((r) => r.plan_type === 'water'),
  };
}

export async function updatePlanProgress(planId: string, progress: number): Promise<UserHealthPlanRow | null> {
  const normalized = Math.max(0, Math.min(100, Math.round(progress)));

  const { data: existing, error: existingError } = await supabase
    .from('user_health_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (existingError) throw existingError;
  const row = existing as UserHealthPlanRow;
  const nextPlanData = {
    ...(row.plan_data ?? {}),
    progress: normalized,
  };

  const isCompleted = normalized >= 100;
  const { data, error } = await supabase
    .from('user_health_plans')
    .update({
      plan_data: nextPlanData,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', planId)
    .select('*')
    .single();

  if (error) throw error;
  return (data as UserHealthPlanRow) ?? null;
}
