import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSignInMethodsForEmail, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { supabase } from '../../lib/supabase';
import { isValidEmail } from '../../lib/authValidation';
import FirebaseGoogleSignIn from '../../components/auth/FirebaseGoogleSignIn';
import { signInWithOAuthProvider } from '../../lib/oauth';
import { getFirebaseAuth, isFirebaseConfigured } from '../../lib/firebaseApp';
import { ensureCurrentUserProfile } from '../../lib/authProfileSync';
import { migrateLocalDataToSupabaseAndCleanup } from '../../lib/localToSupabaseMigration';
import { mapAuthErrorToArabic } from '../../lib/authErrors';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    if (!name || !email || !password) { setError('من فضلك املأ كل الحقول.'); return; }
    if (!isValidEmail(email)) { setError('من فضلك أدخل إيميل صحيح.'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين.'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.'); return; }
    setLoading(true); setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .single();
      if (existingUser) {
        const msg = 'هذا الإيميل مسجل بالفعل. جرّب تسجيل الدخول.';
        setError(msg);
        Alert.alert('تنبيه', msg);
        return;
      }

      if (isFirebaseConfigured()) {
        try {
          const auth = getFirebaseAuth();
          const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
          if (methods.length > 0) {
            const msg = 'هذا الإيميل مسجل بالفعل.';
            setError(msg);
            Alert.alert('تنبيه', msg);
            return;
          }
        } catch {
          // Email not found in Firebase, continue with registration.
        }
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) {
        setError(mapAuthErrorToArabic(signUpError.message || 'Sign up failed'));
        return;
      }

      // Keep Firebase account in sync for email/password flows.
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
        if (methods.length === 0) {
          await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          await firebaseSignOut(auth).catch(() => undefined);
        }
      }

      if (!signUpData?.session) {
        await AsyncStorage.setItem('sn_temp_user', JSON.stringify({ name: name.trim(), email: normalizedEmail }));
        setError('تم إنشاء الحساب. فعّل الإيميل أولًا ثم سجّل الدخول.');
        return;
      }

      const { error: profileError } = await ensureCurrentUserProfile('email');
      if (profileError) {
        setError(mapAuthErrorToArabic(profileError.message || 'Unable to save profile.'));
        return;
      }

      await migrateLocalDataToSupabaseAndCleanup();
      await AsyncStorage.setItem('sn_temp_user', JSON.stringify({ name: name.trim(), email: normalizedEmail }));
      router.replace('/onboarding/step1');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error. Please try again.';
      setError(mapAuthErrorToArabic(msg));
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
        setError(oauthError.message || 'Apple sign up failed');
      }
    } catch {
      setError('Unable to start Apple sign up right now.');
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
          <Text style={s.emoji}>✍️</Text>
          <Text style={s.title}>إنشاء حساب</Text>
          <Text style={s.sub}>ابدأ رحلتك الصحية مجانًا</Text>

          <Text style={s.lbl}>الاسم الكامل</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#444" autoCapitalize="words" />

          <Text style={s.lbl}>الإيميل</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#444" keyboardType="email-address" autoCapitalize="none" />

          <Text style={s.lbl}>كلمة المرور</Text>
          <View style={s.passRow}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#444" secureTextEntry={!showPass} autoCapitalize="none" />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {password.length > 0 && (
            <View style={s.strengthBar}>
              <View style={[s.strengthFill, { width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%', backgroundColor: password.length < 6 ? '#FF6B6B' : password.length < 10 ? '#FF9D4D' : '#4DFF9E' }]} />
            </View>
          )}
          {password.length > 0 && <Text style={[s.strengthTxt, { color: password.length < 6 ? '#FF6B6B' : password.length < 10 ? '#FF9D4D' : '#4DFF9E' }]}>{password.length < 6 ? 'ضعيفة' : password.length < 10 ? 'متوسطة' : 'قوية ✓'}</Text>}

          <Text style={[s.lbl, { marginTop: 12 }]}>تأكيد كلمة المرور</Text>
          <View style={s.passRow}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={confirm} onChangeText={setConfirm} placeholder="••••••••" placeholderTextColor="#444" secureTextEntry={!showConfirm} autoCapitalize="none" />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
              <Text style={s.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {confirm.length > 0 && <Text style={[s.matchTxt, { color: password === confirm ? '#4DFF9E' : '#FF6B6B' }]}>{password === confirm ? '✓ كلمتا المرور متطابقتان' : '✗ كلمتا المرور غير متطابقتين'}</Text>}

          {!!error && <Text style={s.err}>{error}</Text>}

          <TouchableOpacity style={s.btn} onPress={handle} disabled={busy}>
            <Text style={s.btnT}>{loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}</Text>
          </TouchableOpacity>

          <View style={s.divider}><View style={s.divLine} /><Text style={s.divTxt}>أو التسجيل عبر</Text><View style={s.divLine} /></View>

          <View style={s.socialRow}>
            <FirebaseGoogleSignIn disabled={busy} onError={setError} intent="signUp" />
            <TouchableOpacity style={s.socialBtn} onPress={() => handleAppleOAuth()} disabled={busy}>
              <Text style={s.socialIcon}>🍎</Text>
              <Text style={s.socialTxt}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={s.sw}>لديك حساب بالفعل؟ <Text style={s.lnk}>تسجيل الدخول</Text></Text>
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
  sub: { fontSize: 14, color: '#888', marginBottom: 24 },
  lbl: { fontSize: 13, fontWeight: '600', color: '#ccc', marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginBottom: 14 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eyeBtn: { padding: 10 },
  eyeIcon: { fontSize: 20 },
  strengthBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthTxt: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  matchTxt: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  err: { color: '#FF6B6B', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnT: { fontSize: 16, fontWeight: '800', color: '#000' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  divTxt: { color: '#444', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  socialIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  socialTxt: { fontSize: 14, fontWeight: '600', color: '#ccc' },
  sw: { textAlign: 'center', fontSize: 14, color: '#888' },
  lnk: { color: '#E8FF4D', fontWeight: '700' },
});
