import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handle() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); router.replace('/(tabs)/home'); }, 1000);
  }

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
          {!!error && <Text style={s.err}>{error}</Text>}
          <TouchableOpacity style={s.btn} onPress={handle} disabled={loading}>
            <Text style={s.btnT}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
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
  err: { color: '#FF6B6B', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  btnT: { fontSize: 16, fontWeight: '800', color: '#000' },
  sw: { textAlign: 'center', fontSize: 14, color: '#888' },
  lnk: { color: '#E8FF4D', fontWeight: '700' },
});