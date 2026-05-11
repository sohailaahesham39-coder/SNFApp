import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile, getBMICategory } from '../../data/userStore';
import { tryLogDailyProgressFromHome } from '../../lib/progressLog';
import { MEALS, WORKOUTS } from '../../data/localData';
import { useThemeColors } from '../../context/ThemeContext';
import { loadProfileSupabaseFirst } from '../../lib/supabaseUserData';
import { getMeals, getWorkouts } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { getUserActivePlans, updatePlanProgress, subscribeToUserPlans, type UserHealthPlanRow } from '../../lib/healthPlans';
import {
  getRecentDailyLogs,
  getTodayDailyLog,
  subscribeToDailyLogs,
  upsertTodayDailyLog,
  type UserDailyLog,
} from '../../lib/dailyLogs';
import { computeChecklistCurrentStreak, persistBestChecklistStreak } from '../../lib/streaks';
import { getHabitCompletionMap, listHabits, type UserHabit } from '../../lib/habits';
import { getCachedDashboard, refreshHomeDashboard, subscribeToHealthDataRealtime } from '../../lib/healthIntegration';
import { unifiedMedicalConditions } from '../../lib/healthProfileCoherence';
import { getRecommendedWorkoutsForProfile } from '../../lib/workoutRecommendations';

const { width } = Dimensions.get('window');

// ── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
}

function getMealTypeForTime(): string {
  const h = new Date().getHours();
  if (h < 10) return 'Breakfast';
  if (h < 15) return 'Lunch';
  if (h < 19) return 'Dinner';
  return 'Snack';
}

function getGoalConfig(goal: string) {
  if (goal === 'Weight Loss') return {
    label: 'Weight Loss 🔥',
    tip: 'Stay in a calorie deficit today',
    color: '#FF9D4D',
    macros: { protein: 0.40, carbs: 0.30, fat: 0.30 },
    workoutFilter: 'Weight Loss',
  };
  if (goal === 'Muscle Gain') return {
    label: 'Muscle Gain 💪',
    tip: 'Hit your protein target today',
    color: '#4DFF9E',
    macros: { protein: 0.35, carbs: 0.45, fat: 0.20 },
    workoutFilter: 'Muscle Gain',
  };
  return {
    label: 'Stay Healthy ⚖️',
    tip: 'Keep your meals balanced today',
    color: '#E8FF4D',
    macros: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    workoutFilter: 'Maintain',
  };
}

function filterMealsForUser(profile: UserProfile, mealsInput: any[]) {
  const mealType = getMealTypeForTime();
  const goal = profile.goal;
  const conditions = profile.conditions ?? [];
  const allergens = profile.allergens ?? [];

  // score each meal
  const scored = mealsInput.map(meal => {
    let score = 0;

    // prefer current meal time
    if (meal.meal_type === mealType) score += 10;

    // goal-based score
    if (goal === 'Weight Loss') score += meal.weight_loss_score ?? 0;
    else if (goal === 'Muscle Gain') score += meal.muscle_gain_score ?? 0;
    else score += meal.heart_health_score ?? 0;

    // avoid meals that conflict with conditions
    const avoid = meal.conditions_avoid ?? [];
    const hasConflict = conditions.some((c: string) =>
      avoid.some((a: string) => a.toLowerCase().includes(c.toLowerCase()))
    );
    if (hasConflict) score -= 20;

    // bonus if meal is suitable for user condition
    const suitable = meal.conditions_suitable ?? [];
    const hasMatch = conditions.some((c: string) =>
      suitable.some((s: string) => s.toLowerCase().includes(c.toLowerCase()))
    );
    if (hasMatch) score += 5;

    // penalise allergens
    const foods = (meal.foods ?? '').toLowerCase();
    const allergenConflict = allergens.some(a => {
      if (a === 'Gluten/Wheat' && !meal.is_gluten_free) return true;
      if (a === 'Dairy/Milk' && foods.includes('dairy')) return true;
      if (a === 'Fish' && foods.includes('fish')) return true;
      if (a === 'Eggs' && foods.includes('egg')) return true;
      return false;
    });
    if (allergenConflict) score -= 50;

    return { meal, score };
  });

  return scored
    .filter(s => s.score > -10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.meal);
}

