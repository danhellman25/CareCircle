import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Hardcoded fallbacks to bypass Vercel env var newline bug
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chhwfraakmconptlvrym.supabase.co').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaHdmcmFha21jb25wdGx2cnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjk2MjMsImV4cCI6MjA4NjIwNTYyM30.toM-ngllAvi788N-mQVGVVAidC89KRzb09bZM3jzqRk').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaHdmcmFha21jb25wdGx2cnltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyOTYyMywiZXhwIjoyMDg2MjA1NjIzfQ.-nRnL8lzbuKX7ixUfRhH_toM0auPUtCtsuRent3llb8').trim();

// Check if we have valid Supabase credentials
const hasSupabaseConfig: boolean = !!(supabaseUrl && supabaseUrl !== '' && supabaseAnonKey && supabaseAnonKey !== '');
const hasServiceRoleKey: boolean = !!(supabaseServiceKey && supabaseServiceKey !== '');

// Client-side Supabase client (for browser usage)
export function createClient() {
  if (!hasSupabaseConfig) {
    console.warn('Supabase credentials not configured. Using demo mode.');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client with anon key (for server components/actions)
export function createServerClient() {
  if (!hasSupabaseConfig) {
    console.warn('Supabase credentials not configured. Using demo mode.');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client with service role key (for admin operations)
export function createServiceClient() {
  if (!hasSupabaseConfig) {
    console.warn('Supabase credentials not configured. Using demo mode.');
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  if (!hasServiceRoleKey) {
    console.warn('Service role key not configured. Using anon key (limited permissions).');
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig;
}

// Check if service role key is available
export function hasServiceRole(): boolean {
  return hasServiceRoleKey;
}

// Demo IDs for consistent demo data
export const DEMO_IDS = {
  user: 'demo-user-1',
  circle: 'demo-circle-1',
  recipient: 'demo-recipient-1',
} as const;
