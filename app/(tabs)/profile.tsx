import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, Dimensions, ActivityIndicator, Modal,
  TextInput, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  clearProfile, UserProfile, getBMICategory,
  calculateBMI, calculateBMR, calculateTDEE, getTargetCalories,
} from '../../data/userStore';
import { saveProfileLocallyAndPush } from '../../lib/profileSupabase';
import { useTheme, useThemeColors, type LightAccentPreset } from '../../context/ThemeContext';
import { LIGHT_PALETTE } from '../../constants/lightPalette';
import { runMLEngine, MLSummary } from '../../data/mlEngine';
import { generateHabitPlan, HabitPlan, HABIT_QUESTIONS } from '../../data/habitPlan';
import { signOutRemoteSessions } from '../../lib/sessionCleanup';
import { loadProfileSupabaseFirst, upsertOnboardingDataFromProfile } from '../../lib/supabaseUserData';
import { supabase } from '../../lib/supabase';
import { type UserHealthPlanRow } from '../../lib/healthPlans';
import { cancelAllLocalNotifications } from '../../lib/localNotifications';
import { clearPushTokenOnLogout } from '../../lib/pushNotifications';

const { width } = Dimensions.get('window');

// ── Symptom data (inline) ─────────────────────────────────────
const SYMPTOM_CATEGORIES = [
  {
    id: 'brain', label: 'Brain & Focus', icon: '🧠', color: '#9D8FFF',
    symptoms: [
      { id: 's1', arabic: 'دوخة أو اضطراب توازن' },
      { id: 's2', arabic: 'ضعف تركيز وشرود' },
      { id: 's3', arabic: 'نسيان ومشاكل ذاكرة' },
      { id: 's4', arabic: 'صداع متكرر' },
      { id: 's5', arabic: 'ذهن ضبابي غير صافي' },
    ],
  },
  {
    id: 'energy', label: 'Energy & Sleep', icon: '⚡', color: '#E8FF4D',
    symptoms: [
      { id: 's6',  arabic: 'إرهاق مزمن طول اليوم' },
      { id: 's7',  arabic: 'بصحى من النوم تعبان' },
      { id: 's8',  arabic: 'خمول شديد بعد الأكل' },
      { id: 's9',  arabic: 'تقلبات مزاج وعصبية' },
      { id: 's10', arabic: 'قلق أو أعراض اكتئاب' },
    ],
  },
  {
    id: 'hair', label: 'Hair & Skin', icon: '💇', color: '#FF9D4D',
    symptoms: [
      { id: 's11', arabic: 'تساقط شعر شديد ومستمر' },
      { id: 's12', arabic: 'بشرة جافة وبتتقشر' },
      { id: 's13', arabic: 'أظافر هشة وبتتكسر' },
      { id: 's14', arabic: 'بشرة شاحبة وبلا إشراقة' },
      { id: 's15', arabic: 'الجروح بتتأخر في الشفاء' },
    ],
  },
  {
    id: 'muscles', label: 'Muscles & Bones', icon: '🦴', color: '#4DFF9E',
    symptoms: [
      { id: 's16', arabic: 'تشنجات عضلية مؤلمة' },
      { id: 's17', arabic: 'آلام في المفاصل' },
      { id: 's18', arabic: 'ألم في العظام أو ضعفها' },
      { id: 's19', arabic: 'ضعف عام في العضلات' },
      { id: 's20', arabic: 'تحريك رجلين لا إرادي في الليل' },
    ],
  },
];

const DEFICIENCY_RULES = [
  { nutrient: 'Vitamin D3', emoji: '☀️', symptom_ids: ['s6','s7','s9','s10','s17','s18','s4'], daily_dose: '2000–4000 IU/day', best_time: 'مع أكبر وجبة', warning: 'اعمل تحليل 25-OH Vitamin D الأول', egyptian_foods: ['سمك مملح','بيض كامل','كبدة','جبن رومي'], foods_emoji: ['🐟','🥚','🫀','🧀'], supplement_note: 'D3 + K2 مع بعض أحسن' },
  { nutrient: 'Vitamin B12', emoji: '🔴', symptom_ids: ['s1','s2','s3','s5','s6','s7','s14','s19'], daily_dose: '1000 mcg/day', best_time: 'صبح على معدة فاضية', warning: 'ممكن يحتاج حقن — اعمل تحليل', egyptian_foods: ['كبدة بقري','بيض','جبن قريش','سردين'], foods_emoji: ['🫀','🥚','🧀','🐟'], supplement_note: 'Methylcobalamin أفضل' },
  { nutrient: 'Iron', emoji: '🩸', symptom_ids: ['s1','s6','s7','s11','s14','s19','s4'], daily_dose: '18–27 mg/day', best_time: 'مع فيتامين C — قبل الأكل', warning: 'اعمل CBC وferritin الأول', egyptian_foods: ['كبدة','لحمة حمراء','فول مدمس','عدس'], foods_emoji: ['🫀','🥩','🫘','🌿'], supplement_note: 'خد مع عصير برتقان' },
  { nutrient: 'Magnesium', emoji: '⚡', symptom_ids: ['s9','s10','s16','s17','s20','s4','s8'], daily_dose: '300–400 mg/day', best_time: 'الليل قبل النوم', warning: 'ابدأ بـ 200mg — الزيادة إسهال', egyptian_foods: ['لوز','طحينة','عدس','فول','موز'], foods_emoji: ['🌰','🫙','🌿','🫘','🍌'], supplement_note: 'Magnesium Glycinate أفضل' },
  { nutrient: 'Zinc', emoji: '🦪', symptom_ids: ['s11','s13','s15','s19','s7'], daily_dose: '15–25 mg/day', best_time: 'مع الأكل', warning: 'مش تزيد عن 40mg يومياً', egyptian_foods: ['لحمة حمراء','كبدة','بذور قرع','بيض'], foods_emoji: ['🥩','🫀','🌻','🥚'], supplement_note: 'Zinc Picolinate أحسن امتصاصاً' },
  { nutrient: 'Omega-3', emoji: '🐟', symptom_ids: ['s2','s5','s9','s10','s12','s17'], daily_dose: '1000–2000 mg/day', best_time: 'مع وجبة دسمة', warning: 'مميعات دم — استشر طبيب', egyptian_foods: ['سمك بلطي','سردين','تونة','جوز'], foods_emoji: ['🐟','🐟','🥫','🌰'], supplement_note: 'High EPA للمزاج، DHA للمخ' },
  { nutrient: 'Biotin (B7)', emoji: '💇', symptom_ids: ['s11','s12','s13'], daily_dose: '2500–5000 mcg/day', best_time: 'أي وقت', warning: 'بيأثر على تحاليل الغدة — قول للدكتور', egyptian_foods: ['بيض (الصفار)','كبدة','لوز','جبن قريش'], foods_emoji: ['🥚','🫀','🌰','🧀'], supplement_note: 'النتيجة بعد 3-6 أشهر' },
];

