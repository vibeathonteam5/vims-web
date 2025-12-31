import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fikxqjdqmwbpekvzyrku.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_7X_t257F7DXuVsK164PRiA_7Sqqe-fy';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to check connection
 */
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) throw error;
    console.log('Supabase Connected');
    return true;
  } catch (err) {
    console.warn('Supabase not connected or tables not created yet.', err);
    return false;
  }
};