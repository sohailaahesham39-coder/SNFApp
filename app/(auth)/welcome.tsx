import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Welcome() {
  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08']} style={StyleSheet.absoluteFill} />
      <View style={s.blob1} />
      <View style={s.hero}>
        <Text style={s.icon}>💪</Text>
        <Text style={s.title}>Your AI{'\n'}Health Coach</Text>
        <Text style={s.sub}>Personalized nutrition & fitness plans based on Egyptian foods</Text>
        {[['🥗','100+ Egyptian meal plans'],['🏋️','Custom workout programs'],['🤖','AI chatbot 24/7'],['📈','Progress tracking']].map(([icon,text],i) => (
          <View key={i} style={s.row}><Text style={s.fi}>{icon}</Text><Text style={s.ft}>{text}</Text></View>
        ))}
      </View>
      <View style={s.btns}>
        <TouchableOpacity style={s.btnP} onPress={() => router.push('/(auth)/register')}>
          <Text style={s.btnPT}>Get Started — It's Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnG} onPress={() => router.push('/(auth)/login')}>
          <Text style={s.btnGT}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  blob1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, top: -60, right: -60, backgroundColor: 'rgba(232,255,77,0.07)' },
  hero: { flex: 1, paddingHorizontal: 28, paddingTop: 100, justifyContent: 'center', gap: 12 },
  icon: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '900', color: '#fff', lineHeight: 44, marginBottom: 8 },
  sub: { fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fi: { fontSize: 20, width: 32, textAlign: 'center' },
  ft: { fontSize: 14, color: '#ccc', fontWeight: '500' },
  btns: { padding: 24, gap: 12 },
  btnP: { backgroundColor: '#E8FF4D', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnPT: { fontSize: 16, fontWeight: '800', color: '#000' },
  btnG: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnGT: { fontSize: 15, color: '#888', fontWeight: '600' },
});