import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (for server components/actions)
export function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
