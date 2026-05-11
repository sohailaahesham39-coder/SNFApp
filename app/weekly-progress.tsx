import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  type DimensionValue,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useThemeColors } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { buildDailyChecklist, checklistCompletionRatio, type ChecklistItem } from '../lib/dailyChecklist';
import { getRecentDailyLogs, type UserDailyLog } from '../lib/dailyLogs';
import { getUserActivePlans } from '../lib/healthPlans';
import { computeChecklistCurrentStreak } from '../lib/streaks';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00.000Z');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function syntheticLog(userId: string, iso: string): UserDailyLog {
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

type DayRow = { iso: string; items: ChecklistItem[]; ratio: number };

export default function WeeklyProgressScreen() {
  const C = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DayRow[]>([]);
  const [avgPct, setAvgPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completeDays, setCompleteDays] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) {
        router.replace('/(auth)/welcome');
        return;
      }

      const [plans, logs] = await Promise.all([
        getUserActivePlans(uid).catch(() => ({
          water: [],
          vitamin: [],
          lab: [],
          habit: [],
        })),
        getRecentDailyLogs(uid, 120).catch(() => []),
      ]);

      const wGoal = Number(plans.water[0]?.plan_data?.cupsPerDay ?? 8) || 8;
      const vitLen = Array.isArray(plans.vitamin[0]?.plan_data?.vitamins)
        ? (plans.vitamin[0].plan_data.vitamins as unknown[]).length
        : 0;

      const byDate = new Map(logs.map((l) => [l.log_date, l]));
      const streakVal = computeChecklistCurrentStreak(logs, {
        waterGoalCups: wGoal,
        vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
      });
      setStreak(streakVal);

      const nextRows: DayRow[] = [];
      let sum = 0;
      let greens = 0;

      for (let i = 6; i >= 0; i--) {
        const iso = isoDaysAgo(i);
        const log = byDate.get(iso) ?? syntheticLog(uid, iso);
        const items = buildDailyChecklist(log, {
          waterGoalCups: wGoal,
          vitaminsRequiredCount: vitLen > 0 ? vitLen : 0,
          habitsOptional: true,
        });
        const ratio = checklistCompletionRatio(items);
        sum += ratio;
        const relevant = items.filter((x) => !x.skipped);
        const allGreen = relevant.length > 0 && relevant.every((x) => x.done);
        if (allGreen) greens += 1;
        nextRows.push({ iso, items, ratio });
      }

      setRows(nextRows);
      setAvgPct(Math.round((sum / 7) * 100));
      setCompleteDays(greens);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const highlight = useMemo(
    () => ({
      streak,
      avgPct,
      completeDays,
    }),
    [streak, avgPct, completeDays]
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={s.backWrap}>
          <Text style={[s.back, { color: C.accent }]}>{'← Back'}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.text }]}>Weekly progress</Text>
        <Text style={[s.sub, { color: C.textMuted }]}>Last 7 days — checklist consistency</Text>

        {loading ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 28 }} />
        ) : (
          <>
            <View style={[s.kpiRow, { gap: 10 }]}>
              <View style={[s.kpi, { borderColor: C.border, backgroundColor: C.card }]}>
                <Text style={[s.kpiVal, { color: '#FF9D4D' }]}>{highlight.streak}</Text>
                <Text style={[s.kpiLbl, { color: C.textMuted }]}>Day streak</Text>
              </View>
              <View style={[s.kpi, { borderColor: C.border, backgroundColor: C.card }]}>
                <Text style={[s.kpiVal, { color: C.accent }]}>{highlight.avgPct}%</Text>
                <Text style={[s.kpiLbl, { color: C.textMuted }]}>Avg checklist</Text>
              </View>
              <View style={[s.kpi, { borderColor: C.border, backgroundColor: C.card }]}>
                <Text style={[s.kpiVal, { color: '#4DFF9E' }]}>{highlight.completeDays}/7</Text>
                <Text style={[s.kpiLbl, { color: C.textMuted }]}>Fully on-track</Text>
              </View>
            </View>

            <View style={[s.listCard, { borderColor: C.border, backgroundColor: C.card }]}>
              {rows.map((r, idx) => {
                const pct = Math.round(r.ratio * 100);
                const barW = `${Math.min(100, pct)}%` as DimensionValue;
                return (
                  <View
                    key={r.iso}
                    style={[
                      s.dayRow,
                      idx < rows.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border } : null,
                    ]}
                  >
                    <View style={s.dayLeft}>
                      <Text style={[s.dayName, { color: C.text }]}>{dayLabel(r.iso)}</Text>
                      <Text style={[s.dayPct, { color: C.textMuted }]}>{pct}%</Text>
                    </View>
                    <View style={[s.barTrack, { backgroundColor: C.border }]}>
                      <View style={[s.barFill, { width: barW, backgroundColor: C.accent }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={[s.link, { borderColor: C.accent + '55' }]} onPress={() => router.push('/daily-checklist')}>
              <Text style={[s.linkT, { color: C.accent }]}>Open today's checklist</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  backWrap: { marginBottom: 8 },
  back: { fontSize: 15, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '900' },
  sub: { fontSize: 13, marginTop: 6, marginBottom: 20 },
  kpiRow: { flexDirection: 'row', marginBottom: 18 },
  kpi: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  kpiVal: { fontSize: 22, fontWeight: '900' },
  kpiLbl: { fontSize: 10, marginTop: 4, textAlign: 'center', fontWeight: '600' },
  listCard: { borderWidth: 1, borderRadius: 20, padding: 8, marginBottom: 16 },
  dayRow: { paddingVertical: 12, paddingHorizontal: 8 },
  dayLeft: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayName: { fontSize: 14, fontWeight: '700' },
  dayPct: { fontSize: 13, fontWeight: '600' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  link: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkT: { fontWeight: '800', fontSize: 15 },
});
