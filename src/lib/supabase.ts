import { createClient } from '@supabase/supabase-js';

// Using Vite's import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use sessionStorage to reduce persistence of tokens on disk
    storage: window.sessionStorage,
  },
});

// Helper types for better type safety
export type Tables = 'leads' | 'transcripts';

export interface Lead {
  id: string;
  created_at: string;
  confirmation_number: string;
  patient_name: string;
  phone: string;
  email?: string;
  appointment_date: string;
  appointment_time: string;
  primary_concern: string | null;
  urgency_level: 'emergency' | 'urgent' | 'routine' | null;
  notes: string | null;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  metadata: Record<string, any>;
  name: string | null;
  booking_number: string | null;
  updated_at: string | null;
}
