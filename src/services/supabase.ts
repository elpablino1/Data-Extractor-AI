import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bflhjmrtxgukeivzkxku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbGhqbXJ0eGd1a2VpdnpreGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzkxMDcsImV4cCI6MjA3OTMxNTEwN30.dBlE4j1GNrCT91Ij5wSSmP27lXBEBsIz9OgOWaO9Tiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
