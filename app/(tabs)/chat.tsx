import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile } from '../../data/userStore';
import { useThemeColors } from '../../context/ThemeContext';
import { loadProfileSupabaseFirst, loadChatHistorySupabaseFirst, saveChatHistorySupabaseFirst } from '../../lib/supabaseUserData';

interface Msg {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

const SUGGESTIONS = [
  'What should I eat today?',
  'Is coffee bad for me?',
  'Best meal for diabetes?',
  'How much water?',
  'Workout for beginners?',
];

function getTime() {
  return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function bmiLabel(bmi?: number) {
  if (!bmi && bmi !== 0) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function buildWelcomeMessage(profile: UserProfile | null) {
  if (!profile) {
    return "Hi! I'm your Smart Nutrition AI Coach 🤖\n\nAsk me about meals, workouts, hydration, habits, or symptoms, and I'll keep the answers practical and short.";
  }

  return `Hi ${profile.name} 👋

I already know your profile, so we can keep this personal from the start. Ask me anything about meals, workouts, habits, or symptoms, and I'll answer based on your goal, conditions, and preferences.`;
}

function buildProfilePrompt(profile: UserProfile | null) {
  if (!profile) {
    return `You are a Smart Nutrition & Fitness AI Coach. Speak naturally, be concise, and give useful nutrition and fitness advice. Use emojis lightly.`;
  }

  return `You are a Smart Nutrition & Fitness AI Coach with long-term memory of the user's profile.

Speak naturally and do not sound robotic. Use the profile as background knowledge, but do not repeat the full profile fields in every reply. Mention the user's name only when it feels natural. Keep responses under 150 words unless the user asks for more detail.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- BMI: ${profile.bmi} (${bmiLabel(profile.bmi)})
- Goal: ${profile.goal}
- Activity Level: ${profile.activity}
- Daily Calorie Target: ${profile.targetCalories} kcal
- BMR: ${profile.bmr} kcal
- TDEE: ${profile.tdee} kcal
- Health Conditions: ${profile.conditions?.length ? profile.conditions.join(', ') : 'None'}
- Food Allergies: ${profile.allergens?.length ? profile.allergens.join(', ') : 'None'}
- Daily Habits: ${profile.habits?.length ? profile.habits.join(', ') : 'None'}

GUIDELINES:
1. Treat the profile as stable memory across the conversation
2. Use the profile only when it is relevant to the user's question
3. Give specific advice based on health conditions, habits, and allergies
4. Mention calorie targets naturally when they matter
5. Focus on low glycemic foods for diabetes
6. Focus on low sodium and omega-3 for heart conditions
7. Warn about caffeine if the user drinks a lot of coffee or tea
8. Suggest Egyptian foods when possible
9. Keep the tone warm, practical, and human
10. Use emojis lightly, not excessively`;
}

function buildConversationHistory(msgs: Msg[]) {
  return msgs.slice(-8).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));
}

function containsAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function localReply(profile: UserProfile | null, text: string) {
  const lower = text.toLowerCase();

  if (containsAny(lower, ['water', 'hydrate', 'hydration'])) {
    return profile
      ? `For your profile, 2–3 liters a day is a solid target 💧 Add more if you sweat a lot. Egyptian cucumber, lettuce, and watermelon also help.`
      : `Aim for 2–3 liters daily 💧 Add more if you exercise a lot or sweat heavily.`;
  }

  if (containsAny(lower, ['coffee', 'caffeine'])) {
    const habits = profile?.habits || [];
    const heavyCoffee = habits.some(h => h.toLowerCase().includes('coffee'));
    return heavyCoffee
      ? `Since coffee is already part of your habits, try reducing it gradually ☕ Avoid it after 3 PM and swap one cup with mint tea or decaf.`
      : `Coffee is fine in moderation ☕ Keep it to 1–2 cups and avoid sugar-heavy add-ons.`;
  }

  if (containsAny(lower, ['diabetes', 'blood sugar', 'sugar'])) {
    return profile
      ? `A better fit for your profile is a low-glycemic plate: foul, eggs, yogurt, and small portions of baladi bread or brown rice 🍽️ Avoid sweet drinks and desserts.`
      : `Choose low-glycemic meals 🍽️ Focus on fiber, protein, and smaller portions of starch. Avoid sweet drinks and desserts.`;
  }

  if (containsAny(lower, ['meal', 'eat today', 'eat now', 'breakfast', 'lunch', 'dinner'])) {
    const conditions = profile?.conditions || [];
    const hasDiabetes = conditions.some(c => c.toLowerCase().includes('diabetes'));
    const hasHeart = conditions.some(c => c.toLowerCase().includes('heart'));
    if (hasDiabetes) {
      return `A strong option for your profile is grilled chicken, salad, and a small portion of brown rice or baladi bread 🥗`;
    }
    if (hasHeart) {
      return `For your profile, grilled fish, salad, and low-salt soup are a safer choice 🐟 Keep fried food and salty cheese low.`;
    }
    return `A good day meal is eggs or foul for breakfast, grilled chicken or kofta for lunch, and yogurt with fruit for a snack 🥗`;
  }

  if (containsAny(lower, ['beginner', 'workout', 'exercise'])) {
    return `Start with 20–30 minutes of walking plus bodyweight squats and wall push-ups 💪 Keep it easy and consistent.`;
  }

  return profile
    ? `Based on your profile, the next best step is to keep meals balanced, stay hydrated, and avoid foods that conflict with your conditions ✅ Ask me about one meal, workout, or habit at a time and I'll tailor it.`
    : `Focus on balanced meals, hydration, and consistency ✅ Ask me about one meal, workout, or habit at a time and I'll tailor it.`;
}

async function askAnthropic(
  profile: UserProfile | null,
  msgs: Msg[],
  text: string,
  signal: AbortSignal
) {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return localReply(profile, text);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: buildProfilePrompt(profile),
      messages: [...buildConversationHistory(msgs), { role: 'user', content: text }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const botText = data.content?.[0]?.text?.trim();
  if (!botText) {
    throw new Error('Empty response from Anthropic');
  }

  return botText;
}

export default function Chat() {
  const C = useThemeColors();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [savedProfile, savedHistory] = await Promise.all([
          loadProfileSupabaseFirst(),
          loadChatHistorySupabaseFirst<Msg>(),
        ]);

        if (!mounted) return;

        setProfile(savedProfile);

        if (savedHistory && savedHistory.length > 0) {
          try {
            const parsed = savedHistory as Msg[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMsgs(parsed);
            } else {
              setMsgs([
                {
                  id: '1',
                  role: 'bot',
                  time: getTime(),
                  text: buildWelcomeMessage(savedProfile),
                },
              ]);
            }
          } catch {
            setMsgs([
              {
                id: '1',
                role: 'bot',
                time: getTime(),
                text: buildWelcomeMessage(savedProfile),
              },
            ]);
          }
        } else {
          setMsgs([
            {
              id: '1',
              role: 'bot',
              time: getTime(),
              text: buildWelcomeMessage(savedProfile),
            },
          ]);
        }

        setHydrated(true);
      } catch {
        if (!mounted) return;
        setMsgs([
          {
            id: '1',
            role: 'bot',
            time: getTime(),
            text: buildWelcomeMessage(null),
          },
        ]);
        setHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveChatHistorySupabaseFirst(msgs).catch(() => {});
  }, [msgs, hydrated]);

