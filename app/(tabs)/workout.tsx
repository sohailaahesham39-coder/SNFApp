import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORKOUTS } from '../../data/localData';
import { loadProfile, UserProfile } from '../../data/userStore';
import { useTheme, useThemeColors } from '../../context/ThemeContext';
import { getWorkouts } from '../../lib/database';

const DIFFS = ['All','Beginner','Intermediate'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEK_KEY = 'sn_workout_week_done';

function defaultWeek(): boolean[] {
  return [false, false, false, false, false, false, false];
}

async function loadWeekDone(): Promise<boolean[]> {
  try {
    const raw = await AsyncStorage.getItem(WEEK_KEY);
    if (!raw) return defaultWeek();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length === 7) {
      return parsed.map(v => Boolean(v));
    }
  } catch {
    /* ignore */
  }
  return defaultWeek();
}

async function saveWeekDone(days: boolean[]): Promise<void> {
  await AsyncStorage.setItem(WEEK_KEY, JSON.stringify(days));
}

export default function Workout() {
  const { isDark } = useTheme();
  const C = useThemeColors();
  const [diff, setDiff] = useState('All');
  const [profile, setProfile] = useState<UserProfile|null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [weekDone, setWeekDone] = useState<boolean[]>(defaultWeek);

  useEffect(() => {
    loadProfile().then(setProfile);
    getWorkouts().then(data => {
      if (data && data.length > 0) setWorkouts(data);
      else setWorkouts(WORKOUTS);
    }).catch(() => setWorkouts(WORKOUTS));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWeekDone().then(setWeekDone);
    }, []),
  );

  async function toggleDay(index: number) {
    const next = weekDone.map((v, i) => (i === index ? !v : v));
    setWeekDone(next);
    await saveWeekDone(next);
  }

  const filtered = workouts.filter(w => diff==='All' || w.difficulty===diff);

  return (
    <SafeAreaView style={[s.container,{backgroundColor:C.bg}]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill}/>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.title,{color:C.text}]}>Workout Plans 💪</Text>
        <Text style={[s.sub,{color:C.textMuted}]}>Tailored for {profile?.goal||'your goal'}</Text>

        <View style={[s.weekCard,{backgroundColor:C.card,borderColor:C.border}]}>
          <Text style={[s.weekTitle,{color:C.textMuted}]}>THIS WEEK</Text>
          <View style={s.weekRow}>
            {DAYS.map((d, i) => {
              const done = weekDone[i];
              return (
                <TouchableOpacity
                  key={d}
                  activeOpacity={0.7}
                  onPress={() => toggleDay(i)}
                  style={[
                    s.dayItem,
                    {
                      backgroundColor: done ? `${C.accent}18` : C.card,
                      borderColor: done ? C.accent : C.border,
                    },
                  ]}
                >
                  <Text style={[s.dayLbl, { color: done ? C.accent : C.textDim }]}>{d}</Text>
                  {done ? (
                    <Text style={[s.check, { color: C.accent }]}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
          {DIFFS.map(d=>(
            <TouchableOpacity key={d} style={[s.pill,{backgroundColor:diff===d?C.accent:C.card,borderColor:diff===d?C.accent:C.border}]} onPress={()=>setDiff(d)}>
              <Text style={[s.pillT,{color:diff===d?C.onAccent:C.textMuted}]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[s.count,{color:C.textDim}]}>{filtered.length} exercises</Text>

        {filtered.map(w=>(
          <TouchableOpacity key={w.id} style={[s.card,{backgroundColor:C.card,borderColor:C.border}]} onPress={() => router.push({ pathname: '/workout-detail', params: { id: w.id } })}>
            <View style={s.cardTop}>
              <Text style={s.wEmoji}>{w.emoji}</Text>
              <View style={s.wInfo}>
                <Text style={[s.wName,{color:C.text}]}>{w.name}</Text>
                <Text style={[s.wMuscle,{color:C.textMuted}]}>{w.muscle_group}</Text>
              </View>
              <View style={s.calsBurned}>
                <Text style={[s.calsBurnedN, { color: C.accent }]}>{w.calories_burned}</Text>
                <Text style={[s.calsBurnedL,{color:C.textMuted}]}>kcal</Text>
              </View>
            </View>
            <View style={s.stats}>
              {[{icon:'⚡',lbl:w.difficulty},{icon:'🔧',lbl:w.equipment},{icon:'📊',lbl:`${w.sets} sets × ${w.reps}`},{icon:'⏱',lbl:w.duration}].map(st=>(
                <View key={st.lbl} style={[s.statChip,{backgroundColor:isDark?'rgba(0,0,0,0.3)':C.bg3}]}>
                  <Text style={s.statIcon}>{st.icon}</Text>
                  <Text style={[s.statT,{color:C.textMuted}]}>{st.lbl}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1},
  scroll:{padding:20,paddingTop:60,paddingBottom:100},
  title:{fontSize:24,fontWeight:'900',marginBottom:4},
  sub:{fontSize:13,marginBottom:16},
  weekCard:{borderWidth:1,borderRadius:20,padding:16,marginBottom:16},
  weekTitle:{fontSize:11,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.8,marginBottom:12},
  weekRow:{flexDirection:'row',gap:5},
  dayItem:{flex:1,alignItems:'center',gap:3,padding:8,borderRadius:10,borderWidth:1},
  dayLbl:{fontSize:8,fontWeight:'700'},
  check:{fontSize:8,color:'#E8FF4D'},
  filters:{marginBottom:8},
  pill:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,borderWidth:1,marginRight:8},
  pillT:{fontSize:12,fontWeight:'600'},
  count:{fontSize:11,marginBottom:12,marginTop:4},
  card:{borderWidth:1,borderRadius:20,padding:16,marginBottom:10},
  cardTop:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:12},
  wEmoji:{fontSize:32},
  wInfo:{flex:1},
  wName:{fontSize:15,fontWeight:'700',marginBottom:2},
  wMuscle:{fontSize:12},
  calsBurned:{alignItems:'center'},
  calsBurnedN:{fontSize:18,fontWeight:'900'},
  calsBurnedL:{fontSize:10},
  stats:{flexDirection:'row',flexWrap:'wrap',gap:6},
  statChip:{flexDirection:'row',alignItems:'center',gap:4,borderRadius:8,paddingHorizontal:8,paddingVertical:4},
  statIcon:{fontSize:11},
  statT:{fontSize:11,fontWeight:'500'},
});