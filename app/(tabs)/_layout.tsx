import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeColors } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIconName =
  | 'home'
  | 'restaurant'
  | 'barbell'
  | 'medkit'
  | 'chatbubble-ellipses'
  | 'person';

function TabIcon({
  focusedName,
  outlineName,
  label,
  focused,
}: {
  focusedName: TabIconName;
  outlineName: TabIconName;
  label: string;
  focused: boolean;
}) {
  const C = useThemeColors();
  return (
    <View style={[s.tab, focused && { backgroundColor: C.accent + '22', borderColor: C.accent + '55' }]}>
      <Ionicons 
        name={(focused ? focusedName : `${outlineName}-outline`) as any}
        size={22}
        color={focused ? C.accent : C.textMuted}
      />
      <Text 
        style={[s.lbl, { color: focused ? C.accent : C.textMuted }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isDark } = useTheme();
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(12, insets.bottom + 8);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        backgroundColor: isDark ? '#111111' : C.card,
        borderTopColor: C.border,
        borderTopWidth: 1,
        height: 72 + tabBarBottomPadding,
        paddingBottom: tabBarBottomPadding,
        paddingTop: 10,
      },
      tabBarItemStyle: {
        paddingHorizontal: 2,
        minHeight: 44,
      },
    }}>
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="home" outlineName="home" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="meals" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="restaurant" outlineName="restaurant" label="Meals" focused={focused} /> }} />
      <Tabs.Screen name="workout" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="barbell" outlineName="barbell" label="Workout" focused={focused} /> }} />
      <Tabs.Screen name="health" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="medkit" outlineName="medkit" label="Health" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="chatbubble-ellipses" outlineName="chatbubble-ellipses" label="Chat" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focusedName="person" outlineName="person" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tab: { 
    minHeight: 44,
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 2,
    width: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lbl: { 
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