function analyzeSymptoms(selectedIds: string[]) {
  return DEFICIENCY_RULES.map(rule => {
    const matched = rule.symptom_ids.filter(id => selectedIds.includes(id));
    const confidence = Math.round((matched.length / rule.symptom_ids.length) * 100);
    return { ...rule, confidence, symptoms_matched: matched };
  }).filter(r => r.confidence > 0).sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

// ── Sections ──────────────────────────────────────────────────
type Section = 'stats' | 'insights' | 'habits' | 'symptoms' | 'settings';

const GOALS: UserProfile['goal'][] = ['Weight Loss', 'Muscle Gain', 'Maintain'];
const ACTIVITIES: UserProfile['activity'][] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export default function Profile() {
  const { isDark, toggleTheme, lightAccent, setLightAccent } = useTheme();
  const C = useThemeColors();
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('stats');
  const [ml, setML]               = useState<MLSummary | null>(null);
  const [habitPlans, setHabitPlans] = useState<HabitPlan[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomResults, setSymptomResults]     = useState<any[]>([]);
  const [analyzedSymptoms, setAnalyzedSymptoms] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis]   = useState(false);
  const [activeDeficiency, setActiveDeficiency] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [planHistory, setPlanHistory] = useState<UserHealthPlanRow[]>([]);
  const [editDraft, setEditDraft] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male' as 'male' | 'female',
    goal: 'Maintain' as UserProfile['goal'],
    activity: 'moderate' as UserProfile['activity'],
  });

  function openEditProfile() {
    if (!profile) return;
    setEditDraft({
      name: profile.name,
      email: profile.email,
      age: String(profile.age),
      weight: String(profile.weight),
      height: String(profile.height),
      gender: profile.gender,
      goal: profile.goal,
      activity: profile.activity,
    });
    setShowEditProfile(true);
  }

  async function saveEditedProfile() {
    if (!profile) return;
    const w = parseFloat(editDraft.weight.replace(',', '.'));
    const h = parseFloat(editDraft.height.replace(',', '.'));
    const ag = parseInt(editDraft.age, 10);
    if (
      !editDraft.name.trim() ||
      !editDraft.email.trim() ||
      Number.isNaN(w) ||
      Number.isNaN(h) ||
      Number.isNaN(ag)
    ) {
      Alert.alert('Check fields', 'Please fill name, email, age, height, and weight with valid numbers.');
      return;
    }
    if (ag < 10 || ag > 120 || h < 50 || h > 260 || w < 20 || w > 400) {
      Alert.alert('Check values', 'Age, height, or weight looks out of range.');
      return;
    }
    const bmi = calculateBMI(w, h);
    const bmr = calculateBMR(w, h, ag, editDraft.gender);
    const tdee = calculateTDEE(bmr, editDraft.activity);
    const targetCalories = getTargetCalories(tdee, editDraft.goal);
    const next: UserProfile = {
      ...profile,
      name: editDraft.name.trim(),
      email: editDraft.email.trim(),
      age: ag,
      gender: editDraft.gender,
      weight: w,
      height: h,
      goal: editDraft.goal,
      activity: editDraft.activity,
      bmi,
      bmr,
      tdee,
      targetCalories,
    };
    await saveProfileLocallyAndPush(next);
    await upsertOnboardingDataFromProfile(next);
    setProfile(next);
    const mlResult = runMLEngine({
      weight: next.weight,
      targetCalories: next.targetCalories,
      goal: next.goal,
      activity: next.activity,
      age: next.age,
      bmi: next.bmi,
      conditions: next.conditions ?? [],
    });
    setML(mlResult);
    setShowEditProfile(false);
  }

  useFocusEffect(useCallback(() => {
    loadProfileSupabaseFirst().then(p => {
      if (!p) return;
      setProfile(p);
      const mlResult = runMLEngine({
        weight: p.weight, targetCalories: p.targetCalories,
        goal: p.goal, activity: p.activity, age: p.age,
        bmi: p.bmi, conditions: p.conditions ?? [],
      });
      setML(mlResult);
      const habits = (p as any).habits ?? [];
      const plans = habits
        .filter((h: string) => h !== 'None' && HABIT_QUESTIONS[h])
        .map((h: string) => {
          const q = HABIT_QUESTIONS[h];
          const mid = q.options[Math.floor(q.options.length / 2)];
          return generateHabitPlan(h, mid.value);
        });
      setHabitPlans(plans);
      if (plans.length > 0) setSelectedHabit(plans[0].habitName);
    });
    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;
      const { data: rows } = await supabase
        .from('user_health_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      setPlanHistory((rows as UserHealthPlanRow[]) ?? []);
    });
  }, []));

  async function handleExportData() {
    try {
      const profile = await loadProfileSupabaseFirst();
      if (!profile) return;

      const dataToExport = {
        profile,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const payload = JSON.stringify(dataToExport, null, 2);
      await Share.share({
        title: 'Smart Nutrition export',
        message: payload.length > 12000 ? `${payload.slice(0, 12000)}\n\n… (truncated for share)` : payload,
      }).catch(() => {
        Alert.alert(
          'Export Data',
          'Sharing failed. Copy from logs or try again.',
          [{ text: 'OK' }]
        );
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllLocalNotifications();
              await clearPushTokenOnLogout();
              await signOutRemoteSessions();
              await AsyncStorage.clear();
              Alert.alert(
                'Local data cleared',
                'Signed out and removed data from this device. Delete the Supabase user from the Dashboard if needed.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }],
              );
            } catch {
              Alert.alert('Error', 'Could not finish sign-out. Try again.');
            }
          },
        },
      ]
    );
  }

  async function handleLogout() {
    Alert.alert(
      'Logout?',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllLocalNotifications();
              await clearPushTokenOnLogout();
              await signOutRemoteSessions();
              await AsyncStorage.clear();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  }

  function toggleSymptom(id: string) {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setAnalyzedSymptoms(false);
  }

  function runSymptomAnalysis() {
    if (selectedSymptoms.length === 0) return;
    setLoadingAnalysis(true);
    setTimeout(() => {
      const r = analyzeSymptoms(selectedSymptoms);
      setSymptomResults(r);
      setAnalyzedSymptoms(true);
      setActiveDeficiency(r[0]?.nutrient ?? null);
      setLoadingAnalysis(false);
    }, 1000);
  }

  if (!profile) return (
    <View style={[s.container, { backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator color={C.accent} />
    </View>
  );

  const bmiCat = getBMICategory(profile.bmi);
  const currentHabitPlan = habitPlans.find(p => p.habitName === selectedHabit);
  const weekPlan = currentHabitPlan?.weeklyPlans.find(w => w.week === activeWeek);
  const activeDeficiencyData = symptomResults.find(r => r.nutrient === activeDeficiency);

  const SECTIONS: { id: Section; icon: string; label: string }[] = [
    { id: 'stats',    icon: '📊', label: 'Stats'    },
    { id: 'insights', icon: '🧠', label: 'AI'       },
    { id: 'habits',   icon: '💪', label: 'Habits'   },
    { id: 'symptoms', icon: '🔬', label: 'Health'   },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.avatarSec}>
          <View style={[s.avatarRing, { backgroundColor: C.accent + '22' }]}>
            <View style={[s.avatar, { backgroundColor: C.accent + '15' }]}>
              <Text style={[s.avatarT, { color: C.accent }]}>{profile.name.charAt(0)}</Text>
            </View>
          </View>
          <Text style={[s.pName, { color: C.text }]}>{profile.name}</Text>
          <Text style={[s.pEmail, { color: C.textMuted }]}>{profile.email}</Text>
          <View style={[s.goalBadge, { borderColor: C.border, backgroundColor: C.accent + '14' }]}> 
            <Text style={[s.goalBadgeT, { color: C.accent }]}>{profile.goal}</Text>
          </View>
        </View>

        <View style={s.sectionTabs}>
          {SECTIONS.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[
                s.secTab,
                {
                  backgroundColor: activeSection === section.id ? C.card : 'transparent',
                  borderColor: activeSection === section.id ? C.accent : C.border,
                },
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Text style={[s.secTabIcon, { color: C.text }]}>{section.icon}</Text>
              <Text style={[s.secTabLabel, { color: C.text }]}>{section.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === 'stats' && (
          <>
            <View style={s.statsRow}>
              <View style={[s.statCard, { borderColor: C.border }]}> 
                <Text style={[s.statVal, { color: C.text }]}>{profile.bmi.toFixed(1)}</Text>
                <Text style={[s.statLbl, { color: C.textMuted }]}>BMI</Text>
              </View>
              <View style={[s.statCard, { borderColor: C.border }]}> 
                <Text style={[s.statVal, { color: C.text }]}>{profile.tdee}</Text>
                <Text style={[s.statLbl, { color: C.textMuted }]}>TDEE</Text>
              </View>
            </View>
            <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}> 
              <Text style={[s.cardLbl, { color: C.text }]}>Body Status</Text>
              <View style={s.metricRow}>
                <Text style={[s.metricIcon, { color: C.text }]}>⚖️</Text>
                <Text style={[s.metricLbl, { color: C.text }]}>Weight</Text>
                <Text style={[s.metricVal, { color: C.text }]}>{profile.weight} kg</Text>
              </View>
              <View style={s.metricRow}>
                <Text style={[s.metricIcon, { color: C.text }]}>📏</Text>
                <Text style={[s.metricLbl, { color: C.text }]}>Height</Text>
                <Text style={[s.metricVal, { color: C.text }]}>{profile.height} cm</Text>
              </View>
              <View style={s.metricRow}>
                <Text style={[s.metricIcon, { color: C.text }]}>💤</Text>
                <Text style={[s.metricLbl, { color: C.text }]}>{profile.activity}</Text>
                <Text style={[s.metricVal, { color: C.text }]}>{bmiCat.label}</Text>
              </View>
            </View>
            <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}>
              <Text style={[s.cardLbl, { color: C.text }]}>Plan History</Text>
              {planHistory.length === 0 ? (
                <Text style={[s.resultSub, { color: C.textMuted, paddingHorizontal: 16, paddingBottom: 16 }]}>
                  No saved plans yet.
                </Text>
              ) : (
                planHistory.slice(0, 5).map((plan) => (
                  <View key={plan.id} style={s.metricRow}>
                    <Text style={[s.metricIcon, { color: C.text }]}>📌</Text>
                    <Text style={[s.metricLbl, { color: C.text }]}>{plan.plan_type}</Text>
                    <Text style={[s.metricVal, { color: C.textMuted }]}>{plan.status}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {activeSection === 'insights' && (
          <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}> 
            <Text style={[s.cardLbl, { color: C.text }]}>AI Summary</Text>
            {ml ? (
              <>
                <View style={s.metricRow}>
                  <Text style={[s.metricIcon, { color: C.text }]}>📈</Text>
                  <Text style={[s.metricLbl, { color: C.text }]}>Predicted</Text>
                  <Text style={[s.metricVal, { color: C.text }]}>{ml.weightPrediction.predictedWeight} kg</Text>
                </View>
                <Text style={[s.metricLbl, { color: C.text }]}>{ml.dietClassification.dietType}</Text>
                <Text style={[s.metricVal, { color: C.textMuted }]}>{ml.dietClassification.description}</Text>
              </>
            ) : (
              <Text style={[s.emptySub, { color: C.textMuted }]}>Loading AI insights...</Text>
            )}
          </View>
        )}

        {activeSection === 'habits' && (
          currentHabitPlan ? (
            <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}> 
              <Text style={[s.cardLbl, { color: C.text }]}>{currentHabitPlan.habitName}</Text>
              <View style={s.metricRow}>
                <Text style={[s.metricIcon, { color: C.text }]}>{currentHabitPlan.icon}</Text>
                <Text style={[s.metricLbl, { color: C.text }]}>{currentHabitPlan.currentAmount} {currentHabitPlan.unit}</Text>
              </View>
              <View style={[s.predRow, { backgroundColor: C.bg }]}> 
                <Text style={[s.predVal, { color: C.text }]}>{weekPlan ? weekPlan.target : '—'}</Text>
                <Text style={[s.predLbl, { color: C.textMuted }]}>This week</Text>
              </View>
              {currentHabitPlan.alternatives.map((alt, index) => (
                <View key={index} style={[s.catCard, { borderColor: C.border, backgroundColor: C.bg }]}> 
                  <View style={s.catHeader2}>
                    <Text style={[s.catIcon2, { color: C.text }]}>{alt.emoji}</Text>
                    <Text style={[s.catLabel2, { color: C.text }]}>{alt.name}</Text>
                  </View>
                  <Text style={[s.resultSub, { color: C.textMuted }]}>{alt.benefit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.emptyState}>
              <Text style={[s.emptyEmoji, { color: C.text }]}>🤍</Text>
              <Text style={[s.emptyTitle, { color: C.text }]}>No habits found</Text>
              <Text style={[s.emptySub, { color: C.textMuted }]}>Add habits in your profile to see your plan.</Text>
            </View>
          )
        )}

        {activeSection === 'symptoms' && (
          <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}> 
            <Text style={[s.cardLbl, { color: C.text }]}>Symptom analysis</Text>
            {SYMPTOM_CATEGORIES.map(cat => (
              <View key={cat.id} style={s.catCard}>
                <View style={s.catHeader2}>
                  <Text style={[s.catIcon2, { color: C.text }]}>{cat.icon}</Text>
                  <Text style={[s.catLabel2, { color: C.text }]}>{cat.label}</Text>
                </View>
                {cat.symptoms.map(sym => (
                  <TouchableOpacity
                    key={sym.id}
                    style={[
                      s.symptomRow2,
                      {
                        borderColor: C.border,
                        backgroundColor: selectedSymptoms.includes(sym.id) ? C.accent2 + '22' : C.bg,
                      },
                    ]}
                    onPress={() => toggleSymptom(sym.id)}
                  >
                    <Text style={[s.symptomAr2, { color: C.text }]}>{sym.arabic}</Text>
                    <Text style={[s.metricVal, { color: C.text }]}>{selectedSymptoms.includes(sym.id) ? '✓' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <TouchableOpacity
              style={[s.analyzeBtn, { backgroundColor: C.accent }]}
              onPress={runSymptomAnalysis}
            >
              {loadingAnalysis ? (
                <ActivityIndicator color={C.onAccent} />
              ) : (
                <Text style={[s.analyzeBtnT, { color: C.onAccent }]}>Analyze Symptoms</Text>
              )}
            </TouchableOpacity>
            {analyzedSymptoms && activeDeficiencyData ? (
              <View style={s.resultHeader}>
                <Text style={[s.resultTitle, { color: C.text }]}>{activeDeficiencyData.emoji} {activeDeficiencyData.nutrient}</Text>
                <Text style={[s.resultSub, { color: C.textMuted }]}>Detected with {activeDeficiencyData.confidence}% confidence. Daily dose {activeDeficiencyData.daily_dose}.</Text>
              </View>
            ) : null}
          </View>
        )}

        {activeSection === 'settings' && (
  <>
    {/* Appearance */}
    <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[s.cardTitle, { color: C.text }]}>Appearance</Text>
      <View style={[s.settingRow, { borderBottomColor: C.border }]}>
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>{isDark ? '🌙' : '☀️'}</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Dark mode</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={() => toggleTheme()}
          trackColor={{ false: LIGHT_PALETTE.mint + '88', true: '#333' }}
          thumbColor={isDark ? C.accent : LIGHT_PALETTE.pear}
        />
      </View>
      {!isDark && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Text style={[s.accentHint, { color: C.textMuted }]}>
            Light theme accents (Crema and Mint stay as base; pick primary highlight):
          </Text>
          <View style={s.accentRow}>
            {(
              [
                { id: 'pear' as LightAccentPreset, label: 'Pear', color: LIGHT_PALETTE.pear },
                { id: 'tomato' as LightAccentPreset, label: 'Tomato', color: LIGHT_PALETTE.tomato },
                { id: 'mint' as LightAccentPreset, label: 'Mint', color: LIGHT_PALETTE.mint },
              ] as const
            ).map(opt => {
              const sel = lightAccent === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    s.accentChip,
                    {
                      borderColor: sel ? opt.color : C.border,
                      backgroundColor: sel ? opt.color + '28' : 'transparent',
                    },
                  ]}
                  onPress={() => setLightAccent(opt.id)}
                >
                  <View style={[s.accentSwatch, { backgroundColor: opt.color }]} />
                  <Text style={[s.accentChipLbl, { color: C.text }]}>{opt.label}</Text>
                  {sel ? <Text style={{ color: opt.color }}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={s.paletteLegend}>
            <Text style={[s.paletteLegendT, { color: C.textDim }]}>Pear {LIGHT_PALETTE.pear}</Text>
            <Text style={[s.paletteLegendT, { color: C.textDim }]}>Tomato {LIGHT_PALETTE.tomato}</Text>
          </View>
          <View style={s.paletteLegend}>
            <Text style={[s.paletteLegendT, { color: C.textDim }]}>Crema {LIGHT_PALETTE.crema}</Text>
            <Text style={[s.paletteLegendT, { color: C.textDim }]}>Mint {LIGHT_PALETTE.mint}</Text>
          </View>
        </View>
      )}
    </View>

    {/* Profile (edit / save flow) */}
    <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[s.cardTitle, { color: C.text }]}>My profile</Text>
      <Text style={[s.cardSub, { color: C.textMuted }]}>
        Tap Edit to change your details; use Save in the editor to store them on this device.
      </Text>
      <TouchableOpacity
        style={[s.btnSolid, { backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }]}
        onPress={() => router.push('/notifications-settings')}
      >
        <Text style={[s.btnSolidTxt, { color: C.text }]}>Notification settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.btnSolid, { backgroundColor: C.accent }]}
        onPress={openEditProfile}
      >
        <Text style={[s.btnSolidTxt, { color: C.onAccent }]}>Edit profile</Text>
      </TouchableOpacity>
    </View>

    {/* App & legal */}
    <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[s.cardTitle, { color: C.text }]}>App & Legal</Text>
      
      <TouchableOpacity 
        style={[s.settingRow, { borderBottomColor: C.border }]}
        onPress={() => setShowPrivacyPolicy(true)}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>🔒</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Privacy Policy</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[s.settingRow, { borderBottomColor: C.border }]}
        onPress={() => setShowTerms(true)}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>📜</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Terms & Conditions</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[s.settingRow, { borderBottomColor: C.border }]}
        onPress={() => setShowAbout(true)}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>ℹ️</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>About App</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[s.settingRow, { borderBottomColor: C.border }]}
        onPress={() => setShowHelp(true)}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>❓</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Help & FAQ</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[s.settingRow, { borderBottomWidth: 0 }]}
        onPress={() => {
          Alert.alert(
            'App Version',
            'Smart Nutrition & Fitness v1.0.0\n\nBuilt with love by Team SNF\nCIC Graduation Project 2025',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>📱</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Version</Text>
        </View>
        <Text style={[s.settingValue, { color: C.textMuted }]}>1.0.0</Text>
      </TouchableOpacity>
    </View>

    {/* Data Management */}
    <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[s.cardTitle, { color: C.text }]}>Data Management</Text>
      
      <TouchableOpacity 
        style={[s.settingRow, { borderBottomColor: C.border }]}
        onPress={handleExportData}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>📤</Text>
          <Text style={[s.settingLabel, { color: C.text }]}>Export My Data</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[s.settingRow, { borderBottomWidth: 0 }]}
        onPress={handleDeleteAccount}
      >
        <View style={s.settingLeft}>
          <Text style={s.settingIcon}>🗑️</Text>
          <Text style={[s.settingLabel, { color: C.danger }]}>Delete Account</Text>
        </View>
        <Text style={[s.settingArrow, { color: C.textMuted }]}>›</Text>
      </TouchableOpacity>
    </View>

    {/* Logout */}
    <TouchableOpacity
      style={[s.logoutBtn, { backgroundColor: C.danger + '22', borderColor: C.danger + '55' }]}
      onPress={handleLogout}
    >
      <Text style={[s.logoutText, { color: C.danger }]}>Logout</Text>
    </TouchableOpacity>

    {/* Privacy Policy Modal */}
    <Modal visible={showPrivacyPolicy} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modalContainer, { backgroundColor: C.bg }]} edges={['top']}>
        <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[s.modalTitle, { color: C.text }]}>Privacy Policy</Text>
          <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
            <Text style={[s.modalClose, { color: C.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalContent}>
          <Text style={[s.modalText, { color: C.text }]}>
            <Text style={{ fontWeight: '800' }}>Effective Date:</Text> January 2025{'\n\n'}

            <Text style={{ fontWeight: '800' }}>1. Information We Collect{'\n'}</Text>
            We collect information you provide directly to us, including:{'\n'}
            • Personal information (name, age, gender, height, weight){'\n'}
            • Health data (chronic conditions, symptoms, lab test results){'\n'}
            • Dietary preferences and meal logs{'\n'}
            • Exercise data and fitness goals{'\n'}
            • Chat conversations with our AI assistant{'\n\n'}

            <Text style={{ fontWeight: '800' }}>2. How We Use Your Information{'\n'}</Text>
            We use your information to:{'\n'}
            • Provide personalized nutrition and fitness recommendations{'\n'}
            • Generate health analysis reports and lab test suggestions{'\n'}
            • Track your progress toward your health goals{'\n'}
            • Improve our AI models and app features{'\n\n'}

            <Text style={{ fontWeight: '800' }}>3. Data Storage & Security{'\n'}</Text>
            • All data is encrypted in transit and at rest{'\n'}
            • We use Supabase for secure cloud storage{'\n'}
            • Health data is stored in compliance with HIPAA guidelines{'\n'}
            • We never sell your personal information to third parties{'\n\n'}

            <Text style={{ fontWeight: '800' }}>4. Your Rights{'\n'}</Text>
            You have the right to:{'\n'}
            • Access your personal data at any time{'\n'}
            • Export your data in a portable format{'\n'}
            • Request deletion of your account and all associated data{'\n'}
            • Opt out of data collection for AI training{'\n\n'}

            <Text style={{ fontWeight: '800' }}>5. Third-Party Services{'\n'}</Text>
            We use the following third-party services:{'\n'}
            • Supabase (database hosting){'\n'}
            • Anthropic Claude API (AI chat assistance){'\n'}
            • Expo (app framework){'\n\n'}

            <Text style={{ fontWeight: '800' }}>6. Contact Us{'\n'}</Text>
            If you have questions about this Privacy Policy, please contact us:{'\n'}
            • Email: privacy@snfapp.com{'\n'}
            • Team: CIC Graduation Project 2025{'\n'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>

    {/* Terms & Conditions Modal */}
    <Modal visible={showTerms} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modalContainer, { backgroundColor: C.bg }]} edges={['top']}>
        <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[s.modalTitle, { color: C.text }]}>Terms & Conditions</Text>
          <TouchableOpacity onPress={() => setShowTerms(false)}>
            <Text style={[s.modalClose, { color: C.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalContent}>
          <Text style={[s.modalText, { color: C.text }]}>
            <Text style={{ fontWeight: '800' }}>Last updated:</Text> January 2025{'\n\n'}

            <Text style={{ fontWeight: '800' }}>1. Agreement{'\n'}</Text>
            By using Smart Nutrition & Fitness (&quot;SNF&quot;, &quot;the App&quot;) you agree to these Terms and
            Conditions. If you disagree, please do not use the App.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>2. Not medical advice{'\n'}</Text>
            SNF provides general wellness information only. It does not replace diagnosis or treatment by a
            licensed healthcare professional. Always consult your doctor before changing diet, exercise, or
            supplements—especially if you are pregnant, nursing, or have a medical condition.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>3. Use of the App{'\n'}</Text>
            You agree to use the App lawfully and not to misuse or attempt to reverse engineer it. You are
            responsible for the accuracy of information you enter.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>4. Accounts & data{'\n'}</Text>
            You are responsible for safeguarding your device and any sign-in methods you use. You may export or
            request deletion of local data as described in the Privacy Policy where applicable.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>5. Third-party services{'\n'}</Text>
            The App may rely on third-party providers (e.g. authentication, analytics, or AI APIs). Their terms
            may also apply.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>6. Limitation of liability{'\n'}</Text>
            To the maximum extent permitted by law, the SNF team is not liable for any indirect or consequential
            damages arising from your use of the App.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>7. Contact{'\n'}</Text>
            Questions about these terms: legal@snfapp.com (placeholder — replace with your official contact).
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>

    {/* Edit profile Modal */}
    <Modal visible={showEditProfile} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={[s.modalContainer, { backgroundColor: C.bg }]} edges={['top']}>
          <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
            <View style={s.modalHeaderSide}>
              <TouchableOpacity onPress={() => setShowEditProfile(false)} hitSlop={12}>
                <Text style={[s.modalClose, { color: C.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.modalTitle, { color: C.text, flex: 2, textAlign: 'center' }]}>Edit profile</Text>
            <View style={[s.modalHeaderSide, { alignItems: 'flex-end' }]}>
              <TouchableOpacity onPress={saveEditedProfile} hitSlop={12}>
                <Text style={[s.modalClose, { color: C.accent }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={s.editScroll} keyboardShouldPersistTaps="handled">
            <Text style={[s.editLbl, { color: C.textMuted }]}>Name</Text>
            <TextInput
              style={[s.editInput, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
              value={editDraft.name}
              onChangeText={t => setEditDraft(prev => ({ ...prev, name: t }))}
              placeholder="Your name"
              placeholderTextColor={C.textDim}
            />
            <Text style={[s.editLbl, { color: C.textMuted }]}>Email</Text>
            <TextInput
              style={[s.editInput, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
              value={editDraft.email}
              onChangeText={t => setEditDraft(prev => ({ ...prev, email: t }))}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              placeholderTextColor={C.textDim}
            />
            <Text style={[s.editLbl, { color: C.textMuted }]}>Age</Text>
            <TextInput
              style={[s.editInput, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
              value={editDraft.age}
              onChangeText={t => setEditDraft(prev => ({ ...prev, age: t }))}
              keyboardType="number-pad"
              placeholder="Years"
              placeholderTextColor={C.textDim}
            />
            <View style={s.genderRow}>
              <TouchableOpacity
                style={[
                  s.genderChip,
                  { borderColor: C.border, backgroundColor: editDraft.gender === 'male' ? C.accent + '44' : C.card },
                ]}
                onPress={() => setEditDraft(prev => ({ ...prev, gender: 'male' }))}
              >
                <Text style={[s.genderChipT, { color: C.text }]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.genderChip,
                  { borderColor: C.border, backgroundColor: editDraft.gender === 'female' ? C.accent + '44' : C.card },
                ]}
                onPress={() => setEditDraft(prev => ({ ...prev, gender: 'female' }))}
              >
                <Text style={[s.genderChipT, { color: C.text }]}>Female</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.editLbl, { color: C.textMuted }]}>Height (cm)</Text>
            <TextInput
              style={[s.editInput, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
              value={editDraft.height}
              onChangeText={t => setEditDraft(prev => ({ ...prev, height: t }))}
              keyboardType="decimal-pad"
            />
            <Text style={[s.editLbl, { color: C.textMuted }]}>Weight (kg)</Text>
            <TextInput
              style={[s.editInput, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
              value={editDraft.weight}
              onChangeText={t => setEditDraft(prev => ({ ...prev, weight: t }))}
              keyboardType="decimal-pad"
            />
            <Text style={[s.editLbl, { color: C.textMuted }]}>Goal</Text>
            <View style={s.chipWrap}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    s.goalChip,
                    {
                      borderColor: C.border,
                      backgroundColor: editDraft.goal === g ? C.accent + '55' : C.card,
                    },
                  ]}
                  onPress={() => setEditDraft(prev => ({ ...prev, goal: g }))}
                >
                  <Text style={[s.goalChipT, { color: C.text }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.editLbl, { color: C.textMuted }]}>Activity level</Text>
            <View style={s.chipWrap}>
              {ACTIVITIES.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[
                    s.goalChip,
                    {
                      borderColor: C.border,
                      backgroundColor: editDraft.activity === a ? C.accent + '55' : C.card,
                    },
                  ]}
                  onPress={() => setEditDraft(prev => ({ ...prev, activity: a }))}
                >
                  <Text style={[s.goalChipT, { color: C.text }]}>{a.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>

    {/* About Modal */}
    <Modal visible={showAbout} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modalContainer, { backgroundColor: C.bg }]} edges={['top']}>
        <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[s.modalTitle, { color: C.text }]}>About App</Text>
          <TouchableOpacity onPress={() => setShowAbout(false)}>
            <Text style={[s.modalClose, { color: C.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalContent}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 64, marginBottom: 12 }}>🥗</Text>
            <Text style={[{ fontSize: 24, fontWeight: '900', color: C.text, marginBottom: 4 }]}>
              Smart Nutrition & Fitness
            </Text>
            <Text style={[{ fontSize: 16, color: C.textMuted }]}>Version 1.0.0</Text>
          </View>

          <Text style={[s.modalText, { color: C.text }]}>
            <Text style={{ fontWeight: '800' }}>About This App{'\n'}</Text>
            Smart Nutrition & Fitness (SNF) is your personal AI-powered health companion. We combine advanced machine learning with personalized nutrition and fitness guidance to help you achieve your health goals.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Key Features:{'\n'}</Text>
            • AI-powered meal recommendations{'\n'}
            • Personalized workout plans{'\n'}
            • Health analysis and deficiency detection{'\n'}
            • Lab test planning and interpretation{'\n'}
            • Habit reduction programs{'\n'}
            • 10-day safe health plans{'\n'}
            • Real-time chat with AI nutritionist{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Development Team:{'\n'}</Text>
            • Team Leader: Mariam Rabea{'\n'}
            • Team Size: 7 members{'\n'}
            • Supervisor: Dr. Eman Elsayed{'\n'}
            • Teaching Assistant: Yomna Eldeeb{'\n'}
            • Institution: CIC (Canadian International College){'\n'}
            • Project: Graduation Project 2025{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Technology Stack:{'\n'}</Text>
            • React Native with Expo{'\n'}
            • Supabase (Backend & Database){'\n'}
            • Anthropic Claude API (AI Chat){'\n'}
            • Machine Learning (KNN, Linear Regression, Decision Trees){'\n\n'}

            <Text style={{ fontWeight: '800' }}>Contact Us:{'\n'}</Text>
            • Email: support@snfapp.com{'\n'}
            • GitHub: github.com/snf-team{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Credits:{'\n'}</Text>
            Built with ❤️ in Egypt 🇪🇬{'\n'}
            © 2025 SNF Team. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>

    {/* Help & FAQ Modal */}
    <Modal visible={showHelp} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modalContainer, { backgroundColor: C.bg }]} edges={['top']}>
        <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[s.modalTitle, { color: C.text }]}>Help & FAQ</Text>
          <TouchableOpacity onPress={() => setShowHelp(false)}>
            <Text style={[s.modalClose, { color: C.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalContent}>
          <Text style={[s.modalText, { color: C.text }]}>
            <Text style={{ fontWeight: '800', fontSize: 18 }}>Frequently Asked Questions{'\n\n'}</Text>

            <Text style={{ fontWeight: '800' }}>Q: How does the AI meal recommendation work?{'\n'}</Text>
            A: We use K-Nearest Neighbors (KNN) machine learning to analyze your profile (age, weight, goal, activity level) and recommend meals similar to what worked for users with similar profiles.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: Is my health data safe?{'\n'}</Text>
            A: Yes! All data is encrypted and stored securely in Supabase. We never sell your data to third parties. See our Privacy Policy for details.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: Can I use the app offline?{'\n'}</Text>
            A: Most features work offline. However, AI chat requires internet connection to access Claude API.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: How accurate are the lab test recommendations?{'\n'}</Text>
            A: Our recommendations are based on medical guidelines and your symptoms/conditions. However, always consult with a licensed doctor before making health decisions.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: Can I track multiple health conditions?{'\n'}</Text>
            A: Yes! You can add as many chronic conditions as needed in your Health Profile. The app will personalize recommendations accordingly.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: How do I log meals?{'\n'}</Text>
            A: Go to Meals tab → Browse recipes → Tap a meal → Press "Log this meal" button. It will be added to your daily tracking.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: What should I do if the app crashes?{'\n'}</Text>
            A: Try these steps:{'\n'}
            1. Force close and restart the app{'\n'}
            2. Check for app updates{'\n'}
            3. Clear app cache in device settings{'\n'}
            4. If issue persists, email support@snfapp.com{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: Can I change my goal (lose/maintain/gain)?{'\n'}</Text>
            A: Yes! Go to Profile → Edit Profile → Update your goal. The app will recalculate your calorie target.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: How do I export my data?{'\n'}</Text>
            A: Go to Profile → Settings → Export My Data. You'll receive a JSON file with all your data.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Q: Is the app free?{'\n'}</Text>
            A: Yes! SNF is completely free with no ads or subscriptions.{'\n\n'}

            <Text style={{ fontWeight: '800' }}>Need More Help?{'\n'}</Text>
            Email us at: support@snfapp.com{'\n'}
            We typically respond within 24-48 hours.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>
)}

        <Text style={[s.footer, { color: C.textMuted }]}>Quick health check, AI insights, and habit support.{"\n"}Use the tabs above to switch sections.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1},
  scroll:{padding:20,paddingTop:60,paddingBottom:100},
  avatarSec:{alignItems:'center',marginBottom:20},
  avatarRing:{width:84,height:84,borderRadius:42,padding:2,backgroundColor:'rgba(232,255,77,0.2)',marginBottom:12},
  avatar:{flex:1,borderRadius:40,backgroundColor:'rgba(232,255,77,0.1)',alignItems:'center',justifyContent:'center'},
  avatarT:{fontSize:32,fontWeight:'900',color:'#E8FF4D'},
  pName:{fontSize:22,fontWeight:'800',marginBottom:4},
  pEmail:{fontSize:13,marginBottom:10},
  goalBadge:{backgroundColor:'rgba(232,255,77,0.1)',borderWidth:1,borderColor:'rgba(232,255,77,0.2)',borderRadius:999,paddingHorizontal:14,paddingVertical:5},
  goalBadgeT:{fontSize:12,color:'#E8FF4D',fontWeight:'700'},
  sectionTabs:{marginBottom:20},
  secTab:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,paddingVertical:10,borderRadius:999,borderWidth:1,marginRight:8},
  secTabIcon:{fontSize:14},
  secTabLabel:{fontSize:12,fontWeight:'700'},
  statsRow:{flexDirection:'row',gap:10,marginBottom:16},
  statCard:{flex:1,borderWidth:1,borderRadius:16,padding:14,alignItems:'center',gap:4},
  statVal:{fontSize:18,fontWeight:'900'},
  statLbl:{fontSize:10,textTransform:'uppercase',letterSpacing:0.5},
  secTitle:{fontSize:11,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10},
  card:{borderWidth:1,borderRadius:20,overflow:'hidden',marginBottom:14},
  cardLbl:{fontSize:10,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,padding:16,paddingBottom:0},
  cardTitle:{fontSize:16,fontWeight:'800',marginBottom:12,padding:16,paddingBottom:0},
  settingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,borderBottomWidth:1},
  settingLeft:{flexDirection:'row',alignItems:'center',gap:10,flex:1},
  settingIcon:{fontSize:18},
  settingLabel:{fontSize:14,fontWeight:'600',flex:1},
  settingArrow:{fontSize:24,lineHeight:24},
  settingValue:{fontSize:13,fontWeight:'600'},
  modalContainer:{flex:1},
  modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,borderBottomWidth:1},
  modalTitle:{fontSize:18,fontWeight:'800'},
  modalClose:{fontSize:16,fontWeight:'700'},
  modalContent:{padding:16,paddingBottom:32},
  modalHeaderSide:{flex:1},
  modalText:{fontSize:14,lineHeight:22},
  accentHint:{fontSize:12,lineHeight:18,marginBottom:10},
  accentRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},
  accentChip:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,paddingHorizontal:12,borderRadius:14,borderWidth:1,marginBottom:6},
  accentSwatch:{width:22,height:22,borderRadius:8,borderWidth:1,borderColor:'rgba(0,0,0,0.06)'},
  accentChipLbl:{fontSize:13,fontWeight:'700'},
  paletteLegend:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:4},
  paletteLegendT:{fontSize:10,fontWeight:'600'},
  cardSub:{fontSize:12,lineHeight:18,marginBottom:14,paddingHorizontal:16},
  btnSolid:{borderRadius:14,paddingVertical:14,alignItems:'center',marginHorizontal:16,marginBottom:16},
  btnSolidTxt:{fontSize:15,fontWeight:'800'},
  editScroll:{padding:16,paddingBottom:40},
  editLbl:{fontSize:11,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6,marginTop:10},
  editInput:{borderWidth:1,borderRadius:12,paddingHorizontal:14,paddingVertical:12,fontSize:15},
  genderRow:{flexDirection:'row',gap:10,marginBottom:8},
  genderChip:{flex:1,paddingVertical:12,borderRadius:12,borderWidth:1,alignItems:'center'},
  genderChipT:{fontSize:14,fontWeight:'700'},
  chipWrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},
  goalChip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,borderWidth:1},
  goalChipT:{fontSize:12,fontWeight:'600'},
  metricRow:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderBottomWidth:1},
  metricIcon:{fontSize:18,width:24,textAlign:'center'},
  metricLbl:{fontSize:13},
  metricVal:{fontSize:13,fontWeight:'700'},
  tags:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16},
  condTag:{backgroundColor:'rgba(77,255,158,0.08)',borderWidth:1,borderColor:'rgba(77,255,158,0.2)',borderRadius:999,paddingHorizontal:12,paddingVertical:5},
  condTagT:{fontSize:12,color:'#4DFF9E',fontWeight:'600'},
  allergenTag:{backgroundColor:'rgba(255,107,107,0.08)',borderWidth:1,borderColor:'rgba(255,107,107,0.2)',borderRadius:999,paddingHorizontal:12,paddingVertical:5},
  allergenTagT:{fontSize:12,color:'#FF6B6B',fontWeight:'600'},
  algRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14},
  algBadge:{borderWidth:1,borderRadius:999,paddingHorizontal:12,paddingVertical:5},
  algBadgeT:{fontSize:11,fontWeight:'700'},
  predRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-around',padding:16,paddingTop:0},
  predItem:{alignItems:'center'},
  predVal:{fontSize:22,fontWeight:'900'},
  predLbl:{fontSize:11,marginTop:2},
  predArrow:{fontSize:20},
  changeBadge:{borderRadius:12,paddingHorizontal:12,paddingVertical:8},
  dietHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,paddingBottom:0},
  dietType:{fontSize:15,fontWeight:'900',flex:1},
  confBadge:{borderRadius:999,paddingHorizontal:10,paddingVertical:4},
  dietDesc:{fontSize:13,paddingHorizontal:16,paddingVertical:8},
  dietReason:{fontSize:12,fontStyle:'italic',paddingHorizontal:16,paddingBottom:16},
  macroTrack:{height:6,borderRadius:6,overflow:'hidden'},
  macroFill:{height:'100%',borderRadius:6},
  knnRow:{flexDirection:'row',alignItems:'center',gap:10,padding:16,borderBottomWidth:1},
  knnRank:{fontSize:16,fontWeight:'900',width:28},
  knnName:{fontSize:13,fontWeight:'700',marginBottom:2},
  knnMeta:{fontSize:11},
  scoreBadge:{borderRadius:8,paddingHorizontal:10,paddingVertical:6,alignItems:'center'},
  scoreN:{fontSize:13,fontWeight:'900',color:'#E8FF4D'},
  twoCol:{flexDirection:'row',gap:10,marginBottom:14},
  halfCard:{flex:1,borderWidth:1,borderRadius:16,padding:12},
  halfTitle:{fontSize:12,fontWeight:'800',marginBottom:8},
  foodItem:{fontSize:12,marginBottom:4},
  habitTab:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,paddingVertical:10,borderRadius:999,borderWidth:1,marginRight:8},
  habitTabIcon:{fontSize:16},
  habitTabT:{fontSize:12,fontWeight:'700'},
  statusRow2:{flexDirection:'row',alignItems:'center',justifyContent:'space-around',padding:16,paddingTop:0},
  statusItem2:{alignItems:'center',gap:2},
  statusNum:{fontSize:28,fontWeight:'900'},
  statusLbl2:{fontSize:11},
  statusDesc:{fontSize:10},
  riskCard:{borderWidth:1,borderRadius:16,padding:14,marginBottom:14},
  riskTitle:{fontSize:13,fontWeight:'800',marginBottom:8},
  riskItem:{fontSize:12,lineHeight:22},
  weekRow2:{flexDirection:'row',gap:10,marginBottom:14},
  weekBtn:{flex:1,paddingVertical:12,alignItems:'center',borderRadius:14,borderWidth:1},
  weekBtnT:{fontSize:13,fontWeight:'800'},
  weekTargetNum:{fontSize:28,fontWeight:'900'},
  reductionBadge:{borderRadius:12,paddingHorizontal:12,paddingVertical:8},
  replaceTitle:{fontSize:12,fontWeight:'800',marginBottom:6,paddingHorizontal:16},
  replaceText:{fontSize:14,fontWeight:'600',paddingHorizontal:16,paddingBottom:8},
  tipsTitle2:{fontSize:12,fontWeight:'800',marginBottom:6,paddingHorizontal:16},
  tipItem:{fontSize:13,lineHeight:22,paddingHorizontal:16,paddingBottom:4},
  altGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:16},
  altCard:{width:(width-50)/2,borderWidth:1,borderRadius:16,padding:14,gap:6},
  altEmoji:{fontSize:28},
  altName:{fontSize:13,fontWeight:'700'},
  altBenefit:{fontSize:11,lineHeight:16},
  disclaimer:{borderWidth:1,borderRadius:14,padding:12,marginBottom:16},
  disclaimerT:{fontSize:12,lineHeight:18},
  catCard:{borderWidth:1,borderRadius:20,padding:16,marginBottom:12},
  catHeader2:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
  catIcon2:{fontSize:20},
  catLabel2:{fontSize:14,fontWeight:'800',flex:1},
  countBadge:{borderRadius:999,paddingHorizontal:10,paddingVertical:4},
  countT:{fontSize:11,fontWeight:'700'},
  symptomRow2:{flexDirection:'row',alignItems:'center',gap:10,padding:10,borderRadius:12,borderWidth:1,marginBottom:6},
  checkbox:{width:22,height:22,borderRadius:6,borderWidth:2,alignItems:'center',justifyContent:'center'},
  checkmark:{fontSize:12,color:'#000',fontWeight:'900'},
  symptomAr2:{fontSize:13,fontWeight:'600',flex:1},
  analyzeBtn:{backgroundColor:'#E8FF4D',borderRadius:16,paddingVertical:16,alignItems:'center',marginTop:8,marginBottom:20},
  analyzeBtnT:{fontSize:16,fontWeight:'800',color:'#000'},
  resultHeader:{borderWidth:1,borderRadius:16,padding:14,marginBottom:14},
  resultTitle:{fontSize:15,fontWeight:'800',marginBottom:4},
  resultSub:{fontSize:12},
  defTab:{alignItems:'center',paddingHorizontal:14,paddingVertical:10,borderRadius:16,borderWidth:1,marginRight:8,minWidth:70},
  defTabEmoji:{fontSize:18,marginBottom:2},
  defTabName:{fontSize:11,fontWeight:'700'},
  defTabConf:{fontSize:10},
  defName:{fontSize:18,fontWeight:'900',marginBottom:2},
  confBar:{height:8,borderRadius:8,overflow:'hidden',marginBottom:14},
  confFill:{height:'100%',borderRadius:8},
  supNote:{borderWidth:1,borderRadius:12,padding:10,marginTop:10},
  warnCard:{borderWidth:1,borderRadius:14,padding:12,marginBottom:14},
  foodGrid2:{flexDirection:'row',flexWrap:'wrap',gap:8,padding:16,paddingTop:0},
  foodCard2:{borderWidth:1,borderRadius:12,padding:10,alignItems:'center',gap:4,minWidth:(width-90)/3},
  resetBtn:{borderWidth:1,borderRadius:14,paddingVertical:14,alignItems:'center',marginBottom:14},
  resetT:{fontSize:14,fontWeight:'600'},
  healthBtn:{borderWidth:1,borderRadius:16,paddingVertical:14,alignItems:'center',marginBottom:12},
  healthBtnT:{fontSize:15,fontWeight:'700'},
  logoutBtn:{backgroundColor:'rgba(255,107,107,0.08)',borderWidth:1,borderColor:'rgba(255,107,107,0.2)',borderRadius:16,paddingVertical:14,alignItems:'center',marginBottom:20},
  logoutT:{fontSize:15,fontWeight:'700',color:'#FF6B6B'},
  logoutText:{fontSize:15,fontWeight:'700',color:'#FFF'},
  footer:{textAlign:'center',fontSize:11,lineHeight:18},
  arrow2:{fontSize:18},
  emptyState:{alignItems:'center',paddingVertical:60},
  emptyEmoji:{fontSize:64,marginBottom:16},
  emptyTitle:{fontSize:22,fontWeight:'900',marginBottom:8},
  emptySub:{fontSize:14,textAlign:'center',lineHeight:22},
});
