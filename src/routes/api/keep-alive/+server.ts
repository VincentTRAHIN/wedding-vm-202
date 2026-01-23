import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { supabase } from '$lib/server/supabase';

/**
 * Keep-Alive Endpoint
 * Empêche Supabase de se mettre en veille sur les plans gratuits.
 *
 * Usage: GET /api/keep-alive?key=YOUR_CRON_SECRET
 *
 * Sécurité:
 * - Authentification par clé secrète (CRON_SECRET)
 * - Comparaison timing-safe pour éviter les attaques par timing
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		// Récupération de la clé secrète (runtime)
		const CRON_SECRET = env.CRON_SECRET;

		if (!CRON_SECRET) {
			console.error('[Keep-Alive] CRON_SECRET not configured');
			throw error(500, 'Keep-Alive endpoint not configured');
		}

		// Récupération et validation de la clé
		const providedKey = url.searchParams.get('key');

		if (!providedKey) {
			throw error(401, 'Missing authentication key');
		}

		// Comparaison timing-safe de la clé
		// Convertir en Uint8Array pour utiliser crypto.timingSafeEqual
		const providedKeyBuffer = new TextEncoder().encode(providedKey);
		const secretKeyBuffer = new TextEncoder().encode(CRON_SECRET);

		// Les deux buffers doivent avoir la même longueur pour timingSafeEqual
		if (providedKeyBuffer.length !== secretKeyBuffer.length) {
			throw error(401, 'Invalid authentication key');
		}

		// Comparaison sécurisée contre les attaques par timing
		const isValid = crypto.subtle.timingSafeEqual(providedKeyBuffer, secretKeyBuffer);

		if (!isValid) {
			throw error(401, 'Invalid authentication key');
		}

		// Interaction légère avec Supabase pour maintenir la connexion active
		const { error: dbError, count } = await supabase
			.from('guests')
			.select('*', { count: 'exact', head: true });

		if (dbError) {
			console.error('[Keep-Alive] Database error:', dbError);
			throw error(503, 'Database connection failed');
		}

		// Retourner une réponse de succès
		return json({
			status: 'alive',
			timestamp: new Date().toISOString(),
			message: 'Database connection maintained',
			guestCount: count
		});
	} catch (err) {
		// Si c'est déjà une erreur SvelteKit, la relancer
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Sinon, erreur serveur générique
		console.error('[Keep-Alive] Unexpected error:', err);
		throw error(500, 'Internal server error');
	}
};
