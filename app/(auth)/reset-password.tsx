import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

function parseResetParams(url: string | null): { accessToken?: string; refreshToken?: string; type?: string } {
  if (!url) return {};
  const parsed = Linking.parse(url);
  const params = (parsed.queryParams ?? {}) as Record<string, string | undefined>;
  return {
    accessToken: params.access_token,
    refreshToken: params.refresh_token,
    type: params.type,
  };
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);

  const [sessionParams, setSessionParams] = useState<{ accessToken?: string; refreshToken?: string; type?: string }>({});

  const helpText = useMemo(() => {
    if (!ready) return 'Loading reset link…';
    if (!sessionParams.accessToken || !sessionParams.refreshToken) {
      return 'This reset link is missing required tokens. Please request a new reset email.';
    }
    if (sessionParams.type && sessionParams.type !== 'recovery') {
      return 'This link is not a password recovery link. Please request a new reset email.';
    }
    return '';
  }, [ready, sessionParams.accessToken, sessionParams.refreshToken, sessionParams.type]);

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

  async function onUpdate() {
    setError('');
    setSuccess('');

    if (!sessionParams.accessToken || !sessionParams.refreshToken) {
      setError('Invalid reset link. Please request a new reset email.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      // Establish a session from the recovery tokens, then update password.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionParams.accessToken,
        refresh_token: sessionParams.refreshToken,
      });
      if (sessionError) {
        setError(sessionError.message || 'Unable to verify reset link.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Unable to update password.');
        return;
      }

      setSuccess('Password updated successfully. You can now log in.');
      setTimeout(() => router.replace('/(auth)/login'), 900);
    } catch {
      setError('Unexpected error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const canSubmit =
    ready &&
    !busy &&
    !!sessionParams.accessToken &&
    !!sessionParams.refreshToken &&
    (sessionParams.type ? sessionParams.type === 'recovery' : true);

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Set a new password</Text>
          <Text style={s.sub}>Enter your new password below.</Text>

          {!!helpText && <Text style={s.hint}>{helpText}</Text>}
          {!!error && <Text style={s.err}>{error}</Text>}
          {!!success && <Text style={s.ok}>{success}</Text>}

          <Text style={s.lbl}>New password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
          />

          <Text style={s.lbl}>Confirm password</Text>
          <TextInput
            style={s.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
          />

          <TouchableOpacity style={[s.btn, !canSubmit && { opacity: 0.55 }]} onPress={onUpdate} disabled={!canSubmit}>
            <Text style={s.btnT}>{busy ? 'Updating…' : 'Update password'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={s.back}>Back to login</Text>
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

