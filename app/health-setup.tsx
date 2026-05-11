import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeColors } from '../context/ThemeContext';
import { UserProfile } from '../data/userStore';
import { saveProfileLocallyAndPush } from '../lib/profileSupabase';
import { loadProfileSupabaseFirst } from '../lib/supabaseUserData';
import { upsertOnboardingDataFromProfile } from '../lib/supabaseUserData';
import { ensurePersonalizedPlans } from '../lib/personalization';
import { supabase } from '../lib/supabase';
import { healthDataEvents } from '../lib/healthIntegration';
import {
  CHRONIC_CONDITIONS,
  SYMPTOMS_LIST,
  ACUTE_EPISODES,
  DRINKING_HABITS,
  LIFESTYLE_HABITS,
} from '../data/healthEngine';

type Step = 1 | 2 | 3 | 4 | 5;

const CONDITION_GROUP_TITLES: Record<string, string> = {
  cardio: 'Cardio',
  metabolic: 'Metabolic',
  respiratory: 'Respiratory',
  digestive: 'Digestive',
  kidney: 'Kidney',
  mental: 'Mental Health',
  bones: 'Bones & Joints',
  blood: 'Blood & Immunity',
};

export default function HealthSetup() {
  const { isDark } = useTheme();
  const C = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const current = await loadProfileSupabaseFirst();
        if (!mounted) return;

        setProfile(current);
        if (current) {
          setSelectedConditions(current.conditions ?? []);
          setSelectedHabits((current as any).habits ?? []);
        }
      } catch {
        if (!mounted) return;
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const groupedConditions = useMemo(() => {
    const groups: Record<string, typeof CHRONIC_CONDITIONS> = {};
    for (const condition of CHRONIC_CONDITIONS) {
      const key = condition.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(condition);
    }
    return groups;
  }, []);

  function toggleItem(id: string, list: string[], setter: (value: string[]) => void) {
    setter(list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  }

  async function handleFinish() {
    if (!profile) {
      Alert.alert('Profile missing', 'Create your main profile first, then try again.');
      return;
    }

    try {
      setSaving(true);

      const updated = {
        ...profile,
        conditions: selectedConditions,
        habits: selectedHabits,
        healthConditions: selectedConditions,
        healthSymptoms: selectedSymptoms,
        healthEpisodes: selectedEpisodes,
        healthDrinks: selectedDrinks,
        healthHabits: selectedHabits,
      };

      await saveProfileLocallyAndPush(updated as UserProfile);
      await upsertOnboardingDataFromProfile(updated as UserProfile);
      await ensurePersonalizedPlans(updated as UserProfile);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (userId) {
        await healthDataEvents.onHealthProfileUpdated(
          userId,
          { medical_conditions: selectedConditions, symptoms: selectedSymptoms, habits: selectedHabits },
          updated as UserProfile
        );
      }

      Alert.alert('Saved', 'Health profile saved successfully.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save the health profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[s.loadingWrap, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.accent} />
        <Text style={[s.loadingText, { color: C.textMuted }]}>Loading health setup...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
        <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
        <View style={s.centerWrap}>
          <Text style={[s.emptyTitle, { color: C.text }]}>No profile found</Text>
          <Text style={[s.emptySub, { color: C.textMuted }]}>
            Create your main profile first, then come back to fill the health setup.
          </Text>
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: C.accent }]}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Text style={[s.primaryBtnText, { color: C.onAccent }]}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />

      <View style={s.header}>
        <Text style={[s.title, { color: C.text }]}>Health Profile Setup</Text>
        <Text style={[s.subtitle, { color: C.textMuted }]}>Step {step} of {totalSteps}</Text>
        <View style={[s.progressTrack, { backgroundColor: C.border }]}>
          <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: C.accent }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Text style={[s.stepTitle, { color: C.accent }]}>Do you have any chronic conditions?</Text>
            <Text style={[s.stepDesc, { color: C.textMuted }]}>Select all that apply</Text>

            {Object.entries(groupedConditions).map(([groupKey, conditions]) => (
              <View key={groupKey} style={s.groupBlock}>
                <Text style={[s.groupTitle, { color: C.text }]}>{CONDITION_GROUP_TITLES[groupKey] ?? groupKey}</Text>
                <View style={s.grid}>
                  {conditions.map(condition => {
                    const active = selectedConditions.includes(condition.id);
                    return (
                      <TouchableOpacity
                        key={condition.id}
                        style={[
                          s.chip,
                          {
                            backgroundColor: active ? C.accent + '20' : C.card,
                            borderColor: active ? C.accent : C.border,
                          },
                        ]}
                        onPress={() => toggleItem(condition.id, selectedConditions, setSelectedConditions)}
                      >
                        <Text style={s.chipIcon}>{condition.icon}</Text>
                        <Text style={[s.chipText, { color: active ? C.text : C.textMuted }]}>
                          {condition.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[s.stepTitle, { color: C.accent }]}>Are you experiencing any symptoms?</Text>
            <Text style={[s.stepDesc, { color: C.textMuted }]}>Select all that apply</Text>

            <View style={s.grid}>
              {SYMPTOMS_LIST.map(symptom => {
                const active = selectedSymptoms.includes(symptom.id);
                return (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[
                      s.chip,
                      {
                        backgroundColor: active ? C.accent2 + '20' : C.card,
                        borderColor: active ? C.accent2 : C.border,
                      },
                    ]}
                    onPress={() => toggleItem(symptom.id, selectedSymptoms, setSelectedSymptoms)}
                  >
                    <Text style={s.chipIcon}>{symptom.icon}</Text>
                    <Text style={[s.chipText, { color: active ? C.text : C.textMuted }]}>
                      {symptom.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[s.stepTitle, { color: C.accent }]}>Do you experience any attacks or crises?</Text>
            <Text style={[s.stepDesc, { color: C.textMuted }]}>Select all that apply</Text>

            <View style={s.grid}>
              {ACUTE_EPISODES.map(ep => {
                const active = selectedEpisodes.includes(ep.id);
                const urgent = ep.severity === 'urgent';
                return (
                  <TouchableOpacity
                    key={ep.id}
                    style={[
                      s.chip,
                      {
                        backgroundColor: active ? C.danger + '20' : C.card,
                        borderColor: active ? C.danger : C.border,
                      },
                    ]}
                    onPress={() => toggleItem(ep.id, selectedEpisodes, setSelectedEpisodes)}
                  >
                    <Text style={s.chipIcon}>{ep.icon}</Text>
                    <Text style={[s.chipText, { color: active ? C.text : C.textMuted }]}>
                      {ep.name}
                    </Text>
                    {urgent ? (
                      <View style={[s.badge, { backgroundColor: C.danger }]}>
                        <Text style={s.badgeText}>!</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={[s.stepTitle, { color: C.accent }]}>What do you drink daily?</Text>
            <Text style={[s.stepDesc, { color: C.textMuted }]}>Select all that apply</Text>

            <View style={s.grid}>
              {DRINKING_HABITS.map(drink => {
                const active = selectedDrinks.includes(drink.id);
                return (
                  <TouchableOpacity
                    key={drink.id}
                    style={[
                      s.chip,
                      {
                        backgroundColor: active ? C.accent3 + '20' : C.card,
                        borderColor: active ? C.accent3 : C.border,
                      },
                    ]}
                    onPress={() => toggleItem(drink.id, selectedDrinks, setSelectedDrinks)}
                  >
                    <Text style={s.chipIcon}>{drink.icon}</Text>
                    <Text style={[s.chipText, { color: active ? C.text : C.textMuted }]}>
                      {drink.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 5 && (
          <>
            <Text style={[s.stepTitle, { color: C.accent }]}>Any lifestyle habits?</Text>
            <Text style={[s.stepDesc, { color: C.textMuted }]}>Select all that apply</Text>

            <View style={s.grid}>
              {LIFESTYLE_HABITS.map(hab => {
                const active = selectedHabits.includes(hab.id);
                return (
                  <TouchableOpacity
                    key={hab.id}
                    style={[
                      s.chip,
                      {
                        backgroundColor: active ? C.warning + '20' : C.card,
                        borderColor: active ? C.warning : C.border,
                      },
                    ]}
                    onPress={() => toggleItem(hab.id, selectedHabits, setSelectedHabits)}
                  >
                    <Text style={s.chipIcon}>{hab.icon}</Text>
                    <Text style={[s.chipText, { color: active ? C.text : C.textMuted }]}>
                      {hab.name}
                    </Text>
                    {hab.risk === 'very-high' ? (
                      <View style={[s.badge, { backgroundColor: C.danger }]}>
                        <Text style={s.badgeText}>!</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[s.nav, { backgroundColor: C.bg, borderTopColor: C.border }]}>
        {step > 1 ? (
          <TouchableOpacity
            style={[s.navBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => setStep((step - 1) as Step)}
          >
            <Text style={[s.navBtnText, { color: C.text }]}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.navSpacer} />
        )}

        {step < 5 ? (
          <TouchableOpacity
            style={[s.navBtn, s.navBtnPrimary, { backgroundColor: C.accent }]}
            onPress={() => setStep((step + 1) as Step)}
          >
            <Text style={[s.navBtnText, { color: C.onAccent }]}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.navBtn, s.navBtnPrimary, { backgroundColor: C.success }]}
            onPress={handleFinish}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[s.navBtnText, { color: '#000' }]}>✓ Finish</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  progressTrack: { height: 4, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  scroll: { padding: 20, paddingTop: 10, paddingBottom: 120 },
  stepTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  stepDesc: { fontSize: 14, marginBottom: 18 },
  groupBlock: { marginBottom: 18 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: '47%',
    flexGrow: 1,
  },
  chipIcon: { fontSize: 18 },
  chipText: { fontSize: 13, fontWeight: '600', flex: 1 },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  navSpacer: {
    flex: 1,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  navBtnPrimary: { borderWidth: 0 },
  navBtnText: { fontSize: 16, fontWeight: '700' },
});
