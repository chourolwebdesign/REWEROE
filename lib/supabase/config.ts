/**
 * Öffentliche Supabase-Daten (Projekt rewe-roedelheim, Frankfurt). Der Publishable Key darf im Browser stehen –
 * Lesen und Schreiben regeln die RLS-Richtlinien (supabase/migrations). Umgebungsvariablen überschreiben beides.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ljkdcxdckvhbjujefkhn.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_t_aBCzefYxQ-UMOdEw4EKQ_W_1mBVEZ";
