import { createClient } from '@supabase/supabase-js';
import { retryOperation } from '../utils/async/retry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'invoice-intelligence'
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper for retrying Supabase operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await retryOperation(
      async () => {
        try {
          return await operation();
        } catch (error: any) {
          // Check if it's a connection error
          if (error.message?.includes('Failed to fetch')) {
            throw new Error(`Connection error in ${context}: ${error.message}`);
          }
          throw error;
        }
      },
      3,
      { initialDelay: 1000 }
    );
  } catch (error: any) {
    console.error(`Supabase operation failed in ${context}:`, error);
    throw error;
  }
};