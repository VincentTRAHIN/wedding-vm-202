import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const prerender = false;

export const load: PageServerLoad = async ({ locals: { user } }) => {
	// Laisser l'accès à la page d'accueil pour tous (connectés ou non)
	// Plus de redirection automatique vers /dashboard

	if (!user) {
		return {};
	}

	// Si connecté, récupérer les infos du guest pour affichage
	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	const { data: guest, error: guestError } = await supabaseAdmin
		.from('guests')
		.select('id, full_name, rsvp_status')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (guestError) {
		console.error('Error fetching guest:', guestError);
	}

	if (process.env.NODE_ENV === 'development') {
		console.log(
			'🏠 Homepage - User:',
			user.id.substring(0, 8),
			'| Guest:',
			guest?.full_name || 'none'
		);
	}

	return {
		guest
	};
};
