import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { getOAuthRedirectUri } from '../../lib/oauth';
import { isValidEmail } from '../../lib/authValidation';
import { mapAuthErrorToArabic } from '../../lib/authErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSend() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('من فضلك أدخل الإيميل.');
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError('من فضلك أدخل إيميل صحيح.');
      return;
    }

    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getOAuthRedirectUri(),
      });
      if (resetError) {
        setError(mapAuthErrorToArabic(resetError.message || 'Unable to send reset email.'));
        return;
      }
      setSuccess('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={s.title}>استعادة كلمة المرور</Text>
          <Text style={s.sub}>اكتب الإيميل وسنرسل لك رابط تغيير كلمة المرور.</Text>

          <Text style={s.lbl}>الإيميل</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#444"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!!error && <Text style={s.err}>{error}</Text>}
          {!!success && <Text style={s.ok}>{success}</Text>}

          <TouchableOpacity style={s.btn} onPress={onSend} disabled={busy}>
            <Text style={s.btnT}>{busy ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}</Text>
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
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 28 },
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
});

