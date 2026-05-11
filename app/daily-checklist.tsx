import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useThemeColors } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  buildDailyChecklist,
  checklistCompletionRatio,
  extractStoredChecklist,
  mergeChecklistPatch,
  type ChecklistItem,
} from '../lib/dailyChecklist';
import { getRecentDailyLogs, getTodayDailyLog, upsertTodayDailyLog, type UserDailyLog } from '../lib/dailyLogs';
import { getUserActivePlans } from '../lib/healthPlans';
import { getHabitCompletionMap, listHabits } from '../lib/habits';
import {
  computeChecklistCurrentStreak,
  loadPersistedBestChecklistStreak,
  persistBestChecklistStreak,
} from '../lib/streaks';

function emptyDayLog(userId: string, iso: string): UserDailyLog {
  return {
    user_id: userId,
    log_date: iso,
    meals: {},
    water_cups: 0,
    vitamins_taken: [],
    calories_consumed: 0,
    calories_goal: 0,
  };
}

export default function DailyChecklistScreen() {
  const C = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [log, setLog] = useState<UserDailyLog | null>(null);
  const [waterGoalCups, setWaterGoalCups] = useState(8);
  const [vitaminSlots, setVitaminSlots] = useState(0);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        router.replace('/(auth)/welcome');
        return;
      }

      const [today, habits, habitMap, plans, recent] = await Promise.all([
        getTodayDailyLog(uid),
        listHabits().catch(() => []),
        getHabitCompletionMap().catch(() => ({})),
        getUserActivePlans(uid).catch(() => ({
          water: [],
          vitamin: [],
          lab: [],
          habit: [],
        })),
        getRecentDailyLogs(uid, 200).catch(() => []),
      ]);

      const wGoal = Number(plans.water[0]?.plan_data?.cupsPerDay ?? 8) || 8;
      const vitLen = Array.isArray(plans.vitamin[0]?.plan_data?.vitamins)
        ? (plans.vitamin[0].plan_data.vitamins as unknown[]).length
        : 0;

      setWaterGoalCups(wGoal);
      setVitaminSlots(vitLen > 0 ? vitLen : 0);

      const baseLog = today ?? emptyDayLog(uid, new Date().toISOString().slice(0, 10));
      setLog(baseLog);

      const dailyIds = habits.filter((h) => h.frequency === 'daily').map((h) => h.id);
      const nextItems = buildDailyChecklist(baseLog, {
        waterGoalCups: wGoal,
        vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
        habitsOptional: false,
        dailyHabitIds: dailyIds,
        habitCompletionMap: habitMap,
      });
      setItems(nextItems);

      const cur = computeChecklistCurrentStreak(recent, {
        waterGoalCups: wGoal,
        vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
      });
      const persisted = await loadPersistedBestChecklistStreak();
      const bestNext = await persistBestChecklistStreak(cur);
      setStreak(cur);
      setBest(Math.max(persisted, bestNext));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const pct = useMemo(() => Math.round(100 * checklistCompletionRatio(items)), [items]);
  const workoutOn = extractStoredChecklist(log?.meals).workout === true;

  async function setWorkoutFlag(val: boolean) {
    if (!userId || !log) return;
    setSaving(true);
    try {
      const meals = mergeChecklistPatch(log.meals, { workout: val });
      const updated = await upsertTodayDailyLog(userId, { meals });
      if (updated) {
        setLog(updated);
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (uid) {
          const [habits, habitMap, plans, recent] = await Promise.all([
            listHabits().catch(() => []),
            getHabitCompletionMap().catch(() => ({})),
            getUserActivePlans(uid).catch(() => ({ water: [], vitamin: [], lab: [], habit: [] })),
            getRecentDailyLogs(uid, 200).catch(() => []),
          ]);
          const wGoal = Number(plans.water[0]?.plan_data?.cupsPerDay ?? 8) || 8;
          const vitLen = Array.isArray(plans.vitamin[0]?.plan_data?.vitamins)
            ? (plans.vitamin[0].plan_data.vitamins as unknown[]).length
            : 0;
          const dailyIds = habits.filter((h) => h.frequency === 'daily').map((h) => h.id);
          const nextItems = buildDailyChecklist(updated, {
            waterGoalCups: wGoal,
            vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
            habitsOptional: false,
            dailyHabitIds: dailyIds,
            habitCompletionMap: habitMap,
          });
          setItems(nextItems);
          const cur = computeChecklistCurrentStreak(recent, {
            waterGoalCups: wGoal,
            vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
          });
          await persistBestChecklistStreak(cur);
          setStreak(cur);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function addWaterCup() {
    if (!userId || !log || saving) return;
    const next = Math.min(waterGoalCups, (log.water_cups ?? 0) + 1);
    setSaving(true);
    try {
      const updated = await upsertTodayDailyLog(userId, {
        water_cups: next,
      });
      if (updated) {
        setLog(updated);
        await refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={[s.backT, { color: C.accent }]}>{'← Back'}</Text>
          </TouchableOpacity>
          <Text style={[s.title, { color: C.text }]}>Daily checklist</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={[s.hero, { borderColor: C.border, backgroundColor: C.card }]}>
              <Text style={[s.heroPct, { color: C.accent }]}>{pct}%</Text>
              <Text style={[s.heroSub, { color: C.textMuted }]}>Today aligned with your plan</Text>
              <Text style={[s.streakLine, { color: C.text }]}>
                Streak: <Text style={{ color: '#FF9D4D', fontWeight: '800' }}>{streak}</Text>
                {' · '}
                Best: <Text style={{ color: '#4DFF9E', fontWeight: '800' }}>{best}</Text>
              </Text>
            </View>

            <View style={[s.card, { borderColor: C.border, backgroundColor: C.card }]}>
              {items.map((row) => (
                <View key={row.id} style={[s.row, { borderBottomColor: C.border }]}>
                  <Text style={[s.rowIcon, { color: row.done ? C.accent : C.textDim }]}>
                    {row.done ? '✓' : '○'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowLbl, { color: C.text }]}>{row.label}</Text>
                    {row.skipped ? (
                      <Text style={[s.rowHint, { color: C.textDim }]}>Optional / not tracked</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>

            <View style={[s.card, { borderColor: C.border, backgroundColor: C.card }]}>
              <Text style={[s.cardTitle, { color: C.textMuted }]}>Quick actions</Text>
              <View style={s.actionRow}>
                <Text style={[s.actionLbl, { color: C.text }]}>Movement / workout</Text>
                <Switch
                  value={workoutOn}
                  onValueChange={(v) => void setWorkoutFlag(v)}
                  disabled={saving}
                  trackColor={{ false: C.border, true: `${C.accent}88` }}
                  thumbColor={workoutOn ? C.accent : C.textDim}
                />
              </View>
              <TouchableOpacity
                style={[s.btn, { borderColor: C.accent + '55' }]}
                onPress={() => void addWaterCup()}
                disabled={saving}
              >
                <Text style={[s.btnT, { color: C.accent }]}>+ Add one water cup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { borderColor: C.accent + '55' }]}
                onPress={() => router.push('/(tabs)/meals')}
              >
                <Text style={[s.btnT, { color: C.accent }]}>Log a meal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { borderColor: C.accent + '55' }]}
                onPress={() => router.push('/(tabs)/workout')}
              >
                <Text style={[s.btnT, { color: C.accent }]}>Workout tab</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { borderColor: C.accent + '55' }]}
                onPress={() => router.push('/habits')}
              >
                <Text style={[s.btnT, { color: C.accent }]}>Habits</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { borderColor: C.accent + '55' }]}
                onPress={() => router.push('/weekly-progress')}
              >
                <Text style={[s.btnT, { color: C.accent }]}>Weekly progress</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  topRow: { marginBottom: 16 },
  back: { marginBottom: 8 },
  backT: { fontSize: 15, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '900' },
  hero: { borderWidth: 1, borderRadius: 20, padding: 22, alignItems: 'center', marginBottom: 16 },
  heroPct: { fontSize: 44, fontWeight: '900' },
  heroSub: { fontSize: 13, marginTop: 4 },
  streakLine: { fontSize: 14, marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 20, padding: 14, marginBottom: 14 },
  cardTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center', fontWeight: '800' },
  rowLbl: { fontSize: 14, fontWeight: '600' },
  rowHint: { fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  actionLbl: { fontSize: 15, fontWeight: '700' },
  btn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnT: { fontWeight: '800', fontSize: 14 },
});
