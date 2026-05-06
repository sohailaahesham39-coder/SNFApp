import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { loadProfile } from '../../data/userStore';
import { pullRemoteProfileIntoCache } from '../../lib/profileSupabase';
import { isValidEmail } from '../../lib/authValidation';
import FirebaseGoogleSignIn from '../../components/auth/FirebaseGoogleSignIn';
import { signInWithOAuthProvider } from '../../lib/oauth';
import { migrateLocalDataToSupabaseAndCleanup } from '../../lib/localToSupabaseMigration';
import { fetchAllUserDataFromSupabase } from '../../lib/userDataSync';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
          setError('Wrong email or password.');
        } else if (signInError.message?.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email first, then try again.');
        } else {
          setError(signInError.message || 'Login failed');
        }
        return;
      }

      await migrateLocalDataToSupabaseAndCleanup();
      await fetchAllUserDataFromSupabase();
      await pullRemoteProfileIntoCache();
      const profile = await loadProfile();
      if (profile?.name?.trim()) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding/step1');
      }
    } catch {
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleOAuth() {
    setError('');
    setOauthBusy(true);
    try {
      const { error: oauthError } = await signInWithOAuthProvider('apple');
      if (oauthError) {
        setError(oauthError.message || 'Apple sign in failed');
      }
    } catch {
      setError('Unable to start Apple sign in right now.');
    } finally {
      setOauthBusy(false);
    }
  }

  const busy = loading || oauthBusy;

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
          <Text style={s.emoji}>👋</Text>
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.sub}>Sign in to continue</Text>
          <Text style={s.lbl}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#444" keyboardType="email-address" autoCapitalize="none" />
          <Text style={s.lbl}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#444" secureTextEntry />
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={s.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
          {!!error && <Text style={s.err}>{error}</Text>}
          <TouchableOpacity style={s.btn} onPress={handle} disabled={busy}>
            <Text style={s.btnT}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={s.divider}><View style={s.divLine} /><Text style={s.divTxt}>or continue with</Text><View style={s.divLine} /></View>

          <View style={s.socialRow}>
            <FirebaseGoogleSignIn disabled={busy} onError={setError} intent="signIn" />
            <TouchableOpacity style={s.socialBtn} onPress={() => handleAppleOAuth()} disabled={busy}>
              <Text style={s.socialIcon}>🍎</Text>
              <Text style={s.socialTxt}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={s.sw}>No account? <Text style={s.lnk}>Create one</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  scroll: { padding: 24, paddingTop: 60, flexGrow: 1 },
  back: { color: '#888', fontSize: 15, marginBottom: 24 },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 28 },
  lbl: { fontSize: 13, fontWeight: '600', color: '#ccc', marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginBottom: 16 },
  forgot: { color: '#E8FF4D', fontSize: 13, fontWeight: '700', marginTop: -8, marginBottom: 14 },
  err: { color: '#FF6B6B', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnT: { fontSize: 16, fontWeight: '800', color: '#000' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  divTxt: { color: '#444', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  socialIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  socialTxt: { fontSize: 14, fontWeight: '600', color: '#ccc' },
  sw: { textAlign: 'center', fontSize: 14, color: '#888' },
  lnk: { color: '#E8FF4D', fontWeight: '700' },
});
