import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeColors } from '../../context/ThemeContext';

function TabIcon({ name, label, focused }: { name: any; label: string; focused: boolean }) {
  const C = useThemeColors();
  return (
    <View style={s.tab}>
      <Ionicons 
        name={focused ? name : `${name}-outline`} 
        size={24} 
        color={focused ? C.accent : C.textDim} 
      />
      <Text 
        style={[s.lbl, { color: focused ? C.accent : C.textDim }]}
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
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: isDark ? '#0d0d0d' : C.card,
        borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : C.border,
        borderTopWidth: 1,
        height: 65,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarItemStyle: {
        padding: 0,
      },
    }}>
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="meals" options={{ tabBarIcon: ({ focused }) => <TabIcon name="restaurant" label="Meals" focused={focused} /> }} />
      <Tabs.Screen name="workout" options={{ tabBarIcon: ({ focused }) => <TabIcon name="barbell" label="Workout" focused={focused} /> }} />
      <Tabs.Screen name="health" options={{ tabBarIcon: ({ focused }) => <TabIcon name="medkit" label="Health" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses" label="Chat" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tab: { 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 2,
    width: 60,
  },
  lbl: { 
    fontSize: 10, 
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
