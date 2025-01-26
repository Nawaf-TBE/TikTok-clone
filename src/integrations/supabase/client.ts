import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rwlubkngssnrihfukxwc.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bHVia25nc3NucmloZnVreHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MjA3NzYsImV4cCI6MjA1MzE5Njc3Nn0.95lERVSKOMwUYBCWRaBf9ZZPVzKA9i5npRn-or8FfWY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);