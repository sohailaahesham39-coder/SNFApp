import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('sn_theme').then(t => {
      if (t === 'light') setIsDark(false);
    });
  }, []);

  async function toggleTheme() {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('sn_theme', newMode ? 'dark' : 'light');
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// ── Color Palette ────────────────────────────────────────────
// DARK MODE: Current dark theme (yellow-lime accents)
// LIGHT MODE: Pear/Tomato/Crema/Mint palette
export function getColors(isDark: boolean) {
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
  
  // LIGHT MODE — Pear / Tomato / Crema / Mint palette
  return {
    // Backgrounds (Crema based)
    bg:           '#FAF6EA',     // lighter crema
    bg2:          '#F2E7CB',     // Crema
    bg3:          '#EDE2C2',     // slightly darker crema
    card:         '#FFFFFF',     // pure white cards pop on crema
    cardSolid:    '#FFFFFF',
    
    // Borders (warm tones)
    border:       'rgba(148,179,138,0.25)',  // Mint-tinted
    borderStrong: 'rgba(148,179,138,0.45)',
    
    // Text (warm dark browns)
    text:         '#3D2817',                 // deep warm brown
    textMuted:    '#7A5C3F',                 // medium warm brown
    textDim:      '#A89078',                 // light warm brown
    
    // Accents
    accent:       '#EEBF43',   // Pear (primary)
    accent2:      '#94B38A',   // Mint (success)
    accent3:      '#C54F2D',   // Tomato (strong highlight)
    
    // Status
    danger:       '#C54F2D',   // Tomato for errors/warnings
    warning:      '#D88B3A',   // warm orange
    success:      '#94B38A',   // Mint
    info:         '#B88A4A',   // warm honey
    
    // On-accent text
    onAccent:     '#3D2817',
    
    // Gradient colors for LinearGradient
    gradStart:    '#FAF6EA',
    gradEnd:      '#F2E7CB',
  };
}
