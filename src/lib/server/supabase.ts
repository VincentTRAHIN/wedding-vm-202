import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/supabase';

/**
 * Client Supabase côté serveur pour les opérations ne nécessitant pas de session utilisateur
 * Utilisé notamment pour le keep-alive et les tâches de fond
 */
export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
