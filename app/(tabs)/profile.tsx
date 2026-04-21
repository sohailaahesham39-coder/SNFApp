import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, Dimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { loadProfile, clearProfile, UserProfile, getBMICategory } from '../../data/userStore';
import { useTheme, getColors } from '../../context/ThemeContext';
import { runMLEngine, MLSummary } from '../../data/mlEngine';
import { generateHabitPlan, HabitPlan, HABIT_QUESTIONS } from '../../data/habitPlan';

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

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();
  const C = getColors(isDark);
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

  useFocusEffect(useCallback(() => {
    loadProfile().then(p => {
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
  }, []));

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await clearProfile(); router.replace('/(auth)/welcome'); } },
    ]);
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
      <ActivityIndicator color="#E8FF4D" />
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
      <LinearGradient
        colors={isDark ? ['#050505', '#080f06'] : ['#F0F4F0', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.avatarSec}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarT}>{profile.name.charAt(0)}</Text>
            </View>
          </View>
          <Text style={[s.pName, { color: C.text }]}>{profile.name}</Text>
          <Text style={[s.pEmail, { color: C.textMuted }]}>{profile.email}</Text>
          <View style={[s.goalBadge, { borderColor: C.border }]}> 
            <Text style={s.goalBadgeT}>{profile.goal}</Text>
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
            <TouchableOpacity style={s.analyzeBtn} onPress={runSymptomAnalysis}>
              {loadingAnalysis ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.analyzeBtnT}>Analyze Symptoms</Text>
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
          <View style={[s.card, { borderColor: C.border, backgroundColor: C.bg2 }]}> 
            <Text style={[s.cardLbl, { color: C.text }]}>Settings</Text>
            <View style={s.metricRow}>
              <Text style={[s.metricLbl, { color: C.text }]}>Dark mode</Text>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutT}>Logout</Text>
            </TouchableOpacity>
          </View>
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
  logoutBtn:{backgroundColor:'rgba(255,107,107,0.08)',borderWidth:1,borderColor:'rgba(255,107,107,0.2)',borderRadius:16,paddingVertical:14,alignItems:'center',marginBottom:20},
  logoutT:{fontSize:15,fontWeight:'700',color:'#FF6B6B'},
  footer:{textAlign:'center',fontSize:11,lineHeight:18},
  arrow2:{fontSize:18},
  emptyState:{alignItems:'center',paddingVertical:60},
  emptyEmoji:{fontSize:64,marginBottom:16},
  emptyTitle:{fontSize:22,fontWeight:'900',marginBottom:8},
  emptySub:{fontSize:14,textAlign:'center',lineHeight:22},
});