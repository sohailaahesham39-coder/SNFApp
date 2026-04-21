import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadProfile, UserProfile } from '../../data/userStore';
import { useTheme, getColors } from '../../context/ThemeContext';

interface Msg { id: string; role: 'user' | 'bot'; text: string; time: string; }

const SUGGESTIONS = ['What should I eat today?', 'Is coffee bad for me?', 'Best meal for diabetes?', 'How much water?', 'Workout for beginners?'];

function getTime() { return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }); }

export default function Chat() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: '1', role: 'bot', time: getTime(),
    text: "Hi! I'm your Smart Nutrition AI Coach 🤖\n\nI'm connected to your profile and can give personalized advice about:\n• 🥗 Meal recommendations\n• 💪 Workout guidance\n• 💊 Health condition tips\n• 💧 Hydration & habits\n\nWhat would you like to know?"
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { loadProfile().then(setProfile); }, []);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: text.trim(), time: getTime() };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const systemPrompt = profile ? `You are a Smart Nutrition & Fitness AI Coach. You MUST use the user's profile data in every response.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- BMI: ${profile.bmi} (${profile.bmi < 18.5 ? 'Underweight' : profile.bmi < 25 ? 'Normal' : profile.bmi < 30 ? 'Overweight' : 'Obese'})
- Goal: ${profile.goal}
- Activity Level: ${profile.activity}
- Daily Calorie Target: ${profile.targetCalories} kcal
- BMR: ${profile.bmr} kcal
- TDEE: ${profile.tdee} kcal
- Health Conditions: ${profile.conditions?.length ? profile.conditions.join(', ') : 'None'}
- Food Allergies: ${profile.allergens?.length ? profile.allergens.join(', ') : 'None'}
- Daily Habits: ${(profile as any).habits?.length ? (profile as any).habits.join(', ') : 'None'}

RULES:
1. Always address the user by name (${profile.name})
2. Give specific advice based on their health conditions and allergies
3. Mention their calorie target (${profile.targetCalories} kcal) when relevant
4. If they have diabetes, focus on low glycemic foods
5. If they have heart disease, focus on low sodium, omega-3
6. If they smoke, recommend Vitamin C and antioxidants
7. If they drink heavy coffee, warn about caffeine effects
8. Always suggest Egyptian foods when possible
9. Keep responses concise (max 150 words) but helpful
10. Use emojis to make responses friendly` 
      : `You are a Smart Nutrition & Fitness AI Coach. Give helpful nutrition and fitness advice. Use emojis. Keep responses under 150 words.`;

      const conversationHistory = msgs.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: systemPrompt,
          messages: [...conversationHistory, { role: 'user', content: text }],
        }),
      });

      const data = await response.json();
      const botText = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again!';

      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', text: botText, time: getTime() }]);
    } catch (error) {
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: 'bot', text: "I'm having trouble connecting right now. Please check your internet and try again! 🔄", time: getTime() }]);
    }
    setTyping(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <LinearGradient colors={isDark ? ['#050505', '#080f06'] : ['#F0F4F0', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[s.header, { borderBottomColor: C.border }]}>
          <View style={[s.aiAvatar, { backgroundColor: 'rgba(232,255,77,0.1)', borderColor: 'rgba(232,255,77,0.2)' }]}>
            <Text style={s.aiEmoji}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.aiName, { color: C.text }]}>AI Nutrition Coach</Text>
            <View style={s.statusRow}>
              <View style={s.onlineDot} />
              <Text style={s.status}>Online · {profile ? `Knows your profile ✓` : 'Ready to help'}</Text>
            </View>
          </View>
          {profile && (
            <View style={s.profileBadge}>
              <Text style={s.profileBadgeT}>{profile.name[0].toUpperCase()}</Text>
            </View>
          )}
        </View>

        <ScrollView ref={scrollRef} style={s.msgs} contentContainerStyle={s.msgsContent} showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {msgs.map(msg => (
            <View key={msg.id} style={[s.msgWrap, msg.role === 'user' && s.msgWrapU]}>
              {msg.role === 'bot' && <View style={[s.botAv, { backgroundColor: 'rgba(232,255,77,0.08)' }]}><Text style={{ fontSize: 12 }}>🤖</Text></View>}
              <View style={[s.bubble, msg.role === 'user' ? s.userBubble : [s.botBubble, { backgroundColor: C.card, borderColor: C.border }]]}>
                <Text style={[s.bubbleT, msg.role === 'user' && s.userT]}>{msg.text}</Text>
                <Text style={[s.timeT, { color: msg.role === 'user' ? 'rgba(0,0,0,0.4)' : C.textDim }]}>{msg.time}</Text>
              </View>
            </View>
          ))}
          {typing && (
            <View style={s.msgWrap}>
              <View style={[s.botAv, { backgroundColor: 'rgba(232,255,77,0.08)' }]}><Text style={{ fontSize: 12 }}>🤖</Text></View>
              <View style={[s.botBubble, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ color: '#E8FF4D', fontSize: 14, letterSpacing: 4 }}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.suggestions, { borderTopColor: C.border }]}>
          {SUGGESTIONS.map(sg => (
            <TouchableOpacity key={sg} style={[s.chip, { borderColor: 'rgba(232,255,77,0.15)', backgroundColor: 'rgba(232,255,77,0.06)' }]} onPress={() => send(sg)}>
              <Text style={[s.chipT, { color: '#E8FF4D' }]}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[s.inputRow, { borderTopColor: C.border }]}>
          <TextInput style={[s.input, { backgroundColor: C.bg3, borderColor: C.border, color: C.text }]} value={input} onChangeText={setInput} placeholder="Ask me anything..." placeholderTextColor={C.textDim} multiline />
          <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendOff]} onPress={() => send(input)} disabled={!input.trim() || typing}>
            <Text style={s.sendT}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 60, borderBottomWidth: 1 },
  aiAvatar: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  aiEmoji: { fontSize: 22 },
  aiName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DFF9E' },
  status: { fontSize: 11, color: '#4DFF9E' },
  profileBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(232,255,77,0.15)', borderWidth: 1.5, borderColor: '#E8FF4D', alignItems: 'center', justifyContent: 'center' },
  profileBadgeT: { fontSize: 14, fontWeight: '800', color: '#E8FF4D' },
  msgs: { flex: 1 },
  msgsContent: { padding: 16, gap: 12, paddingBottom: 8 },
  msgWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  msgWrapU: { flexDirection: 'row-reverse' },
  botAv: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 16 },
  botBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#E8FF4D', borderBottomRightRadius: 4 },
  bubbleT: { fontSize: 13, color: '#ccc', lineHeight: 19 },
  userT: { color: '#000', fontWeight: '600' },
  timeT: { fontSize: 10, marginTop: 4 },
  suggestions: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, maxHeight: 50 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, height: 34, justifyContent: 'center' },
  chipT: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8FF4D', alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
  sendT: { fontSize: 18, fontWeight: '800', color: '#000' },
});