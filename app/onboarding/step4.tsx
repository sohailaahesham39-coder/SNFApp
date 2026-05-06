import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBMI, calculateBMR, calculateTDEE, getTargetCalories } from '../../data/userStore';
import { saveProfileLocallyAndPush } from '../../lib/profileSupabase';
import { upsertOnboardingDataFromProfile } from '../../lib/supabaseUserData';

const HEALTH_CONDITIONS = [
  { id: 1, name: 'Diabetes Type 2', icon: '💉' },
  { id: 2, name: 'Hypertension', icon: '❤️' },
  { id: 3, name: 'Heart Disease', icon: '🫀' },
  { id: 4, name: 'Obesity', icon: '⚖️' },
  { id: 5, name: 'Colon Issues', icon: '🩺' },
  { id: 6, name: 'Kidney Disease', icon: '🫘' },
  { id: 7, name: 'Anemia', icon: '🩸' },
  { id: 8, name: 'Thyroid Issues', icon: '🦋' },
  { id: 9, name: 'Hypoglycemia', icon: '🍬' },
  { id: 10, name: 'Weak Bones', icon: '🦴' },
  { id: 11, name: 'Muscle Weakness', icon: '💪' },
  { id: 12, name: 'Hair Loss', icon: '💇' },
  { id: 13, name: 'Chronic Fatigue', icon: '😴' },
  { id: 14, name: 'Oxidative Stress', icon: '⚡' },
  { id: 15, name: 'None', icon: '✅' },
];

const ALLERGENS = [
  { id: 1, name: 'Gluten/Wheat', icon: '🌾' },
  { id: 2, name: 'Dairy/Milk', icon: '🥛' },
  { id: 3, name: 'Eggs', icon: '🥚' },
  { id: 4, name: 'Peanuts', icon: '🥜' },
  { id: 5, name: 'Tree Nuts', icon: '🌰' },
  { id: 6, name: 'Fish', icon: '🐟' },
  { id: 7, name: 'Shellfish', icon: '🦐' },
  { id: 8, name: 'Soy', icon: '🫘' },
  { id: 9, name: 'None', icon: '✅' },
];

const HABITS = [
  { id: 1, name: 'Smoking', icon: '🚬' },
  { id: 2, name: 'Heavy Coffee', icon: '☕' },
  { id: 3, name: 'Heavy Tea', icon: '🍵' },
  { id: 4, name: 'Energy Drinks', icon: '⚡' },
  { id: 5, name: 'Soft Drinks', icon: '🥤' },
  { id: 6, name: 'Alcohol', icon: '🍺' },
  { id: 7, name: 'High Sugar Diet', icon: '🍩' },
  { id: 8, name: 'None', icon: '✅' },
];

export default function Step4() {
  const params = useLocalSearchParams();
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [habits, setHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    if (item === 'None') { setList(['None']); return; }
    const f = list.filter(i => i !== 'None');
    setList(f.includes(item) ? f.filter(i => i !== item) : [...f, item]);
  }

  async function finish() {
    setLoading(true);
    const tempData = await AsyncStorage.getItem('sn_temp_user');
    const { name, email } = tempData ? JSON.parse(tempData) : { name: 'User', email: '' };
    const age = parseInt(params.age as string);
    const height = parseInt(params.height as string);
    const weight = parseInt(params.weight as string);
    const gender = params.gender as 'male' | 'female';
    const goal = params.goal as any;
    const activity = params.activity as any;
    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activity);
    const targetCalories = getTargetCalories(tdee, goal);
    await saveProfileLocallyAndPush({
      name, email, age, gender, height, weight, goal, activity,
      conditions: conditions.filter(c => c !== 'None'),
      allergens: allergens.filter(a => a !== 'None'),
      habits: habits.filter(h => h !== 'None'),
      bmi, bmr, tdee, targetCalories
    });
    await upsertOnboardingDataFromProfile({
      name, email, age, gender, height, weight, goal, activity,
      conditions: conditions.filter(c => c !== 'None'),
      allergens: allergens.filter(a => a !== 'None'),
      habits: habits.filter(h => h !== 'None'),
      bmi, bmr, tdee, targetCalories
    });
    await AsyncStorage.removeItem('sn_temp_user');
    setLoading(false);
    router.replace('/health-setup');
  }

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <View style={s.prog}>{[1,2,3,4].map(i => <View key={i} style={[s.step, s.on]} />)}</View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.num}>Step 4 of 4</Text>
        <Text style={s.title}>Health profile ⚕️</Text>
        <Text style={s.sub}>Help us personalize your plan</Text>

        <Text style={s.secLbl}>Health conditions</Text>
        <View style={s.chips}>
          {HEALTH_CONDITIONS.map(c => (
            <TouchableOpacity key={c.id} style={[s.chip, conditions.includes(c.name) && s.chipOn]} onPress={() => toggle(conditions, setConditions, c.name)}>
              <Text style={s.chipIcon}>{c.icon}</Text>
              <Text style={[s.chipTxt, conditions.includes(c.name) && s.chipTxtOn]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.secLbl}>Food allergies</Text>
        <View style={s.chips}>
          {ALLERGENS.map(a => (
            <TouchableOpacity key={a.id} style={[s.chip, allergens.includes(a.name) && s.chipOn]} onPress={() => toggle(allergens, setAllergens, a.name)}>
              <Text style={s.chipIcon}>{a.icon}</Text>
              <Text style={[s.chipTxt, allergens.includes(a.name) && s.chipTxtOn]}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.secLbl}>Daily habits</Text>
        <View style={s.chips}>
          {HABITS.map(h => (
            <TouchableOpacity key={h.id} style={[s.chip, habits.includes(h.name) && s.chipOn]} onPress={() => toggle(habits, setHabits, h.name)}>
              <Text style={s.chipIcon}>{h.icon}</Text>
              <Text style={[s.chipTxt, habits.includes(h.name) && s.chipTxtOn]}>{h.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.btns}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}><Text style={s.backT}>← Back</Text></TouchableOpacity>
          <TouchableOpacity style={s.next} onPress={finish} disabled={loading}>
            <Text style={s.nextT}>{loading ? 'Setting up...' : "Let's go! 🚀"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  prog: { flexDirection: 'row', gap: 6, padding: 24, paddingTop: 60, paddingBottom: 0 },
  step: { flex: 1, height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  on: { backgroundColor: '#E8FF4D' },
  scroll: { padding: 24, paddingTop: 16 },
  num: { fontSize: 12, color: '#555', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 20 },
  secLbl: { fontSize: 11, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  chipOn: { borderColor: '#E8FF4D', backgroundColor: 'rgba(232,255,77,0.08)' },
  chipIcon: { fontSize: 14 },
  chipTxt: { fontSize: 12, color: '#888', fontWeight: '600' },
  chipTxtOn: { color: '#E8FF4D' },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  back: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backT: { fontSize: 15, color: '#888', fontWeight: '600' },
  next: { flex: 2, backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextT: { fontSize: 16, fontWeight: '800', color: '#000' },
});
