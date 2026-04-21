import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { WORKOUTS } from '../data/localData';
import { useTheme, getColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutDetail() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const { id } = useLocalSearchParams();
  const workout = WORKOUTS.find(w => w.id === id);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setTimerActive(false); clearInterval(intervalRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  if (!workout) return null;

  const restTime = (workout as any).rest_seconds || 60;
  const instructions = (workout as any).instructions || 'Follow proper form and technique.';
  const instructionSteps = instructions.split('. ').filter((s: string) => s.trim());

  function startTimer(seconds: number) {
    setTimeLeft(seconds);
    setTimerActive(true);
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <LinearGradient colors={isDark ? ['#050505','#080f06'] : ['#F0F4F0','#FFFFFF']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backT}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.emoji}>{workout.emoji}</Text>
        <Text style={[s.title, { color: C.text }]}>{workout.name}</Text>

        <View style={s.badges}>
          <View style={[s.badge, { backgroundColor: 'rgba(232,255,77,0.12)' }]}>
            <Text style={[s.badgeT, { color: '#E8FF4D' }]}>{workout.difficulty}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: 'rgba(77,255,158,0.12)' }]}>
            <Text style={[s.badgeT, { color: '#4DFF9E' }]}>{workout.muscle_group}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Text style={[s.badgeT, { color: C.textMuted }]}>🔧 {workout.equipment}</Text>
          </View>
        </View>

        <View style={[s.statsCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>WORKOUT STATS</Text>
          <View style={s.statsGrid}>
            {[
              { lbl: 'Calories', val: workout.calories_burned, unit: 'kcal', color: '#E8FF4D' },
              { lbl: 'Sets', val: workout.sets, unit: 'sets', color: '#4DFF9E' },
              { lbl: 'Reps', val: workout.reps, unit: '', color: '#9D8FFF' },
              { lbl: 'Duration', val: workout.duration, unit: '', color: '#FF9D4D' },
            ].map(st => (
              <View key={st.lbl} style={[s.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : C.bg3 }]}>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={[s.statUnit, { color: C.textMuted }]}>{st.unit}</Text>
                <Text style={[s.statLbl, { color: C.textMuted }]}>{st.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>HOW TO DO IT</Text>
          {instructionSteps.map((step: string, i: number) => (
            <View key={i} style={[s.stepRow, { borderBottomColor: C.border }]}>
              <View style={s.stepNum}><Text style={s.stepNumT}>{i + 1}</Text></View>
              <Text style={[s.stepT, { color: C.text }]}>{step.trim()}</Text>
            </View>
          ))}
        </View>

        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>SET TRACKER</Text>
          <View style={s.setsRow}>
            {Array.from({ length: workout.sets }).map((_, i) => (
              <TouchableOpacity key={i} style={[s.setCircle, currentSet > i && s.setDone]} onPress={() => { if (currentSet === i + 1) { setCurrentSet(i + 2); startTimer(restTime); } }}>
                <Text style={[s.setTxt, { color: currentSet > i ? '#000' : C.textMuted }]}>{i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.setHint, { color: C.textMuted }]}>Tap each set when completed</Text>
        </View>

        <View style={[s.timerCard, { backgroundColor: timerActive ? 'rgba(232,255,77,0.1)' : C.card, borderColor: timerActive ? 'rgba(232,255,77,0.3)' : C.border }]}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>REST TIMER</Text>
          <Text style={[s.timerVal, { color: timerActive ? '#E8FF4D' : C.text }]}>{formatTime(timeLeft || restTime)}</Text>
          <View style={s.timerBtns}>
            <TouchableOpacity style={[s.timerBtn, { backgroundColor: '#E8FF4D' }]} onPress={() => startTimer(restTime)}>
              <Text style={s.timerBtnT}>Start Rest ({restTime}s)</Text>
            </TouchableOpacity>
            {timerActive && (
              <TouchableOpacity style={[s.timerBtn, { backgroundColor: 'rgba(255,107,107,0.2)', borderWidth: 1, borderColor: '#FF6B6B' }]} onPress={() => { setTimerActive(false); setTimeLeft(0); }}>
                <Text style={[s.timerBtnT, { color: '#FF6B6B' }]}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>GOOD FOR</Text>
          <View style={s.tags}>
            {workout.goal.map(g => (
              <View key={g} style={[s.tag, { backgroundColor: 'rgba(157,143,255,0.08)', borderColor: 'rgba(157,143,255,0.2)' }]}>
                <Text style={[s.tagT, { color: '#9D8FFF' }]}>🎯 {g}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.startBtn} onPress={() => startTimer(restTime)}>
          <Text style={s.startBtnT}>▶ Start Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  back: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  backT: { color: '#888', fontSize: 15 },
  scroll: { padding: 20, paddingBottom: 100 },
  emoji: { fontSize: 72, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  badgeT: { fontSize: 12, fontWeight: '700' },
  statsCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  statVal: { fontSize: 16, fontWeight: '900' },
  statUnit: { fontSize: 9 },
  statLbl: { fontSize: 9, textAlign: 'center' },
  section: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(232,255,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  stepNumT: { fontSize: 13, fontWeight: '800', color: '#E8FF4D' },
  stepT: { fontSize: 14, flex: 1, lineHeight: 20 },
  setsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 8 },
  setCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  setDone: { backgroundColor: '#E8FF4D', borderColor: '#E8FF4D' },
  setTxt: { fontSize: 16, fontWeight: '800' },
  setHint: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  timerCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'center' },
  timerVal: { fontSize: 52, fontWeight: '900', marginBottom: 16 },
  timerBtns: { flexDirection: 'row', gap: 10 },
  timerBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  timerBtnT: { fontSize: 14, fontWeight: '800', color: '#000' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  tagT: { fontSize: 12, fontWeight: '600' },
  startBtn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  startBtnT: { fontSize: 16, fontWeight: '800', color: '#000' },
});