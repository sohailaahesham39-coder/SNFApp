import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile, getBMICategory } from '../../data/userStore';
import { tryLogDailyProgressFromHome } from '../../lib/progressLog';
import { MEALS, WORKOUTS } from '../../data/localData';
import { useThemeColors } from '../../context/ThemeContext';
import { loadProfileSupabaseFirst } from '../../lib/supabaseUserData';

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

function filterMealsForUser(profile: UserProfile) {
  const mealType = getMealTypeForTime();
  const goal = profile.goal;
  const conditions = profile.conditions ?? [];
  const allergens = profile.allergens ?? [];

  // score each meal
  const scored = MEALS.map(meal => {
    let score = 0;

    // prefer current meal time
    if (meal.meal_type === mealType) score += 10;

    // goal-based score
    if (goal === 'Weight Loss') score += meal.weight_loss_score ?? 0;
    else if (goal === 'Muscle Gain') score += meal.muscle_gain_score ?? 0;
    else score += meal.heart_health_score ?? 0;

    // avoid meals that conflict with conditions
    const avoid = meal.conditions_avoid ?? [];
    const hasConflict = conditions.some(c =>
      avoid.some(a => a.toLowerCase().includes(c.toLowerCase()))
    );
    if (hasConflict) score -= 20;

    // bonus if meal is suitable for user condition
    const suitable = meal.conditions_suitable ?? [];
    const hasMatch = conditions.some(c =>
      suitable.some(s => s.toLowerCase().includes(c.toLowerCase()))
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

function getRecommendedWorkouts(profile: UserProfile) {
  const goal = profile.goal;
  const conditions = profile.conditions ?? [];

  return WORKOUTS.filter(w => {
    // match goal
    if (!w.goal.includes(goal === 'Maintain' ? 'Maintain' : goal)) return false;
    // no barbell for heart/kidney patients
    if (conditions.some(c => ['Heart Disease', 'Kidney Disease'].includes(c))) {
      if (w.equipment === 'Barbell') return false;
    }
    return true;
  }).slice(0, 2);
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

  async function load() {
    const p = await loadProfileSupabaseFirst();
    if (!p) {
      router.replace('/(auth)/welcome');
      return;
    }
    setProfile(p);
    void tryLogDailyProgressFromHome(p);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!profile) return null;

  // ── derived data ────────────────────────────────────────────────────────────
  const goalConfig = getGoalConfig(profile.goal);
  const bmiCat = getBMICategory(profile.bmi);
  const recommendedMeals = filterMealsForUser(profile);
  const recommendedWorkouts = getRecommendedWorkouts(profile);
  const conditionTips = getConditionTips(profile.conditions ?? []);
  const mealType = getMealTypeForTime();

  // macros from target calories
  const { macros } = goalConfig;
  const proteinG = Math.round(profile.targetCalories * macros.protein / 4);
  const carbsG = Math.round(profile.targetCalories * macros.carbs / 4);
  const fatG = Math.round(profile.targetCalories * macros.fat / 9);

  // calories display (target as goal for today)
  const todayTarget = profile.targetCalories;

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
              <Text style={s.seeAll}>See all →</Text>
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
            style={[s.addMeal, { borderColor: 'rgba(232,255,77,0.2)' }]}
            onPress={() => router.push('/(tabs)/meals')}
          >
            <Text style={s.addMealT}>+ Log a meal</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recommended Workouts ── */}
        {recommendedWorkouts.length > 0 && (
          <View style={s.section}>
            <View style={s.secHeader}>
              <View>
                <Text style={[s.secTitle, { color: C.textMuted }]}>TODAY'S WORKOUTS</Text>
                <Text style={[s.secSub, { color: C.textDim }]}>Selected for {profile.goal}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workout')}>
                <Text style={s.seeAll}>See all →</Text>
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
              { icon: '📈', lbl: 'Progress', path: '/(tabs)/profile' },
              { icon: '⚕️', lbl: 'Health', path: '/(tabs)/profile' },
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
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 13, marginBottom: 2 },
  name: { fontSize: 22, fontWeight: '900' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(232,255,77,0.15)', borderWidth: 1.5, borderColor: '#E8FF4D', alignItems: 'center', justifyContent: 'center' },
  avatarT: { fontSize: 16, fontWeight: '800', color: '#E8FF4D' },

  tipsCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 6 },
  tipsTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  tipItem: { fontSize: 13, fontWeight: '500' },

  card: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardLbl: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  calVal: { fontSize: 30, fontWeight: '900' },
  calUnit: { fontSize: 16, fontWeight: '400' },
  calSub: { fontSize: 12, marginTop: 2 },
  goalBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  goalBadgeT: { fontSize: 10, fontWeight: '700' },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  trackHint: { fontSize: 10, marginTop: 6 },

  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
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

  section: { marginBottom: 20 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  secTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  secSub: { fontSize: 10, marginTop: 2 },
  seeAll: { fontSize: 12, color: '#E8FF4D', fontWeight: '700' },

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
  addMealT: { fontSize: 13, color: '#E8FF4D', fontWeight: '700' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  quickCard: { width: (width - 50) / 2, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickIcon: { fontSize: 28 },
  quickLbl: { fontSize: 12, fontWeight: '600' },
});