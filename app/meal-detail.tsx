import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, getColors } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Rich meal data with real ingredients + quantities + instructions ──
const MEAL_DETAIL_DATA: Record<string, {
  emoji: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  tips: string;
  warnings?: string[];
}> = {
  MEAL001: {
    emoji: '🫘',
    ingredients: [
      { item: 'Foul medames (cooked fava beans)', amount: '200g' },
      { item: 'Boiled eggs', amount: '2 eggs' },
      { item: 'Brown bread', amount: '2 slices' },
      { item: 'Tomato', amount: '1 medium' },
      { item: 'Cucumber', amount: '½ medium' },
      { item: 'Olive oil', amount: '1 tbsp' },
      { item: 'Lemon juice', amount: '1 tbsp' },
      { item: 'Cumin', amount: '½ tsp' },
    ],
    steps: [
      'Boil eggs for 8–10 minutes, then peel and slice.',
      'Heat foul medames in a pan, add cumin and lemon juice, stir well.',
      'Drizzle 1 tbsp olive oil over the foul.',
      'Slice tomato and cucumber for the salad.',
      'Serve foul with eggs, salad, and brown bread on the side.',
    ],
    tips: 'Add garlic to the foul for extra flavor. Use low-sodium seasoning if you have hypertension.',
    warnings: ['Avoid adding salt if you have hypertension or kidney disease.'],
  },
  MEAL002: {
    emoji: '🥣',
    ingredients: [
      { item: 'Greek yogurt (low-fat)', amount: '150g' },
      { item: 'Rolled oats', amount: '50g (½ cup)' },
      { item: 'Banana', amount: '1 medium' },
      { item: 'Strawberries or berries', amount: '80g' },
      { item: 'Honey', amount: '1 tsp' },
    ],
    steps: [
      'Cook oats with 100ml water or low-fat milk for 3–4 minutes, stirring occasionally.',
      'Slice the banana and wash the berries.',
      'Pour Greek yogurt into a bowl.',
      'Top with oatmeal, banana slices, and berries.',
      'Drizzle 1 tsp honey over the top before serving.',
    ],
    tips: 'Great pre-workout breakfast. Eat 30–60 min before exercise for best energy.',
    warnings: ['Contains dairy — substitute with soy yogurt if lactose intolerant.'],
  },
  MEAL004: {
    emoji: '🍲',
    ingredients: [
      { item: 'Basmati rice', amount: '100g (dry)' },
      { item: 'Brown lentils', amount: '50g' },
      { item: 'Macaroni', amount: '50g' },
      { item: 'Tomato sauce (no salt)', amount: '3 tbsp' },
      { item: 'Chickpeas', amount: '30g' },
      { item: 'Onion (caramelized)', amount: '1 small' },
      { item: 'Olive oil', amount: '1 tsp' },
      { item: 'Vinegar', amount: '1 tsp' },
    ],
    steps: [
      'Cook lentils in boiling water for 20 minutes until soft.',
      'Cook rice separately for 15 minutes.',
      'Boil macaroni for 8 minutes, drain.',
      'Caramelize onion in 1 tsp olive oil until golden brown.',
      'Layer rice, lentils, and macaroni in a bowl.',
      'Top with tomato sauce, chickpeas, caramelized onion, and a splash of vinegar.',
    ],
    tips: 'Use brown rice instead of white for a lower glycemic index.',
    warnings: ['Contains gluten (macaroni). Not suitable for gluten intolerance.'],
  },
  MEAL006: {
    emoji: '🍗',
    ingredients: [
      { item: 'Chicken breast', amount: '150g' },
      { item: 'Brown rice', amount: '80g (dry)' },
      { item: 'Broccoli', amount: '100g' },
      { item: 'Carrots', amount: '50g' },
      { item: 'Zucchini', amount: '50g' },
      { item: 'Olive oil', amount: '1 tbsp' },
      { item: 'Garlic', amount: '2 cloves' },
      { item: 'Black pepper', amount: '½ tsp' },
      { item: 'Lemon juice', amount: '1 tbsp' },
    ],
    steps: [
      'Marinate chicken breast with olive oil, garlic, pepper, and lemon juice for 15 min.',
      'Grill chicken on medium heat for 6–7 minutes each side until fully cooked.',
      'Cook brown rice in 160ml water for 15–18 minutes.',
      'Steam broccoli, carrots, and zucchini for 5–7 minutes until tender.',
      'Slice chicken and serve over rice with vegetables on the side.',
    ],
    tips: 'High protein meal — perfect post-workout. Add chili flakes for metabolism boost.',
    warnings: [],
  },
  MEAL007: {
    emoji: '🐟',
    ingredients: [
      { item: 'Fish fillet (tilapia or sea bass)', amount: '200g' },
      { item: 'Romaine lettuce', amount: '60g' },
      { item: 'Tomato', amount: '1 medium' },
      { item: 'Cucumber', amount: '½ medium' },
      { item: 'Olive oil', amount: '1 tbsp' },
      { item: 'Lemon', amount: '1 whole' },
      { item: 'Garlic powder', amount: '½ tsp' },
      { item: 'Mixed herbs', amount: '1 tsp' },
    ],
    steps: [
      'Preheat oven to 200°C (390°F).',
      'Season fish with garlic powder, herbs, and squeeze of lemon.',
      'Place on baking tray with 1 tbsp olive oil, bake for 18–20 minutes.',
      'Chop lettuce, tomato, and cucumber into a salad bowl.',
      'Dress salad with remaining lemon juice and a drizzle of olive oil.',
      'Serve baked fish alongside the salad.',
    ],
    tips: 'Rich in omega-3 — excellent for heart health. Do not overcook.',
    warnings: ['Contains fish — do not serve to users with fish allergy.'],
  },
  MEAL008: {
    emoji: '🍵',
    ingredients: [
      { item: 'Red lentils', amount: '100g (dry)' },
      { item: 'Onion', amount: '1 medium' },
      { item: 'Garlic', amount: '2 cloves' },
      { item: 'Cumin', amount: '1 tsp' },
      { item: 'Turmeric', amount: '½ tsp' },
      { item: 'Olive oil', amount: '1 tsp' },
      { item: 'Lemon juice', amount: '2 tbsp' },
      { item: 'Water or low-sodium broth', amount: '500ml' },
    ],
    steps: [
      'Rinse lentils thoroughly under cold water.',
      'Sauté diced onion and garlic in olive oil for 3–4 minutes.',
      'Add lentils, cumin, turmeric, and broth/water.',
      'Bring to boil, then simmer on low heat for 20–25 minutes.',
      'Blend until smooth using a hand blender.',
      'Add lemon juice and stir. Serve hot.',
    ],
    tips: 'Very high in fiber and iron. Add a squeeze of lemon to boost iron absorption.',
    warnings: [],
  },
  MEAL009: {
    emoji: '🥬',
    ingredients: [
      { item: 'Molokhia (fresh or frozen)', amount: '200g' },
      { item: 'Grilled chicken breast', amount: '120g' },
      { item: 'Brown rice', amount: '80g (dry)' },
      { item: 'Garlic', amount: '4 cloves' },
      { item: 'Coriander', amount: '1 tsp' },
      { item: 'Low-sodium chicken broth', amount: '200ml' },
      { item: 'Lemon', amount: '1 whole' },
    ],
    steps: [
      'Grill chicken breast with light seasoning, slice when done.',
      'Cook brown rice for 15–18 minutes.',
      'Fry garlic and coriander briefly in a dry pan until fragrant.',
      'Add molokhia to chicken broth, bring to simmer for 5 minutes.',
      'Add garlic-coriander mix to molokhia, stir and serve immediately.',
      'Serve molokhia over rice with chicken on the side and lemon wedge.',
    ],
    tips: 'Molokhia is rich in Vitamin K and iron — great for anemia.',
    warnings: [],
  },
  MEAL010: {
    emoji: '🥜',
    ingredients: [
      { item: 'Hard boiled eggs', amount: '2 eggs' },
      { item: 'Almonds (unsalted)', amount: '20g (15 almonds)' },
      { item: 'Cucumber', amount: '1 medium' },
      { item: 'Cherry tomatoes', amount: '80g' },
    ],
    steps: [
      'Boil eggs for 8–10 minutes, peel and halve.',
      'Measure out 20g of almonds.',
      'Wash and slice cucumber and cherry tomatoes.',
      'Arrange all items in a snack box or plate.',
    ],
    tips: 'Perfect mid-morning or afternoon snack. Keeps blood sugar stable.',
    warnings: ['Contains nuts — avoid if allergic to tree nuts.'],
  },
  MEAL011: {
    emoji: '🥗',
    ingredients: [
      { item: 'Canned tuna in water (drained)', amount: '120g' },
      { item: 'Romaine lettuce', amount: '80g' },
      { item: 'Tomato', amount: '1 medium' },
      { item: 'Cucumber', amount: '½ medium' },
      { item: 'Red onion', amount: '¼ small' },
      { item: 'Olive oil', amount: '1 tbsp' },
      { item: 'Lemon juice', amount: '1 tbsp' },
      { item: 'Black pepper', amount: 'to taste' },
    ],
    steps: [
      'Drain canned tuna well and break into chunks.',
      'Chop lettuce, tomato, cucumber, and red onion.',
      'Combine all vegetables in a large bowl.',
      'Add tuna on top.',
      'Drizzle with olive oil and lemon juice, season with black pepper.',
      'Toss gently and serve immediately.',
    ],
    tips: 'Very quick to prepare. Use olive oil in water tuna for lower fat content.',
    warnings: ['Contains fish — do not serve to users with fish allergy.'],
  },
  MEAL012: {
    emoji: '🥣',
    ingredients: [
      { item: 'Rolled oats', amount: '60g (¾ cup)' },
      { item: 'Low-fat milk or oat milk', amount: '200ml' },
      { item: 'Banana', amount: '1 medium, sliced' },
      { item: 'Fresh berries (blueberries/strawberries)', amount: '80g' },
      { item: 'Honey', amount: '1 tsp' },
    ],
    steps: [
      'Add oats and milk to a small saucepan.',
      'Cook on medium heat for 4–5 minutes, stirring frequently.',
      'Pour into a bowl when creamy and thick.',
      'Top with sliced banana and berries.',
      'Drizzle honey over the top.',
    ],
    tips: 'High fiber breakfast — keeps you full for 3–4 hours.',
    warnings: ['Contains gluten (oats). Use certified gluten-free oats if needed.'],
  },
};

