import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { loadProfile } from '../data/userStore';

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(async () => {
      const profile = await loadProfile();
      router.replace(profile ? '/(tabs)/home' : '/(auth)/welcome');
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505', '#0a0f08', '#050505']} style={StyleSheet.absoluteFill} />
      <View style={s.blob1} />
      <View style={s.blob2} />
      <Animated.View style={[s.content, { opacity, transform: [{ scale }] }]}>
        <Text style={s.icon}>🥗</Text>
        <Text style={s.title}>Smart Nutrition</Text>
        <Text style={s.sub}>& Fitness Chatbot</Text>
        <Text style={s.tag}>Your AI Health Coach</Text>
        <View style={s.track}><View style={s.fill} /></View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', alignItems: 'center', justifyContent: 'center' },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, left: -80, backgroundColor: 'rgba(232,255,77,0.06)' },
  blob2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, bottom: -50, right: -60, backgroundColor: 'rgba(77,255,158,0.05)' },
  content: { alignItems: 'center', paddingHorizontal: 40 },
  icon: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 22, fontWeight: '700', color: '#E8FF4D', marginTop: 4 },
  tag: { fontSize: 13, color: '#555', marginTop: 10 },
  track: { width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginTop: 40, overflow: 'hidden' },
  fill: { height: '100%', width: '50%', backgroundColor: '#E8FF4D' },
});