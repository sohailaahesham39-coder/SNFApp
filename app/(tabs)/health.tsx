import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useTheme, useThemeColors } from '../../context/ThemeContext';
import { loadProfileSupabaseFirst } from '../../lib/supabaseUserData';
import {
  generateDeficiencyAnalysisSheet,
  generateLabTestPlan,
  generateHabitReductionPlan,
  generate10DayPlan,
  analyzeCompliance,
} from '../../data/healthEngine';
import { normalizeHealthDrinks, normalizedHabitsList } from '../../lib/healthDrinks';
import { supabase } from '../../lib/supabase';
import {
  saveUserHabitPlan,
  saveUserLabPlan,
  saveUserVitaminPlan,
  saveUserWaterPlan,
} from '../../lib/healthPlans';

type Section = 'overview' | 'analysis' | 'labs' | 'plan' | 'supplements';

export default function HealthTab() {
  const { isDark } = useTheme();
  const C = useThemeColors();
  
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [profile, setProfile] = useState<any>(null);
  
  // Analysis results
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [labPlan, setLabPlan] = useState<any>(null);
  const [habitPlan, setHabitPlan] = useState<any>(null);
  const [safePlan, setSafePlan] = useState<any>(null);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  async function loadData() {
    const p = await loadProfileSupabaseFirst();
    if (!p) {
      Alert.alert('Setup Required', 'Please complete health profile setup first.', [
        { text: 'Setup Now', onPress: () => router.push('/health-setup') },
      ]);
      return;
    }
    setProfile(p);

    // Generate analysis
    const conditions = (p as any).healthConditions || [];
    const symptoms = (p as any).healthSymptoms || [];
    const habits = normalizedHabitsList((p as any).healthHabits);
    const drinksObj = normalizeHealthDrinks((p as any).healthDrinks);

    // Deficiency analysis
    const defAnalysis = await generateDeficiencyAnalysisSheet(
      conditions,
      symptoms,
      [...habits, ...Object.keys(drinksObj)],
      p.age,
      p.gender
    );
    setDeficiencies(defAnalysis);

    // Lab test plan
    const labs = await generateLabTestPlan(
      conditions,
      symptoms,
      habits,
      p.age,
      p.gender
    );
    setLabPlan(labs);

    // Habit reduction (example: coffee if present)
    const coffeeCups = drinksObj.coffee ?? 0;
    if (coffeeCups > 2) {
      const habit = await generateHabitReductionPlan(
        'drink_coffee',
        coffeeCups,
        conditions,
        symptoms
      );
      setHabitPlan(habit);
    }

    // 10-day safe plan
    const plan = generate10DayPlan(
      conditions,
      defAnalysis.slice(0, 2).map(d => d.nutrient.toLowerCase().replace(' ', '_'))
    );
    setSafePlan(plan);

    // Persist generated plans to user_health_plans
    const authUser = await supabase.auth.getUser();
    const userId = authUser.data.user?.id;
    if (userId) {
      if (defAnalysis.length > 0) await saveUserVitaminPlan(userId, defAnalysis.slice(0, 3));
      if (labs?.totalTests > 0) await saveUserLabPlan(userId, [...labs.urgent, ...labs.high, ...labs.medium]);
      if (coffeeCups > 2) {
        const generatedHabit = await generateHabitReductionPlan('drink_coffee', coffeeCups, conditions, symptoms);
        await saveUserHabitPlan(userId, 'drink_coffee', generatedHabit);
      }
      const weight = typeof (p as any).weight === 'number' ? (p as any).weight : 70;
      const waterGoal = Math.max(1800, Math.round(weight * 35));
      await saveUserWaterPlan(userId, waterGoal, ['08:00', '12:30', '17:00', '20:30']);
    }
  }

  if (!profile) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
        <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏥</Text>
          <Text style={[{ fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 8, textAlign: 'center' }]}>
            Health Profile Setup Required
          </Text>
          <Text style={[{ fontSize: 14, color: C.textMuted, marginBottom: 24, textAlign: 'center' }]}>
            Complete your health profile to get personalized recommendations
          </Text>
          <TouchableOpacity
            style={[{ backgroundColor: C.accent, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 }]}
            onPress={() => router.push('/health-setup')}
          >
            <Text style={[{ fontSize: 16, fontWeight: '700', color: C.onAccent }]}>Start Setup →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sections = [
    { id: 'overview' as Section,     icon: '📊', label: 'Overview' },
    { id: 'analysis' as Section,     icon: '🔬', label: 'Analysis' },
    { id: 'labs' as Section,         icon: '🧪', label: 'Lab Tests' },
    { id: 'plan' as Section,         icon: '📋', label: '10-Day Plan' },
    { id: 'supplements' as Section,  icon: '💊', label: 'Supplements' },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: C.text }]}>Health Center</Text>
        <Text style={[s.subtitle, { color: C.textMuted }]}>Your personalized health plan</Text>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
        {sections.map(sec => (
          <TouchableOpacity
            key={sec.id}
            style={[s.tab, {
              backgroundColor: activeSection === sec.id ? C.accent : C.card,
              borderColor: activeSection === sec.id ? C.accent : C.border,
            }]}
            onPress={() => setActiveSection(sec.id)}
          >
            <Text style={s.tabIcon}>{sec.icon}</Text>
            <Text style={[s.tabLabel, { color: activeSection === sec.id ? C.onAccent : C.textMuted }]}>
              {sec.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ═══════════════════════════════════════════════════════
            SECTION: OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        {activeSection === 'overview' && (
          <>
            <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.cardTitle, { color: C.text }]}>Health Summary</Text>
              <View style={s.statRow}>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: C.accent }]}>
                    {(profile as any).healthConditions?.length || 0}
                  </Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>Conditions</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: C.accent2 }]}>
                    {deficiencies.length}
                  </Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>Possible Deficiencies</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: C.accent3 }]}>
                    {labPlan?.totalTests || 0}
                  </Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>Tests Needed</Text>
                </View>
              </View>
            </View>

            {deficiencies.length > 0 && (
              <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[s.cardTitle, { color: C.text }]}>Top Concerns</Text>
                {deficiencies.slice(0, 3).map((def, i) => (
                  <View key={i} style={[s.concernRow, { borderBottomColor: C.border }]}>
                    <Text style={s.concernIcon}>{def.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.concernName, { color: C.text }]}>{def.nutrient}</Text>
                      <Text style={[s.concernConf, { color: C.textMuted }]}>
                        {def.confidence}% confidence
                      </Text>
                    </View>
                    <View style={[s.badge, { 
                      backgroundColor: def.riskLevel === 'lab_required_first' ? '#FF6B6B20' : '#4DFF9E20' 
                    }]}>
                      <Text style={[s.badgeText, { 
                        color: def.riskLevel === 'lab_required_first' ? '#FF6B6B' : '#4DFF9E' 
                      }]}>
                        {def.riskLevel === 'lab_required_first' ? 'Lab First' : 'Safe'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: C.accent }]}
              onPress={() => setActiveSection('analysis')}
            >
              <Text style={[s.actionBtnText, { color: C.onAccent }]}>
                View Full Analysis →
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION: ANALYSIS (DEFICIENCY SHEETS)
        ═══════════════════════════════════════════════════════ */}
        {activeSection === 'analysis' && deficiencies.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: C.textMuted }]}>
              DEFICIENCY ANALYSIS REPORT
            </Text>
            
            {deficiencies.map((def, idx) => (
              <View key={idx} style={[s.analysisCard, { backgroundColor: C.card, borderColor: C.border }]}>
                {/* Header */}
                <View style={s.analysisHeader}>
                  <Text style={{ fontSize: 32 }}>{def.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[s.analysisTitle, { color: C.text }]}>{def.nutrient}</Text>
                    <Text style={[s.analysisBasis, { color: C.textMuted }]}>
                      {def.scientificBasis}
                    </Text>
                  </View>
                  <View style={[s.confBadge, { backgroundColor: C.accent + '20' }]}>
                    <Text style={[s.confText, { color: C.accent }]}>{def.confidence}%</Text>
                  </View>
                </View>

                {/* Matched Symptoms */}
                <View style={[s.section, { borderTopColor: C.border }]}>
                  <Text style={[s.sectionLabel, { color: C.textMuted }]}>MATCHED SYMPTOMS</Text>
                  {def.matchedSymptoms.map((sym: any, i: number) => (
                    <Text key={i} style={[s.symptomText, { color: C.text }]}>
                      • {sym.name}
                    </Text>
                  ))}
                </View>

                {/* Risk Level */}
                <View style={[s.section, { borderTopColor: C.border }]}>
                  <Text style={[s.sectionLabel, { color: C.textMuted }]}>RISK LEVEL</Text>
                  <View style={[s.riskBadge, { 
                    backgroundColor: def.riskLevel === 'lab_required_first' ? '#FF6B6B20' : 
                                   def.riskLevel === 'caution' ? '#FF9D4D20' : '#4DFF9E20',
                    borderColor: def.riskLevel === 'lab_required_first' ? '#FF6B6B' : 
                                def.riskLevel === 'caution' ? '#FF9D4D' : '#4DFF9E',
                  }]}>
                    <Text style={[s.riskText, { 
                      color: def.riskLevel === 'lab_required_first' ? '#FF6B6B' : 
                            def.riskLevel === 'caution' ? '#FF9D4D' : '#4DFF9E' 
                    }]}>
                      {def.riskLevel === 'lab_required_first' ? '⚠️ LAB TEST REQUIRED FIRST' :
                       def.riskLevel === 'caution' ? '⚠️ CAUTION - Monitor Closely' :
                       '✅ SAFE TO START'}
                    </Text>
                  </View>
                </View>

                {/* Supplement (if safe) */}
                {def.supplement && (
                  <View style={[s.section, { borderTopColor: C.border }]}>
                    <Text style={[s.sectionLabel, { color: C.textMuted }]}>SAFE SUPPLEMENT</Text>
                    <Text style={[s.supName, { color: C.text }]}>{def.supplement.name}</Text>
                    <View style={s.supDetail}>
                      <Text style={[s.supLabel, { color: C.textMuted }]}>Dose:</Text>
                      <Text style={[s.supValue, { color: C.text }]}>{def.supplement.dose}</Text>
                    </View>
                    <View style={s.supDetail}>
                      <Text style={[s.supLabel, { color: C.textMuted }]}>Timing:</Text>
                      <Text style={[s.supValue, { color: C.text }]}>{def.supplement.timing}</Text>
                    </View>
                    <View style={s.supDetail}>
                      <Text style={[s.supLabel, { color: C.textMuted }]}>Duration:</Text>
                      <Text style={[s.supValue, { color: C.text }]}>{def.supplement.duration}</Text>
                    </View>
                  </View>
                )}

                {/* Lab Tests */}
                <View style={[s.section, { borderTopColor: C.border }]}>
                  <Text style={[s.sectionLabel, { color: C.textMuted }]}>RECOMMENDED LAB TESTS</Text>
                  {def.labTests.map((lab: any, i: number) => (
                    <View key={i} style={[s.labItem, { backgroundColor: C.bg, borderColor: C.border }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={[s.labName, { color: C.text }]}>{lab.name}</Text>
                        <Text style={[s.labCost, { color: C.accent }]}>{lab.cost}</Text>
                      </View>
                      <Text style={[s.labWhy, { color: C.textMuted }]}>Why: {lab.why}</Text>
                      <Text style={[s.labWhen, { color: C.textMuted }]}>When: {lab.when}</Text>
                      {lab.fasting && (
                        <Text style={[s.labFasting, { color: '#FF9D4D' }]}>⚠️ Fasting required</Text>
                      )}
                    </View>
                  ))}
                </View>

                {/* Egyptian Foods */}
                <View style={[s.section, { borderTopColor: C.border }]}>
                  <Text style={[s.sectionLabel, { color: C.textMuted }]}>🇪🇬 EGYPTIAN FOOD SOURCES</Text>
                  <View style={s.foodGrid}>
                    {def.egyptianFoods.map((food: any, i: number) => (
                      <View key={i} style={[s.foodCard, { backgroundColor: C.bg, borderColor: C.border }]}>
                        <Text style={s.foodEmoji}>{food.emoji}</Text>
                        <Text style={[s.foodName, { color: C.text }]}>{food.name}</Text>
                        <Text style={[s.foodAmount, { color: C.textMuted }]}>{food.amount}</Text>
                        <Text style={[s.foodContent, { color: C.accent2 }]}>{food.nutrientContent}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Warnings */}
                <View style={[s.section, { borderTopColor: C.border }]}>
                  <Text style={[s.sectionLabel, { color: C.textMuted }]}>WARNINGS & TIPS</Text>
                  {def.warnings.map((warn: string, i: number) => (
                    <Text key={i} style={[s.warningText, { 
                      color: warn.startsWith('⚠️') ? '#FF6B6B' : 
                            warn.startsWith('💡') ? C.accent : C.text 
                    }]}>
                      {warn}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {activeSection === 'analysis' && deficiencies.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 64 }}>✅</Text>
            <Text style={[s.emptyTitle, { color: C.text }]}>No Deficiencies Detected</Text>
            <Text style={[s.emptySub, { color: C.textMuted }]}>
              Based on your symptoms, no major deficiencies found. Keep up the good work!
            </Text>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION: LAB TESTS
        ═══════════════════════════════════════════════════════ */}
        {activeSection === 'labs' && labPlan && (
          <>
            <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.cardTitle, { color: C.text }]}>Your Lab Test Plan</Text>
              <View style={s.statRow}>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: '#FF6B6B' }]}>{labPlan.urgent.length}</Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>Urgent</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: '#FF9D4D' }]}>{labPlan.high.length}</Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>High</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={[s.statNum, { color: C.accent }]}>
                    {labPlan.totalCostMin}-{labPlan.totalCostMax} EGP
                  </Text>
                  <Text style={[s.statLabel, { color: C.textMuted }]}>Est. Cost</Text>
                </View>
              </View>
            </View>

            {labPlan.fastingRequired && (
              <View style={[s.alertCard, { backgroundColor: '#FF9D4D20', borderColor: '#FF9D4D' }]}>
                <Text style={[s.alertText, { color: '#FF9D4D' }]}>
                  ⏰ Some tests require fasting. Schedule morning appointment.
                </Text>
              </View>
            )}

            {/* Urgent Tests */}
            {labPlan.urgent.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { color: '#FF6B6B' }]}>🚨 URGENT (Within 1 week)</Text>
                {labPlan.urgent.map((test: any, i: number) => (
                  <View key={i} style={[s.testCard, { backgroundColor: C.card, borderColor: '#FF6B6B40' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={[s.testName, { color: C.text }]}>{test.name}</Text>
                      <Text style={[s.testCost, { color: C.accent }]}>{test.cost}</Text>
                    </View>
                    <Text style={[s.testWhy, { color: C.textMuted }]}>Why: {test.why}</Text>
                    {test.fasting && (
                      <Text style={[s.testFasting, { color: '#FF9D4D' }]}>
                        ⚠️ Fasting {test.fastingHours}h required
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* High Priority Tests */}
            {labPlan.high.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { color: '#FF9D4D' }]}>⚠️ HIGH PRIORITY (Within 1 month)</Text>
                {labPlan.high.map((test: any, i: number) => (
                  <View key={i} style={[s.testCard, { backgroundColor: C.card, borderColor: C.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={[s.testName, { color: C.text }]}>{test.name}</Text>
                      <Text style={[s.testCost, { color: C.accent }]}>{test.cost}</Text>
                    </View>
                    <Text style={[s.testWhy, { color: C.textMuted }]}>Why: {test.why}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Tips */}
            <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.cardTitle, { color: C.text }]}>💡 Tips</Text>
              {labPlan.tips.map((tip: string, i: number) => (
                <Text key={i} style={[s.tipText, { color: C.textMuted }]}>• {tip}</Text>
              ))}
            </View>
          </>
        )}

        {activeSection === 'plan' && (
          <>
            {!safePlan || safePlan.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 64 }}>📋</Text>
                <Text style={[s.emptyTitle, { color: C.text }]}>No 10-day plan generated yet</Text>
                <Text style={[s.emptySub, { color: C.textMuted }]}>Refresh profile data and try again.</Text>
              </View>
            ) : (
              <>
                <Text style={[s.sectionTitle, { color: C.textMuted }]}>YOUR 10-DAY ACTION PLAN</Text>
                {safePlan.map((day: any) => (
                  <View key={day.day} style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Text style={[s.cardTitle, { color: C.text }]}>
                      Day {day.day}: {day.theme}
                    </Text>
                    <Text style={[s.tipText, { color: C.textMuted, marginBottom: 8 }]}>
                      Date: {day.date}
                    </Text>
                    {(day.tasks ?? []).slice(0, 6).map((task: any) => (
                      <Text key={task.id} style={[s.tipText, { color: C.text }]}>
                        {task.icon} {task.title} - {task.description}
                      </Text>
                    ))}
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {activeSection === 'supplements' && (
          <>
            <Text style={[s.sectionTitle, { color: C.textMuted }]}>SUPPLEMENT GUIDANCE</Text>
            {deficiencies.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 64 }}>💊</Text>
                <Text style={[s.emptyTitle, { color: C.text }]}>No supplement recommendations right now</Text>
              </View>
            ) : (
              deficiencies.map((def, idx) => (
                <View key={idx} style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={[s.cardTitle, { color: C.text }]}>
                    {def.emoji} {def.nutrient}
                  </Text>
                  {def.supplement ? (
                    <>
                      <Text style={[s.tipText, { color: C.text }]}>Dose: {def.supplement.dose}</Text>
                      <Text style={[s.tipText, { color: C.text }]}>Timing: {def.supplement.timing}</Text>
                      <Text style={[s.tipText, { color: C.text }]}>Duration: {def.supplement.duration}</Text>
                    </>
                  ) : (
                    <Text style={[s.tipText, { color: '#FF9D4D' }]}>
                      Lab testing first is recommended before supplement use.
                    </Text>
                  )}
                  {(def.warnings ?? []).slice(0, 3).map((w: string, i: number) => (
                    <Text key={i} style={[s.tipText, { color: C.textMuted }]}>- {w}</Text>
                  ))}
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  tabs: { paddingHorizontal: 20, marginBottom: 16 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5, marginRight: 8 },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 4 },
  concernRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  concernIcon: { fontSize: 24 },
  concernName: { fontSize: 14, fontWeight: '700' },
  concernConf: { fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  actionBtnText: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  analysisCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  analysisHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  analysisTitle: { fontSize: 18, fontWeight: '900' },
  analysisBasis: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  confBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  confText: { fontSize: 13, fontWeight: '800' },
  section: { borderTopWidth: 1, paddingTop: 16, marginTop: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  symptomText: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
  riskBadge: { borderWidth: 1.5, borderRadius: 10, padding: 12 },
  riskText: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  supName: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  supDetail: { flexDirection: 'row', marginBottom: 4 },
  supLabel: { fontSize: 13, width: 80 },
  supValue: { fontSize: 13, fontWeight: '600', flex: 1 },
  labItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  labName: { fontSize: 14, fontWeight: '700', flex: 1 },
  labCost: { fontSize: 14, fontWeight: '800' },
  labWhy: { fontSize: 12, marginTop: 4 },
  labWhen: { fontSize: 12, marginTop: 2 },
  labFasting: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodCard: { borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', width: '48%' },
  foodEmoji: { fontSize: 28, marginBottom: 4 },
  foodName: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  foodAmount: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  foodContent: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  warningText: { fontSize: 12, lineHeight: 20, marginBottom: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  alertCard: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 16 },
  alertText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  testCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  testName: { fontSize: 14, fontWeight: '700', flex: 1 },
  testCost: { fontSize: 14, fontWeight: '800' },
  testWhy: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  testFasting: { fontSize: 12, marginTop: 6, fontWeight: '600' },
  tipText: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
});
