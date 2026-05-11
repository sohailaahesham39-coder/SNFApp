import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const hash = url.slice(hashIndex + 1);
  const params = new URLSearchParams(hash);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function parseResetParams(url: string | null): { accessToken?: string; refreshToken?: string; type?: string; code?: string } {
  if (!url) return {};
  const parsed = Linking.parse(url);
  const params = (parsed.queryParams ?? {}) as Record<string, string | undefined>;
  const hashParams = parseHashParams(url);
  return {
    accessToken: params.access_token ?? hashParams.access_token,
    refreshToken: params.refresh_token ?? hashParams.refresh_token,
    type: params.type ?? hashParams.type,
    code: params.code ?? hashParams.code,
  };
}

export default function ResetPassword() {
  const localParams = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    type?: string;
    code?: string;
  }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);

  const [sessionParams, setSessionParams] = useState<{ accessToken?: string; refreshToken?: string; type?: string; code?: string }>({});

  const helpText = useMemo(() => {
    if (!ready) return 'جارٍ تحميل رابط الاستعادة...';
    if (!sessionParams.accessToken && !sessionParams.code) {
      return 'رابط الاستعادة غير مكتمل. من فضلك اطلب رابطًا جديدًا.';
    }
    if (sessionParams.type && sessionParams.type !== 'recovery') {
      return 'هذا الرابط ليس رابط استعادة كلمة المرور.';
    }
    return '';
  }, [ready, sessionParams.accessToken, sessionParams.code, sessionParams.type]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const initialUrl = await Linking.getInitialURL();
        const initial = parseResetParams(initialUrl);
        if (mounted) setSessionParams(initial);

        // Also listen for the case where the app was already open.
        const sub = Linking.addEventListener('url', ({ url }) => {
          const p = parseResetParams(url);
          setSessionParams(p);
        });

        return () => sub.remove();
      } finally {
        if (mounted) setReady(true);
      }
    }

    const cleanupPromise = init();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.()).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!localParams) return;
    setSessionParams((prev) => ({
      accessToken: (localParams.access_token as string | undefined) ?? prev.accessToken,
      refreshToken: (localParams.refresh_token as string | undefined) ?? prev.refreshToken,
      type: (localParams.type as string | undefined) ?? prev.type,
      code: (localParams.code as string | undefined) ?? prev.code,
    }));
  }, [localParams.access_token, localParams.refresh_token, localParams.type, localParams.code]);

  async function onUpdate() {
    setError('');
    setSuccess('');

    if (!sessionParams.accessToken && !sessionParams.code) {
      setError('رابط الاستعادة غير صالح. اطلب رابطًا جديدًا.');
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
      // Establish a session from the recovery tokens, then update password.
      if (sessionParams.accessToken && sessionParams.refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: sessionParams.accessToken,
          refresh_token: sessionParams.refreshToken,
        });
        if (sessionError) {
          setError(sessionError.message || 'تعذر التحقق من رابط الاستعادة.');
          return;
        }
      } else if (sessionParams.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(sessionParams.code);
        if (exchangeError) {
          setError(exchangeError.message || 'تعذر التحقق من رابط الاستعادة.');
          return;
        }
      }

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

  const canSubmit =
    ready &&
    !busy &&
    (!!sessionParams.code || (!!sessionParams.accessToken && !!sessionParams.refreshToken)) &&
    (sessionParams.type ? sessionParams.type === 'recovery' : true);

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>تعيين كلمة مرور جديدة</Text>
          <Text style={s.sub}>أدخل كلمة المرور الجديدة.</Text>

          {!!helpText && <Text style={s.hint}>{helpText}</Text>}
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
  hint: { color: '#777', fontSize: 13, marginBottom: 10 },
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

