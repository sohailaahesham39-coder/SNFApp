import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useThemeColors } from '../context/ThemeContext';
import { navigateFromAlertAction } from '../lib/navigateFromAlertAction';
import { supabase } from '../lib/supabase';

type UserAlertRow = {
  id: string;
  title: string;
  message: string;
  action: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AlertsScreen() {
  const C = useThemeColors();
  const [rows, setRows] = useState<UserAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setRows([]);
        return;
      }
      const { data } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      setRows((data as UserAlertRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function markRead(id: string) {
    try {
      await supabase.from('user_alerts').update({ is_read: true }).eq('id', id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
    } catch {
      // offline / RLS — keep UI stable
    }
  }

  async function markAllRead() {
    const unreadIds = rows.filter((r) => !r.is_read).map((r) => r.id);
    if (unreadIds.length === 0) return;
    await supabase.from('user_alerts').update({ is_read: true }).in('id', unreadIds);
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
  }

  async function onAlertPress(row: UserAlertRow) {
    await markRead(row.id);
    const hint = row.action?.trim();
    if (hint) navigateFromAlertAction(hint);
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
      <View style={s.header}>
        <Text style={[s.title, { color: C.text }]}>Alerts Center</Text>
        <TouchableOpacity style={[s.markAllBtn, { borderColor: C.border }]} onPress={markAllRead}>
          <Text style={[s.markAllText, { color: C.text }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
          showsVerticalScrollIndicator={false}
        >
          {rows.length === 0 ? (
            <View style={[s.emptyCard, { borderColor: C.border, backgroundColor: C.card }]}>
              <Text style={[s.emptyTitle, { color: C.text }]}>No alerts</Text>
              <Text style={[s.emptySub, { color: C.textMuted }]}>You are all caught up.</Text>
            </View>
          ) : (
            rows.map((row) => (
              <TouchableOpacity
                key={row.id}
                style={[
                  s.alertCard,
                  { borderColor: row.is_read ? C.border : C.accent + '55', backgroundColor: C.card },
                ]}
                onPress={() => void onAlertPress(row)}
              >
                <View style={s.alertTop}>
                  <Text style={[s.alertTitle, { color: C.text }]}>{row.title}</Text>
                  {!row.is_read ? <Text style={[s.unreadBadge, { color: C.accent }]}>NEW</Text> : null}
                </View>
                <Text style={[s.alertMessage, { color: C.textMuted }]}>{row.message}</Text>
                <View style={s.alertBottom}>
                  <Text style={[s.alertTime, { color: C.textDim }]}>{new Date(row.created_at).toLocaleString()}</Text>
                  {row.action ? (
                    <Text style={[s.alertAction, { color: C.accent }]}>{row.action} →</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900' },
  markAllBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  markAllText: { fontSize: 12, fontWeight: '700' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 120, gap: 10 },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emptySub: { fontSize: 13 },
  alertCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 },
  alertTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  unreadBadge: { fontSize: 11, fontWeight: '800' },
  alertMessage: { fontSize: 13, lineHeight: 19 },
  alertBottom: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTime: { fontSize: 11 },
  alertAction: { fontSize: 11, fontWeight: '700' },
});
