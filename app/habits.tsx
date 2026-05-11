import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  archiveHabit,
  createHabit,
  getHabitCompletionMap,
  getHabitStats,
  listHabits,
  setHabitCompletion,
  subscribeToHabits,
  type HabitFrequency,
  type UserHabit,
} from '../lib/habits';
import { healthDataEvents } from '../lib/healthIntegration';

type HabitStatsMap = Record<string, { completionRate: number; streak: number }>;

export default function HabitsScreen() {
  const C = useThemeColors();
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [todayMap, setTodayMap] = useState<Record<string, boolean>>({});
  const [statsMap, setStatsMap] = useState<HabitStatsMap>({});
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftFrequency, setDraftFrequency] = useState<HabitFrequency>('daily');
  const [draftTime, setDraftTime] = useState('08:00');
  const [draftReminders, setDraftReminders] = useState(true);
  const [draftTarget, setDraftTarget] = useState('7');

  async function refresh() {
    setLoading(true);
    try {
      const rows = await listHabits();
      setHabits(rows);
      const completion = await getHabitCompletionMap();
      setTodayMap(completion);

      const statsEntries = await Promise.all(
        rows.map(async (habit) => [habit.id, await getHabitStats(habit.id)] as const)
      );
      setStatsMap(Object.fromEntries(statsEntries));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const unsub = subscribeToHabits(() => {
      void refresh();
    });
    return unsub;
  }, []);

  const completedTodayCount = useMemo(
    () => habits.filter((h) => todayMap[h.id]).length,
    [habits, todayMap]
  );

  async function onAddHabit() {
    if (!draftName.trim()) {
      Alert.alert('Required', 'Please enter a habit name.');
      return;
    }
    setSaving(true);
    try {
      await createHabit({
        name: draftName.trim(),
        frequency: draftFrequency,
        time_of_day: draftTime.trim() || null,
        reminders_enabled: draftReminders,
        target_per_week: Number(draftTarget) || (draftFrequency === 'daily' ? 7 : 3),
      });
      setShowAdd(false);
      setDraftName('');
      setDraftFrequency('daily');
      setDraftTime('08:00');
      setDraftReminders(true);
      setDraftTarget('7');
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onToggleDone(habit: UserHabit) {
    const done = !!todayMap[habit.id];
    await setHabitCompletion(habit.id, !done);
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (userId && !done) {
      await healthDataEvents.onHabitCompleted(userId, habit.id);
    }
    await refresh();
  }

  function onDeleteHabit(habit: UserHabit) {
    Alert.alert('Delete habit', `Delete "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await archiveHabit(habit.id);
          await refresh();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={[s.title, { color: C.text }]}>Habits Manager</Text>
            <Text style={[s.subtitle, { color: C.textMuted }]}>
              {completedTodayCount}/{habits.length} completed today
            </Text>
          </View>
          <TouchableOpacity style={[s.addBtn, { backgroundColor: C.accent }]} onPress={() => setShowAdd(true)}>
            <Text style={[s.addBtnText, { color: C.onAccent }]}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[s.emptyCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[s.emptyText, { color: C.textMuted }]}>Loading habits...</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={[s.emptyCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[s.emptyTitle, { color: C.text }]}>No habits yet</Text>
            <Text style={[s.emptyText, { color: C.textMuted }]}>
              Add your first habit with frequency, time, and reminder settings.
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const done = !!todayMap[habit.id];
            const stats = statsMap[habit.id] ?? { completionRate: 0, streak: 0 };
            return (
              <View key={habit.id} style={[s.habitCard, { borderColor: C.border, backgroundColor: C.card }]}>
                <View style={s.habitTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.habitName, { color: C.text }]}>{habit.name}</Text>
                    <Text style={[s.habitMeta, { color: C.textMuted }]}>
                      {habit.frequency} • target {habit.target_per_week}/week • {habit.time_of_day || 'no time'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onDeleteHabit(habit)}>
                    <Text style={[s.deleteText, { color: C.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.statsRow}>
                  <View style={[s.statPill, { borderColor: C.border }]}>
                    <Text style={[s.statLabel, { color: C.textMuted }]}>Streak</Text>
                    <Text style={[s.statValue, { color: C.text }]}>{stats.streak}d</Text>
                  </View>
                  <View style={[s.statPill, { borderColor: C.border }]}>
                    <Text style={[s.statLabel, { color: C.textMuted }]}>30d Rate</Text>
                    <Text style={[s.statValue, { color: C.text }]}>{stats.completionRate}%</Text>
                  </View>
                </View>

                <View style={[s.progressTrack, { backgroundColor: C.border }]}>
                  <View style={[s.progressFill, { width: `${stats.completionRate}%`, backgroundColor: C.accent2 }]} />
                </View>

                <TouchableOpacity
                  style={[s.completeBtn, { borderColor: done ? C.accent2 : C.border, backgroundColor: done ? C.accent2 + '22' : 'transparent' }]}
                  onPress={() => onToggleDone(habit)}
                >
                  <Text style={[s.completeBtnText, { color: done ? C.accent2 : C.textMuted }]}>
                    {done ? 'Completed today ✓' : 'Mark as done today'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.modalTitle, { color: C.text }]}>Add Habit</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Habit name"
              placeholderTextColor={C.textDim}
              style={[s.input, { color: C.text, borderColor: C.border, backgroundColor: C.bg }]}
            />
            <View style={s.freqRow}>
              {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[s.freqBtn, { borderColor: draftFrequency === f ? C.accent : C.border, backgroundColor: draftFrequency === f ? C.accent + '22' : 'transparent' }]}
                  onPress={() => setDraftFrequency(f)}
                >
                  <Text style={{ color: draftFrequency === f ? C.accent : C.textMuted, fontWeight: '700' }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={draftTime}
              onChangeText={setDraftTime}
              placeholder="HH:MM"
              placeholderTextColor={C.textDim}
              style={[s.input, { color: C.text, borderColor: C.border, backgroundColor: C.bg }]}
            />
            <TextInput
              value={draftTarget}
              onChangeText={setDraftTarget}
              keyboardType="number-pad"
              placeholder="Target per week"
              placeholderTextColor={C.textDim}
              style={[s.input, { color: C.text, borderColor: C.border, backgroundColor: C.bg }]}
            />
            <View style={s.switchRow}>
              <Text style={{ color: C.text }}>Reminder enabled</Text>
              <Switch value={draftReminders} onValueChange={setDraftReminders} />
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, { borderColor: C.border }]} onPress={() => setShowAdd(false)}>
                <Text style={{ color: C.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: C.accent }]} onPress={onAddHabit} disabled={saving}>
                <Text style={{ color: C.onAccent, fontWeight: '800' }}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, fontWeight: '600' },
  addBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  addBtnText: { fontSize: 14, fontWeight: '900' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyText: { fontSize: 13, lineHeight: 20 },
  habitCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  habitTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  habitName: { fontSize: 16, fontWeight: '800' },
  habitMeta: { fontSize: 12, marginTop: 2 },
  deleteText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statPill: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flex: 1 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 15, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  completeBtn: { borderWidth: 1, borderRadius: 12, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  completeBtnText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: { flex: 1, borderWidth: 1, borderRadius: 10, minHeight: 42, justifyContent: 'center', alignItems: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  modalBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, minWidth: 90, alignItems: 'center' },
});
