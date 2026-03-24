import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Using anonymous user_id from device
  },
});

// Types
export interface UserProfile {
  id?: string;
  user_id: string;
  display_name?: string | null;
  city: string;
  language: string;
  calculation_method: string;
  prayer_alerts: number;
  adhkar_reminders: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrayerLog {
  id?: string;
  user_id: string;
  prayer_name: string;
  date: string;
  status: 'completed' | 'missed';
  created_at?: string;
}

export interface AdhkarProgress {
  id?: string;
  user_id: string;
  dhikr_id: string;
  date: string;
  count: number;
  completed: boolean;
  created_at?: string;
}
