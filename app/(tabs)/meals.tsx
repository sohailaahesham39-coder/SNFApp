import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MEALS } from '../../data/localData';
import { UserProfile } from '../../data/userStore';
import { useTheme, useThemeColors } from '../../context/ThemeContext';
import { getMeals } from '../../lib/database';
import { loadProfileSupabaseFirst } from '../../lib/supabaseUserData';
import { buildMedicalMealTimingHints, estimateMacroGap, generatePersonalizedMealPlan, runMealSafetyCheck, swapMealInPlan, type DailyMealPlan, type PlannedMealType } from '../../lib/mealPlanner';

const FILTERS = ['All','Breakfast','Lunch','Dinner','Snack'];
const MEAL_COLORS: Record<string,string> = { Breakfast:'#E8FF4D', Lunch:'#4DFF9E', Dinner:'#9D8FFF', Snack:'#FF9D4D' };

export default function Meals() {
  const { isDark } = useTheme();
  const C = useThemeColors();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<UserProfile|null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<DailyMealPlan | null>(null);
  const [timingHints, setTimingHints] = useState<string[]>([]);

  useEffect(() => {
    loadProfileSupabaseFirst().then(async (p) => {
      setProfile(p);
      if (p) {
        const generated = await generatePersonalizedMealPlan(p).catch(() => null);
        setPlan(generated);
        setTimingHints(buildMedicalMealTimingHints(p, []));
      }
    });
    getMeals().then(data => {
      if (data && data.length > 0) {
        setMeals(data);
      } else {
        setMeals(MEALS);
      }
      setLoading(false);
    }).catch(() => {
      setMeals(MEALS);
      setLoading(false);
    });
  }, []);

  const filtered = meals.filter(m => {
    const mf = filter==='All' || m.meal_type===filter;
    const ms = m.name.toLowerCase().includes(search.toLowerCase()) || m.foods.toLowerCase().includes(search.toLowerCase());
    const ma = !profile?.allergens?.length || profile.allergens.every(a => !m.foods.toLowerCase().includes(a.toLowerCase()));
    const safety = profile ? runMealSafetyCheck(m, profile, []) : { passed: true };
    return mf && ms && ma && safety.passed;
  });

  const planMeals = plan
    ? (Object.entries(plan.meals) as Array<[PlannedMealType, any]>).filter(([, meal]) => !!meal)
    : [];

  const macroGap = profile && plan ? estimateMacroGap(plan, profile) : null;

  async function handleSwap(mealType: PlannedMealType) {
    if (!plan) return;
    const next = await swapMealInPlan(plan, mealType);
    setPlan(next);
  }

  function openShoppingList() {
    if (!plan || plan.shoppingList.length === 0) {
      Alert.alert('Shopping list', 'No items in today shopping list yet.');
      return;
    }
    Alert.alert(
      'Shopping list',
      plan.shoppingList.map((row) => `• ${row.item} x${row.qty}`).join('\n')
    );
  }

  return (
    <SafeAreaView style={[s.container,{backgroundColor:C.bg}]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill}/>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.title,{color:C.text}]}>Meal Plans 🥗</Text>
        <Text style={[s.sub,{color:C.textMuted}]}>Egyptian-inspired, nutrition-optimized</Text>
        {plan && (
          <View style={[s.planCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.planTitle, { color: C.text }]}>Today Personalized Plan</Text>
            <Text style={[s.planSub, { color: C.textMuted }]}>
              {Math.round(plan.totals.calories)} kcal • {Math.round(plan.totals.protein)}g protein • {Math.round(plan.totals.carbs)}g carbs • {Math.round(plan.totals.fat)}g fat
            </Text>
            {macroGap && (
              <Text style={[s.planSub, { color: C.textMuted }]}>
                Gap vs target: {Math.round(macroGap.calories)} kcal, P {Math.round(macroGap.protein)}g, C {Math.round(macroGap.carbs)}g, F {Math.round(macroGap.fat)}g
              </Text>
            )}
            {timingHints.map((h) => (
              <Text key={h} style={[s.hint, { color: C.textMuted }]}>• {h}</Text>
            ))}
            <TouchableOpacity style={[s.shoppingBtn, { borderColor: C.accent + '55' }]} onPress={openShoppingList}>
              <Text style={[s.shoppingBtnT, { color: C.accent }]}>Open shopping list</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[s.searchBox,{backgroundColor:C.bg3,borderColor:C.border}]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={[s.searchInput,{color:C.text}]} value={search} onChangeText={setSearch} placeholder="Search meals..." placeholderTextColor={C.textDim}/>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
          {FILTERS.map(f=>(
            <TouchableOpacity key={f} style={[s.pill,{backgroundColor:filter===f?'#E8FF4D':C.card,borderColor:filter===f?'#E8FF4D':C.border}]} onPress={()=>setFilter(f)}>
              <Text style={[s.pillT,{color:filter===f?'#000':C.textMuted}]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[s.count,{color:C.textDim}]}>{filtered.length} meals found</Text>

        {planMeals.length > 0 && (
          <View style={[s.planCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.planTitle, { color: C.text }]}>Safe for you today</Text>
            {planMeals.map(([mealType, meal]) => (
              <View key={meal.id} style={[s.safeRow, { borderBottomColor: C.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.safeTitle, { color: C.text }]}>{mealType}: {meal.name}</Text>
                  <Text style={[s.safeSub, { color: C.textMuted }]}>
                    ✅ Safety checked • {meal.safetyReasons?.[0] ?? 'Profile-safe'}
                  </Text>
                  {meal.medicationNotes?.map((n: string) => (
                    <Text key={n} style={[s.safeSub, { color: C.warning }]}>⚠ {n}</Text>
                  ))}
                </View>
                <TouchableOpacity style={[s.swapBtn, { borderColor: C.border }]} onPress={() => handleSwap(mealType)}>
                  <Text style={[s.swapBtnT, { color: C.text }]}>Swap</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {filtered.map(meal=>{
          const color = MEAL_COLORS[meal.meal_type]||'#E8FF4D';
          return (
            <TouchableOpacity key={meal.id} style={[s.card,{backgroundColor:C.card,borderColor:C.border}]} onPress={() => router.push({ pathname: '/meal-detail', params: { id: meal.id } })}>
              <View style={s.cardHead}>
                <View style={[s.typePill,{backgroundColor:color+'18'}]}><Text style={[s.typeT,{color}]}>{meal.meal_type}</Text></View>
                <Text style={[s.cals,{color:C.text}]}>{meal.calories} <Text style={[s.calsU,{color:C.textMuted}]}>kcal</Text></Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.mealEmoji}>{meal.emoji}</Text>
                <View style={s.mealInfo}>
                  <Text style={[s.mealName,{color:C.text}]}>{meal.name}</Text>
                  <Text style={[s.mealFoods,{color:C.textMuted}]} numberOfLines={2}>{meal.foods}</Text>
                </View>
              </View>
              <View style={s.macros}>
                {[{lbl:'P',val:meal.protein,color:'#E8FF4D'},{lbl:'C',val:meal.carbs,color:'#4DFF9E'},{lbl:'F',val:meal.fat,color:'#9D8FFF'}].map(m=>(
                  <View key={m.lbl} style={[s.macroChip,{backgroundColor:isDark?'rgba(0,0,0,0.3)':C.bg3}]}>
                    <View style={[s.dot,{backgroundColor:m.color}]}/>
                    <Text style={[s.macroT,{color:C.textMuted}]}>{m.val}g <Text style={{color:C.textDim}}>{m.lbl}</Text></Text>
                  </View>
                ))}
                <View style={[s.macroChip,{backgroundColor:isDark?'rgba(0,0,0,0.3)':C.bg3}]}>
                  <Text style={[s.macroT,{color:C.textMuted}]}>⏱ {meal.prep_time}m</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1},
  scroll:{padding:20,paddingTop:60,paddingBottom:100},
  title:{fontSize:24,fontWeight:'900',marginBottom:4},
  sub:{fontSize:13,marginBottom:16},
  searchBox:{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderRadius:16,paddingHorizontal:14,marginBottom:14},
  searchIcon:{fontSize:16},
  searchInput:{flex:1,paddingVertical:12,fontSize:14},
  filters:{marginBottom:14},
  pill:{paddingHorizontal:14,paddingVertical:7,borderRadius:999,borderWidth:1,marginRight:8},
  pillT:{fontSize:12,fontWeight:'600'},
  count:{fontSize:11,marginBottom:12},
  card:{borderWidth:1,borderRadius:20,padding:16,marginBottom:12},
  planCard:{borderWidth:1,borderRadius:16,padding:14,marginBottom:12},
  planTitle:{fontSize:15,fontWeight:'800',marginBottom:6},
  planSub:{fontSize:12,marginBottom:4},
  hint:{fontSize:12,marginTop:2},
  shoppingBtn:{marginTop:8,borderWidth:1,borderRadius:12,paddingVertical:10,alignItems:'center'},
  shoppingBtnT:{fontSize:13,fontWeight:'700'},
  safeRow:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,borderBottomWidth:1},
  safeTitle:{fontSize:13,fontWeight:'700'},
  safeSub:{fontSize:11,marginTop:2},
  swapBtn:{borderWidth:1,borderRadius:10,paddingHorizontal:10,paddingVertical:8},
  swapBtnT:{fontSize:12,fontWeight:'700'},
  cardHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  typePill:{paddingHorizontal:10,paddingVertical:4,borderRadius:999},
  typeT:{fontSize:11,fontWeight:'700'},
  cals:{fontSize:16,fontWeight:'800'},
  calsU:{fontSize:11,fontWeight:'400'},
  cardBody:{flexDirection:'row',gap:12,marginBottom:12},
  mealEmoji:{fontSize:32},
  mealInfo:{flex:1},
  mealName:{fontSize:14,fontWeight:'700',marginBottom:4},
  mealFoods:{fontSize:12,lineHeight:17},
  macros:{flexDirection:'row',flexWrap:'wrap',gap:6},
  macroChip:{flexDirection:'row',alignItems:'center',gap:4,borderRadius:8,paddingHorizontal:8,paddingVertical:4},
  dot:{width:5,height:5,borderRadius:3},
  macroT:{fontSize:11,fontWeight:'600'},
});