  async function send(text: string) {
    if (!text.trim() || typing) return;

    const cleanText = text.trim();
    const userMsg: Msg = {
      id: Date.now().toString(),
      role: 'user',
      text: cleanText,
      time: getTime(),
    };

    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const botText = await askAnthropic(profile, [...msgs, userMsg], cleanText, controller.signal);
      setMsgs(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: botText,
          time: getTime(),
        },
      ]);
    } catch (error) {
      const fallback = localReply(profile, cleanText);
      setMsgs(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: fallback,
          time: getTime(),
        },
      ]);
    } finally {
      clearTimeout(timeout);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <LinearGradient colors={[C.gradStart, C.gradEnd]} style={StyleSheet.absoluteFill} />
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

        <ScrollView
          ref={scrollRef}
          style={s.msgs}
          contentContainerStyle={s.msgsContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {msgs.map(msg => (
            <View key={msg.id} style={[s.msgWrap, msg.role === 'user' && s.msgWrapU]}>
              {msg.role === 'bot' && (
                <View style={[s.botAv, { backgroundColor: 'rgba(232,255,77,0.08)' }]}>
                  <Text style={{ fontSize: 12 }}>🤖</Text>
                </View>
              )}
              <View
                style={[
                  s.bubble,
                  msg.role === 'user' ? s.userBubble : [s.botBubble, { backgroundColor: C.card, borderColor: C.border }],
                ]}
              >
                <Text style={[s.bubbleT, msg.role === 'user' && s.userT]}>{msg.text}</Text>
                <Text style={[s.timeT, { color: msg.role === 'user' ? 'rgba(0,0,0,0.4)' : C.textDim }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
          {typing && (
            <View style={s.msgWrap}>
              <View style={[s.botAv, { backgroundColor: 'rgba(232,255,77,0.08)' }]}>
                <Text style={{ fontSize: 12 }}>🤖</Text>
              </View>
              <View style={[s.botBubble, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ color: '#E8FF4D', fontSize: 14, letterSpacing: 4 }}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.suggestions, { borderTopColor: C.border }]}>
          {SUGGESTIONS.map(sg => (
            <TouchableOpacity
              key={sg}
              style={[s.chip, { borderColor: 'rgba(232,255,77,0.15)', backgroundColor: 'rgba(232,255,77,0.06)' }]}
              onPress={() => send(sg)}
            >
              <Text style={[s.chipT, { color: '#E8FF4D' }]}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[s.inputRow, { borderTopColor: C.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: C.bg3, borderColor: C.border, color: C.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={C.textDim}
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendOff]}
            onPress={() => send(input)}
            disabled={!input.trim() || typing}
          >
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
