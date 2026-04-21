import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kslxfyanrpcbwfkvycsp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbHhmeWFucnBjYndma3Z5Y3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjAyNTAsImV4cCI6MjA5MTg5NjI1MH0.Pe0v1RHCFEeQyWiPfRCA3P8sqaTdSwkQMelpkbzS5S8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});