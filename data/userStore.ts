import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  goal: 'Weight Loss' | 'Muscle Gain' | 'Maintain';
  activity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  conditions: string[];
  allergens: string[];
  habits?: string[];
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
}

const KEY = 'sn_user_profile';

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function calculateBMI(weight: number, height: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

export function calculateTDEE(bmr: number, activity: string): number {
  const m: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * (m[activity] || 1.2));
}

export function getTargetCalories(tdee: number, goal: string): number {
  if (goal === 'Weight Loss') return tdee - 500;
  if (goal === 'Muscle Gain') return tdee + 300;
  return tdee;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#4DFF9E' };
  if (bmi < 25) return { label: 'Normal', color: '#E8FF4D' };
  if (bmi < 30) return { label: 'Overweight', color: '#FF9D4D' };
  return { label: 'Obese', color: '#FF6B6B' };
}