import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_PALETTE } from '../constants/lightPalette';

export type LightAccentPreset = 'pear' | 'tomato' | 'mint';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  lightAccent: LightAccentPreset;
  setLightAccent: (a: LightAccentPreset) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  lightAccent: 'pear',
  setLightAccent: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [lightAccent, setLightAccentState] = useState<LightAccentPreset>('pear');

  useEffect(() => {
    AsyncStorage.getItem('sn_theme').then(t => {
      if (t === 'light') setIsDark(false);
    });
    AsyncStorage.getItem('sn_light_accent').then(a => {
      if (a === 'pear' || a === 'tomato' || a === 'mint') setLightAccentState(a);
    });
  }, []);

  async function toggleTheme() {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('sn_theme', newMode ? 'dark' : 'light');
  }

  async function setLightAccent(next: LightAccentPreset) {
    setLightAccentState(next);
    await AsyncStorage.setItem('sn_light_accent', next);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, lightAccent, setLightAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/** Theme-aware colors — use wherever you previously called `getColors(isDark)`. */
export function useThemeColors() {
  const { isDark, lightAccent } = useTheme();
  return useMemo(() => getColors(isDark, lightAccent), [isDark, lightAccent]);
}

// ── Color Palette ────────────────────────────────────────────
// DARK MODE: Current dark theme (yellow-lime accents)
// LIGHT MODE: Pear/Tomato/Crema/Mint palette
function lightColorsFromAccent(preset: LightAccentPreset) {
  const PEAR = LIGHT_PALETTE.pear;
  const TOMATO = LIGHT_PALETTE.tomato;
  const CREMA = LIGHT_PALETTE.crema;
  const MINT = LIGHT_PALETTE.mint;

  let accent: string;
  let accent2: string;
  let accent3: string;

  switch (preset) {
    case 'tomato':
      accent = TOMATO;
      accent2 = PEAR;
      accent3 = MINT;
      break;
    case 'mint':
      accent = MINT;
      accent2 = PEAR;
      accent3 = TOMATO;
      break;
    default:
      accent = PEAR;
      accent2 = MINT;
      accent3 = TOMATO;
  }

  return {
    bg: '#FAF6EA',
    bg2: CREMA,
    bg3: '#EDE2C2',
    card: '#FFFFFF',
    cardSolid: '#FFFFFF',
    border: 'rgba(148,179,138,0.25)',
    borderStrong: 'rgba(148,179,138,0.45)',
    text: '#3D2817',
    textMuted: '#7A5C3F',
    textDim: '#A89078',
    accent,
    accent2,
    accent3,
    danger: TOMATO,
    warning: '#D88B3A',
    success: MINT,
    info: '#B88A4A',
    onAccent: '#3D2817',
    gradStart: '#FAF6EA',
    gradEnd: CREMA,
  };
}

export function getColors(isDark: boolean, lightAccent: LightAccentPreset = 'pear') {
  if (isDark) {
    return {
      // Backgrounds
      bg:           '#080808',
      bg2:          '#0d0d0d',
      bg3:          '#1a1a1a',
      card:         'rgba(255,255,255,0.03)',
      cardSolid:    '#151515',
      
      // Borders
      border:       'rgba(255,255,255,0.08)',
      borderStrong: 'rgba(255,255,255,0.15)',
      
      // Text
      text:         '#ffffff',
      textMuted:    '#888888',
      textDim:      '#555555',
      
      // Accents
      accent:       '#E8FF4D',   // lime yellow
      accent2:      '#4DFF9E',   // neon green
      accent3:      '#9D8FFF',   // purple
      
      // Status
      danger:       '#FF6B6B',
      warning:      '#FF9D4D',
      success:      '#4DFF9E',
      info:         '#9D8FFF',
      
      // On-accent text
      onAccent:     '#000000',
      
      // Gradient colors for LinearGradient
      gradStart:    '#050505',
      gradEnd:      '#080f06',
    };
  }

  return lightColorsFromAccent(lightAccent);
}
