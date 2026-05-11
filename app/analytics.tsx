import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { getRecentDailyLogs } from '../lib/dailyLogs';
import { listHabits, getHabitStats, type UserHabit } from '../lib/habits';
import { loadProfileSupabaseFirst } from '../lib/supabaseUserData';

type Point = { label: string; value: number };

function MiniBars({ points, color, track }: { points: Point[]; color: string; track: string }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <View style={s.barWrap}>
      {points.map((point) => (
        <View key={point.label} style={s.barCol}>
          <View style={[s.barTrack, { backgroundColor: track }]}>
            <View style={[s.barFill, { height: `${Math.round((point.value / max) * 100)}%`, backgroundColor: color }]} />
          </View>
          <Text style={s.barLabel}>{point.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const C = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [caloriePoints, setCaloriePoints] = useState<Point[]>([]);
  const [waterPoints, setWaterPoints] = useState<Point[]>([]);
  const [habitRows, setHabitRows] = useState<Array<{ habit: UserHabit; completionRate: number; streak: number }>>([]);
  const [bmi, setBmi] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const [{ data: auth }, profile] = await Promise.all([supabase.auth.getUser(), loadProfileSupabaseFirst()]);
        const userId = auth.user?.id;
        if (!mounted) return;

        setBmi(profile?.bmi ?? null);
        setTargetCalories(profile?.targetCalories ?? 0);

        if (!userId) {
          setCaloriePoints([]);
          setWaterPoints([]);
          setHabitRows([]);
          return;
        }

        const [logs, habits] = await Promise.all([getRecentDailyLogs(userId, 7), listHabits()]);
        if (!mounted) return;

        setCaloriePoints(
          logs.map((log) => ({
            label: log.log_date.slice(5),
            value: log.calories_consumed,
          }))
        );
        setWaterPoints(
          logs.map((log) => ({
            label: log.log_date.slice(5),
            value: log.water_cups,
          }))
        );

        const stats = await Promise.all(
          habits.slice(0, 5).map(async (habit) => ({ habit, ...(await getHabitStats(habit.id, 30)) }))
        );
        if (!mounted) return;
        setHabitRows(stats);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const avgCalories = useMemo(() => {
    if (caloriePoints.length === 0) return 0;
    return Math.round(caloriePoints.reduce((sum, p) => sum + p.value, 0) / caloriePoints.length);
  }, [caloriePoints]);

  const avgWater = useMemo(() => {
    if (waterPoints.length === 0) return 0;
    return Number((waterPoints.reduce((sum, p) => sum + p.value, 0) / waterPoints.length).toFixed(1));
  }, [waterPoints]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.title, { color: C.text }]}>Progress Analytics</Text>
        <Text style={[s.sub, { color: C.textMuted }]}>Daily, weekly, and habit trends</Text>

        <View style={s.kpiRow}>
          <View style={[s.kpiCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[s.kpiLabel, { color: C.textMuted }]}>BMI</Text>
            <Text style={[s.kpiValue, { color: C.text }]}>{bmi ? bmi.toFixed(1) : '—'}</Text>
          </View>
          <View style={[s.kpiCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[s.kpiLabel, { color: C.textMuted }]}>Avg Calories</Text>
            <Text style={[s.kpiValue, { color: C.text }]}>{avgCalories}</Text>
          </View>
          <View style={[s.kpiCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[s.kpiLabel, { color: C.textMuted }]}>Avg Water</Text>
            <Text style={[s.kpiValue, { color: C.text }]}>{avgWater} cups</Text>
          </View>
        </View>

        <View style={[s.card, { borderColor: C.border, backgroundColor: C.card }]}>
          <Text style={[s.cardTitle, { color: C.text }]}>Calories vs Goal (7 days)</Text>
          <Text style={[s.cardSub, { color: C.textMuted }]}>Goal: {targetCalories} kcal/day</Text>
          <MiniBars points={caloriePoints} color={C.accent} track={C.border} />
        </View>

        <View style={[s.card, { borderColor: C.border, backgroundColor: C.card }]}>
          <Text style={[s.cardTitle, { color: C.text }]}>Water Intake Pattern (7 days)</Text>
          <MiniBars points={waterPoints} color={C.accent2} track={C.border} />
        </View>

        <View style={[s.card, { borderColor: C.border, backgroundColor: C.card }]}>
          <Text style={[s.cardTitle, { color: C.text }]}>Habit Streaks & Adherence</Text>
          {habitRows.length === 0 ? (
            <Text style={[s.cardSub, { color: C.textMuted }]}>No habits tracked yet.</Text>
          ) : (
            habitRows.map((row) => (
              <View key={row.habit.id} style={s.habitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.habitName, { color: C.text }]}>{row.habit.name}</Text>
                  <Text style={[s.habitSub, { color: C.textMuted }]}>
                    Streak {row.streak} days • {row.completionRate}% adherence (30d)
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {loading ? <Text style={[s.loading, { color: C.textMuted }]}>Refreshing analytics...</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 18, paddingBottom: 120, gap: 12 },
  title: { fontSize: 26, fontWeight: '900' },
  sub: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 },
  kpiLabel: { fontSize: 11, marginBottom: 6 },
  kpiValue: { fontSize: 16, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardSub: { fontSize: 12, marginBottom: 8 },
  barWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', minHeight: 80, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 10, color: '#888' },
  habitRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#9993' },
  habitName: { fontSize: 14, fontWeight: '700' },
  habitSub: { fontSize: 12, marginTop: 2 },
  loading: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
