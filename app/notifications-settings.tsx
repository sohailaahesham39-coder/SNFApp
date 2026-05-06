import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../context/ThemeContext';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  applyLocalNotificationSchedules,
  sendTestLocalNotification,
  type UserNotificationSettings,
} from '../lib/localNotifications';

export default function NotificationsSettingsScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    loadNotificationSettings()
      .then((v) => setSettings(v))
      .finally(() => setLoading(false));
  }, []);

  async function onSave() {
    await saveNotificationSettings(settings);
    await applyLocalNotificationSchedules(settings);
    Alert.alert('Saved', 'Notification settings updated successfully.');
  }

  async function onTest() {
    await sendTestLocalNotification();
    Alert.alert('Sent', 'Test notification sent.');
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backBtn, { color: C.accent }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.text }]}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <SettingRow
          label="Water reminders"
          value={settings.water_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, water_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Water interval (hours)"
          value={String(settings.water_reminder_interval_hours)}
          onChange={(v) => setSettings((p) => ({ ...p, water_reminder_interval_hours: Number(v || 2) }))}
          C={C}
        />

        <SettingRow
          label="Vitamin reminders"
          value={settings.vitamin_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, vitamin_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Vitamin time (HH:mm)"
          value={settings.vitamin_reminder_time}
          onChange={(v) => setSettings((p) => ({ ...p, vitamin_reminder_time: v }))}
          C={C}
        />

        <SettingRow
          label="Workout reminders"
          value={settings.workout_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, workout_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Workout time (HH:mm)"
          value={settings.workout_reminder_time}
          onChange={(v) => setSettings((p) => ({ ...p, workout_reminder_time: v }))}
          C={C}
        />

        <SettingRow
          label="Meal reminders"
          value={settings.meal_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, meal_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Breakfast time (HH:mm)"
          value={settings.meal_breakfast_time}
          onChange={(v) => setSettings((p) => ({ ...p, meal_breakfast_time: v }))}
          C={C}
        />
        <InputRow
          label="Lunch time (HH:mm)"
          value={settings.meal_lunch_time}
          onChange={(v) => setSettings((p) => ({ ...p, meal_lunch_time: v }))}
          C={C}
        />
        <InputRow
          label="Dinner time (HH:mm)"
          value={settings.meal_dinner_time}
          onChange={(v) => setSettings((p) => ({ ...p, meal_dinner_time: v }))}
          C={C}
        />
        <SettingRow
          label="Habit reduction reminders"
          value={settings.habit_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, habit_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Habit reminder time (HH:mm)"
          value={settings.habit_reminder_time}
          onChange={(v) => setSettings((p) => ({ ...p, habit_reminder_time: v }))}
          C={C}
        />
        <SettingRow
          label="Lab reminders"
          value={settings.lab_reminders}
          onChange={(v) => setSettings((p) => ({ ...p, lab_reminders: v }))}
          C={C}
        />
        <InputRow
          label="Lab reminder day (1-7)"
          value={String(settings.lab_reminder_day_of_week)}
          onChange={(v) =>
            setSettings((p) => ({ ...p, lab_reminder_day_of_week: Math.max(1, Math.min(7, Number(v || 1))) }))
          }
          C={C}
        />
        <InputRow
          label="Lab reminder time (HH:mm)"
          value={settings.lab_reminder_time}
          onChange={(v) => setSettings((p) => ({ ...p, lab_reminder_time: v }))}
          C={C}
        />
        <SettingRow
          label="Push notifications"
          value={settings.push_enabled}
          onChange={(v) => setSettings((p) => ({ ...p, push_enabled: v }))}
          C={C}
        />

        <TouchableOpacity style={[s.secondaryBtn, { borderColor: C.border, backgroundColor: C.bg2 }]} onPress={onTest}>
          <Text style={[s.secondaryBtnText, { color: C.text }]}>Send test notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: C.accent, opacity: loading ? 0.65 : 1 }]}
          disabled={loading}
          onPress={onSave}
        >
          <Text style={[s.primaryBtnText, { color: C.onAccent }]}>{loading ? 'Loading...' : 'Save settings'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  onChange,
  C,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[s.row, { borderColor: C.border }]}>
      <Text style={[s.label, { color: C.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function InputRow({
  label,
  value,
  onChange,
  C,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[s.row, { borderColor: C.border }]}>
      <Text style={[s.label, { color: C.text }]}>{label}</Text>
      <TextInput
        style={[s.input, { color: C.text, borderColor: C.border, backgroundColor: C.card }]}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  backBtn: { fontSize: 15, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '900' },
  content: { padding: 18, gap: 10, paddingBottom: 30 },
  row: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '700', flex: 1, paddingRight: 12 },
  input: { minWidth: 90, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, textAlign: 'center' },
  primaryBtn: { marginTop: 6, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '900' },
  secondaryBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },
});

