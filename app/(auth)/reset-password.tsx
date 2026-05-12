import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/** Fallback if deep link opened this screen before root layout finished (session not set yet). */
async function tryEstablishSessionFromUrl(): Promise<boolean> {
  const url = await Linking.getInitialURL();
  if (!url || !url.includes('auth/callback')) return false;
  const parsed = Linking.parse(url);
  const params = (parsed.queryParams ?? {}) as Record<string, string | undefined>;
  const hashParams = parseHashParams(url);
  const code = params.code ?? hashParams.code;
  const type = params.type ?? hashParams.type;
  const accessToken = params.access_token ?? hashParams.access_token;
  const refreshToken = params.refresh_token ?? hashParams.refresh_token;

  if (type !== 'recovery') return false;

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }
  return false;
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: s1 } = await supabase.auth.getSession();
      if (cancelled) return;
      if (s1.session) {
        setHasSession(true);
        setReady(true);
        return;
      }
      const ok = await tryEstablishSessionFromUrl();
      if (cancelled) return;
      if (ok) {
        const { data: s2 } = await supabase.auth.getSession();
        setHasSession(!!s2.session);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onUpdate() {
    setError('');
    setSuccess('');

    if (!hasSession) {
      setError('انتهت صلاحية الرابط. اطلب رابط استعادة جديد من شاشة نسيت كلمة المرور.');
      return;
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'تعذر تحديث كلمة المرور.');
        return;
      }

      setSuccess('تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
      setTimeout(() => router.replace('/(auth)/login'), 900);
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = ready && hasSession && !busy;

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>تعيين كلمة مرور جديدة</Text>
          <Text style={s.sub}>أدخل كلمة المرور الجديدة.</Text>

          {ready && !hasSession && (
            <Text style={s.hint}>
              لم يتم التحقق من الرابط. افتح الرابط من الإيميل على نفس الجهاز الذي فيه التطبيق، أو اطلب رابطًا جديدًا.
            </Text>
          )}
          {!ready && <Text style={s.hint}>جارٍ التحقق من الرابط...</Text>}
          {!!error && <Text style={s.err}>{error}</Text>}
          {!!success && <Text style={s.ok}>{success}</Text>}

          <Text style={s.lbl}>كلمة المرور الجديدة</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
          />

          <Text style={s.lbl}>تأكيد كلمة المرور</Text>
          <TextInput
            style={s.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
          />

          <TouchableOpacity style={[s.btn, !canSubmit && { opacity: 0.55 }]} onPress={onUpdate} disabled={!canSubmit}>
            <Text style={s.btnT}>{busy ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={s.back}>الرجوع لتسجيل الدخول</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  scroll: { padding: 24, paddingTop: 70, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 16 },
  hint: { color: '#aaa', fontSize: 13, marginBottom: 12, lineHeight: 20 },
  lbl: { fontSize: 13, fontWeight: '600', color: '#ccc', marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  err: { color: '#FF6B6B', fontSize: 13, marginBottom: 8 },
  ok: { color: '#B6FF6B', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnT: { fontSize: 16, fontWeight: '800', color: '#000' },
  back: { textAlign: 'center', color: '#888', fontSize: 14 },
});