function getConditionTips(conditions: string[]): string[] {
  const tips: Record<string, string> = {
    'Diabetes Type 2': '🩸 Choose low-glycemic foods today',
    'Hypertension': '🧂 Reduce sodium – no added salt today',
    'Heart Disease': '🐟 Include omega-3 rich foods today',
    'Obesity': '⚖️ Focus on portion control',
    'Anemia': '🥩 Eat iron-rich foods with Vitamin C',
    'Kidney Disease': '💧 Monitor protein & fluid intake',
    'Thyroid Issues': '🦋 Avoid raw cruciferous vegetables',
    'Colon Issues': '🌿 Prioritize fiber and probiotics',
    'Chronic Fatigue': '⚡ Eat small frequent meals',
    'Hair Loss': '🥚 Increase biotin & zinc foods',
  };
  return conditions
    .filter(c => tips[c])
    .map(c => tips[c])
    .slice(0, 2);
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const C = useThemeColors();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mealsData, setMealsData] = useState<any[]>(MEALS);
  const [workoutsData, setWorkoutsData] = useState<any[]>(WORKOUTS);
  const [plansLoading, setPlansLoading] = useState(false);
  const [vitaminPlan, setVitaminPlan] = useState<UserHealthPlanRow | null>(null);
  const [labPlan, setLabPlan] = useState<UserHealthPlanRow | null>(null);
  const [habitPlan, setHabitPlan] = useState<UserHealthPlanRow | null>(null);
  const [waterPlan, setWaterPlan] = useState<UserHealthPlanRow | null>(null);
  const [fallbackHabits, setFallbackHabits] = useState<string[]>([]);
  const [dailyLog, setDailyLog] = useState<UserDailyLog | null>(null);
  const [trackedHabits, setTrackedHabits] = useState<UserHabit[]>([]);
  const [todayHabitMap, setTodayHabitMap] = useState<Record<string, boolean>>({});
  const [syncedSummary, setSyncedSummary] = useState<{ alerts: string[]; refreshedAt?: string } | null>(null);
  const [streakCurrent, setStreakCurrent] = useState(0);
  const [streakBest, setStreakBest] = useState(0);

  async function load() {
    const p = await loadProfileSupabaseFirst();
    if (!p) {
      router.replace('/(auth)/welcome');
      return;
    }
    setProfile(p);
    setFallbackHabits(((p as any).habits?.length ? (p as any).habits : (p as any).healthHabits) ?? []);
    const [remoteMeals, remoteWorkouts] = await Promise.all([
      getMeals().catch(() => MEALS),
      getWorkouts().catch(() => WORKOUTS),
    ]);
    setMealsData(remoteMeals?.length ? remoteMeals : MEALS);
    setWorkoutsData(remoteWorkouts?.length ? remoteWorkouts : WORKOUTS);
    void tryLogDailyProgressFromHome(p);
    const authUser = await supabase.auth.getUser();
    const userId = authUser.data.user?.id;
    if (userId) {
      setPlansLoading(true);
      try {
        const active = await getUserActivePlans(userId);
        setVitaminPlan(active.vitamin[0] ?? null);
        setLabPlan(active.lab[0] ?? null);
        setHabitPlan(active.habit[0] ?? null);
        setWaterPlan(active.water[0] ?? null);

        const wGoalStreak = Number(active.water[0]?.plan_data?.cupsPerDay ?? 8) || 8;
        const vitLenStreak = Array.isArray(active.vitamin[0]?.plan_data?.vitamins)
          ? (active.vitamin[0].plan_data.vitamins as unknown[]).length
          : 0;
        const recentForStreak = await getRecentDailyLogs(userId, 200).catch(() => [] as UserDailyLog[]);
        const curStreak = computeChecklistCurrentStreak(recentForStreak, {
          waterGoalCups: wGoalStreak,
          vitaminsRequiredCount: vitLenStreak > 0 ? vitLenStreak : 0,
        });
        const bestStreak = await persistBestChecklistStreak(curStreak);
        setStreakCurrent(curStreak);
        setStreakBest(bestStreak);

        const todayLog = await getTodayDailyLog(userId);
        if (todayLog) setDailyLog(todayLog);
        const [habitsRows, habitStatus] = await Promise.all([
          listHabits().catch(() => []),
          getHabitCompletionMap().catch(() => ({})),
        ]);
        setTrackedHabits(habitsRows);
        setTodayHabitMap(habitStatus);
        const cached = await getCachedDashboard(userId);
        if (cached) {
          setSyncedSummary({
            alerts: cached.alerts ?? [],
            refreshedAt: cached.refreshed_at,
          });
        }
      } finally {
        setPlansLoading(false);
      }
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const conditionTips = getConditionTips(profile ? unifiedMedicalConditions(profile) : []);
  const mealType = getMealTypeForTime();
  const todayTarget = profile?.targetCalories ?? 0;
  const waterCups = Number(dailyLog?.water_cups ?? waterPlan?.plan_data?.consumedCupsToday ?? 0);
  const waterGoalCups = Number(waterPlan?.plan_data?.cupsPerDay ?? 8);
  const waterReminderTimes: string[] = waterPlan?.plan_data?.reminderTimes ?? [];
  const nextWaterReminder = waterReminderTimes[0] ?? 'Not set';
  const vitamins: any[] = vitaminPlan?.plan_data?.vitamins ?? [];
  const vitaminsTakenCount = dailyLog?.vitamins_taken?.length ?? 0;
  const vitaminsTaken = vitamins.length > 0
    ? Math.round((vitaminsTakenCount / Math.max(1, vitamins.length)) * 100)
    : Number(vitaminPlan?.plan_data?.progress ?? 0);
  const habitProgress = Number(habitPlan?.plan_data?.progress ?? 0);
  const labTestsPending = Array.isArray(labPlan?.plan_data?.tests) ? labPlan!.plan_data.tests.length : 0;
  const activePlansCount = [waterPlan, vitaminPlan, habitPlan, labPlan].filter(Boolean).length;
  const fallbackHabitLabel = fallbackHabits.find((h) => h && h !== 'None');
  const firstTrackedHabit = trackedHabits[0];

  async function markWaterCup() {
    if (!waterPlan) return;
    const nextCups = Math.min(waterGoalCups, waterCups + 1);
    const progress = Math.round((nextCups / Math.max(1, waterGoalCups)) * 100);
    await updatePlanProgress(waterPlan.id, progress);
    const authUser = await supabase.auth.getUser();
    const userId = authUser.data.user?.id;
    if (userId) {
      const updated = await upsertTodayDailyLog(userId, {
        water_cups: nextCups,
        calories_goal: todayTarget,
      });
      if (updated) setDailyLog(updated);
    }
    setWaterPlan({
      ...waterPlan,
      plan_data: { ...waterPlan.plan_data, consumedCupsToday: nextCups, progress },
      status: progress >= 100 ? 'completed' : 'active',
    });
  }

  async function markVitaminTaken() {
    if (!vitaminPlan) return;
    const count = Math.max(1, vitamins.length);
    const current = Math.round((vitaminsTaken / 100) * count);
    const next = Math.min(count, current + 1);
    const progress = Math.round((next / count) * 100);
    await updatePlanProgress(vitaminPlan.id, progress);
    const authUser = await supabase.auth.getUser();
    const userId = authUser.data.user?.id;
    if (userId) {
      const existing = dailyLog?.vitamins_taken ?? [];
      const nextVitaminsTaken = [...existing, `vitamin_${Date.now()}`].slice(0, count);
      const updated = await upsertTodayDailyLog(userId, {
        vitamins_taken: nextVitaminsTaken,
        calories_goal: todayTarget,
      });
      if (updated) setDailyLog(updated);
    }
    setVitaminPlan({
      ...vitaminPlan,
      plan_data: { ...vitaminPlan.plan_data, progress },
      status: progress >= 100 ? 'completed' : 'active',
    });
  }

  useEffect(() => {
    let unsubPlans: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;
      unsubPlans = subscribeToUserPlans(userId, () => {
        void load();
      });
      unsubLogs = subscribeToDailyLogs(userId, () => {
        void getTodayDailyLog(userId).then((log) => {
          if (log) setDailyLog(log);
        });
      });
      const unsubRealtime = subscribeToHealthDataRealtime(userId, () => {
        void load();
      });
      const prevUnsubPlans = unsubPlans;
      unsubPlans = () => {
        prevUnsubPlans?.();
        unsubRealtime?.();
      };
      void refreshHomeDashboard(userId).then((dashboard) => {
        if (dashboard) {
          setSyncedSummary({
            alerts: dashboard.alerts ?? [],
            refreshedAt: dashboard.refreshed_at,
          });
        }
      });
    });
    return () => {
      unsubPlans?.();
      unsubLogs?.();
    };
  }, []);

  if (!profile) return null;

  // ── derived data ────────────────────────────────────────────────────────────
  const goalConfig = getGoalConfig(profile.goal);
  const bmiCat = getBMICategory(profile.bmi);
  const recommendedMeals = filterMealsForUser(profile, mealsData);
  const recommendedWorkouts = getRecommendedWorkoutsForProfile(profile, workoutsData).slice(0, 2);

  // macros from target calories
  const { macros } = goalConfig;
  const proteinG = Math.round(profile.targetCalories * macros.protein / 4);
  const carbsG = Math.round(profile.targetCalories * macros.carbs / 4);
  const fatG = Math.round(profile.targetCalories * macros.fat / 9);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient
        colors={[C.gradStart, C.gradEnd]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={[s.greeting, { color: C.textMuted }]}>{getGreeting()}</Text>
            <Text style={[s.name, { color: C.text }]}>{profile.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarT}>{(profile.name || 'U')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Condition Tips ── */}
        {conditionTips.length > 0 && (
          <View style={[s.tipsCard, { backgroundColor: 'rgba(77,255,158,0.06)', borderColor: 'rgba(77,255,158,0.15)' }]}>
            <Text style={[s.tipsTitle, { color: '#4DFF9E' }]}>Today's Health Tips</Text>
            {conditionTips.map((tip, i) => (
              <Text key={i} style={[s.tipItem, { color: C.textMuted }]}>{tip}</Text>
            ))}
          </View>
        )}

        {/* ── Daily checklist & streak ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.cardLbl, { color: C.textMuted }]}>DAILY CHECKLIST</Text>
          <Text style={[s.calSub, { color: C.text }]}>
            Current streak: <Text style={{ color: '#FF9D4D', fontWeight: '800' }}>{streakCurrent}</Text>
            {' · '}
            Best: <Text style={{ color: '#4DFF9E', fontWeight: '800' }}>{streakBest}</Text>
          </Text>
          <Text style={[s.trackHint, { color: C.textDim }]}>
            Water, meals, workout, and habits when you track them
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={[s.streakBtn, { flex: 1, borderColor: C.accent + '55' }]}
              onPress={() => router.push('/daily-checklist')}
            >
              <Text style={[s.streakBtnT, { color: C.accent }]}>Today's checklist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.streakBtn, { flex: 1, borderColor: C.accent + '55' }]}
              onPress={() => router.push('/weekly-progress')}
            >
              <Text style={[s.streakBtnT, { color: C.accent }]}>Weekly</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Calorie Card ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={[s.cardLbl, { color: C.textMuted }]}>TODAY'S CALORIE GOAL</Text>
              <Text style={[s.calVal, { color: goalConfig.color }]}>
                {todayTarget.toLocaleString()}
                <Text style={[s.calUnit, { color: C.textMuted }]}> kcal</Text>
              </Text>
              <Text style={[s.calSub, { color: C.textMuted }]}>{goalConfig.tip}</Text>
            </View>
            <View style={[s.goalBadge, { backgroundColor: goalConfig.color + '18', borderColor: goalConfig.color + '30' }]}>
              <Text style={[s.goalBadgeT, { color: goalConfig.color }]}>{goalConfig.label}</Text>
            </View>
          </View>
          {/* progress bar placeholder */}
          <View style={[s.track, { backgroundColor: C.border }]}>
            <View style={[s.fill, { width: '0%', backgroundColor: goalConfig.color }]} />
          </View>
          <Text style={[s.trackHint, { color: C.textDim }]}>Log meals to track progress</Text>
        </View>

        {/* ── Water Tracker ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.cardLbl, { color: C.textMuted }]}>WATER TRACKER</Text>
          {plansLoading ? <ActivityIndicator color={C.accent} /> : !waterPlan ? (
            <Text style={[s.calSub, { color: C.textMuted }]}>No active water plan yet.</Text>
          ) : (
            <>
              <Text style={[s.calSub, { color: C.text }]}>
                {waterCups}/{waterGoalCups} cups today
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 20, marginRight: 4 }}>{i < waterCups ? '💧' : '🥛'}</Text>
                ))}
              </View>
              <Text style={[s.trackHint, { color: C.textDim }]}>Next reminder: {nextWaterReminder}</Text>
              <TouchableOpacity style={[s.addMeal, { borderColor: C.accent + '55' }]} onPress={markWaterCup}>
                <Text style={[s.addMealT, { color: C.accent }]}>+ Mark one cup</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Today's Vitamins ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.cardLbl, { color: C.textMuted }]}>TODAY'S VITAMINS</Text>
          {plansLoading ? <ActivityIndicator color={C.accent} /> : !vitaminPlan ? (
            <Text style={[s.calSub, { color: C.textMuted }]}>No active vitamin plan.</Text>
          ) : (
            <>
              {vitamins.slice(0, 3).map((v: any, idx: number) => (
                <Text key={idx} style={[s.calSub, { color: C.text }]}>☐ {v.nutrient ?? v.name ?? 'Vitamin'}</Text>
              ))}
              <Text style={[s.trackHint, { color: C.textDim }]}>Progress: {vitaminsTaken}%</Text>
              <TouchableOpacity style={[s.addMeal, { borderColor: C.accent + '55' }]} onPress={markVitaminTaken}>
                <Text style={[s.addMealT, { color: C.accent }]}>+ Mark vitamin as taken</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Active Habit ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.cardLbl, { color: C.textMuted }]}>ACTIVE HABIT</Text>
          {plansLoading ? <ActivityIndicator color={C.accent} /> : !habitPlan ? (
            <>
              <Text style={[s.calSub, { color: C.textMuted }]}>
                {firstTrackedHabit
                  ? `${firstTrackedHabit.name} - ${todayHabitMap[firstTrackedHabit.id] ? 'done today' : 'pending'}`
                  : fallbackHabitLabel
                    ? `Tracking habit: ${fallbackHabitLabel}`
                    : 'No active habit plan.'}
              </Text>
              <TouchableOpacity style={[s.addMeal, { borderColor: C.accent + '55' }]} onPress={() => router.push('/habits')}>
                <Text style={[s.addMealT, { color: C.accent }]}>Open habits manager</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[s.calSub, { color: C.text }]}>Current progress: {habitProgress}%</Text>
              <Text style={[s.trackHint, { color: C.textDim }]}>Today's target: stay on weekly reduction plan.</Text>
              <Text style={[s.trackHint, { color: '#4DFF9E' }]}>You are building consistency, keep going.</Text>
            </>
          )}
        </View>

        {/* ── Macros ── */}
        <View style={s.macroRow}>
          {[
            { lbl: 'Protein', val: proteinG, color: '#E8FF4D' },
            { lbl: 'Carbs', val: carbsG, color: '#4DFF9E' },
            { lbl: 'Fat', val: fatG, color: '#9D8FFF' },
          ].map(m => (
            <View key={m.lbl} style={[s.macroCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[s.dot, { backgroundColor: m.color }]} />
              <Text style={[s.macroVal, { color: C.text }]}>
                {m.val}<Text style={[s.macroUnit, { color: C.textMuted }]}>g</Text>
              </Text>
              <Text style={[s.macroLbl, { color: C.textMuted }]}>{m.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── BMI ── */}
        <View style={[s.bmiCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={s.bmiLeft}>
            <Text style={[s.bmiLbl, { color: C.textMuted }]}>BMI</Text>
            <Text style={[s.bmiVal, { color: C.text }]}>{profile.bmi}</Text>
            <View style={[s.bmiPill, { backgroundColor: bmiCat.color + '20' }]}>
              <Text style={[s.bmiPillT, { color: bmiCat.color }]}>{bmiCat.label}</Text>
            </View>
          </View>
          <View style={[s.bmiRight, { borderLeftColor: C.border }]}>
            <Text style={[s.bmiStat, { color: C.textMuted }]}>
              TDEE: <Text style={{ color: '#E8FF4D' }}>{profile.tdee} kcal</Text>
            </Text>
            <Text style={[s.bmiStat, { color: C.textMuted }]}>
              BMR: <Text style={{ color: '#4DFF9E' }}>{profile.bmr} kcal</Text>
            </Text>
            <Text style={[s.bmiStat, { color: C.textMuted }]}>
              Target: <Text style={{ color: '#9D8FFF' }}>{profile.targetCalories} kcal</Text>
            </Text>
          </View>
        </View>

        {/* ── Recommended Meals ── */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <View>
              <Text style={[s.secTitle, { color: C.textMuted }]}>RECOMMENDED FOR {mealType.toUpperCase()}</Text>
              <Text style={[s.secSub, { color: C.textDim }]}>Based on your {profile.goal} goal</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
              <Text style={[s.seeAll, { color: C.accent }]}>See all →</Text>
            </TouchableOpacity>
          </View>

          {recommendedMeals.map(meal => (
            <TouchableOpacity
              key={meal.id}
              style={[s.mealItem, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push({ pathname: '/meal-detail', params: { id: meal.id } })}
            >
              <Text style={s.mealEmoji}>{meal.emoji}</Text>
              <View style={s.mealInfo}>
                <Text style={[s.mealName, { color: C.text }]}>{meal.name}</Text>
                <Text style={[s.mealType, { color: C.textMuted }]}>
                  {meal.meal_type} · {meal.prep_time} min · {meal.protein}g protein
                </Text>
              </View>
              <View style={s.calBadge}>
                <Text style={s.calBadgeT}>{meal.calories}</Text>
                <Text style={[s.calUnit2, { color: 'rgba(232,255,77,0.5)' }]}>cal</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[s.addMeal, { borderColor: C.accent + '55' }]}
            onPress={() => router.push('/(tabs)/meals')}
          >
            <Text style={[s.addMealT, { color: C.accent }]}>+ Log a meal</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Health Summary ── */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.cardLbl, { color: C.textMuted }]}>QUICK HEALTH SUMMARY</Text>
          {plansLoading ? <ActivityIndicator color={C.accent} /> : (
            <>
              <Text style={[s.calSub, { color: C.text }]}>Deficiencies count: {vitamins.length}</Text>
              <Text style={[s.calSub, { color: C.text }]}>Lab tests pending: {labTestsPending}</Text>
              <Text style={[s.calSub, { color: C.text }]}>Active plans: {activePlansCount}</Text>
              <TouchableOpacity style={[s.addMeal, { borderColor: C.accent + '55' }]} onPress={() => router.push('/(tabs)/health')}>
                <Text style={[s.addMealT, { color: C.accent }]}>Open Health tab</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Synced Dashboard Status ── */}
        {syncedSummary && (
          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.cardLbl, { color: C.textMuted }]}>SYNC STATUS</Text>
            <Text style={[s.calSub, { color: C.text }]}>
              Last refresh: {syncedSummary.refreshedAt ? new Date(syncedSummary.refreshedAt).toLocaleTimeString() : 'N/A'}
            </Text>
            {syncedSummary.alerts.length > 0 ? (
              syncedSummary.alerts.slice(0, 2).map((alert, idx) => (
                <Text key={idx} style={[s.trackHint, { color: C.warning }]}>⚠ {alert}</Text>
              ))
            ) : (
              <Text style={[s.trackHint, { color: C.textDim }]}>No active health alerts.</Text>
            )}
            <TouchableOpacity style={[s.addMeal, { borderColor: C.accent + '55' }]} onPress={() => router.push('/alerts')}>
              <Text style={[s.addMealT, { color: C.accent }]}>Open alerts center</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Recommended Workouts ── */}
        {recommendedWorkouts.length > 0 && (
          <View style={s.section}>
            <View style={s.secHeader}>
              <View>
                <Text style={[s.secTitle, { color: C.textMuted }]}>TODAY'S WORKOUTS</Text>
                <Text style={[s.secSub, { color: C.textDim }]}>Selected for {profile.goal}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workout')}>
                <Text style={[s.seeAll, { color: C.accent }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            {recommendedWorkouts.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[s.workoutItem, { backgroundColor: C.card, borderColor: C.border }]}
                onPress={() => router.push({ pathname: '/workout-detail', params: { id: w.id } })}
              >
                <Text style={s.mealEmoji}>{w.emoji}</Text>
                <View style={s.mealInfo}>
                  <Text style={[s.mealName, { color: C.text }]}>{w.name}</Text>
                  <Text style={[s.mealType, { color: C.textMuted }]}>
                    {w.muscle_group} · {w.duration} · {w.sets} sets
                  </Text>
                </View>
                <View style={[s.calBadge, { backgroundColor: 'rgba(77,255,158,0.08)', borderColor: 'rgba(77,255,158,0.15)' }]}>
                  <Text style={[s.calBadgeT, { color: '#4DFF9E' }]}>{w.calories_burned}</Text>
                  <Text style={[s.calUnit2, { color: 'rgba(77,255,158,0.5)' }]}>kcal</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Quick Access ── */}
        <View style={s.section}>
          <Text style={[s.secTitle, { color: C.textMuted }]}>QUICK ACCESS</Text>
          <View style={s.quickGrid}>
            {[
              { icon: '💪', lbl: 'Workout', path: '/(tabs)/workout' },
              { icon: '🤖', lbl: 'Ask AI', path: '/(tabs)/chat' },
              { icon: '📈', lbl: 'Progress', path: '/analytics' },
              { icon: '🔔', lbl: 'Alerts', path: '/alerts' },
            ].map(q => (
              <TouchableOpacity
                key={q.lbl}
                style={[s.quickCard, { backgroundColor: C.card, borderColor: C.border }]}
                onPress={() => router.push(q.path as any)}
              >
                <Text style={s.quickIcon}>{q.icon}</Text>
                <Text style={[s.quickLbl, { color: C.textMuted }]}>{q.lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 13, marginBottom: 4, fontWeight: '600' },
  name: { fontSize: 28, fontWeight: '900' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(232,255,77,0.15)', borderWidth: 1.5, borderColor: '#E8FF4D', alignItems: 'center', justifyContent: 'center' },
  avatarT: { fontSize: 16, fontWeight: '800', color: '#E8FF4D' },

  tipsCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 6 },
  tipsTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  tipItem: { fontSize: 13, fontWeight: '500' },

  card: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardLbl: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  calVal: { fontSize: 30, fontWeight: '900' },
  calUnit: { fontSize: 16, fontWeight: '400' },
  calSub: { fontSize: 13, marginTop: 3, lineHeight: 19 },
  goalBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  goalBadgeT: { fontSize: 10, fontWeight: '700' },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  trackHint: { fontSize: 10, marginTop: 6 },

  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  macroCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  macroVal: { fontSize: 16, fontWeight: '800' },
  macroUnit: { fontSize: 11 },
  macroLbl: { fontSize: 10 },

  bmiCard: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', marginBottom: 20 },
  bmiLeft: { flex: 1, paddingRight: 16 },
  bmiLbl: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  bmiVal: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  bmiPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  bmiPillT: { fontSize: 11, fontWeight: '700' },
  bmiRight: { flex: 1, paddingLeft: 16, borderLeftWidth: 1, justifyContent: 'center', gap: 8 },
  bmiStat: { fontSize: 12, fontWeight: '500' },

  section: { marginBottom: 24 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  secTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  secSub: { fontSize: 10, marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '800' },

  mealItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 6 },
  workoutItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 6 },
  mealEmoji: { fontSize: 24 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  mealType: { fontSize: 11 },
  calBadge: { backgroundColor: 'rgba(232,255,77,0.08)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(232,255,77,0.15)', alignItems: 'center' },
  calBadgeT: { fontSize: 13, color: '#E8FF4D', fontWeight: '800' },
  calUnit2: { fontSize: 9 },

  addMeal: { borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', marginTop: 4 },
  addMealT: { fontSize: 14, fontWeight: '800' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  quickCard: { width: (width - 50) / 2, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickIcon: { fontSize: 28 },
  quickLbl: { fontSize: 12, fontWeight: '600' },
  streakBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  streakBtnT: { fontSize: 13, fontWeight: '800' },
});