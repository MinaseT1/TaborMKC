import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Supabase environment variables:', {
  isBrowser,
  url: supabaseUrl ? 'SET' : 'MISSING',
  key: supabaseAnonKey ? 'SET' : 'MISSING',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

// Lazy client creation
let _supabase: SupabaseClient | null = null

// Create a function to get Supabase client
export function getSupabaseClient() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase credentials missing:', { url: !!supabaseUrl, key: !!supabaseAnonKey });
      throw new Error('Supabase credentials are required');
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Export a getter function that creates the client on demand
export function getSupabase() {
  try {
    return getSupabaseClient();
  } catch (error) {
    console.warn('⚠️ Supabase client creation failed:', error);
    throw error;
  }
}

// For backward compatibility, export supabase as a getter
export const supabase = {
  get client() {
    return getSupabase();
  }
}

// For server-side operations with service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create admin client with error handling
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    if (!supabaseServiceKey) {
      console.warn('⚠️ Supabase service role key missing, admin operations will not work');
      return null;
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdmin;
}

// Export admin client with lazy loading
export const supabaseAdmin = getSupabaseAdmin()