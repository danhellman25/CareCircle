import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
const hasSupabaseConfig: boolean = !!(supabaseUrl && supabaseUrl !== '' && supabaseAnonKey && supabaseAnonKey !== '');

// Client-side Supabase client
export function createClient() {
  if (!hasSupabaseConfig) {
    console.warn('Supabase credentials not configured. Using demo mode.');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (for server components/actions)
export function createServerClient() {
  if (!hasSupabaseConfig) {
    console.warn('Supabase credentials not configured. Using demo mode.');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig;
}