// ── Fallback for meals not in detail data ──
function getFallbackDetail(meal: any) {
  const ingredients = (meal.foods || '').split('+').map((f: string) => ({
    item: f.trim(),
    amount: 'as needed',
  }));
  return {
    emoji: meal.emoji || '🍽️',
    ingredients,
    steps: ingredients.map((ing: any, i: number) =>
      `Step ${i + 1}: Prepare ${ing.item} properly before adding to the dish.`
    ),
    tips: 'Follow standard preparation guidelines for best results.',
    warnings: [],
  };
}

import { MEALS } from '../data/localData';

export default function MealDetail() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const { id } = useLocalSearchParams();
  const meal = MEALS.find(m => m.id === id);
  if (!meal) return null;

  const detail = MEAL_DETAIL_DATA[meal.id as string] || getFallbackDetail(meal);

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <LinearGradient colors={isDark ? ['#050505','#080f06'] : ['#F0F4F0','#FFFFFF']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backT}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Emoji hero */}
        <View style={s.hero}>
          <View style={[s.emojiCircle, { backgroundColor: 'rgba(232,255,77,0.08)', borderColor: 'rgba(232,255,77,0.2)' }]}>
            <Text style={s.heroEmoji}>{detail.emoji}</Text>
          </View>
        </View>

        <Text style={[s.title, { color: C.text }]}>{meal.name}</Text>

        <View style={s.badges}>
          <View style={[s.badge, { backgroundColor: 'rgba(232,255,77,0.12)' }]}>
            <Text style={[s.badgeT, { color: '#E8FF4D' }]}>{meal.meal_type}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: 'rgba(77,255,158,0.12)' }]}>
            <Text style={[s.badgeT, { color: '#4DFF9E' }]}>{meal.difficulty}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Text style={[s.badgeT, { color: C.textMuted }]}>⏱ {meal.prep_time} min</Text>
          </View>
        </View>

        {/* Nutrition */}
        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.secTitle, { color: C.textMuted }]}>NUTRITION INFO</Text>
          <View style={s.macroGrid}>
            {[
              { lbl: 'Calories', val: meal.calories, unit: 'kcal', color: '#E8FF4D' },
              { lbl: 'Protein',  val: meal.protein,  unit: 'g',    color: '#E8FF4D' },
              { lbl: 'Carbs',    val: meal.carbs,    unit: 'g',    color: '#4DFF9E' },
              { lbl: 'Fat',      val: meal.fat,       unit: 'g',    color: '#9D8FFF' },
            ].map(m => (
              <View key={m.lbl} style={[s.macroItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : C.bg3 }]}>
                <Text style={[s.macroVal, { color: m.color }]}>{m.val}</Text>
                <Text style={[s.macroUnit, { color: C.textMuted }]}>{m.unit}</Text>
                <Text style={[s.macroLbl, { color: C.textMuted }]}>{m.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warnings */}
        {detail.warnings && detail.warnings.length > 0 && (
          <View style={[s.warnCard, { backgroundColor: 'rgba(255,107,107,0.06)', borderColor: 'rgba(255,107,107,0.2)' }]}>
            <Text style={[s.warnTitle, { color: '#FF6B6B' }]}>⚠️ Warnings</Text>
            {detail.warnings.map((w, i) => (
              <Text key={i} style={[s.warnItem, { color: '#FF6B6B' }]}>• {w}</Text>
            ))}
          </View>
        )}

        {/* Ingredients with quantities */}
        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.secTitle, { color: C.textMuted }]}>INGREDIENTS</Text>
          {detail.ingredients.map((ing, i) => (
            <View key={i} style={[s.ingRow, { borderBottomColor: C.border }]}>
              <View style={s.bullet} />
              <Text style={[s.ingName, { color: C.text }]}>{ing.item}</Text>
              <View style={[s.amountBadge, { backgroundColor: 'rgba(232,255,77,0.08)' }]}>
                <Text style={s.amountT}>{ing.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Real preparation steps */}
        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.secTitle, { color: C.textMuted }]}>HOW TO PREPARE</Text>
          {detail.steps.map((step, i) => (
            <View key={i} style={[s.stepRow, { borderBottomColor: C.border }]}>
              <View style={s.stepNum}><Text style={s.stepNumT}>{i + 1}</Text></View>
              <Text style={[s.stepT, { color: C.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={[s.tipCard, { backgroundColor: 'rgba(77,255,158,0.06)', borderColor: 'rgba(77,255,158,0.15)' }]}>
          <Text style={[s.tipTitle, { color: '#4DFF9E' }]}>💡 Chef's Tip</Text>
          <Text style={[s.tipText, { color: C.textMuted }]}>{detail.tips}</Text>
        </View>

        {/* Suitable for */}
        {meal.conditions_suitable.length > 0 && (
          <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.secTitle, { color: C.textMuted }]}>SUITABLE FOR</Text>
            <View style={s.tags}>
              {meal.conditions_suitable.map(c => (
                <View key={c} style={[s.tag, { backgroundColor: 'rgba(77,255,158,0.08)', borderColor: 'rgba(77,255,158,0.2)' }]}>
                  <Text style={[s.tagT, { color: '#4DFF9E' }]}>✓ {c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={s.logBtn}>
          <Text style={s.logBtnT}>+ Log this meal</Text>
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
  hero: { alignItems: 'center', marginBottom: 16 },
  emojiCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  badgeT: { fontSize: 12, fontWeight: '700' },
  section: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 },
  secTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  macroGrid: { flexDirection: 'row', gap: 8 },
  macroItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  macroVal: { fontSize: 18, fontWeight: '900' },
  macroUnit: { fontSize: 9 },
  macroLbl: { fontSize: 9, textAlign: 'center' },
  warnCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  warnTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  warnItem: { fontSize: 12, lineHeight: 20 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E8FF4D' },
  ingName: { fontSize: 13, fontWeight: '500', flex: 1 },
  amountBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountT: { fontSize: 12, color: '#E8FF4D', fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(232,255,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  stepNumT: { fontSize: 13, fontWeight: '800', color: '#E8FF4D' },
  stepT: { fontSize: 13, flex: 1, lineHeight: 20, color: '#ccc' },
  tipCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  tipTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  tipText: { fontSize: 13, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  tagT: { fontSize: 12, fontWeight: '600' },
  logBtn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  logBtnT: { fontSize: 16, fontWeight: '800', color: '#000' },
});